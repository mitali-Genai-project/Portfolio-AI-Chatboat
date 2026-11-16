import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, QuadraticBezierCurve3, Vector3, type InterleavedBufferAttribute, type Mesh } from "three";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import type { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { floatOffset, type Vec3 } from "./layout";

const SEGMENTS = 28;

/** A branch end point: rest position plus the float seed/amplitude of the thing it's attached to. */
export interface BranchEnd {
  pos: Vec3;
  seed: number;
  amp: number;
}

interface GraphBranchProps {
  from: BranchEnd;
  to: BranchEnd;
  color: string;
  dark: boolean;
  /** "main" = core → node (halo + pulse); "leaf" = node → satellite (single thin line). */
  variant: "main" | "leaf";
  active: boolean;
  dimmed: boolean;
  reduced: boolean;
}

interface Scratch {
  curve: QuadraticBezierCurve3;
  points: Vector3[];
  offset: { x: number; y: number; z: number };
  /** How the curve bows away from the straight line between its ends. */
  bend: Vector3;
  /** Rest-pose points, handed to <Line> once. */
  initial: Vector3[];
}

function makeScratch(from: BranchEnd, to: BranchEnd): Scratch {
  const dir = new Vector3(to.pos[0] - from.pos[0], to.pos[1] - from.pos[1], to.pos[2] - from.pos[2]);
  const length = dir.length();
  const perp = new Vector3().crossVectors(dir, new Vector3(0, 0, 1));
  if (perp.lengthSq() < 1e-6) perp.set(1, 0, 0);
  // Alternate the bow direction so neighbouring branches don't all curl the same way.
  const sign = to.seed % 2 ? 1 : -1;
  const bend = perp.normalize().multiplyScalar(0.2 * length * sign).add(new Vector3(0, 0, 0.22 * length));
  return {
    curve: new QuadraticBezierCurve3(new Vector3(), new Vector3(), new Vector3()),
    points: Array.from({ length: SEGMENTS + 1 }, () => new Vector3()),
    offset: { x: 0, y: 0, z: 0 },
    bend,
    initial: [],
  };
}

function setEnd(target: Vector3, end: BranchEnd, t: number, offset: Scratch["offset"]) {
  floatOffset(end.seed, t, offset);
  target.set(end.pos[0] + offset.x * end.amp, end.pos[1] + offset.y * end.amp, end.pos[2] + offset.z * end.amp);
}

/** Update the curve to the current end positions and sample it into `points`. */
function sample(s: Scratch, from: BranchEnd, to: BranchEnd, t: number) {
  const { curve } = s;
  setEnd(curve.v0, from, t, s.offset);
  setEnd(curve.v2, to, t, s.offset);
  curve.v1.addVectors(curve.v0, curve.v2).multiplyScalar(0.5).add(s.bend);
  for (let i = 0; i <= SEGMENTS; i++) curve.getPoint(i / SEGMENTS, s.points[i]);
}

/** Write sampled points straight into a Line2's segment buffer (no reallocation per frame). */
function writeLine(line: Line2, points: Vector3[]) {
  const attr = line.geometry.attributes.instanceStart as InterleavedBufferAttribute;
  const arr = attr.data.array as Float32Array;
  for (let i = 0; i < SEGMENTS; i++) {
    const a = points[i];
    const b = points[i + 1];
    const o = i * 6;
    arr[o] = a.x; arr[o + 1] = a.y; arr[o + 2] = a.z;
    arr[o + 3] = b.x; arr[o + 4] = b.y; arr[o + 5] = b.z;
  }
  attr.data.needsUpdate = true;
}

/** A curved glowing connector that follows both of its floating end points. */
export function GraphBranch({ from, to, color, dark, variant, active, dimmed, reduced }: GraphBranchProps) {
  // Per-branch scratch objects, created once and mutated only inside useFrame.
  const [scratch] = useState(() => {
    const s = makeScratch(from, to);
    sample(s, from, to, 0);
    s.initial = s.points.map((p) => p.clone());
    return s;
  });

  const main = variant === "main";
  const halo = useRef<Line2>(null);
  const core = useRef<Line2>(null);
  const pulse = useRef<Mesh>(null);

  useFrame(({ clock }, dt) => {
    if (!core.current) return;
    const t = reduced ? 0 : clock.elapsedTime;
    if (!reduced) {
      sample(scratch, from, to, t);
      writeLine(core.current, scratch.points);
      if (halo.current) writeLine(halo.current, scratch.points);
    }

    const k = reduced ? 1 : 1 - Math.exp(-dt * 6);
    const coreMat = core.current.material as LineMaterial;
    const base = main ? 0.5 : 0.28;
    coreMat.opacity = MathUtils.lerp(coreMat.opacity, active ? 0.95 : dimmed ? base * 0.45 : base, k);
    if (halo.current) {
      const haloMat = halo.current.material as LineMaterial;
      haloMat.opacity = MathUtils.lerp(haloMat.opacity, active ? 0.28 : dimmed ? 0.04 : 0.1, k);
    }
    if (pulse.current) {
      scratch.curve.getPoint((t * 0.15 + to.seed / 6) % 1, pulse.current.position);
      pulse.current.visible = !dimmed;
    }
  });

  return (
    <group>
      {main && (
        <Line ref={halo} points={scratch.initial} color={color} lineWidth={5} transparent opacity={0.1} depthWrite={false} toneMapped={false} frustumCulled={false} />
      )}
      <Line
        ref={core}
        points={scratch.initial}
        color={color}
        lineWidth={main ? 1.4 : 0.9}
        transparent
        opacity={main ? 0.5 : 0.28}
        depthWrite={false}
        toneMapped={false}
        frustumCulled={false}
      />
      {main && !reduced && (
        <mesh ref={pulse} raycast={() => null}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshBasicMaterial color={dark ? "#ffffff" : color} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
