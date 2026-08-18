"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { DURATION, EASE_OUT_EXPO, STAGGER, springy } from "@/components/motion/transitions";
import { Logo } from "@/components/ui/Logo";
import { SHELL } from "@/components/ui/layout";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/useActiveSection";

/** Scroll travel before hide-on-scroll engages, so a nudge cannot hide the nav. */
const HIDE_AFTER = 120;

/** The in-page anchors, in document order. Derived so nav stays the one source. */
const SECTION_IDS = site.nav
  .filter((item) => item.href.startsWith("/#"))
  .map((item) => item.href.slice(2));

function isActive(href: string, pathname: string, section: string | null): boolean {
  if (!href.startsWith("/#")) return pathname.startsWith(href);
  return pathname === "/" && href.slice(2) === section;
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const lastY = useRef(0);
  const section = useActiveSection(SECTION_IDS, pathname === "/");

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = lastY.current;
    lastY.current = y;
    // Never hide while the menu is open — the close button lives up here.
    setHidden(!open && y > HIDE_AFTER && y > previous);
  });

  // Route changes come from tapping a link inside the overlay. pathname is the
  // trigger, not something the body reads — hence the intentional dependency.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Lenis drives scroll, so `overflow: hidden` alone would not hold it.
    document.documentElement.classList.add("overflow-hidden");
    window.dispatchEvent(new CustomEvent("lenis:toggle", { detail: { stopped: true } }));
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      window.dispatchEvent(new CustomEvent("lenis:toggle", { detail: { stopped: false } }));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
      className="fixed inset-x-0 top-0 z-50 border-ink-3/60 border-b bg-ink-0/80 backdrop-blur-md"
    >
      <nav className={cn(SHELL, "flex items-center justify-between gap-4 py-4")}>
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded text-ash-3"
          aria-label={`${site.name} — home`}
        >
          <Logo className="h-7 w-auto text-ash-2 transition-colors duration-300 group-hover:text-ash-3 sm:h-8" />
          <span className="font-medium text-sm tracking-tight">{site.name}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => {
            const active = isActive(item.href, pathname, section);
            return (
              <li key={item.href} className="relative">
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    transition={springy}
                    className="absolute inset-0 rounded-full bg-ink-2"
                    aria-hidden="true"
                  />
                ) : null}
                <Magnetic strength={4}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-3 py-1.5 text-xs transition-colors duration-300",
                      active ? "text-ash-3" : "text-ash-1 hover:text-ash-2",
                    )}
                  >
                    {item.label}
                  </Link>
                </Magnetic>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex size-11 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
        >
          {[0, 1].map((index) => (
            <motion.span
              key={index}
              aria-hidden="true"
              animate={{
                rotate: open ? (index === 0 ? 45 : -45) : 0,
                y: open ? (index === 0 ? 4 : -4) : 0,
              }}
              transition={springy}
              className="block h-px w-6 bg-ash-2"
            />
          ))}
        </button>
      </nav>

      {/* Reading progress, doubling as the header's bottom rule. */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="h-px origin-left bg-red"
        aria-hidden="true"
      />

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT_EXPO }}
            className="absolute inset-x-0 top-full h-[calc(100svh-100%)] overflow-y-auto border-ink-3/60 border-t bg-ink-0 md:hidden"
          >
            <Stagger
              trigger="mount"
              interval={STAGGER.base}
              className={cn(SHELL, "flex flex-col py-4 pb-[max(2rem,env(safe-area-inset-bottom))]")}
            >
              {site.nav.map((item) => (
                <StaggerItem key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href, pathname, section) ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center border-ink-3/60 border-b text-lg transition-colors",
                      isActive(item.href, pathname, section) ? "text-ash-3" : "text-ash-2",
                    )}
                  >
                    {item.label}
                  </Link>
                </StaggerItem>
              ))}
              <StaggerItem className="flex flex-wrap gap-5 pt-6">
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="link-sweep font-mono text-[11px] text-ash-1 uppercase tracking-widest"
                  >
                    {social.label}
                  </a>
                ))}
              </StaggerItem>
            </Stagger>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
