import { isAuthorizedCron } from "@/lib/auth";
import { syncRecentlyPlayed } from "@/lib/spotify";

/**
 * Ingests recently-played into the rolling 7-day window.
 *
 * Driven by .github/workflows/spotify-sync.yml every 30 minutes — not a Vercel
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
    console.error("[spotify-sync]", error);
    return Response.json({ error: "Sync failed" }, { status: 502 });
  }
}
