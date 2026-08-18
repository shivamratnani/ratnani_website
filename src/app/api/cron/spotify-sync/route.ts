import { isAuthorizedCron } from "@/lib/auth";
import { SpotifyRateLimitError, syncRecentlyPlayed } from "@/lib/spotify";

/**
 * Ingests recently-played into the rolling 7-day window.
 *
 * Driven by .github/workflows/spotify-sync.yml every ~5 minutes — not a Vercel
 * Cron, which is capped at once per day on Hobby and would make a true weekly
 * window impossible.
 */
export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ingested } = await syncRecentlyPlayed();
    return Response.json({ ok: true, ingested });
  } catch (error) {
    // A quota-exhausted Spotify heals itself once the window resets; failing
    // the run would only paint CI red until then. The Now page's "synced Xm
    // ago" line keeps the staleness visible meanwhile. Everything else — bad
    // token, Redis down — still fails loudly.
    if (error instanceof SpotifyRateLimitError) {
      console.warn("[spotify-sync] skipped:", error.message);
      return Response.json({
        ok: true,
        skipped: "rate-limited",
        retryAfterSeconds: error.retryAfterSeconds,
      });
    }
    console.error("[spotify-sync]", error);
    return Response.json({ error: "Sync failed" }, { status: 502 });
  }
}
