import { experience } from "@/data/experience";

/**
 * The roles with no end date. Shared by the Now section on the home page and
 * the /now page, so "what I'm working on" is written once.
 */
export function CurrentWork({ compact = false }: { compact?: boolean }) {
  const current = experience.filter((role) => role.end === "Present");

  return (
    <ul className="space-y-3">
      {current.map((role) => (
        <li key={`${role.company}-${role.start}`} className="border-ink-3 border-l py-1 pl-5">
          <span className="font-medium text-ash-3 text-sm">{role.company}</span>
          <span className="text-ash-1 text-sm"> · {role.title}</span>
          {/* The home page runs this beside a second column, where the full
           * summary would outrun the listening lists next to it. */}
          <p className="mt-1 text-ash-1 text-sm leading-relaxed">
            {compact ? role.tagline : role.summary}
          </p>
          {role.url ? (
            <a
              href={role.url}
              target="_blank"
              rel="noreferrer noopener"
              // Host only: the full URL competes with the role title above it.
              className="link-sweep mt-1.5 inline-block font-mono text-[11px] text-ash-1 transition-colors hover:text-ash-2"
            >
              {role.url.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
