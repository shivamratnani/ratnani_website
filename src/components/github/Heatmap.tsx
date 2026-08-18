"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/components/motion/transitions";
import type { ContributionDay } from "@/lib/github";

/**
 * Grayscale ramp for levels 0–3; level 4 is the only red.
 * That restraint is the point: the heaviest days are the sole accent on the
 * page, so the grid reads as a signal rather than decoration.
 */
const FILL = ["bg-ink-2", "bg-ash-1/25", "bg-ash-1/50", "bg-ash-2/70", "bg-red"] as const;

const DAY_LABELS = ["Mon", "Wed", "Fri"] as const;

export function Heatmap({ weeks }: { weeks: ContributionDay[][] }) {
  const reduced = useReducedMotion();

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3">
        <div
          className="flex shrink-0 flex-col justify-between py-[2px] font-mono text-[10px] text-ash-1"
          aria-hidden="true"
        >
          {DAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={week[0]?.date ?? weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <motion.span
                  key={day.date}
                  title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                  className={`size-[11px] rounded-[2px] ${FILL[day.level]}`}
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: DURATION.fast,
                          ease: EASE_OUT_EXPO,
                          // Diagonal wave: later weeks and lower rows arrive last,
                          // so the top-quartile reds ignite across the grid.
                          delay: (weekIndex + dayIndex) * STAGGER.tight * 0.35,
                        }
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
