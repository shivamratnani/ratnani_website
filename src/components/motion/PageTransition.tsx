"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { DURATION, EASE_OUT_EXPO } from "./transitions";

/**
 * Cross-route enter animation.
 *
 * Deliberately not keyed on the pathname, and deliberately not wrapped in
 * AnimatePresence. Either one remounts this subtree during hydration, and a
 * remount throws away the streaming-Suspense placeholders React left in the
 * server HTML — the content for those boundaries then never leaves its
 * `<div hidden id="S:n">` staging container. That is what was hiding the GitHub
 * tracker and pinning its stats at zero.
 *
 * Animating the same element on each pathname change gets the transition
 * without ever tearing the tree down.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is this effect's trigger, not a value it reads.
  useEffect(() => {
    if (reduced || !scope.current) return;
    animate(
      scope.current,
      { opacity: [0, 1], y: [12, 0] },
      { duration: DURATION.base, ease: EASE_OUT_EXPO },
    );
  }, [pathname, reduced, animate, scope]);

  return <div ref={scope}>{children}</div>;
}
