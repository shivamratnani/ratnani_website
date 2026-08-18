"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Magnetic } from "@/components/motion/Magnetic";
import { site } from "@/data/site";

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-ink-3/60 border-b bg-ink-0/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-mono text-ash-3 text-sm tracking-tight">
          sh1v<span className="text-red">.</span>
        </Link>

        <ul className="flex items-center gap-1 overflow-x-auto">
          {site.nav.map((item) => {
            const active = item.href.startsWith("/#")
              ? pathname === "/"
              : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Magnetic strength={4}>
                  <Link
                    href={item.href}
                    className={`rounded px-2 py-1 text-xs transition-colors duration-300 ${
                      active ? "text-ash-3" : "text-ash-1 hover:text-ash-2"
                    }`}
                  >
                    {item.label}
                  </Link>
                </Magnetic>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
