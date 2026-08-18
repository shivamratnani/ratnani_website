"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EnergyGrid } from "@/components/motion/EnergyGrid";
import { DURATION, STAGGER } from "@/components/motion/transitions";
import { site } from "@/data/site";

/**
 * Screen one, and nothing else: a lattice warped by unseen mass, with energy
 * running along it and no copy on top. Everything that used to sit here — role, company, résumé
 * summary — lives in <Intro>, one screen down. The heading stays in the
 * document for the outline and for search; it just isn't drawn.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // The field fades as the section leaves, so it never fights the copy below.
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      // svh, not dvh: dvh would resize the canvas every time a mobile URL bar
      // collapses, forcing a rebuild of the whole field mid-scroll.
      className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden"
    >
      <h1 className="sr-only">{`${site.name} — ${site.role}`}</h1>

      <motion.div
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.slow, ease: "linear" }}
        style={reduced ? undefined : { opacity }}
        className="absolute inset-0"
      >
        <EnergyGrid className="h-full w-full [mask-image:radial-gradient(ellipse_52%_58%_at_50%_50%,black_15%,transparent_100%)]" />
      </motion.div>

      <motion.a
        href="#intro"
        aria-label="Scroll to introduction"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STAGGER.loose * 4, duration: DURATION.slow }}
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
