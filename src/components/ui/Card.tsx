import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Raised surface with a hover lift. Used by repo cards and track rows. */
export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-ink-3 bg-ink-1 p-4",
        interactive &&
          "transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-ink-3/80 hover:bg-ink-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
