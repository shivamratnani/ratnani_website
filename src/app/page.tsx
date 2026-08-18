import { connection } from "next/server";
import { Suspense } from "react";
import { Heatmap } from "@/components/github/Heatmap";
import { Languages } from "@/components/github/Languages";
import { PinnedRepos } from "@/components/github/PinnedRepos";
import { Stats } from "@/components/github/Stats";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/ui/ContactForm";
import { Hero } from "@/components/ui/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { Section } from "@/components/ui/Section";
import { Timeline } from "@/components/ui/Timeline";
import { education } from "@/data/experience";
import { site, skills } from "@/data/site";
import { getGitHubTracker } from "@/lib/github";

/** Skeleton height matches the loaded grid so nothing shifts when it resolves. */
function TrackerFallback() {
  return <div className="h-[220px] animate-pulse rounded-lg bg-ink-1" />;
}

async function Tracker() {
  // Request-time island inside a prerendered shell. Without this the cached
  // fetch would run at build, where there are no credentials, and a GitHub
  // outage would fail the whole page rather than this one section.
  await connection();
  const tracker = await getGitHubTracker();

  if (!tracker) {
    return (
      <p className="text-ash-1 text-sm">
        GitHub data is unavailable right now —{" "}
        <a
          href={`https://github.com/${site.github}`}
          target="_blank"
          rel="noreferrer noopener"
          className="link-sweep text-ash-2"
        >
          see the profile directly
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <Stats tracker={tracker} />
      <Heatmap weeks={tracker.weeks} />
      <Languages languages={tracker.languages} />

      <div className="space-y-4 pt-2">
        <h3 className="font-mono text-[11px] text-ash-1 uppercase tracking-widest">Pinned</h3>
        <PinnedRepos repos={tracker.repos} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <Reveal className="mx-auto max-w-3xl px-6 py-6">
        <Marquee items={skills} />
      </Reveal>

      <Section id="work" index="01" title="Work">
        <Timeline />
        <Reveal className="mt-6 border-ink-3 border-l py-4 pl-5">
          <h3 className="font-medium text-ash-3 text-sm">
            {education.school}
            <span className="text-ash-1"> · {education.degree}</span>
          </h3>
          <p className="mt-1 font-mono text-[11px] text-ash-1">2022 — 2025</p>
        </Reveal>
      </Section>

      <Section id="projects" index="02" title="On GitHub">
        <Suspense fallback={<TrackerFallback />}>
          <Tracker />
        </Suspense>
      </Section>

      <Section id="contact" index="03" title="Contact">
        <Reveal className="mb-6">
          <p className="text-ash-2 leading-relaxed">
            Building something that needs to survive real users? Reach me at{" "}
            <a href={`mailto:${site.email}`} className="link-sweep text-ash-3">
              {site.email}
            </a>
            .
          </p>
        </Reveal>
        <Reveal>
          <ContactForm />
        </Reveal>
      </Section>
    </>
  );
}
