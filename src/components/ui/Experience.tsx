"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DURATION, EASE_OUT_EXPO, STAGGER } from "@/components/motion/transitions";
import { MEASURE } from "@/components/ui/layout";
import { education, experience, formatPeriod, type Role } from "@/data/experience";
import { cn } from "@/lib/cn";

/** Shared row chrome, so a role and the education entry cannot drift apart. */
const ROW = "flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:gap-6";
const PERIOD = "shrink-0 font-mono text-[11px] text-ash-1 tabular-nums sm:w-40 sm:text-right";
/**
 * Wraps the period and the toggle. On mobile they share one line under the
 * tagline; `sm:contents` dissolves the wrapper so both become direct children
 * of ROW's flex row again on wider screens.
 */
const META = "flex items-baseline justify-between gap-4 sm:contents";
const TOGGLE = "w-4 shrink-0 text-center font-mono text-ash-1 text-sm";

function collapse(reduced: boolean | null) {
  return {
    initial: reduced ? { opacity: 0 } : { height: 0, opacity: 0 },
    animate: reduced ? { opacity: 1 } : { height: "auto" as const, opacity: 1 },
    exit: reduced ? { opacity: 0 } : { height: 0, opacity: 0 },
    transition: reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE_OUT_EXPO },
  };
}

function RoleRow({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();
  // Roles with no highlights carry nothing extra to reveal, so they stay static
  // rather than offering an affordance that opens onto the line already shown.
  const expandable = Boolean(role.highlights?.length);

  const header = (
    <div className={ROW}>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-ash-3 text-base">
          {role.company}
          <span className="text-ash-1"> · {role.title}</span>
        </h3>
        <p className={cn(MEASURE, "mt-1.5 text-ash-2 text-sm leading-relaxed")}>{role.tagline}</p>
      </div>
      <div className={META}>
        <span className={PERIOD}>
          {formatPeriod(role.start)} — {formatPeriod(role.end)}
        </span>
        {/* Non-expandable rows keep an empty slot so every period column lines up. */}
        <span
          aria-hidden="true"
          className={cn(TOGGLE, expandable && "transition-colors group-hover:text-red")}
        >
          {expandable ? (open ? "−" : "+") : ""}
        </span>
      </div>
    </div>
  );

  // The sweep sits on the header, not the wrapper — on the wrapper it would
  // draw itself under the expanded panel and read as a section divider.
  const sweep = cn(
    "rule-sweep block w-full",
    expandable && "hover:[background-size:100%_1px]",
    open && "[background-size:100%_1px]",
  );

  return (
    <Reveal className="border-ink-3 border-t">
      {expandable ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(sweep, "group cursor-pointer text-left")}
        >
          {header}
        </button>
      ) : (
        <div className={sweep}>{header}</div>
      )}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div id={panelId} {...collapse(reduced)} className="overflow-hidden">
            <Stagger
              interval={STAGGER.base}
              // The panel already animates in; re-gating children on viewport
              // would strand them hidden when it opens below the fold.
              trigger="mount"
              className={cn(MEASURE, "space-y-2.5 pb-6")}
            >
              <StaggerItem className="text-ash-2 text-sm leading-relaxed">
                {role.summary}
              </StaggerItem>
              {role.highlights?.map((highlight) => (
                <StaggerItem
                  key={highlight}
                  className="relative pl-4 text-ash-1 text-sm leading-relaxed before:absolute before:top-[0.6em] before:left-0 before:size-1 before:rounded-full before:bg-red/70"
                >
                  {highlight}
                </StaggerItem>
              ))}
            </Stagger>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Reveal>
  );
}

export function Experience() {
  const [showEarlier, setShowEarlier] = useState(false);
  const reduced = useReducedMotion();

  const primary = experience.filter((role) => role.tier === "primary");
  const earlier = experience.filter((role) => role.tier === "earlier");

  return (
    <div>
      {/* Education reads as its own thing rather than a trailing row: one
       * line, labelled, above the roles it came before. */}
      <Reveal className="mb-10 space-y-3">
        <h3 className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">Education</h3>
        <div className="border-ink-3 border-t border-b">
          <div className={ROW}>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-ash-3 text-base">
                {education.school}
                <span className="text-ash-1"> · {education.degree}</span>
              </h4>
            </div>
            <div className={META}>
              <span className={PERIOD}>
                {formatPeriod(education.start)} — {formatPeriod(education.end)}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="border-ink-3 border-b">
        {primary.map((role) => (
          <RoleRow key={`${role.company}-${role.start}`} role={role} />
        ))}

        <AnimatePresence initial={false}>
          {showEarlier ? (
            <motion.div key="earlier" {...collapse(reduced)} className="overflow-hidden">
              {earlier.map((role) => (
                <RoleRow key={`${role.company}-${role.start}`} role={role} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setShowEarlier((value) => !value)}
          aria-expanded={showEarlier}
          className="w-full cursor-pointer border-ink-3 border-t py-5 text-left font-mono text-[11px] text-ash-1 uppercase tracking-widest transition-colors hover:text-red"
        >
          {showEarlier ? "− hide earlier roles" : `+ ${earlier.length} earlier roles`}
        </button>
      </div>
    </div>
  );
}
