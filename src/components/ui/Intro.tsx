import { Reveal } from "@/components/motion/Reveal";
import { MEASURE, SHELL } from "@/components/ui/layout";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/** Screen two — the résumé summary the hero no longer carries. */
export function Intro() {
  return (
    <section id="intro" className={cn(SHELL, "scroll-mt-24 py-24 sm:py-32")}>
      <Reveal className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">
        {site.role} · {site.company} · {site.location}
      </Reveal>
      <Reveal delay={0.08}>
        <p className={cn(MEASURE, "mt-6 text-ash-2 text-lg leading-relaxed sm:text-xl")}>
          {site.summary}
        </p>
      </Reveal>
    </section>
  );
}
