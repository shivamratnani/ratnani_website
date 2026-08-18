"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { riseVariants, staticVariants, transition } from "./transitions";

type RevealProps = {
  children: ReactNode;
  /** Seconds to hold before entering. Prefer <Stagger> for lists. */
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Fade-and-rise on scroll into view — the single entrance used site-wide.
 *
 * Reduced motion resolves here rather than at each call site, so honouring the
 * preference is automatic for every consumer.
 */
export function Reveal({ children, delay = 0, ...rest }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={reduced ? staticVariants : riseVariants}
      transition={reduced ? { duration: 0 } : transition(undefined, delay)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
