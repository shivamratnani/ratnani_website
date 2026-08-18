import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const config: NextConfig = {
  // A stray package-lock.json in $HOME otherwise gets picked as the root.
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  // Next 16: opt-in caching via the `use cache` directive + cacheLife profiles.
  cacheComponents: true,
  // Stable in Next 16 — automatic memoization, so no hand-rolled useMemo/useCallback.
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 defaults this to [75] and COERCES `quality` to the nearest allowed
    // value. Without 90 here the gallery would silently downgrade.
    qualities: [75, 90],
  },
  typedRoutes: true,
};

export default config;
