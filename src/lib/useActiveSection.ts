"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which in-page section is currently in view.
 *
 * The nav mixes route links with same-page anchors. Marking every anchor active
 * whenever `pathname === "/"` would light all of them at once, so anchors defer
 * to this hook and routes keep using the pathname.
 */
export function useActiveSection(ids: readonly string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A band across the upper-middle of the viewport: a section becomes active
      // once it reaches reading position, not the moment its edge appears.
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [ids, enabled]);

  return active;
}
