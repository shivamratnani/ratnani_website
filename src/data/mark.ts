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

export type Point = { x: number; y: number };

export type MarkDot = Point & {
  /** 0–1 position along the diagonal sweep, driving the shimmer's delay. */
  phase: number;
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

export const MARK_DOTS: readonly MarkDot[] = markPoints.map((point) => ({
  ...point,
  phase: (point.x + point.y) / (MARK_WIDTH + MARK_HEIGHT),
}));

/**
 * The hover state: Icarus mid-fall — wings still spread where his arms were,
 * head thrown back between them, legs tumbling — under a perfect red sun,
 * over a sea of cloud. Tonal, not monochrome: `#` is the figure (brightest),
 * `f` a falling feather (mid), `c` the cloud sea (dim), `o` the sun (red).
 *
 * Traced from a rendered composition and pasted back as a bitmap so the shape
 * stays editable in place. Denser than the mark could ever shatter into on its
 * own — see the seed/fill split below.
 */
const ICARUS = [
  "................................................................",
  "................................................................",
  "....................................................ooooo.......",
  "..................................................ooooooooo.....",
  ".................................................ooooooooooo....",
  "................................................ooooooooooooo...",
  "................................................ooooooooooooo...",
  "...................................#####.......ooooooooooooooo..",
  "........###.....................#######........ooooooooooooooo..",
  "........########..............#####............ooooooooooooooo..",
  "............######.....##....###...............ooooooooooooooo..",
  "................####..####.####.#######........ooooooooooooooo..",
  ".............####.###.###################.......ooooooooooooo...",
  ".......#########################................ooooooooooooo...",
  ".......#####.....############....................ooooooooooo....",
  "....................#######.......................ooooooooo.....",
  ".......................##...........................ooooo.......",
  ".......................##.......................................",
  ".......................##.......................................",
  ".......................##.......................................",
  ".......................##.......................................",
  "......................###.......................................",
  "......................####......................................",
  "......................####......................................",
  "............f........##..##.........f...........................",
  "............f.......###..##.........f...........................",
  "....................##....##....................................",
  "....................##....###...................................",
  "...................##......##...................................",
  "...............f...##...........................................",
  "...............f........................f.......................",
  ".........f..............................f.......................",
  ".........f......................................................",
  "...............................f................................",
  "...............................f................................",
  "................................................................",
  "........................f.......................................",
  ".....cccc..ccc..........f......cccc..........cccc........cccc...",
  "....ccccccccccc...cccc........cccccc........cccccc..ccc.cccccccc",
  "....ccccccccccc..cccccc......cccccccc..ccccccccccccccccccccccccc",
  "ccc.cccccccccccccccccccc.....ccccccccccccccccccccccccccccccccccc",
  "cccccccccccccccccccccccccc..cccccccccccccccccccccccccccccccccccc",
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
] as const;

/** Mark units per Icarus cell. Small: the picture is drawn in fine grain. */
const SCENE_PITCH = 3.5;
/**
 * The scene hangs below the mark rather than replacing it in place: the header
 * is only ~30px tall, and Icarus needs room to fall. Offsets are mark units
 * from the mark's own origin, so the drop clears a `py-4` header.
 */
const SCENE_X = -6;
const SCENE_Y = 46;

/** Which colour a scene dot takes once the picture is up. */
export type Tone = "figure" | "feather" | "cloud" | "sun";

const TONES: Partial<Record<string, Tone>> = {
  "#": "figure",
  f: "feather",
  c: "cloud",
  o: "sun",
};

export type SceneDot = Point & {
  tone: Tone;
  /** 0–1 along the diagonal, staggering the fill layer's reveal. */
  phase: number;
};

/** Sub-dots per mark dot. Idle they overlap into one dot; hover breaks them up. */
export const SHARDS_PER_DOT = 7;
/** How far off its parent's centre a shard sits while the mark is at rest. */
const CLUSTER_RADIUS = 0.52;
/** Idle and hover radii. Seven idle shards union to roughly `DOT_RADIUS`. */
export const SHARD_RADIUS = 0.66;
/** 0.42 × SCENE_PITCH — thinner and the shapes stop reading. */
export const SHARD_RADIUS_SCENE = 1.47;

export type Shard = {
  /** Resting position, clustered on the parent dot. */
  from: Point;
  /** Where this shard lands once the mark comes apart. */
  to: Point;
  /** The parent's shimmer phase, so a whole dot pulses as one. */
  phase: number;
  /** 0–1 within its cluster, spreading the shards' departure over time. */
  offset: number;
  /** The colour of the scene dot this shard lands as. */
  tone: Tone;
};

const SCENE_WIDTH = ICARUS[0].length * SCENE_PITCH;
const SCENE_HEIGHT = ICARUS.length * SCENE_PITCH;

const sceneDots: SceneDot[] = ICARUS.flatMap((row, rowIndex) =>
  [...row].flatMap((cell, columnIndex) => {
    const tone = TONES[cell];
    if (!tone) return [];
    const x = SCENE_X + (columnIndex + 0.5) * SCENE_PITCH;
    const y = SCENE_Y + (rowIndex + 0.5) * SCENE_PITCH;
    return [{ x, y, tone, phase: (x - SCENE_X + y - SCENE_Y) / (SCENE_WIDTH + SCENE_HEIGHT) }];
  }),
);

const SHARD_COUNT = markPoints.length * SHARDS_PER_DOT;
if (sceneDots.length < SHARD_COUNT) {
  throw new Error(
    `The Icarus bitmap has ${sceneDots.length} dots but the mark shatters into ${SHARD_COUNT}; every shard needs a destination.`,
  );
}

/**
 * The picture holds far more dots than the mark can shatter into, so the scene
 * splits in two: every ~4th dot (row-major, so spatially spread) is a seed the
 * flying shards land on, and the rest — `SCENE_FILL` — fade in around them as
 * they arrive. Only the 231 shards ever animate transforms; the fill layer
 * costs nothing while the mark idles.
 */
const seedIndices = new Set(
  Array.from({ length: SHARD_COUNT }, (_, i) => Math.floor((i * sceneDots.length) / SHARD_COUNT)),
);
const seeds = sceneDots.filter((_, index) => seedIndices.has(index));
export const SCENE_FILL: readonly SceneDot[] = sceneDots.filter(
  (_, index) => !seedIndices.has(index),
);

if (seeds.length !== SHARD_COUNT) {
  throw new Error(`Seed sampling drew ${seeds.length} dots; the shards need ${SHARD_COUNT}.`);
}

/**
 * Hands each mark dot the `SHARDS_PER_DOT` seed dots nearest to it, closest
 * pair first. Both sides are normalised to their own box, so the mark's layout
 * survives the blow-up — the S unfolds into the scene's left, the R its right —
 * instead of every dot converging on the middle. 33×231, so brute force is free.
 */
function shatter(from: readonly Point[], to: readonly SceneDot[]): SceneDot[][] {
  const normalise = (p: Point, w: number, h: number, x0 = 0, y0 = 0) => ({
    x: (p.x - x0) / w,
    y: (p.y - y0) / h,
  });
  const parents = from.map((p) => normalise(p, MARK_WIDTH, MARK_HEIGHT));
  const targets = to.map((p) => normalise(p, SCENE_WIDTH, SCENE_HEIGHT, SCENE_X, SCENE_Y));

  const candidates = parents
    .flatMap((a, i) =>
      // Squared distance: only the ordering matters, so skip the square root.
      targets.map((b, j) => ({ i, j, distance: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 })),
    )
    .sort((a, b) => a.distance - b.distance);

  const clusters: SceneDot[][] = from.map(() => []);
  const claimed = new Set<number>();

  for (const { i, j } of candidates) {
    const target = to[j];
    const cluster = clusters[i];
    if (!target || !cluster || cluster.length === SHARDS_PER_DOT || claimed.has(j)) continue;
    cluster.push(target);
    claimed.add(j);
  }

  return clusters;
}

const clusters = shatter(markPoints, seeds);

export const SHARDS: readonly Shard[] = MARK_DOTS.flatMap((dot, dotIndex) => {
  const cluster = clusters[dotIndex] ?? [];
  // Nearest destination leaves first, so the cluster drains rather than bursts.
  const ordered = [...cluster].sort(
    (a, b) => (a.x - dot.x) ** 2 + (a.y - dot.y) ** 2 - ((b.x - dot.x) ** 2 + (b.y - dot.y) ** 2),
  );

  return ordered.map((target, shardIndex) => {
    // One shard holds the centre; the rest ring it, so the resting cluster
    // reads as a single solid dot rather than a clump.
    const angle = ((shardIndex - 1) / (SHARDS_PER_DOT - 1)) * Math.PI * 2;
    const radius = shardIndex === 0 ? 0 : CLUSTER_RADIUS;

    return {
      from: { x: dot.x + Math.cos(angle) * radius, y: dot.y + Math.sin(angle) * radius },
      to: { x: target.x, y: target.y },
      phase: dot.phase,
      offset: shardIndex / (SHARDS_PER_DOT - 1),
      tone: target.tone,
    };
  });
});
