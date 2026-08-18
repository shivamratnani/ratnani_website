"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DURATION, EASE_OUT_EXPO } from "@/components/motion/transitions";
import type { Photo } from "@/data/photos";

/** Grid renders responsive AVIF/WebP at q90; the lightbox serves the untouched original. */
export function Gallery({ photos }: { photos: readonly Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const active = index === null ? null : photos[index];

  const step = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null ? null : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, step]);

  return (
    <>
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-3">
        {photos.map((photo, i) => (
          <motion.button
            key={photo.src}
            type="button"
            onClick={() => setIndex(i)}
            layoutId={reduced ? undefined : `photo-${photo.src}`}
            className="block w-full overflow-hidden rounded-lg"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={
              reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE_OUT_EXPO }
            }
          >
            <Image
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              quality={90}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={() => setIndex(null)}
          >
            <motion.div
              layoutId={reduced ? undefined : `photo-${active.src}`}
              className="relative max-h-full w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Unoptimized: the lightbox is where the full-resolution master
                  is meant to be seen, so it must not be resampled. */}
              <Image
                src={active.src}
                alt=""
                width={active.width}
                height={active.height}
                unoptimized
                priority
                className="max-h-[85vh] w-full rounded-lg object-contain"
              />
            </motion.div>

            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Close"
              className="absolute top-4 right-4 rounded px-3 py-1.5 font-mono text-ash-1 text-xs hover:text-red"
            >
              esc
            </button>

            <p className="absolute bottom-4 font-mono text-[11px] text-ash-1 tabular-nums">
              {(index ?? 0) + 1} / {photos.length}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
