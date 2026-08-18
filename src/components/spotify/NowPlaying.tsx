"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NowPlaying as NowPlayingData } from "@/lib/spotify";

/**
 * One minute, not thirty seconds: each poll costs a Spotify request per
 * visitor, and the app's quota is finite — 30s polling across a few open tabs
 * is what once tripped Spotify's rate limit. The local ticker below keeps the
 * progress bar smooth between polls.
 */
const POLL_MS = 60_000;
/** How often the local progress estimate advances between polls. */
const TICK_MS = 1_000;

/**
 * Sized against its own column rather than the viewport: the card renders in a
 * one-column phone layout, in a ~300px column at 2xl, and full width on /now,
 * and no viewport breakpoint separates the first two from the third.
 *
 * The cover stays square and absorbs the row's slack (`flex-auto min-h-0`)
 * rather than setting its height, so the card tracks the lists beside it
 * instead of driving them. `object-cover` crops if the row is shorter than the
 * art is wide.
 */
const ART =
  "aspect-square w-full min-h-0 flex-auto rounded-lg object-cover @sm:aspect-auto @sm:size-14 @sm:flex-none @sm:rounded";

function clock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Live ticker. Polls rather than streams — one request per 30s is plenty. */
export function NowPlaying({ initial }: { initial: NowPlayingData }) {
  const [track, setTrack] = useState(initial);
  const [progress, setProgress] = useState(initial?.progressMs ?? 0);

  useEffect(() => {
    const controller = new AbortController();

    const poll = async () => {
      try {
        const response = await fetch("/api/spotify/now-playing", { signal: controller.signal });
        if (!response.ok) return;
        const next = (await response.json()) as NowPlayingData;
        setTrack(next);
        setProgress(next?.progressMs ?? 0);
      } catch {
        // Offline or aborted — keep showing the last known track.
      }
    };

    const id = setInterval(poll, POLL_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, []);

  // Advance locally between polls so the bar moves rather than stepping every
  // 30 seconds. Clamped to the track length; the next poll is the source of truth.
  useEffect(() => {
    if (!track?.playing || !track.durationMs) return;
    const id = setInterval(
      () => setProgress((value) => Math.min(track.durationMs ?? 0, value + TICK_MS)),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [track?.playing, track?.durationMs]);

  if (!track) {
    return (
      <p className="flex items-center gap-2 font-mono text-[11px] text-ash-1">
        <span className="size-1.5 rounded-full bg-ash-1" />
        Not listening right now
      </p>
    );
  }

  // The bar is meaningless for a track that has already finished.
  const percent =
    track.playing && track.durationMs ? Math.min(100, (progress / track.durationMs) * 100) : null;

  return (
    // Narrow column: a lock-screen player, cover first. Wide: a compact row, so
    // a full-width slot does not turn the cover into a billboard. The query is
    // on the wrapper — an element cannot size itself against its own container.
    <div className="@container h-full">
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex h-full w-full max-w-md flex-col gap-4 rounded-xl border border-ink-3 bg-ink-1 p-4 transition-colors duration-300 hover:border-ash-1/40 @sm:flex-row @sm:items-center @sm:rounded-lg @sm:p-3"
      >
        {track.art ? (
          <Image src={track.art} alt="" width={320} height={320} unoptimized className={ART} />
        ) : (
          <span className={`${ART} bg-ink-2`} />
        )}

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-mono text-[10px] text-ash-1 uppercase tracking-widest">
            {track.playing ? (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-red" />
              </span>
            ) : (
              <span className="size-1.5 rounded-full bg-ash-1" />
            )}
            {track.playing ? "Now playing" : "Last played"}
          </span>

          <span className="mt-1.5 block truncate font-medium text-ash-3 text-base @sm:text-sm">
            {track.name}
          </span>
          <span className="block truncate text-ash-1 text-xs">
            {track.artist} · {track.album}
          </span>

          {percent === null ? null : (
            <span className="mt-3 block">
              <span className="block h-1 w-full overflow-hidden rounded-full bg-ink-3">
                <span
                  className="block h-full rounded-full bg-red transition-[width] duration-1000 ease-linear"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="mt-1.5 flex justify-between font-mono text-[10px] text-ash-1 tabular-nums">
                <span>{clock(progress)}</span>
                <span>{clock(track.durationMs ?? 0)}</span>
              </span>
            </span>
          )}
        </span>
      </a>
    </div>
  );
}
