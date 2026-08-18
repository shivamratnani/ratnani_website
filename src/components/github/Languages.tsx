import { Reveal } from "@/components/motion/Reveal";

/**
 * The bar ramps the site's single red from dark to light across the segments,
 * the same device the heatmap uses. Transparency rather than a second colour,
 * so the whole page still holds one hue.
 */
const RAMP = ["bg-red/25", "bg-red/40", "bg-red/55", "bg-red/70", "bg-red/85", "bg-red"] as const;

/** Single stacked bar — one row, no legend clutter, percentages inline. */
export function Languages({ languages }: { languages: { name: string; percent: number }[] }) {
  if (languages.length === 0) return null;

  return (
    <Reveal className="space-y-3">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-ink-2">
        {languages.map((language, index) => (
          <span
            key={language.name}
            // Ramp runs across however many languages there are, so the last
            // segment is always the brightest rather than depending on there
            // being exactly RAMP.length of them.
            className={
              RAMP[Math.round((index / Math.max(1, languages.length - 1)) * (RAMP.length - 1))]
            }
            style={{ width: `${language.percent}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ash-1">
        {languages.map((language) => (
          <li key={language.name}>
            {language.name} <span className="text-ash-1/60">{language.percent}%</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
