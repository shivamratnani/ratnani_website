"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { springy } from "./transitions";

const SIZE = 24;
/** Anything that should grow the ring and tint it red. */
const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary";

/**
 * A trailing ring that replaces nothing — the native cursor stays, this rides
 * behind it. Mounted only where a real pointer exists, so touch devices never
 * pay for it.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const springX = useSpring(x, springy);
  const springY = useSpring(y, springy);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX - SIZE / 2);
      y.set(event.clientY - SIZE / 2);
      setVisible(true);
      setActive(Boolean((event.target as Element | null)?.closest?.(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: springX, y: springY, width: SIZE, height: SIZE }}
      animate={{ scale: active ? 1.9 : 1, opacity: visible ? 1 : 0 }}
      transition={springy}
      className={`pointer-events-none fixed top-0 left-0 z-[60] rounded-full border transition-colors duration-300 ${
        active ? "border-red" : "border-ash-1"
      }`}
    />
  );
}
