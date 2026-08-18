import { Redis } from "@upstash/redis";
import { requireEnv } from "./env";

let client: Redis | undefined;

/** Lazily constructed Upstash client, shared across the process. */
export function redis(): Redis {
  if (!client) {
    const env = requireEnv("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN");
    client = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return client;
}
