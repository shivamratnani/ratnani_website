import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Entry = {
  id: string;
  name: string;
  url: string;
  art: string | null;
  plays: number;
  /** Secondary line — artist name for tracks, omitted for artists. */
  sub?: string;
};

/**
 * Ranked list shared by top tracks and top artists. One component rather than
 * two near-identical ones; the only difference between them is the `sub` line.
 */
export function TopList({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">{title}</h3>

      {entries.length === 0 ? (
        <p className="text-ash-1 text-sm">Nothing logged yet this week.</p>
      ) : (
        <Stagger className="space-y-px">
          {entries.map((entry, index) => (
            <StaggerItem key={entry.id}>
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-300 hover:bg-ink-1"
              >
                <span className="w-4 shrink-0 font-mono text-[11px] text-ash-1 tabular-nums">
                  {index + 1}
                </span>

                {entry.art ? (
                  <Image
                    src={entry.art}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                    className="size-9 shrink-0 rounded"
                  />
                ) : (
                  <span className="size-9 shrink-0 rounded bg-ink-2" />
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ash-3 text-sm">{entry.name}</span>
                  {entry.sub ? (
                    <span className="block truncate text-ash-1 text-xs">{entry.sub}</span>
                  ) : null}
                </span>

                <span className="shrink-0 font-mono text-[11px] text-ash-1 tabular-nums">
                  {entry.plays}
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
