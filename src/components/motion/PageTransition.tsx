"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT_EXPO } from "./transitions";

/**
 * Cross-route enter animation, keyed on the pathname.
 *
 * Deliberately NOT wrapped in AnimatePresence. There is no exit animation here,
 * so presence tracking bought nothing — and it re-parents the subtree during
 * hydration, which orphans React's streaming-Suspense placeholder comments. The
 * server-rendered content for a boundary then never leaves its `<div hidden>`
 * staging container, which is what was hiding the GitHub tracker.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
