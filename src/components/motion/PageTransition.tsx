"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT_EXPO } from "./transitions";

/**
 * Cross-route enter animation, keyed on the pathname.
 *
 * `mode="wait"` is deliberately not used: holding the outgoing route would
 * delay the incoming one past the point the browser restores scroll position.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
