"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * The hero's living mesh: a field of drifting nodes that continuously form and
 * dissolve edges, with electric signals racing along those edges and flashing
 * each node they arrive at.
 *
 * Everything below the component is a plain module-scope function operating on
 * a single mutable `Field`. That shape is deliberate — the frame loop must not
 * allocate, so nodes, edges and beams live in pools sized once per resize and
 * are reused for the lifetime of the field.
 */

/** Target one node per this many CSS px² — density, independent of viewport. */
const AREA_PER_NODE = 15_000;
const NODE_COUNT = { min: 48, max: 220 } as const;
/** Edges only form between nodes closer than this (CSS px). */
const LINK_RADIUS = 168;
const MAX_EDGES_PER_NODE = 6;
const BEAM_COUNT = 14;
/** Fraction of beams that fire red rather than white. */
const RED_SHARE = 0.3;
const BEAM_SPEED = { min: 190, max: 340 } as const;
/** Radius within which the pointer pushes nodes away (CSS px). */
const POINTER_RADIUS = 190;
const POINTER_PUSH = 26;
const DPR_CAP = 2;
/** Clamps the integration step so a backgrounded tab cannot teleport the field. */
const MAX_STEP = 1 / 30;

type Node = {
  /** Anchor the node drifts around; never itself animated. */
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  /** Per-node drift, so the field breathes organically instead of in lockstep. */
  phase: number;
  speed: number;
  amplitude: number;
  radius: number;
  /** Decays to 0; driven up to 1 when a beam arrives. Powers the flash. */
  charge: number;
  /** Indices into `Field.edges`, packed into a fixed slice of `adjacency`. */
  degree: number;
};

type Edge = { a: number; b: number };

type Beam = {
  from: number;
  to: number;
  /** 0 → 1 along the current edge. */
  t: number;
  speed: number;
  red: boolean;
  /** Hops remaining before the beam dies and respawns elsewhere. */
  life: number;
};

type Palette = { ash: string; red: string; line: string };

type Field = {
  width: number;
  height: number;
  nodes: Node[];
  edges: Edge[];
  /** Flat adjacency: node i owns slots [i * MAX_EDGES_PER_NODE, … + degree). */
  adjacency: Int32Array;
  beams: Beam[];
  pointerX: number;
  pointerY: number;
  pointerActive: boolean;
  time: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Reads a `@theme` token as a concrete rgb triple usable in `rgba()`. */
function readToken(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const raw = styles.getPropertyValue(name).trim() || fallback;
  const hex = raw.replace("#", "");
  if (hex.length !== 6) return raw;
  const value = Number.parseInt(hex, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

function readPalette(canvas: HTMLCanvasElement): Palette {
  const styles = getComputedStyle(canvas);
  return {
    ash: readToken(styles, "--color-ash-3", "#ededef"),
    red: readToken(styles, "--color-red", "#ff2d20"),
    line: readToken(styles, "--color-ash-1", "#6e6e76"),
  };
}

/**
 * Lays out nodes on a jittered grid — even coverage without the visible rows a
 * strict grid produces — then links each to its nearest neighbours through a
 * uniform spatial hash, so linking stays O(n) rather than O(n²).
 */
function build(width: number, height: number): Field {
  const target = Math.round((width * height) / AREA_PER_NODE);
  const count = Math.min(NODE_COUNT.max, Math.max(NODE_COUNT.min, target));
  const columns = Math.max(1, Math.round(Math.sqrt((count * width) / Math.max(height, 1))));
  const rows = Math.max(1, Math.ceil(count / columns));
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  const nodes: Node[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const homeX = (column + rand(0.2, 0.8)) * cellWidth;
      const homeY = (row + rand(0.2, 0.8)) * cellHeight;
      nodes.push({
        homeX,
        homeY,
        x: homeX,
        y: homeY,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.12, 0.42),
        amplitude: rand(6, 20),
        radius: rand(0.9, 2.1),
        charge: 0,
        degree: 0,
      });
    }
  }

  // Spatial hash keyed on LINK_RADIUS cells: a node's neighbours can only be in
  // its own cell or the eight around it.
  const cell = LINK_RADIUS;
  const gridColumns = Math.max(1, Math.ceil(width / cell));
  const gridRows = Math.max(1, Math.ceil(height / cell));
  const buckets: number[][] = Array.from({ length: gridColumns * gridRows }, () => []);
  const bucketOf = (x: number, y: number) => {
    const cx = Math.min(gridColumns - 1, Math.max(0, Math.floor(x / cell)));
    const cy = Math.min(gridRows - 1, Math.max(0, Math.floor(y / cell)));
    return cy * gridColumns + cx;
  };
  nodes.forEach((node, index) => {
    buckets[bucketOf(node.x, node.y)]?.push(index);
  });

  const edges: Edge[] = [];
  const adjacency = new Int32Array(nodes.length * MAX_EDGES_PER_NODE).fill(-1);
  const link = (a: number, b: number) => {
    const nodeA = nodes[a];
    const nodeB = nodes[b];
    if (!nodeA || !nodeB) return;
    if (nodeA.degree >= MAX_EDGES_PER_NODE || nodeB.degree >= MAX_EDGES_PER_NODE) return;
    const index = edges.length;
    edges.push({ a, b });
    adjacency[a * MAX_EDGES_PER_NODE + nodeA.degree++] = index;
    adjacency[b * MAX_EDGES_PER_NODE + nodeB.degree++] = index;
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    const cx = Math.min(gridColumns - 1, Math.max(0, Math.floor(node.x / cell)));
    const cy = Math.min(gridRows - 1, Math.max(0, Math.floor(node.y / cell)));
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const nx = cx + ox;
        const ny = cy + oy;
        if (nx < 0 || ny < 0 || nx >= gridColumns || ny >= gridRows) continue;
        for (const j of buckets[ny * gridColumns + nx] ?? []) {
          // j > i dedupes the pair without a visited set.
          if (j <= i) continue;
          const other = nodes[j];
          if (!other) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          if (dx * dx + dy * dy <= LINK_RADIUS * LINK_RADIUS) link(i, j);
        }
      }
    }
  }

  const beams: Beam[] = Array.from({ length: BEAM_COUNT }, () => ({
    from: 0,
    to: 0,
    t: 0,
    speed: 0,
    red: false,
    life: 0,
  }));

  const field: Field = {
    width,
    height,
    nodes,
    edges,
    adjacency,
    beams,
    pointerX: width / 2,
    pointerY: height / 2,
    pointerActive: false,
    time: 0,
  };
  for (const beam of beams) respawn(field, beam);
  return field;
}

/** Picks a random node with at least one edge, biased toward the pointer. */
function seedNode(field: Field): number {
  const { nodes, pointerActive, pointerX, pointerY } = field;
  let best = -1;
  // Best-of-N: cheap bias toward the pointer without sorting the whole field.
  const samples = pointerActive ? 6 : 1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let attempt = 0; attempt < samples * 4 && best < 0; attempt++) {
    const index = Math.floor(Math.random() * nodes.length);
    const node = nodes[index];
    if (!node || node.degree === 0) continue;
    if (!pointerActive) return index;
    const distance = (node.x - pointerX) ** 2 + (node.y - pointerY) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

/** Sends a beam down a random edge of `from`. Returns false if it is a dead end. */
function launch(field: Field, beam: Beam, from: number): boolean {
  const node = field.nodes[from];
  if (!node || node.degree === 0) return false;
  const slot = from * MAX_EDGES_PER_NODE + Math.floor(Math.random() * node.degree);
  const edge = field.edges[field.adjacency[slot] ?? -1];
  if (!edge) return false;
  beam.from = from;
  beam.to = edge.a === from ? edge.b : edge.a;
  beam.t = 0;
  return true;
}

function respawn(field: Field, beam: Beam): void {
  const seed = seedNode(field);
  beam.speed = rand(BEAM_SPEED.min, BEAM_SPEED.max);
  beam.red = Math.random() < RED_SHARE;
  beam.life = Math.floor(rand(4, 11));
  if (seed < 0 || !launch(field, beam, seed)) beam.life = 0;
}

function step(field: Field, delta: number): void {
  field.time += delta;
  const { nodes, pointerActive, pointerX, pointerY, time } = field;

  for (const node of nodes) {
    const drift = time * node.speed + node.phase;
    let x = node.homeX + Math.cos(drift) * node.amplitude;
    let y = node.homeY + Math.sin(drift * 1.3) * node.amplitude;

    if (pointerActive) {
      const dx = x - pointerX;
      const dy = y - pointerY;
      const distance = Math.hypot(dx, dy);
      if (distance < POINTER_RADIUS && distance > 0.01) {
        // Squared falloff: a tight, springy pocket rather than a wide bulge.
        const force = (1 - distance / POINTER_RADIUS) ** 2 * POINTER_PUSH;
        x += (dx / distance) * force;
        y += (dy / distance) * force;
      }
    }

    node.x = x;
    node.y = y;
    node.charge = Math.max(0, node.charge - delta * 1.9);
  }

  for (const beam of field.beams) {
    if (beam.life <= 0) {
      respawn(field, beam);
      continue;
    }
    const from = nodes[beam.from];
    const to = nodes[beam.to];
    if (!from || !to) {
      beam.life = 0;
      continue;
    }
    const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    beam.t += (beam.speed * delta) / length;
    if (beam.t < 1) continue;

    // Arrived: flash the node, then hop onward until the beam runs out of life.
    to.charge = 1;
    beam.life -= 1;
    if (beam.life <= 0 || !launch(field, beam, beam.to)) beam.life = 0;
  }
}

function draw(context: CanvasRenderingContext2D, field: Field, palette: Palette): void {
  const { nodes, edges } = field;
  context.clearRect(0, 0, field.width, field.height);

  // Edges first, so nodes and beams sit on top of the mesh.
  context.lineWidth = 1;
  for (const edge of edges) {
    const a = nodes[edge.a];
    const b = nodes[edge.b];
    if (!a || !b) continue;
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    if (distance > LINK_RADIUS) continue;
    // Opacity falls off with length, so the mesh visibly forms and dissolves as
    // nodes drift in and out of range.
    const fade = (1 - distance / LINK_RADIUS) * 0.28;
    const charge = Math.max(a.charge, b.charge) * 0.35;
    context.strokeStyle = `rgb(${palette.line} / ${(fade + charge).toFixed(3)})`;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  for (const node of nodes) {
    const glow = node.charge;
    context.fillStyle =
      glow > 0.02
        ? `rgb(${palette.ash} / ${(0.3 + glow * 0.7).toFixed(3)})`
        : `rgb(${palette.line} / 0.5)`;
    context.beginPath();
    context.arc(node.x, node.y, node.radius + glow * 1.8, 0, Math.PI * 2);
    context.fill();
  }

  // Beams: a bright head with a gradient trail running back along the edge.
  context.lineCap = "round";
  for (const beam of field.beams) {
    if (beam.life <= 0) continue;
    const from = nodes[beam.from];
    const to = nodes[beam.to];
    if (!from || !to) continue;
    const headX = from.x + (to.x - from.x) * beam.t;
    const headY = from.y + (to.y - from.y) * beam.t;
    const tail = Math.max(0, beam.t - 0.45);
    const tailX = from.x + (to.x - from.x) * tail;
    const tailY = from.y + (to.y - from.y) * tail;
    const rgb = beam.red ? palette.red : palette.ash;

    const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
    gradient.addColorStop(0, `rgb(${rgb} / 0)`);
    gradient.addColorStop(1, `rgb(${rgb} / 0.95)`);
    context.strokeStyle = gradient;
    context.lineWidth = beam.red ? 1.8 : 1.4;
    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(headX, headY);
    context.stroke();

    context.fillStyle = `rgb(${rgb} / 0.95)`;
    context.beginPath();
    context.arc(headX, headY, beam.red ? 2.1 : 1.7, 0, Math.PI * 2);
    context.fill();
  }
  context.lineWidth = 1;
}

export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const palette = readPalette(canvas);
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
      draw(context, field, palette);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const delta = Math.min(MAX_STEP, last ? (now - last) / 1000 : 0);
      last = now;
      step(field, delta);
      draw(context, field, palette);
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
