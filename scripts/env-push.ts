/**
 * Syncs .env.local to Vercel.
 *
 *   pnpm env:push [production|preview|development]   (default: production)
 *
 * Values are piped over stdin rather than passed as arguments, so no secret
 * appears in the process table or in shell history. Existing values are
 * removed first, because `vercel env add` refuses to overwrite.
 *
 * Upstash variables are skipped: the Marketplace integration owns those, and
 * pushing hand-set copies would shadow it.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import { readEnvFile } from "../src/lib/dotenv.ts";

const TARGET = process.argv[2] ?? "production";
const MANAGED_BY_INTEGRATION = ["KV_REST_API_URL", "KV_REST_API_TOKEN", "KV_URL", "REDIS_URL"];

const KEYS = [
  "GITHUB_TOKEN",
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REFRESH_TOKEN",
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

/** Runs a command, optionally writing `input` to its stdin. Resolves with the exit code. */
function run(command: string, args: string[], input?: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: [input ? "pipe" : "ignore", "ignore", "ignore"] });
    child.stdin?.end(input);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

const env = await readEnvFile(join(process.cwd(), ".env.local"));
const present = KEYS.filter((key) => env[key]);
const missing = KEYS.filter((key) => !env[key]);

if (present.length === 0) {
  console.error("Nothing to push — .env.local has none of the expected keys.");
  process.exit(1);
}

console.log(`Pushing ${present.length} variable(s) to ${TARGET}…\n`);

for (const key of present) {
  await run("vercel", ["env", "rm", key, TARGET, "--yes"]);
  const code = await run("vercel", ["env", "add", key, TARGET], env[key]);
  console.log(`  ${code === 0 ? "✓" : "✗"} ${key}`);
}

if (missing.length > 0) {
  console.log(`\nNot set locally, skipped: ${missing.join(", ")}`);
}
console.log(
  `\nManaged by the Upstash integration, never pushed: ${MANAGED_BY_INTEGRATION.join(", ")}`,
);
