import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { Playlist } from "@/lib/spotify";

/**
 * Public playlists as a card grid. Renders nothing when the list is empty —
 * the fetch degrades to `[]` when the token lacks the playlist scope, and an
 * empty section reads as broken rather than as "none yet".
 */
export function Playlists({ playlists }: { playlists: Playlist[] }) {
  if (playlists.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">Playlists</h3>
      <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {playlists.map((playlist) => (
          <StaggerItem key={playlist.id}>
            <a
              href={playlist.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-lg border border-ink-3 bg-ink-1 p-3 transition-colors duration-300 hover:border-ash-1/40"
            >
              {playlist.art ? (
                <Image
                  src={playlist.art}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="size-11 shrink-0 rounded"
                />
              ) : (
                <span className="size-11 shrink-0 rounded bg-ink-2" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ash-3 text-sm">{playlist.name}</span>
                <span className="block font-mono text-[11px] text-ash-1">
                  {playlist.tracks} {playlist.tracks === 1 ? "track" : "tracks"}
                </span>
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
