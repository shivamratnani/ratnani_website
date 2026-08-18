import { cn } from "@/lib/cn";

/**
 * Infinite horizontal scroll. The track is duplicated so the loop is seamless;
 * the copy is aria-hidden so screen readers hear the list once.
 */
export function Marquee({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      {[false, true].map((isClone) => (
        <ul
          key={String(isClone)}
          aria-hidden={isClone || undefined}
          className="flex shrink-0 animate-[marquee_42s_linear_infinite] items-center gap-8 pr-8 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        >
          {items.map((item) => (
            <li key={item} className="whitespace-nowrap font-mono text-ash-1 text-xs">
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
