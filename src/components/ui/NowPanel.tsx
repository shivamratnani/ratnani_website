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

/** Skeleton matched to the loaded height, so nothing shifts when it resolves —
 * shorter at 2xl, where the ticker moves beside the lists instead of above them. */
export function ListeningPreviewFallback() {
  return <div className="h-[500px] animate-pulse rounded-lg bg-ink-1 2xl:h-[360px]" />;
}

export async function ListeningPreview() {
  // Request-time island inside a prerendered shell — see the note in app/page.tsx.
  await connection();
  const [week, playing] = await Promise.all([
    getSpotifyWeek(LIMIT),
    getNowPlaying().catch(() => null),
  ]);

  return (
    // One row of columns rather than a stack: the ticker is a third the height
    // of a five-row list, so stacking it left the panel far deeper than the
    // roles beside it. `content-center` sits the card on the lists' midline.
    <div className="grid gap-8 sm:grid-cols-2 2xl:grid-cols-3">
      <div className="grid content-center sm:col-span-2 2xl:col-span-1">
        <NowPlaying initial={playing} />
      </div>
      <TopList
        title="Top tracks · 7 days"
        entries={week.tracks.map((track) => ({ ...track, sub: track.artist }))}
      />
      <TopList title="Top artists · 7 days" entries={week.artists} />
    </div>
  );
}

/**
 * What I'm working on, then what I've been listening to. The listening side
 * widens to three columns at 2xl so the whole panel reads as one row of even
 * height. The two halves are independent — the listening side streams — so the
 * roles never wait on Spotify.
 */
export function NowPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,2.05fr)]">
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
