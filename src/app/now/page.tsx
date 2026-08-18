import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { NowPlaying } from "@/components/spotify/NowPlaying";
import { Playlists } from "@/components/spotify/Playlists";
import { TopList } from "@/components/spotify/TopList";
import { CurrentWork } from "@/components/ui/CurrentWork";
import { MEASURE } from "@/components/ui/layout";
import { Section } from "@/components/ui/Section";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/cn";
import { getNowPlaying, getSpotifySeason, getSpotifyWeek } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm working on, and what I've had on repeat this week.",
};

function ListeningFallback() {
  return <div className="h-64 animate-pulse rounded-lg bg-ink-1" />;
}

/** The /now page is the full view, so it lists deeper than the home panel. */
const LISTED = 10;

async function Listening() {
  // Request-time island — see the note in app/page.tsx.
  await connection();
  // Both windows read the same per-day keys, so this is two aggregations over
  // one dataset rather than a second source of truth.
  const [week, season] = await Promise.all([getSpotifyWeek(LISTED), getSpotifySeason(LISTED)]);

  return (
    <div className="space-y-12">
      {/* Three columns: tracks, artists, and the playlists standing alongside
       * both windows rather than under them. */}
      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-12">
          <TopList
            title="Top tracks · 7 days"
            entries={week.tracks.map((track) => ({ ...track, sub: track.artist }))}
          />
          <TopList
            title="Top tracks · 4 weeks"
            entries={season.tracks.map((track) => ({ ...track, sub: track.artist }))}
          />
        </div>

        <div className="space-y-12">
          <TopList title="Top artists · 7 days" entries={week.artists} />
          <TopList title="Top artists · 4 weeks" entries={season.artists} />
        </div>

        <div className="space-y-12 sm:col-span-2 xl:col-span-1">
          <Playlists title="Playlists · 7 days" playlists={week.playlists} />
          <Playlists title="Playlists · 4 weeks" playlists={season.playlists} />
        </div>
      </div>

      <p className="font-mono text-[11px] text-ash-1">
        Rolling windows over the same play history — the 4-week view fills in as the sync runs ·{" "}
        {week.syncedAt ? <TimeAgo value={week.syncedAt} prefix="synced " /> : "never synced"}
      </p>
    </div>
  );
}

async function Ticker() {
  await connection();
  return <NowPlaying initial={await getNowPlaying().catch(() => null)} />;
}

export default function NowPage() {
  return (
    <>
      <Section id="now" index="—" title="Now">
        <Reveal className="space-y-6">
          <p className={cn(MEASURE, "text-ash-2 leading-relaxed")}>
            Updated whenever something changes. Currently in Manhattan, working on:
          </p>
          <CurrentWork />
          <Suspense fallback={null}>
            <Ticker />
          </Suspense>
        </Reveal>
      </Section>

      <Section id="listening" index="—" title="Listening">
        <Suspense fallback={<ListeningFallback />}>
          <Listening />
        </Suspense>
      </Section>
    </>
  );
}
