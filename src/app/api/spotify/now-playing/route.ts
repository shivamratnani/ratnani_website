import { connection } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

/**
 * Polled by the NowPlaying ticker. Deliberately uncached.
 *
 * Under Cache Components `export const dynamic` is rejected; connection() is the
 * primitive that marks a route as request-time so it is never prerendered.
 */
export async function GET() {
  await connection();

  try {
    return Response.json(await getNowPlaying(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[now-playing]", error);
    return Response.json(null, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
