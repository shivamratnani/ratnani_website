"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { DotField } from "@/components/motion/DotField";
import { SplitText } from "@/components/motion/SplitText";
import { DURATION, STAGGER } from "@/components/motion/transitions";
import { SHELL } from "@/components/ui/layout";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * Screen one, and nothing else: the living dot mesh behind a single line.
 * Everything that used to sit here — role, company, résumé summary — now lives
 * in <Intro>, one screen down.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Content drifts up and fades as the section leaves, so the mesh is the last
  // thing standing before the page proper begins.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      // svh, not dvh: dvh would resize the canvas every time a mobile URL bar
      // collapses, forcing a rebuild of the whole field mid-scroll.
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden"
    >
      <DotField className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_78%)]" />

      <motion.div
        style={reduced ? undefined : { y, opacity }}
        className={cn(SHELL, "relative flex flex-1 flex-col justify-center py-24 sm:py-32")}
      >
        <h1 className="text-balance font-medium text-[clamp(2.5rem,10vw,8.5rem)] text-ash-3 leading-[0.95] tracking-tighter">
          <SplitText by="char" trigger="mount" delayChildren={0.15}>
            {site.tagline}
          </SplitText>
        </h1>
      </motion.div>

      <motion.a
        href="#intro"
        aria-label="Scroll to introduction"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.loose * 8, duration: DURATION.slow }}
        style={reduced ? undefined : { opacity }}
        className="group relative z-10 flex flex-col items-center gap-3 pb-10 sm:pb-14"
      >
        <span className="font-mono text-[10px] text-ash-1 uppercase tracking-[0.2em] transition-colors group-hover:text-ash-2">
          Scroll
        </span>
        <span className="relative h-10 w-px overflow-hidden bg-ink-3" aria-hidden="true">
          <span className="absolute inset-x-0 h-1/2 animate-[scroll-cue_2.2s_var(--ease-out-expo)_infinite] bg-red motion-reduce:animate-none" />
        </span>
      </motion.a>
    </section>
  );
}
