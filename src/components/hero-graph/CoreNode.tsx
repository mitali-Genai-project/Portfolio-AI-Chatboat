import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group, Mesh } from "three";
import { focusDistance, isDragClick, placeAnchor, type AnchorRegistry } from "./anchors";
import { CORE_FLOAT, CORE_RADIUS, floatOffset } from "./layout";
import { RimGlow } from "./RimGlow";

interface CoreNodeProps {
  dark: boolean;
  accent: string;
  reduced: boolean;
  /** Small canvases skip the decorative particles and second ring. */
  compact: boolean;
  anchors: RefObject<AnchorRegistry>;
  /** The intro card is open. */
  selected: boolean;
  onSelect: () => void;
}

const offset = { x: 0, y: 0, z: 0 };

/** The central identity sphere with a cyan rim, orbit rings and a few particles. Its "MV" text lives in the HTML overlay. */
export function CoreNode({ dark, accent, reduced, compact, anchors, selected, onSelect }: CoreNodeProps) {
  const group = useRef<Group>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);

  useFrame((state) => {
    if (!group.current) return;
    if (!reduced) {
      const t = state.clock.elapsedTime;
      floatOffset(0, t, offset);
      group.current.position.set(offset.x * CORE_FLOAT, offset.y * CORE_FLOAT, offset.z * CORE_FLOAT);
      if (ringA.current) ringA.current.rotation.z = t * 0.12;
      if (ringB.current) ringB.current.rotation.z = -t * 0.08;
    }
    const { camera, size } = state;
    const fd = focusDistance(state);
    placeAnchor(anchors.current.get("core"), group.current, 0, camera, size.width, size.height, fd);
    placeAnchor(anchors.current.get("core:caption"), group.current, -CORE_RADIUS - 0.12, camera, size.width, size.height, fd, "below");
  });

  return (
    <group ref={group} name="core">
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragClick(e)) onSelect();
        }}
      >
        <sphereGeometry args={[CORE_RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          color={dark ? "#0b1a30" : "#f8fafc"}
          emissive={accent}
          emissiveIntensity={dark ? 0.12 : 0.04}
          roughness={0.35}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.25}
        />
      </mesh>
      <RimGlow radius={CORE_RADIUS * 1.04} color={accent} intensity={(dark ? 1.6 : 1.1) * (selected ? 1.5 : 1)} power={3} additive={dark} />
      <RimGlow radius={CORE_RADIUS * 1.35} color={accent} intensity={dark ? 0.35 : 0.18} power={1.6} additive={dark} />

      <mesh ref={ringA} rotation={[1.15, 0.2, 0]} raycast={() => null}>
        <torusGeometry args={[CORE_RADIUS * 1.5, 0.006, 8, 128]} />
        <meshBasicMaterial color={accent} transparent opacity={dark ? 0.45 : 0.6} toneMapped={false} />
      </mesh>
      {!compact && (
        <mesh ref={ringB} rotation={[1.35, -0.5, 0.4]} raycast={() => null}>
          <torusGeometry args={[CORE_RADIUS * 1.75, 0.004, 8, 128]} />
          <meshBasicMaterial color={dark ? "#a78bfa" : "#7c3aed"} transparent opacity={0.3} toneMapped={false} />
        </mesh>
      )}
      {!compact && (
        <Sparkles count={40} scale={2.4} size={1.6} speed={reduced ? 0 : 0.25} opacity={dark ? 0.7 : 0.5} color={accent} />
      )}
    </group>
  );
}
