"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { riseVariants, STAGGER, staggerVariants, staticVariants } from "./transitions";

type DivProps = Omit<HTMLMotionProps<"div">, "children">;

type StaggerProps = {
  children: ReactNode;
  interval?: number;
  delayChildren?: number;
} & DivProps;

/**
 * Releases direct <StaggerItem> children one after another on scroll into view.
 * Prefer this over per-child Reveal delays — the interval stays in one place.
 */
export function Stagger({
  children,
  interval = STAGGER.base,
  delayChildren = 0,
  ...rest
}: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={reduced ? staticVariants : staggerVariants(interval, delayChildren)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * One staggered child. A separate export rather than a static property on
 * Stagger: across the RSC boundary a "use client" module resolves to a client
 * reference proxy that carries no static properties, so Stagger.Item would be
 * undefined whenever a Server Component rendered it.
 */
export function StaggerItem({ children, ...rest }: { children: ReactNode } & DivProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={reduced ? staticVariants : riseVariants} {...rest}>
      {children}
    </motion.div>
  );
}
