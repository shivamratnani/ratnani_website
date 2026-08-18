"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT_EXPO } from "@/components/motion/transitions";
import { DOT_RADIUS, MARK_DOTS, MARK_HEIGHT, MARK_WIDTH } from "@/data/mark";

/** Seconds the idle shimmer takes to cross the whole mark. */
const SHIMMER_PERIOD = 2.1;

/** The path the hover beam races along — a diagonal sweep across the mark. */
const BEAM_PATH = `M0 ${MARK_HEIGHT} L${MARK_WIDTH} 0`;

const beamTransition = { duration: DURATION.slow, ease: EASE_OUT_EXPO } as const;

/** White head first, red trailing behind it — the hero's beam, on the logo. */
const beams = [
  { color: "var(--color-ash-3)", width: 1.1, delay: 0 },
  { color: "var(--color-red)", width: 1.6, delay: 0.09 },
] as const;

export function Logo({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}
      role="img"
      aria-label="Shivam Ratnani"
      className={className}
      initial="idle"
      whileHover={reduced ? undefined : "active"}
      // Focus follows hover so keyboard users see the same state.
      whileFocus={reduced ? undefined : "active"}
    >
      <title>Shivam Ratnani</title>

      {MARK_DOTS.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={DOT_RADIUS}
          fill="currentColor"
          style={
            reduced
              ? { opacity: 0.75 }
              : {
                  animation: `dot-shimmer ${SHIMMER_PERIOD}s var(--ease-out-expo) ${(dot.phase * SHIMMER_PERIOD).toFixed(3)}s infinite`,
                }
          }
        />
      ))}

      {reduced
        ? null
        : beams.map((beam) => (
            <motion.path
              key={beam.color}
              d={BEAM_PATH}
              stroke={beam.color}
              strokeWidth={beam.width}
              strokeLinecap="round"
              fill="none"
              // pathLength normalises the dash maths regardless of geometry.
              pathLength={1}
              strokeDasharray="0.35 1"
              variants={{
                idle: { strokeDashoffset: 1.35, opacity: 0 },
                active: { strokeDashoffset: -0.35, opacity: [0, 1, 1, 0] },
              }}
              transition={{ ...beamTransition, delay: beam.delay }}
            />
          ))}
    </motion.svg>
  );
}
