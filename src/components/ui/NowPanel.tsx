import { connection } from "next/server";
import { Reveal } from "@/components/motion/Reveal";
import { NowPlaying } from "@/components/spotify/NowPlaying";
import { TopList } from "@/components/spotify/TopList";
import { CurrentWork } from "@/components/ui/CurrentWork";
import { MEASURE } from "@/components/ui/layout";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { getNowPlaying, getSpotifyWeek } from "@/lib/spotify";

/** Five of each: enough to read as a habit without the panel growing deeper
 * than the roles beside it. */
const LIMIT = 5;

/** Skeleton matched to the loaded height, so nothing shifts when it resolves. */
export function ListeningPreviewFallback() {
  return <div className="h-[420px] animate-pulse rounded-lg bg-ink-1" />;
}

export async function ListeningPreview() {
  // Request-time island inside a prerendered shell — see the note in app/page.tsx.
  await connection();
  const [week, playing] = await Promise.all([
    getSpotifyWeek(LIMIT),
    getNowPlaying().catch(() => null),
  ]);

  return (
    <div className="space-y-8">
      <NowPlaying initial={playing} />
      {/* Side by side: stacked, the two lists ran twice the height of the roles
       * beside them and left the left column empty. */}
      <div className="grid gap-8 sm:grid-cols-2">
        <TopList
          title="Top tracks · 7 days"
          entries={week.tracks.map((track) => ({ ...track, sub: track.artist }))}
        />
        <TopList title="Top artists · 7 days" entries={week.artists} />
      </div>
    </div>
  );
}

/**
 * Two columns: what I'm working on, and what I've been listening to. They are
 * independent — the listening side streams — so the roles never wait on Spotify.
 */
export function NowPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <Reveal className="space-y-6">
        <p className={cn(MEASURE, "text-ash-2 leading-relaxed")}>
          Currently in {site.location}, working on:
        </p>
        <CurrentWork compact />
      </Reveal>

      <Reveal delay={0.08}>{children}</Reveal>
    </div>
  );
}
