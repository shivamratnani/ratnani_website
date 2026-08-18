import type { Transition, Variants } from "motion/react";

/**
 * The entire site's motion vocabulary. Nothing outside this file defines an
 * easing curve, a duration, or a stagger interval — components compose the
 * variants below instead. Mirrors --ease-out-expo in styles/globals.css.
 */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
} as const;

export const STAGGER = {
  tight: 0.03,
  base: 0.06,
  loose: 0.12,
} as const;

export const RISE = 24;

export const transition = (duration: number = DURATION.base, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_OUT_EXPO,
});

/** Fade + rise. The default entrance for anything that enters. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: RISE },
  visible: { opacity: 1, y: 0, transition: transition() },
};

/** Parent that releases children on an interval. Pairs with riseVariants. */
export const staggerVariants = (stagger: number = STAGGER.base, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Static replacements used when the visitor asks for reduced motion. */
export const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export const springy: Transition = { type: "spring", stiffness: 380, damping: 30 };
