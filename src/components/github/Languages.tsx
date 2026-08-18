import { Reveal } from "@/components/motion/Reveal";

/** Single stacked bar — one row, no legend clutter, percentages inline. */
export function Languages({ languages }: { languages: { name: string; percent: number }[] }) {
  if (languages.length === 0) return null;

  return (
    <Reveal className="space-y-3">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-ink-2">
        {languages.map((language, index) => (
          <span
            key={language.name}
            className={index === 0 ? "bg-red" : "bg-ash-1"}
            style={{ width: `${language.percent}%`, opacity: index === 0 ? 1 : 1 - index * 0.15 }}
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
