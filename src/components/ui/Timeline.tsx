"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { DURATION, EASE_OUT_EXPO } from "@/components/motion/transitions";
import { experience, formatPeriod, type Role } from "@/data/experience";

function RoleEntry({ role }: { role: Role }) {
  return (
    <article className="border-ink-3 border-l py-4 pl-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-medium text-ash-3 text-sm">
          {role.company}
          <span className="text-ash-1"> · {role.title}</span>
        </h3>
        <span className="font-mono text-[11px] text-ash-1 tabular-nums">
          {formatPeriod(role.start)} — {formatPeriod(role.end)}
        </span>
      </div>

      <p className="mt-2 text-ash-2 text-sm leading-relaxed">{role.summary}</p>

      {role.highlights ? (
        <ul className="mt-3 space-y-1.5">
          {role.highlights.map((highlight) => (
            <li
              key={highlight}
              className="relative pl-4 text-ash-1 text-sm leading-relaxed before:absolute before:top-[0.6em] before:left-0 before:size-1 before:rounded-full before:bg-ink-3"
            >
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function Timeline() {
  const [showEarlier, setShowEarlier] = useState(false);
  const reduced = useReducedMotion();

  const primary = experience.filter((role) => role.tier === "primary");
  const earlier = experience.filter((role) => role.tier === "earlier");

  return (
    <div className="space-y-1">
      {primary.map((role) => (
        <Reveal key={`${role.company}-${role.start}`}>
          <RoleEntry role={role} />
        </Reveal>
      ))}

      <AnimatePresence initial={false}>
        {showEarlier ? (
          <motion.div
            key="earlier"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE_OUT_EXPO }
            }
            className="overflow-hidden"
          >
            {earlier.map((role) => (
              <RoleEntry key={`${role.company}-${role.start}`} role={role} />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setShowEarlier((value) => !value)}
        aria-expanded={showEarlier}
        className="ml-5 pt-3 font-mono text-[11px] text-ash-1 transition-colors hover:text-red"
      >
        {showEarlier ? "− hide earlier roles" : `+ ${earlier.length} earlier roles`}
      </button>
    </div>
  );
}
