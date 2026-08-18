"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SplitText } from "@/components/motion/SplitText";

/**
 * Section heading with a rule that draws itself across the full-bleed width as
 * the heading scrolls into place — scroll-linked rather than time-based, so it
 * tracks the reader instead of firing once and finishing.
 */
export function SectionHeading({ index, title }: { index?: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 55%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="mb-10 flex items-baseline gap-3 sm:gap-5">
      {index ? (
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-red text-xs"
        >
          {index}
        </motion.span>
      ) : null}
      <h2 className="font-medium text-ash-3 text-xl tracking-tight sm:text-2xl">
        <SplitText>{title}</SplitText>
      </h2>
      <motion.span
        style={reduced ? undefined : { scaleX }}
        className="h-px flex-1 origin-left bg-ink-3"
        aria-hidden="true"
      />
    </div>
  );
}
