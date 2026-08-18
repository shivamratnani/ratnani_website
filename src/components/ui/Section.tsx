import type { ReactNode } from "react";
import { SHELL } from "@/components/ui/layout";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
 * The only section wrapper. Owns the full-bleed gutters, vertical rhythm, and
 * anchor offset, so spacing cannot drift between sections. Stays a Server
 * Component; the scroll-linked heading is the one client island inside it.
 */
export function Section({ id, index, title, children, className }: SectionProps) {
  return (
    <section
      id={id}
      // The header is fixed, so anchor jumps need to clear it themselves.
      className={cn(SHELL, "scroll-mt-20 py-20 sm:py-28", className)}
    >
      {title ? <SectionHeading index={index} title={title} /> : null}
      {children}
    </section>
  );
}
