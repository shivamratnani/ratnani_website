"use client";

import { motion, useReducedMotion } from "motion/react";
import { riseVariants, STAGGER, staggerVariants, staticVariants } from "./transitions";

type SplitTextProps = {
  children: string;
  /** Characters read as a wave; words read as a list. */
  by?: "char" | "word";
  interval?: number;
  delayChildren?: number;
  /** Enter immediately (hero) or when scrolled into view (everything else). */
  trigger?: "mount" | "view";
  className?: string;
};

/**
 * Splits a string and releases the pieces on the shared rise variant.
 *
 * Words are always wrapped so a break can only ever happen between them —
 * character splitting inside a word would otherwise let a line wrap mid-word.
 * The whole string is exposed to assistive tech once, via the sr-only copy.
 */
export function SplitText({
  children,
  by = "word",
  interval = by === "char" ? STAGGER.tight : STAGGER.base,
  delayChildren = 0,
  trigger = "view",
  className,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const words = children.split(" ");
  const enter =
    trigger === "mount"
      ? { animate: "visible" as const }
      : { whileInView: "visible" as const, viewport: { once: true, amount: 0.2 } };

  return (
    <motion.span
      className={className}
      aria-label={children}
      initial="hidden"
      variants={reduced ? staticVariants : staggerVariants(interval, delayChildren)}
      {...enter}
    >
      {words.map((word, wordIndex) => (
        <span
          // Position is the identity here: the same word (or character) recurs
          // within one string, and the pieces never reorder.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          key={`${word}-${wordIndex}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
        >
          {(by === "char" ? [...word] : [word]).map((piece, pieceIndex) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: as above
              key={`${piece}-${pieceIndex}`}
              variants={reduced ? staticVariants : riseVariants}
              className="inline-block"
            >
              {piece}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
