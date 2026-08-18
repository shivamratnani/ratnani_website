import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { Playlist, Ranked } from "@/lib/spotify";

/**
 * My playlists ranked by how much I actually played them. Renders nothing when
 * the list is empty — plays only attribute to playlists in my own library, so a
 * quiet window is normal and an empty section reads as broken rather than as
 * "nothing yet".
 */
export function Playlists({ title, playlists }: { title: string; playlists: Ranked<Playlist>[] }) {
  if (playlists.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">{title}</h3>
      <Stagger className="space-y-3">
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
                  {playlist.plays} {playlist.plays === 1 ? "play" : "plays"} · {playlist.tracks}{" "}
                  {playlist.tracks === 1 ? "track" : "tracks"}
                </span>
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
