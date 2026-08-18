"use client";

import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { useEffect } from "react";

/**
 * Mounts Lenis for the whole document. No-ops under reduced motion.
 *
 * Lenis owns scroll position, so `overflow: hidden` cannot lock the page on its
 * own. The mobile menu asks for a lock by dispatching `lenis:toggle` rather than
 * reaching for an instance it would otherwise need lifted into a context.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onToggle = (event: Event) => {
      const stopped = (event as CustomEvent<{ stopped: boolean }>).detail?.stopped;
      if (stopped) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("lenis:toggle", onToggle);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("lenis:toggle", onToggle);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
