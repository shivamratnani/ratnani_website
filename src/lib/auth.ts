import { timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

/**
 * Constant-time bearer check for the cron endpoint. Compares digests rather
 * than raw values so the comparison is length-independent.
 */
export function isAuthorizedCron(request: Request): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  const provided = Buffer.from(header.slice(7));
  const expected = Buffer.from(requireEnv("CRON_SECRET").CRON_SECRET);

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
