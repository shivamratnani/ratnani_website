import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  /** Mono index shown beside the heading, e.g. "01". */
  index?: string;
  title?: string;
  children: ReactNode;
  className?: string;
};

/**
 * The only section wrapper. Owns heading treatment, vertical rhythm, and the
 * scroll reveal, so spacing cannot drift between sections.
 */
export function Section({ id, index, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-3xl px-6 py-20 sm:py-28", className)}>
      {title ? (
        <Reveal className="mb-10 flex items-baseline gap-3">
          {index ? <span className="font-mono text-xs text-red">{index}</span> : null}
          <h2 className="font-medium text-ash-3 text-xl tracking-tight">{title}</h2>
          <span className="h-px flex-1 bg-ink-3" aria-hidden="true" />
        </Reveal>
      ) : null}
      {children}
    </section>
  );
}
