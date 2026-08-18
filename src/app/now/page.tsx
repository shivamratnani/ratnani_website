import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { NowPlaying } from "@/components/spotify/NowPlaying";
import { TopList } from "@/components/spotify/TopList";
import { Section } from "@/components/ui/Section";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { experience } from "@/data/experience";
import { getNowPlaying, getSpotifyWeek } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm working on, and what I've had on repeat this week.",
};

function ListeningFallback() {
  return <div className="h-64 animate-pulse rounded-lg bg-ink-1" />;
}

async function Listening() {
  // Request-time island — see the note in app/page.tsx.
  await connection();
  const week = await getSpotifyWeek();

  return (
    <div className="space-y-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <TopList
          title="Top tracks · 7 days"
          entries={week.tracks.map((track) => ({ ...track, sub: track.artist }))}
        />
        <TopList title="Top artists · 7 days" entries={week.artists} />
      </div>
      <p className="font-mono text-[11px] text-ash-1">
        Rolling 7-day window, aggregated from play history ·{" "}
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
  const current = experience.filter((role) => role.end === "Present");

  return (
    <>
      <Section id="now" index="—" title="Now">
        <Reveal className="space-y-6">
          <p className="text-ash-2 leading-relaxed">
            Updated whenever something changes. Currently in New York, working on:
          </p>
          <ul className="space-y-3">
            {current.map((role) => (
              <li key={`${role.company}-${role.start}`} className="border-ink-3 border-l py-1 pl-5">
                <span className="font-medium text-ash-3 text-sm">{role.company}</span>
                <span className="text-ash-1 text-sm"> · {role.title}</span>
                <p className="mt-1 text-ash-1 text-sm leading-relaxed">{role.summary}</p>
              </li>
            ))}
          </ul>
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
