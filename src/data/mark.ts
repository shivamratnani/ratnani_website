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

/**
 * The hover state: Icarus falling, the sun he flew at behind him, the last of
 * his feathers still coming apart in between. Exactly as many dots as the mark
 * above, because the morph moves those dots rather than adding any.
 */
const ICARUS = [
  "................#....",
  "..............#...#..",
  ".............#.....#.",
  ".........#...........",
  ".............#......#",
  ".#..#..#.............",
  "..#...#......#.....#.",
  "...###.....#..#...#..",
  "....#...........#....",
  "....#....#...........",
  "....#................",
  "...#.#.....#.........",
  "..#...#..............",
  ".#.....#.............",
] as const;

export type Point = { x: number; y: number };

export type MarkDot = Point & {
  /** 0–1 position along the diagonal sweep, driving the shimmer's delay. */
  phase: number;
  /** Where this dot flies to when the mark morphs into Icarus. */
  to: Point;
};

const markPoints: Point[] = GLYPHS.flatMap((glyph, glyphIndex) =>
  glyph.flatMap((row, rowIndex) =>
    [...row].flatMap((cell, columnIndex) => {
      if (cell !== "#") return [];
      const x = glyphIndex * (GLYPH_WIDTH + GAP) + columnIndex * CELL + CELL / 2;
      const y = rowIndex * CELL + CELL / 2;
      return [{ x, y }];
    }),
  ),
);

/** Same bitmap idea as the glyphs, on a finer pitch so the figure has room. */
const ICARUS_PITCH = 2;

/** Centres the finer Icarus grid inside the mark's own box. */
const inset = (span: number, cells: number) => (span - cells * ICARUS_PITCH) / 2;
const ICARUS_X = inset(MARK_WIDTH, ICARUS[0].length);
const ICARUS_Y = inset(MARK_HEIGHT, ICARUS.length);

const icarusPoints: Point[] = ICARUS.flatMap((row, rowIndex) =>
  [...row].flatMap((cell, columnIndex) =>
    cell === "#"
      ? [
          {
            x: ICARUS_X + (columnIndex + 0.5) * ICARUS_PITCH,
            y: ICARUS_Y + (rowIndex + 0.5) * ICARUS_PITCH,
          },
        ]
      : [],
  ),
);

if (icarusPoints.length !== markPoints.length) {
  throw new Error(
    `The Icarus bitmap has ${icarusPoints.length} dots but the mark has ${markPoints.length}; every dot needs exactly one destination.`,
  );
}

/**
 * Claim the closest pairs first, so dots slide to the nearest free destination
 * instead of crossing the mark to swap seats. 33×33 — brute force is free.
 */
function pairByProximity(from: readonly Point[], to: readonly Point[]): Map<number, Point> {
  const candidates = from
    .flatMap((a, i) =>
      // Squared distance: only the ordering matters, so skip the square root.
      to.map((b, j) => ({ i, j, distance: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 })),
    )
    .sort((a, b) => a.distance - b.distance);

  const pairs = new Map<number, Point>();
  const claimed = new Set<number>();

  for (const { i, j } of candidates) {
    const target = to[j];
    if (!target || pairs.has(i) || claimed.has(j)) continue;
    pairs.set(i, target);
    claimed.add(j);
  }

  return pairs;
}

const icarusTargets = pairByProximity(markPoints, icarusPoints);

export const MARK_DOTS: readonly MarkDot[] = markPoints.map((point, index) => ({
  ...point,
  phase: (point.x + point.y) / (MARK_WIDTH + MARK_HEIGHT),
  to: icarusTargets.get(index) ?? point,
}));
