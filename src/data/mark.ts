/**
 * The "SR" mark, as a bitmap rather than geometry: `#` is a dot, anything else
 * is empty. Editing the shape means editing these strings.
 *
 * Shared by the nav logo, the favicon, and the OG image so the three can never
 * drift apart.
 */
const GLYPHS = [
  [".###.", "#...#", "#....", ".###.", "....#", "#...#", ".###."],
  ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
] as const;

/** Grid pitch in mark units. Dots sit at cell centres. */
export const CELL = 4;
/** Space between the two glyphs, in the same units. */
const GAP = 3;
export const DOT_RADIUS = 1.2;

export const MARK_ROWS = GLYPHS[0].length;
const COLUMNS = GLYPHS[0][0].length;
const GLYPH_WIDTH = COLUMNS * CELL;
export const MARK_WIDTH = GLYPHS.length * GLYPH_WIDTH + (GLYPHS.length - 1) * GAP;
export const MARK_HEIGHT = MARK_ROWS * CELL;

export type MarkDot = {
  x: number;
  y: number;
  /** 0–1 position along the diagonal sweep, driving the shimmer's delay. */
  phase: number;
};

export const MARK_DOTS: readonly MarkDot[] = GLYPHS.flatMap((glyph, glyphIndex) =>
  glyph.flatMap((row, rowIndex) =>
    [...row].flatMap((cell, columnIndex) => {
      if (cell !== "#") return [];
      const x = glyphIndex * (GLYPH_WIDTH + GAP) + columnIndex * CELL + CELL / 2;
      const y = rowIndex * CELL + CELL / 2;
      return [{ x, y, phase: (x + y) / (MARK_WIDTH + MARK_HEIGHT) }];
    }),
  ),
);
