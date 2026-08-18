import { Redis } from "@upstash/redis";
import { requireEnv } from "./env";

let client: Redis | undefined;

/** Lazily constructed Upstash client, shared across the process. */
export function redis(): Redis {
  if (!client) {
    const env = requireEnv("KV_REST_API_URL", "KV_REST_API_TOKEN");
    client = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });
  }
  return client;
}
