"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * The hero's whole visual: a lattice of pale dots with energy running along its
 * lines, warped by masses you never see.
 *
 * The dark matter is the point. A handful of wells drift through the field, and
 * nothing draws them — they are known only by what they do to the grid: dots
 * pulled off their lattice points, lines bent and brightened as they pass. The
 * regularity of the grid is what makes the distortion legible.
 *
 * Everything below the component is a plain module-scope function operating on a
 * single mutable `Field`. That shape is deliberate: the frame loop must not
 * allocate, so nodes, pulses and wells live in pools sized once per resize, and
 * the colour ramps are baked into offscreen sprites at startup and blitted.
 * Neighbour lookups are index arithmetic on the lattice — there is no proximity
 * query here to go quadratic.
 */

/** Lattice pitch in CSS px, scaled to the viewport and clamped both ways. */
const SPACING = { min: 52, max: 84 } as const;
const SPACING_DIVISOR = 22;

/** Invisible masses. Each drifts on its own Lissajous path. */
const WELL_COUNT = 4;
const WELL_RADIUS = { min: 240, max: 430 } as const;
/** Peak displacement a well can apply, in CSS px. */
const WELL_PULL = { min: 20, max: 44 } as const;
/** Shapes the pull across a well's radius: zero at the centre, peaking a third
 * of the way out, zero again at the rim. Chosen so the distortion is a ring
 * rather than a singularity — pull that peaks at the centre drags every node in
 * range onto one point and reads as a black hole, not a lensed field. The
 * constant sets that peak to exactly 1. */
const LENS_SHAPE = 6.75;
const WELL_DRIFT = { min: 0.05, max: 0.15 } as const;
/** The cursor is a well too — same maths, so it lenses the grid identically. */
const POINTER_RADIUS = 260;
const POINTER_PULL = 34;

/** Ripples. Expanding rings that pass through the lattice and fade, spawned on
 * a timer and again wherever a pulse burns out. */
const RIPPLE_POOL = 5;
const RIPPLE_INTERVAL = { min: 1.6, max: 4.2 } as const;
/** Radius growth in CSS px per second. */
const RIPPLE_SPEED = { min: 170, max: 290 } as const;
/** Peak radial displacement in CSS px, and how long a ring takes to die. */
const RIPPLE_AMPLITUDE = { min: 9, max: 19 } as const;
const RIPPLE_LIFE = { min: 2, max: 3.4 } as const;
/** Half-width of the ring in CSS px — how much of the grid it holds at once. */
const RIPPLE_WIDTH = 78;
/** Past this many half-widths the wave is numerically dead; skip the node. */
const RIPPLE_REACH = 2;

/** One pulse per this many nodes, clamped. */
const NODES_PER_PULSE = 24;
const PULSE_COUNT = { min: 8, max: 30 } as const;
const PULSE_SPEED = { min: 95, max: 265 } as const;
/** A slice of the pulses crawl instead of run, so the grid is never uniform. */
const DRIFT_SHARE = 0.3;
const DRIFT_FACTOR = { min: 0.18, max: 0.4 } as const;
/** Nodes crossed before a pulse dies and respawns elsewhere. */
const PULSE_HOPS = { min: 6, max: 20 } as const;
/** Chance a pulse carries straight on through a node rather than turning. */
const STRAIGHT_BIAS = 0.62;
/** Trail length, in multiples of the lattice pitch. */
const TRAIL_SPANS = 2.6;
const PULSE_THICKNESS = 1.1;
/** Glow passes behind the core line, widest first. Two give a beam a soft wide
 * falloff that one cannot, and neither puts a disc on the head. */
const GLOW_PASSES = [
  { scale: 14, alpha: 0.07 },
  { scale: 5, alpha: 0.18 },
] as const;

/** How the pulses split between the three inks. */
const TONE_SHARE = { ash: 0.5, deep: 0.34 } as const;

/** Lattice line brightness, from untouched to fully energised. */
const LINE_ALPHA = { min: 0.07, max: 0.32 } as const;
/** Distinct alpha buckets the lines are drawn in — one stroke per bucket, so
 * the whole lattice costs a handful of draws rather than one per edge. */
const LINE_TIERS = 5;

const DOT_SIZE = 6.5;
const DOT_ALPHA = { min: 0.3, max: 0.85 } as const;
/** Idle breathing: depth of the sine and how fast it runs. */
const DOT_PULSE = 0.16;
const DOT_PULSE_SPEED = 1.7;
/** How fast a node's arrival flash fades, in units per second. */
const CHARGE_DECAY = 1.5;

/** Horizontal resolution of the baked ramp, and the square bake of the dot. */
const SPRITE_WIDTH = 512;
const DOT_SPRITE = 32;
const DPR_CAP = 2;
/** Clamps the integration step so a backgrounded tab cannot teleport the field. */
const MAX_STEP = 1 / 30;

/** Neighbour directions. Ordered so `direction ^ 1` is always the reverse. */
const RIGHT = 0;
const LEFT = 1;
const DOWN = 2;
const UP = 3;
/** Every edge, named once: walking right and down from each node covers the
 * whole lattice without drawing any edge twice. */
const EDGE_DIRECTIONS = [RIGHT, DOWN] as const;

type Tone = "ash" | "deep" | "red";

type Node = {
  /** Lattice point. Never animated — displacement is recomputed from it. */
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  /** Total pull acting here, 0 → 1. Drives brightness, not position. */
  strain: number;
  /** Driven to 1 when a pulse arrives, then decays. */
  charge: number;
  /** Offsets this node's idle breathing from its neighbours'. */
  phase: number;
};

type Pulse = {
  /** Node the trail bends back through; -1 on the first hop. */
  previous: number;
  from: number;
  to: number;
  /** Direction taken out of `from`, so the next hop can prefer straight on. */
  direction: number;
  /** 0 → 1 along the current edge. */
  t: number;
  speed: number;
  tone: Tone;
  /** Hops remaining before the pulse dies and respawns elsewhere. */
  hops: number;
};

/** An invisible mass. Position is a Lissajous figure over the field. */
type Well = {
  x: number;
  y: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  radius: number;
  pull: number;
};

/** An expanding ring. Unlike a well it has no mass — it just passes through. */
type Ripple = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  amplitude: number;
  /** 1 → 0 across the ring's life. */
  life: number;
  decay: number;
};

type Field = {
  width: number;
  height: number;
  columns: number;
  rows: number;
  spacing: number;
  nodes: Node[];
  pulses: Pulse[];
  wells: Well[];
  ripples: Ripple[];
  /** Seconds until the next ripple. */
  nextRipple: number;
  time: number;
  pointerX: number;
  pointerY: number;
  pointerActive: boolean;
};

type Sprites = { dot: HTMLCanvasElement; trails: Record<Tone, HTMLCanvasElement>; line: string };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function rollTone(): Tone {
  const roll = Math.random();
  if (roll < TONE_SHARE.ash) return "ash";
  return roll < TONE_SHARE.ash + TONE_SHARE.deep ? "deep" : "red";
}

/** Reads a `@theme` token as a concrete rgb triple usable in `rgb(… / …)`. */
function readToken(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const raw = styles.getPropertyValue(name).trim() || fallback;
  const hex = raw.replace("#", "");
  if (hex.length !== 6) return raw;
  const value = Number.parseInt(hex, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

/**
 * Bakes a trail into an image: transparent at the tail, opaque at the head.
 * Blitting a slice of this beats stepping a gradient by hand — smooth at any
 * length, and no gradient object is allocated once the field is running.
 */
function bakeTrail(rgb: string): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_WIDTH;
  sprite.height = 1;
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const ramp = context.createLinearGradient(0, 0, SPRITE_WIDTH, 0);
  ramp.addColorStop(0, `rgb(${rgb} / 0)`);
  ramp.addColorStop(0.55, `rgb(${rgb} / 0.28)`);
  ramp.addColorStop(0.88, `rgb(${rgb} / 0.9)`);
  ramp.addColorStop(1, `rgb(${rgb} / 1)`);
  context.fillStyle = ramp;
  context.fillRect(0, 0, SPRITE_WIDTH, 1);
  return sprite;
}

/** A soft round dot. Blitted rather than arc-filled so the edge stays gentle. */
function bakeDot(rgb: string): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = DOT_SPRITE;
  sprite.height = DOT_SPRITE;
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const centre = DOT_SPRITE / 2;
  const ramp = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
  ramp.addColorStop(0, `rgb(${rgb} / 1)`);
  ramp.addColorStop(0.28, `rgb(${rgb} / 0.85)`);
  ramp.addColorStop(0.6, `rgb(${rgb} / 0.12)`);
  ramp.addColorStop(1, `rgb(${rgb} / 0)`);
  context.fillStyle = ramp;
  context.fillRect(0, 0, DOT_SPRITE, DOT_SPRITE);
  return sprite;
}

function bakeSprites(canvas: HTMLCanvasElement): Sprites {
  const styles = getComputedStyle(canvas);
  const line = readToken(styles, "--color-ash-1", "#6e6e76");
  return {
    // The dots are the light grey of the ramp, one step up from the lines.
    dot: bakeDot(readToken(styles, "--color-ash-2", "#a1a1aa")),
    trails: {
      ash: bakeTrail(readToken(styles, "--color-ash-3", "#ededef")),
      deep: bakeTrail(readToken(styles, "--color-red-dim", "#b0170e")),
      red: bakeTrail(readToken(styles, "--color-red", "#e5281d")),
    },
    line: `rgb(${line})`,
  };
}

/**
 * The lattice makes neighbours pure arithmetic — no adjacency table, no spatial
 * hash, no proximity scan. Returns -1 at the edges of the grid.
 */
function neighbour(field: Field, index: number, direction: number): number {
  const column = index % field.columns;
  switch (direction) {
    case RIGHT:
      return column + 1 < field.columns ? index + 1 : -1;
    case LEFT:
      return column > 0 ? index - 1 : -1;
    case DOWN:
      return index + field.columns < field.nodes.length ? index + field.columns : -1;
    case UP:
      return index - field.columns >= 0 ? index - field.columns : -1;
    default:
      return -1;
  }
}

/** Launches a pulse out of `from`, preferring to carry straight on. */
function launch(field: Field, pulse: Pulse, from: number, incoming: number): boolean {
  // Four tries: straight first if the bias wins, then whatever is open. The
  // reverse of `incoming` is excluded so a pulse never doubles back on itself.
  const preferred = incoming >= 0 && Math.random() < STRAIGHT_BIAS ? incoming : -1;
  for (let attempt = 0; attempt < 5; attempt++) {
    const direction = attempt === 0 && preferred >= 0 ? preferred : Math.floor(Math.random() * 4);
    if (incoming >= 0 && direction === (incoming ^ 1)) continue;
    const to = neighbour(field, from, direction);
    if (to < 0) continue;
    pulse.previous = pulse.from === from ? pulse.previous : pulse.from;
    pulse.from = from;
    pulse.to = to;
    pulse.direction = direction;
    pulse.t = 0;
    return true;
  }
  return false;
}

function respawn(field: Field, pulse: Pulse): void {
  const drift = Math.random() < DRIFT_SHARE ? rand(DRIFT_FACTOR.min, DRIFT_FACTOR.max) : 1;
  pulse.speed = rand(PULSE_SPEED.min, PULSE_SPEED.max) * drift;
  pulse.tone = rollTone();
  pulse.hops = Math.floor(rand(PULSE_HOPS.min, PULSE_HOPS.max));
  pulse.previous = -1;
  pulse.from = -1;
  const seed = Math.floor(Math.random() * field.nodes.length);
  if (!launch(field, pulse, seed, -1)) pulse.hops = 0;
}

function build(width: number, height: number): Field {
  const spacing = Math.min(SPACING.max, Math.max(SPACING.min, Math.round(width / SPACING_DIVISOR)));
  // One column and row of overspill on each side, so the lattice never shows an
  // edge — the mask fades it out long before the last node.
  const columns = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;
  const offsetX = (width - (columns - 1) * spacing) / 2;
  const offsetY = (height - (rows - 1) * spacing) / 2;

  const nodes: Node[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const homeX = offsetX + column * spacing;
      const homeY = offsetY + row * spacing;
      nodes.push({
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        strain: 0,
        charge: 0,
        // Diagonal phase, so the idle breath crosses the grid as a wave rather
        // than blinking the whole thing at once.
        phase: (column + row) * 0.35,
      });
    }
  }

  const field: Field = {
    width,
    height,
    columns,
    rows,
    spacing,
    nodes,
    pulses: [],
    wells: Array.from({ length: WELL_COUNT }, () => ({
      x: width / 2,
      y: height / 2,
      phaseX: rand(0, Math.PI * 2),
      phaseY: rand(0, Math.PI * 2),
      speedX: rand(WELL_DRIFT.min, WELL_DRIFT.max),
      speedY: rand(WELL_DRIFT.min, WELL_DRIFT.max),
      radius: rand(WELL_RADIUS.min, WELL_RADIUS.max),
      pull: rand(WELL_PULL.min, WELL_PULL.max),
    })),
    ripples: Array.from({ length: RIPPLE_POOL }, () => ({
      x: 0,
      y: 0,
      radius: 0,
      speed: 0,
      amplitude: 0,
      life: 0,
      decay: 1,
    })),
    nextRipple: rand(0.6, 1.8),
    time: 0,
    pointerX: width / 2,
    pointerY: height / 2,
    pointerActive: false,
  };

  const count = Math.min(
    PULSE_COUNT.max,
    Math.max(PULSE_COUNT.min, Math.round(nodes.length / NODES_PER_PULSE)),
  );
  for (let index = 0; index < count; index++) {
    const pulse: Pulse = {
      previous: -1,
      from: 0,
      to: 0,
      direction: RIGHT,
      t: 0,
      speed: 0,
      tone: "ash",
      hops: 0,
    };
    respawn(field, pulse);
    // Scatter along the first edge so the grid is already live on frame one.
    pulse.t = Math.random();
    field.pulses.push(pulse);
  }
  return field;
}

/**
 * Applies one well to one node, accumulating displacement and strain. Returns
 * the strain contribution; the node is moved in place.
 */
function lens(node: Node, x: number, y: number, radius: number, pull: number): number {
  const dx = x - node.x;
  const dy = y - node.y;
  const distance = Math.hypot(dx, dy);
  if (distance > radius || distance < 0.01) return 0;
  const ratio = distance / radius;
  const force = LENS_SHAPE * ratio * (1 - ratio) ** 2;
  node.x += (dx / distance) * force * pull;
  node.y += (dy / distance) * force * pull;
  return force;
}

/**
 * Applies one ripple to one node. The profile is a sine inside a Gaussian: zero
 * at the ring itself, a crest ahead of it and a trough behind, dying to nothing
 * within RIPPLE_REACH half-widths. Returns the strain contribution.
 */
function disturb(node: Node, ripple: Ripple): number {
  const dx = node.x - ripple.x;
  const dy = node.y - ripple.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.01) return 0;
  const offset = (distance - ripple.radius) / RIPPLE_WIDTH;
  if (Math.abs(offset) > RIPPLE_REACH) return 0;
  const wave = Math.sin(offset * Math.PI) * Math.exp(-offset * offset);
  const push = wave * ripple.amplitude * ripple.life;
  node.x += (dx / distance) * push;
  node.y += (dy / distance) * push;
  return Math.abs(wave) * ripple.life;
}

/** Starts a ring at a point. Silently does nothing if every slot is busy. */
function splash(field: Field, x: number, y: number): void {
  for (const ripple of field.ripples) {
    if (ripple.life > 0) continue;
    ripple.x = x;
    ripple.y = y;
    ripple.radius = 0;
    ripple.speed = rand(RIPPLE_SPEED.min, RIPPLE_SPEED.max);
    ripple.amplitude = rand(RIPPLE_AMPLITUDE.min, RIPPLE_AMPLITUDE.max);
    ripple.life = 1;
    ripple.decay = 1 / rand(RIPPLE_LIFE.min, RIPPLE_LIFE.max);
    return;
  }
}

function step(field: Field, delta: number): void {
  field.time += delta;
  const { nodes, wells, time } = field;

  for (const well of wells) {
    // Lissajous over the field, padded out past the edges so a well can leave
    // and return rather than bouncing inside a box.
    well.x = field.width * (0.5 + 0.62 * Math.sin(time * well.speedX + well.phaseX));
    well.y = field.height * (0.5 + 0.62 * Math.sin(time * well.speedY + well.phaseY));
  }

  for (const ripple of field.ripples) {
    if (ripple.life <= 0) continue;
    ripple.radius += ripple.speed * delta;
    ripple.life = Math.max(0, ripple.life - delta * ripple.decay);
  }

  field.nextRipple -= delta;
  if (field.nextRipple <= 0) {
    field.nextRipple = rand(RIPPLE_INTERVAL.min, RIPPLE_INTERVAL.max);
    splash(field, Math.random() * field.width, Math.random() * field.height);
  }

  for (const node of nodes) {
    node.x = node.homeX;
    node.y = node.homeY;
    let strain = 0;
    for (const well of wells) {
      strain += lens(node, well.x, well.y, well.radius, well.pull);
    }
    for (const ripple of field.ripples) {
      if (ripple.life > 0) strain += disturb(node, ripple);
    }
    if (field.pointerActive) {
      strain += lens(node, field.pointerX, field.pointerY, POINTER_RADIUS, POINTER_PULL);
    }
    node.strain = Math.min(1, strain);
    node.charge = Math.max(0, node.charge - delta * CHARGE_DECAY);
  }

  for (const pulse of field.pulses) {
    if (pulse.hops <= 0) {
      respawn(field, pulse);
      continue;
    }
    const from = nodes[pulse.from];
    const to = nodes[pulse.to];
    if (!from || !to) {
      pulse.hops = 0;
      continue;
    }
    const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    pulse.t += (pulse.speed * delta) / length;
    if (pulse.t < 1) continue;

    // Arrived: flash the node, then carry on until the pulse runs out of hops.
    to.charge = 1;
    pulse.hops -= 1;
    if (pulse.hops <= 0 || !launch(field, pulse, pulse.to, pulse.direction)) {
      // Burning out discharges into a ring, so the pulses and the ripples read
      // as one system rather than two effects sharing a canvas.
      pulse.hops = 0;
      splash(field, to.x, to.y);
    }
  }
}

/**
 * Blits one slice of a trail ramp along a segment. `from` and `to` are positions
 * in the ramp (0 tail, 1 head), which is what lets a trail bend around a node:
 * the two segments take adjacent slices and meet without a seam.
 */
function blitTrail(
  context: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  from: number,
  to: number,
  thickness: number,
): void {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  if (length < 0.01 || to <= from) return;
  context.save();
  context.translate(ax, ay);
  context.rotate(Math.atan2(dy, dx));
  context.drawImage(
    sprite,
    SPRITE_WIDTH * from,
    0,
    SPRITE_WIDTH * (to - from),
    1,
    0,
    -thickness / 2,
    length,
    thickness,
  );
  context.restore();
}

/** The lattice, drawn in a few alpha tiers so brightness can vary per edge
 * without paying for a stroke per edge. */
function drawLattice(context: CanvasRenderingContext2D, field: Field, sprites: Sprites): void {
  const { nodes } = field;
  context.strokeStyle = sprites.line;
  context.lineWidth = 1;

  for (let tier = 0; tier < LINE_TIERS; tier++) {
    const low = tier / LINE_TIERS;
    const high = (tier + 1) / LINE_TIERS;
    context.globalAlpha =
      LINE_ALPHA.min + (LINE_ALPHA.max - LINE_ALPHA.min) * ((tier + 0.5) / LINE_TIERS);
    context.beginPath();

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (!node) continue;
      // An edge is as bright as its brighter end, so a pulse lights the whole
      // segment it is crossing rather than half of it.
      for (const direction of EDGE_DIRECTIONS) {
        const other = nodes[neighbour(field, index, direction)];
        if (!other) continue;
        const energy = Math.max(
          node.strain * 0.55 + node.charge,
          other.strain * 0.55 + other.charge,
        );
        const level = Math.min(0.999, energy);
        if (level < low || level >= high) continue;
        context.moveTo(node.x, node.y);
        context.lineTo(other.x, other.y);
      }
    }
    context.stroke();
  }
}

function drawDots(context: CanvasRenderingContext2D, field: Field, sprites: Sprites): void {
  for (const node of field.nodes) {
    const breath = 1 + DOT_PULSE * Math.sin(field.time * DOT_PULSE_SPEED + node.phase);
    const lift = Math.max(node.strain, node.charge);
    const alpha = (DOT_ALPHA.min + (DOT_ALPHA.max - DOT_ALPHA.min) * lift) * breath;
    const size = DOT_SIZE * (1 + lift * 0.5) * breath;
    context.globalAlpha = Math.min(1, alpha);
    context.drawImage(sprites.dot, node.x - size / 2, node.y - size / 2, size, size);
  }
}

function drawPulses(context: CanvasRenderingContext2D, field: Field, sprites: Sprites): void {
  const trail = field.spacing * TRAIL_SPANS;

  for (const pulse of field.pulses) {
    if (pulse.hops <= 0) continue;
    const from = field.nodes[pulse.from];
    const to = field.nodes[pulse.to];
    if (!from || !to) continue;

    const headX = from.x + (to.x - from.x) * pulse.t;
    const headY = from.y + (to.y - from.y) * pulse.t;
    const travelled = Math.hypot(to.x - from.x, to.y - from.y) * pulse.t;
    const onEdge = Math.min(trail, travelled);
    const tailX = headX - ((headX - from.x) * onEdge) / (travelled || 1);
    const tailY = headY - ((headY - from.y) * onEdge) / (travelled || 1);

    // The remainder of the trail, if any, bends back through the previous node.
    const previous = pulse.previous >= 0 ? field.nodes[pulse.previous] : undefined;
    const spill = trail - onEdge;
    const sprite = sprites.trails[pulse.tone];

    // Core last so the glow never sits on top of it.
    for (let pass = 0; pass <= GLOW_PASSES.length; pass++) {
      const glow = GLOW_PASSES[pass];
      const thickness = glow ? PULSE_THICKNESS * glow.scale : PULSE_THICKNESS;
      context.globalAlpha = glow ? glow.alpha : 1;

      blitTrail(context, sprite, tailX, tailY, headX, headY, 1 - onEdge / trail, 1, thickness);
      if (!previous || spill <= 0.5) continue;

      const backLength = Math.hypot(from.x - previous.x, from.y - previous.y) || 1;
      const reach = Math.min(spill, backLength);
      const backX = from.x + ((previous.x - from.x) * reach) / backLength;
      const backY = from.y + ((previous.y - from.y) * reach) / backLength;
      blitTrail(
        context,
        sprite,
        backX,
        backY,
        from.x,
        from.y,
        1 - (onEdge + reach) / trail,
        1 - onEdge / trail,
        thickness,
      );
    }
  }
}

function draw(context: CanvasRenderingContext2D, field: Field, sprites: Sprites): void {
  context.clearRect(0, 0, field.width, field.height);
  drawLattice(context, field, sprites);
  drawDots(context, field, sprites);
  drawPulses(context, field, sprites);
  context.globalAlpha = 1;
}

export function EnergyGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const sprites = bakeSprites(canvas);
    let field = build(canvas.clientWidth || 1, canvas.clientHeight || 1);
    let frame = 0;
    let last = 0;
    let visible = true;
    let pendingResize = false;

    const resize = () => {
      pendingResize = false;
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      const dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = build(width, height);
      step(field, 0);
      draw(context, field, sprites);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const delta = Math.min(MAX_STEP, last ? (now - last) / 1000 : 0);
      last = now;
      step(field, delta);
      draw(context, field, sprites);
    };

    const start = () => {
      if (frame || reduced) return;
      last = 0;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      // Touch drags scroll the page; treating them as a cursor fights the user.
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      field.pointerX = event.clientX - rect.left;
      field.pointerY = event.clientY - rect.top;
      field.pointerActive = true;
    };
    const onPointerLeave = () => {
      field.pointerActive = false;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      // Coalesce: a drag-resize fires this continuously, and build() is not free.
      if (pendingResize) return;
      pendingResize = true;
      requestAnimationFrame(resize);
    });
    resizeObserver.observe(canvas);

    // Reduced motion gets exactly one painted frame — no loop, no listeners.
    if (reduced) {
      return () => {
        resizeObserver.disconnect();
      };
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && !document.hidden) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" tabIndex={-1} className={className} />;
}
