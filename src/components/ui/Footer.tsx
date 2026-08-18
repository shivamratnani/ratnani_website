import { cacheLife } from "next/cache";
import { SHELL } from "@/components/ui/layout";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/** Cached: the copyright year is stable far longer than a deploy cycle. */
export async function Footer() {
  "use cache";
  cacheLife("days");

  return (
    <footer className={cn(SHELL, "py-12")}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-ink-3 border-t pt-6">
        <p className="font-mono text-[11px] text-ash-1">
          © {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex gap-4">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="link-sweep font-mono text-[11px] text-ash-1 hover:text-ash-3"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
