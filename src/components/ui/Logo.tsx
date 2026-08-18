"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DURATION, EASE_OUT_EXPO } from "@/components/motion/transitions";
import {
  DOT_RADIUS,
  MARK_DOTS,
  MARK_HEIGHT,
  MARK_WIDTH,
  SCENE_FILL,
  SHARD_RADIUS,
  SHARD_RADIUS_SCENE,
  SHARDS,
  type Tone,
} from "@/data/mark";

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

/** Milliseconds a shard spends in flight. */
const FLIGHT = 720;
/** Spread across the mark's diagonal, so the far corner lets go last. */
const PHASE_SPREAD = 200;
/** Spread within one dot, so its shards bead off it rather than burst. */
const SHARD_SPREAD = 280;
/** How long the fill layer's reveal is smeared across the scene's diagonal. */
const FILL_SPREAD = 600;
/** The fill layer's fade, in and out. Out is quick so the shards leave last. */
const FILL_FADE = 300;

/**
 * The scene's tonal palette. Wings, feathers, clouds and sun stay on the
 * site's tokens; the body's two browns are scene-local skin tones — the one
 * place the site earns a colour outside its palette.
 */
const TONE_COLOR: Record<Tone, string> = {
  wing: "var(--color-ash-3)",
  body: "#a18468",
  face: "#d2ab84",
  feather: "var(--color-ash-2)",
  cloud: "var(--color-ash-1)",
  sun: "var(--color-red)",
};

/** Milliseconds after landing before the mark comes apart on its own. */
const AUTOPLAY_DELAY = 3000;
/** How long the scene holds before the dots gather back into the mark. */
const AUTOPLAY_HOLD = 5000;

export function Logo({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  // Shown once on landing, so the mark tells its story before anyone hovers.
  const [autoplaying, setAutoplaying] = useState(false);
  const fallen = (hovered || autoplaying) && !reduced;

  useEffect(() => {
    if (reduced) return;
    const fall = setTimeout(() => setAutoplaying(true), AUTOPLAY_DELAY);
    const gather = setTimeout(() => setAutoplaying(false), AUTOPLAY_DELAY + AUTOPLAY_HOLD);
    return () => {
      clearTimeout(fall);
      clearTimeout(gather);
    };
  }, [reduced]);

  const hover = reduced
    ? undefined
    : {
        onPointerEnter: () => setHovered(true),
        onPointerLeave: () => setHovered(false),
        // Focus follows hover so keyboard users see the same state.
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      };

  return (
    <motion.svg
      viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}
      role="img"
      aria-label="Shivam Ratnani"
      className={className}
      // The scene Icarus falls into is far taller than the mark's own box.
      style={{ overflow: "visible" }}
      initial="idle"
      animate={fallen ? "active" : "idle"}
    >
      <title>Shivam Ratnani</title>

      {/* The hit area: the mark's box, not the dots that leave it. */}
      <rect width={MARK_WIDTH} height={MARK_HEIGHT} fill="transparent" {...hover} />

      {reduced ? (
        <g pointerEvents="none">
          {MARK_DOTS.map((dot) => (
            <circle
              key={`${dot.x}-${dot.y}`}
              cx={dot.x}
              cy={dot.y}
              r={DOT_RADIUS}
              fill="currentColor"
              opacity={0.75}
            />
          ))}
        </g>
      ) : (
        <g pointerEvents="none">
          {/* The dots the shards cannot account for: the picture's fine grain,
           * fading in around the shards as they land. Never animated idle. */}
          {SCENE_FILL.map((dot) => (
            <circle
              key={`${dot.x}-${dot.y}`}
              r={1}
              className="logo-shard"
              fill={TONE_COLOR[dot.tone]}
              style={{
                transform: `translate(${dot.x}px, ${dot.y}px) scale(${SHARD_RADIUS_SCENE})`,
                opacity: fallen ? 1 : 0,
                transition: `opacity ${FILL_FADE}ms linear ${Math.round(
                  fallen ? FLIGHT * 0.4 + dot.phase * FILL_SPREAD : (1 - dot.phase) * 120,
                )}ms`,
              }}
            />
          ))}
          {SHARDS.map((shard) => {
            const point = fallen ? shard.to : shard.from;
            const scale = fallen ? SHARD_RADIUS_SCENE : SHARD_RADIUS;
            // Shards nearest their destination go first on the way out and
            // come home last, so the dot drains and refills rather than blinks.
            const lead = fallen ? shard.offset : 1 - shard.offset;
            const phase = fallen ? shard.phase : 1 - shard.phase;

            return (
              <circle
                key={`${shard.to.x}-${shard.to.y}`}
                r={1}
                className="logo-shard"
                fill={fallen ? TONE_COLOR[shard.tone] : "currentColor"}
                style={{
                  transform: `translate(${point.x}px, ${point.y}px) scale(${scale})`,
                  transition: `transform ${FLIGHT}ms var(--ease-out-expo) ${Math.round(phase * PHASE_SPREAD + lead * SHARD_SPREAD)}ms, fill ${FLIGHT}ms linear, opacity ${FLIGHT}ms linear`,
                  // The shimmer belongs to the mark. Once the dots land it has
                  // to stop, or the wave eats holes in the picture they form.
                  animation: fallen
                    ? undefined
                    : `dot-shimmer ${SHIMMER_PERIOD}s var(--ease-out-expo) ${(shard.phase * SHIMMER_PERIOD).toFixed(3)}s infinite`,
                }}
              />
            );
          })}
        </g>
      )}

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
              pointerEvents="none"
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
