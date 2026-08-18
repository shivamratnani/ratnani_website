"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  riseVariants,
  STAGGER,
  staggerVariants,
  staticVariants,
} from "@/components/motion/transitions";
import { site } from "@/data/site";

const HEADLINE = "I build infrastructure that holds up under real load.";

/** Words repeat, so keys are disambiguated once here rather than by list index. */
const WORDS = HEADLINE.split(" ").map((word, index, all) => ({
  word,
  key: `${word}-${index}`,
  trailing: index === all.length - 1 ? "" : " ",
}));

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="mx-auto max-w-3xl px-6 pt-20 pb-8 sm:pt-28">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={reduced ? staticVariants : staggerVariants(STAGGER.tight)}
      >
        <motion.p
          variants={reduced ? staticVariants : riseVariants}
          className="mb-6 font-mono text-[11px] text-ash-1 uppercase tracking-widest"
        >
          {site.role} · {site.company} · {site.location}
        </motion.p>

        <h1 className="max-w-2xl text-balance font-medium text-3xl text-ash-3 leading-[1.15] tracking-tight sm:text-4xl">
          {WORDS.map(({ word, key, trailing }) => (
            <motion.span
              key={key}
              variants={reduced ? staticVariants : riseVariants}
              className="inline-block whitespace-pre"
            >
              {word}
              {trailing}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={reduced ? staticVariants : riseVariants}
          className="mt-6 max-w-xl text-ash-2 leading-relaxed"
        >
          Payments moving $10M+ a month, voice infrastructure carrying up to a million calls, and AI
          pipelines clinicians actually sign off on. I work with founding teams to get systems from
          scoping to production without breaking what already works.
        </motion.p>
      </motion.div>
    </section>
  );
}
