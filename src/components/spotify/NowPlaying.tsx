"use client";

import { useEffect, useState } from "react";
import type { NowPlaying as NowPlayingData } from "@/lib/spotify";

const POLL_MS = 30_000;

/** Live ticker. Polls rather than streams — one request per 30s is plenty. */
export function NowPlaying({ initial }: { initial: NowPlayingData }) {
  const [track, setTrack] = useState(initial);

  useEffect(() => {
    const controller = new AbortController();

    const poll = async () => {
      try {
        const response = await fetch("/api/spotify/now-playing", { signal: controller.signal });
        if (response.ok) setTrack((await response.json()) as NowPlayingData);
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

  if (!track) {
    return (
      <p className="flex items-center gap-2 font-mono text-[11px] text-ash-1">
        <span className="size-1.5 rounded-full bg-ash-1" />
        Not listening right now
      </p>
    );
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-2 font-mono text-[11px] text-ash-2"
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-red" />
      </span>
      <span className="truncate">
        {track.name} — {track.artist}
      </span>
    </a>
  );
}
