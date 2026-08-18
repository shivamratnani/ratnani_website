"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/components/motion/transitions";
import type { ContributionDay } from "@/lib/github";

/**
 * One hue, five steps. Level 0 stays neutral so empty days read as ground
 * rather than as a faint contribution; 1–4 ramp the site's single red from dark
 * to light, so density is legible without introducing a second colour.
 */
const FILL = ["bg-ink-2", "bg-red/30", "bg-red/55", "bg-red/80", "bg-red"] as const;

const DAY_LABELS = ["Mon", "Wed", "Fri"] as const;

/** "2026-08-18" → "18 Aug 2026", without dragging in a date library. */
function formatDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Heatmap({ weeks }: { weeks: ContributionDay[][] }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<ContributionDay | null>(null);

  return (
    <div>
      {/* Reserved line: the readout replaces a placeholder rather than being
       * inserted, so hovering never shifts the grid below it. */}
      <p className="mb-2 h-4 font-mono text-[11px] text-ash-1" aria-live="polite">
        {hovered ? (
          <>
            <span className="text-ash-3">{hovered.count.toLocaleString()}</span>{" "}
            {hovered.count === 1 ? "contribution" : "contributions"} on {formatDay(hovered.date)}
          </>
        ) : (
          <span className="text-ash-1/70">Hover a day for its contributions</span>
        )}
      </p>

      <div className="overflow-x-auto pb-2 [mask-image:linear-gradient(90deg,black_calc(100%-3rem),transparent)] sm:[mask-image:none]">
        <div className="flex gap-3">
          <div
            className="flex shrink-0 flex-col justify-between py-[2px] font-mono text-[10px] text-ash-1"
            aria-hidden="true"
          >
            {DAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="flex gap-[3px]" onPointerLeave={() => setHovered(null)}>
            {weeks.map((week, weekIndex) => (
              <div key={week[0]?.date ?? weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <motion.span
                    key={day.date}
                    // Kept alongside the readout: it is the only affordance for
                    // touch, where there is no hover.
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                    onPointerEnter={() => setHovered(day)}
                    onFocus={() => setHovered(day)}
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
    </div>
  );
}
