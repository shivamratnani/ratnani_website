/**
 * Writes one value from stdin into .env.local.
 *
 *   read -rs "v?Secret: " && printf '%s' "$v" | pnpm secret:set SPOTIFY_CLIENT_SECRET
 *
 * Reading from stdin keeps the value out of argv, the process table, and shell
 * history. Uses upsertEnvFile rather than sed so a value containing regex or
 * delimiter characters cannot corrupt the file.
 */
import { join } from "node:path";
import { upsertEnvFile } from "../src/lib/dotenv.ts";

const key = process.argv[2];

if (!key || !/^[A-Z][A-Z0-9_]*$/.test(key)) {
  console.error("Usage: <value on stdin> | pnpm secret:set <ENV_KEY>");
  process.exit(1);
}

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
const value = Buffer.concat(chunks).toString("utf8").trim();

if (!value) {
  console.error(`No value on stdin — ${key} unchanged.`);
  process.exit(1);
}

// Credentials never contain whitespace. A value that does is almost always a
// stray clipboard grab, and writing it produces a confusing auth failure much
// later instead of an obvious one here.
if (/\s/.test(value)) {
  console.error(
    `Refusing to write ${key}: the value contains whitespace, so it is very ` +
      "likely not a credential. Copy the value itself and try again.",
  );
  process.exit(1);
}

await upsertEnvFile(join(process.cwd(), ".env.local"), key, value);
console.log(`✓ ${key} written to .env.local (${value.length} chars)`);
