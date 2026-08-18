import { z } from "zod";

/**
 * Server-side environment. Validated per key rather than as a whole object, so
 * one unset variable fails only the feature that needs it — the GitHub widget
 * should not go dark because Resend is unconfigured.
 */
const schema = z.object({
  GITHUB_TOKEN: z.string().min(1),
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
  // Provisioned by the Vercel Upstash integration under these names, not the
  // UPSTASH_* ones Upstash's own dashboard hands out.
  KV_REST_API_URL: z.url(),
  KV_REST_API_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CONTACT_TO_EMAIL: z.email(),
  CRON_SECRET: z.string().min(16),
});

type Env = z.infer<typeof schema>;

/**
 * Reads and validates the named variables, throwing a message that names
 * exactly which ones are missing so a misconfigured deploy is diagnosable from
 * a single log line.
 */
export function requireEnv<K extends keyof Env>(...keys: K[]): Pick<Env, K> {
  const values = {} as Pick<Env, K>;
  const missing: string[] = [];

  for (const key of keys) {
    const parsed = schema.shape[key].safeParse(process.env[key]);
    if (parsed.success) values[key] = parsed.data as Env[K];
    else missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(`Missing or invalid environment variables: ${missing.join(", ")}`);
  }

  return values;
}
