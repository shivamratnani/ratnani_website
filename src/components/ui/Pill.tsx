import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono chip used for skills, languages, and metadata. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border border-ink-3 bg-ink-1 px-2.5 py-1 font-mono text-ash-2 text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}
