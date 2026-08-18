"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DURATION, EASE_OUT_EXPO } from "./transitions";

type CountUpProps = {
  to: number;
  /** Rendered after the number, inside the same element. */
  suffix?: string;
  className?: string;
};

/** Animates 0 → `to` once, when scrolled into view. */
export function CountUp({ to, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);
  const count = useMotionValue(0);

  useEffect(() => {
    if (!inView || reduced) return;
    // Animate a motion value rather than handing animate() two bare numbers.
    // The numeric overload no-ops here, which is what pinned every stat at 0.
    const unsubscribe = count.on("change", (latest) => setValue(Math.round(latest)));
    const controls = animate(count, to, { duration: DURATION.slow, ease: EASE_OUT_EXPO });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, reduced, to, count]);

  // The number is data, not decoration. If the in-view trigger never fires the
  // tile would sit on a wrong value forever, so settle on the real one.
  useEffect(() => {
    if (reduced || inView) return;
    const settle = setTimeout(() => setValue(to), 2000);
    return () => clearTimeout(settle);
  }, [inView, reduced, to]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
