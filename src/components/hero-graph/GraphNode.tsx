import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { MathUtils, type Group, type Mesh, type MeshStandardMaterial, type ShaderMaterial } from "three";
import type { GraphNodeData, GraphNodeId } from "@/data/graphNodes";
import { focusDistance, isDragClick, placeAnchor, type AnchorRegistry } from "./anchors";
import { floatOffset, LEAF_RADIUS, NODE_RADIUS, type Vec3 } from "./layout";
import { RimGlow } from "./RimGlow";

const offset = { x: 0, y: 0, z: 0 };

interface GraphNodeProps {
  node: GraphNodeData;
  /** Seed for the float animation; must match the node's branches. */
  seed: number;
  position: Vec3;
  color: string;
  dark: boolean;
  hovered: boolean;
  selected: boolean;
  /** Another node is selected — fade this one back slightly. */
  dimmed: boolean;
  reduced: boolean;
  anchors: RefObject<AnchorRegistry>;
  onHover: (id: GraphNodeId | null) => void;
  onSelect: (id: GraphNodeId) => void;
}

/** One floating main node: sphere + rim glow. Its icon and label live in the HTML overlay and are positioned from here. */
export function GraphNode({ node, seed, position, color, dark, hovered, selected, dimmed, reduced, anchors, onHover, onSelect }: GraphNodeProps) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame((state, dt) => {
    if (!group.current || !body.current || !glow.current) return;
    floatOffset(seed, reduced ? 0 : state.clock.elapsedTime, offset);
    group.current.position.set(position[0] + offset.x, position[1] + offset.y, position[2] + offset.z);

    // Frame-rate independent easing; reduced motion snaps straight to the target.
    const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
    const scale = MathUtils.lerp(body.current.scale.x, selected ? 1.25 : hovered ? 1.15 : 1, k);
    body.current.scale.setScalar(scale);
    glow.current.scale.setScalar(scale);

    const mat = body.current.material as MeshStandardMaterial;
    mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, selected || hovered ? 0.9 : dimmed ? 0.25 : 0.45, k);
    const rim = (glow.current.material as ShaderMaterial).uniforms.uIntensity;
    rim.value = MathUtils.lerp(rim.value, selected || hovered ? 2.2 : dimmed ? 0.7 : 1.2, k);

    const a = anchors.current;
    const { camera, size } = state;
    const fd = focusDistance(state);
    placeAnchor(a.get(`${node.id}:icon`), group.current, 0, camera, size.width, size.height, fd);
    placeAnchor(a.get(`${node.id}:label`), group.current, -(NODE_RADIUS * scale) - 0.04, camera, size.width, size.height, fd, "below");
  });

  return (
    <group ref={group} position={position}>
      <mesh
        ref={body}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragClick(e)) onSelect(node.id);
        }}
      >
        <sphereGeometry args={[NODE_RADIUS, 40, 40]} />
        <meshStandardMaterial color={dark ? "#0d1a2e" : "#ffffff"} emissive={color} emissiveIntensity={0.45} roughness={0.4} metalness={0.1} />
      </mesh>
      <RimGlow ref={glow} radius={NODE_RADIUS * 1.12} color={color} intensity={1.2} power={2.2} additive={dark} />
    </group>
  );
}

interface LeafNodeProps {
  anchorKey: string;
  seed: number;
  position: Vec3;
  color: string;
  dark: boolean;
  /** Parent node is hovered or selected. */
  active: boolean;
  reduced: boolean;
  anchors: RefObject<AnchorRegistry>;
}

/** Small satellite sphere; purely decorative (its label appears when the parent is active). */
export function LeafNode({ anchorKey, seed, position, color, dark, active, reduced, anchors }: LeafNodeProps) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);

  useFrame((state, dt) => {
    if (!group.current || !body.current) return;
    floatOffset(seed, reduced ? 0 : state.clock.elapsedTime, offset);
    group.current.position.set(position[0] + offset.x, position[1] + offset.y, position[2] + offset.z);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 8);
    body.current.scale.setScalar(MathUtils.lerp(body.current.scale.x, active ? 1.4 : 1, k));
    const { camera, size } = state;
    placeAnchor(anchors.current.get(anchorKey), group.current, -LEAF_RADIUS - 0.05, camera, size.width, size.height, focusDistance(state), "below");
  });

  return (
    <group ref={group} position={position}>
      <mesh ref={body} raycast={() => null}>
        <sphereGeometry args={[LEAF_RADIUS, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={dark ? 0.85 : 0.75} toneMapped={false} />
      </mesh>
      <RimGlow radius={LEAF_RADIUS * 1.9} color={color} intensity={0.7} power={1.5} additive={dark} />
    </group>
  );
}
