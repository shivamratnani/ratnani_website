"use client";

import { Command } from "cmdk";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { springy } from "@/components/motion/transitions";
import { experience } from "@/data/experience";
import { site } from "@/data/site";

type Action = { id: string; label: string; hint: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (href: string) => () => {
      setOpen(false);
      if (href.startsWith("http") || href.startsWith("mailto")) {
        window.open(href, "_blank");
        return;
      }
      // Every internal href here comes from site.nav or a literal above, so it is
      // a real route; typedRoutes cannot narrow that through the string union.
      router.push(href as Route);
    },
    [router],
  );

  // Built from the same data that renders the site, so the palette can never
  // drift out of sync with the nav or the timeline.
  const actions: Action[] = [
    ...site.nav.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      hint: "Go",
      run: go(item.href),
    })),
    ...site.socials.map((social) => ({
      id: `social-${social.label}`,
      label: social.label,
      hint: "Open",
      run: go(social.href),
    })),
    {
      id: "resume",
      label: "Download résumé",
      hint: "PDF",
      run: go("/resume.pdf"),
    },
    ...experience
      .filter((role) => role.tier === "primary")
      .map((role) => ({
        id: `role-${role.company}-${role.start}`,
        label: `${role.company} — ${role.title}`,
        hint: "Work",
        run: go("/#work"),
      })),
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-0/70 p-4 pt-[18vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-ink-3 bg-ink-1 shadow-2xl"
            initial={reduced ? false : { opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={reduced ? { duration: 0 } : springy}
            onClick={(event) => event.stopPropagation()}
          >
            <Command loop label="Command menu">
              <Command.Input
                autoFocus
                placeholder="Jump to…"
                className="w-full border-ink-3 border-b bg-transparent px-4 py-3.5 text-ash-3 text-sm outline-none placeholder:text-ash-1"
              />
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="px-2 py-6 text-center text-ash-1 text-sm">
                  Nothing matches.
                </Command.Empty>
                {actions.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={`${action.label} ${action.hint}`}
                    onSelect={action.run}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-ash-2 text-sm data-[selected=true]:bg-ink-2 data-[selected=true]:text-red"
                  >
                    <span>{action.label}</span>
                    <span className="font-mono text-[10px] text-ash-1">{action.hint}</span>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
