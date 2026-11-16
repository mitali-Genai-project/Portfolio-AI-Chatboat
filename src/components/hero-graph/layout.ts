/**
 * Pure layout math shared by the 3D scene and the 2D fallback (no three.js import, so it
 * stays cheap in the main bundle).
 *
 * The graph is "organic": hand-tuned, asymmetric 3D seed positions for the six main nodes,
 * satellite leaves fanned outward from each, then a short deterministic relaxation pass that
 * pushes apart anything closer than its minimum spacing. Same result on every load.
 */

export type Vec3 = [number, number, number];

export const CORE_RADIUS = 0.62;
export const NODE_RADIUS = 0.28;
export const LEAF_RADIUS = 0.08;

/** Seed positions, in graph order (about, skills, experience, projects, github, contact). */
const MAIN_SEEDS: Vec3[] = [
  [-2.5, 1.85, -0.9],
  [2.35, 1.95, 0.7],
  [3.3, -0.45, -1.3],
  [1.2, -2.3, 1.0],
  [-1.75, -2.05, -1.5],
  [-3.4, -0.2, 0.75],
];

export interface LayoutPoint {
  pos: Vec3;
  /** Index of the parent point (-1 = attached to the core). */
  parent: number;
  /** Index of the main node this point belongs to. */
  group: number;
  kind: "main" | "leaf";
  /** Seed for the float animation. */
  seed: number;
}

export interface GraphLayout {
  main: LayoutPoint[];
  /** leaves[i] are the satellites of main node i. */
  leaves: LayoutPoint[][];
  /** Radius of a sphere (centred at the origin) that contains everything. */
  radius: number;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const norm = (a: Vec3) => scale(a, 1 / (len(a) || 1));

/** Leaf j of a node sits ~1.1 units further out, fanned around the outward direction. */
function leafSeed(parent: Vec3, j: number, count: number, i: number): Vec3 {
  const out = norm(parent);
  // A vector perpendicular to `out`, rotated per leaf so the fan isn't planar.
  const side = norm([-out[1], out[0], 0.35 * (i % 2 ? 1 : -1)]);
  const up = norm([out[1] * side[2] - out[2] * side[1], out[2] * side[0] - out[0] * side[2], out[0] * side[1] - out[1] * side[0]]);
  const spread = count === 1 ? 0 : (j / (count - 1) - 0.5) * 1.6;
  const lift = (j % 2 ? 0.35 : -0.25) + i * 0.03;
  const dir = norm(add(add(out, scale(side, spread)), scale(up, lift)));
  return add(parent, scale(dir, 1.05 + 0.15 * (j % 2)));
}

/** Push apart pairs that are closer than `min`; the core (origin) stays fixed and repels too. */
function relax(points: LayoutPoint[], minFor: (a: LayoutPoint, b: LayoutPoint) => number, iterations = 40) {
  const core: LayoutPoint = { pos: [0, 0, 0], parent: -1, group: -1, kind: "main", seed: 0 };
  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let a = 0; a < points.length; a++) {
      for (let b = -1; b < points.length; b++) {
        if (b === a) continue;
        const other = b === -1 ? core : points[b];
        const min = b === -1 ? (points[a].kind === "main" ? 2.3 : 1.6) : minFor(points[a], other);
        const d = sub(points[a].pos, other.pos);
        const dist = len(d) || 0.001;
        if (dist >= min) continue;
        // Core is immovable; otherwise split the correction between both points.
        const push = scale(norm(d), (min - dist) * (b === -1 ? 1 : 0.5));
        points[a].pos = add(points[a].pos, push);
        if (b !== -1) points[b].pos = sub(points[b].pos, push);
        moved = true;
      }
    }
    if (!moved) break;
  }
}

export function buildLayout(leafCounts: number[]): GraphLayout {
  const main: LayoutPoint[] = MAIN_SEEDS.slice(0, leafCounts.length).map((pos, i) => ({
    pos: [...pos] as Vec3,
    parent: -1,
    group: i,
    kind: "main",
    seed: i + 1,
  }));
  const leaves = main.map((m, i) =>
    Array.from({ length: leafCounts[i] }, (_, j): LayoutPoint => ({
      pos: leafSeed(m.pos, j, leafCounts[i], i),
      parent: i,
      group: i,
      kind: "leaf",
      seed: 10 + i * 4 + j,
    })),
  );

  const all = [...main, ...leaves.flat()];
  relax(all, (a, b) => {
    if (a.kind === "main" && b.kind === "main") return 2.4;
    if (a.kind === "leaf" && b.kind === "leaf") return a.group === b.group ? 0.75 : 1.0;
    return a.group === b.group ? 0.9 : 1.3;
  });

  const radius = Math.max(...all.map((p) => len(p.pos))) + 0.4;
  return { main, leaves, radius };
}

/** Normalised (0–100) screen position of each main node, for the flat 2D fallback. */
export function layout2D(layout: GraphLayout) {
  const r = layout.radius;
  return layout.main.map((p) => ({ x: 50 + (p.pos[0] / r) * 44, y: 50 - (p.pos[1] / r) * 44 }));
}

/**
 * Gentle deterministic drift for an element with the given seed at time t.
 * Nodes and branch end-points both call this, so lines stay attached without shared state.
 */
export function floatOffset(seed: number, t: number, out: { x: number; y: number; z: number }) {
  out.x = Math.sin(t * 0.55 + seed * 1.3) * 0.06;
  out.y = Math.sin(t * 0.8 + seed * 1.7) * 0.11;
  out.z = Math.cos(t * 0.5 + seed) * 0.08;
  return out;
}

/** Amplitude of the core's float relative to other nodes. */
export const CORE_FLOAT = 0.5;
