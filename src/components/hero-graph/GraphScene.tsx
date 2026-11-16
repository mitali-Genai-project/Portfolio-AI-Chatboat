import { CameraControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Box3, MathUtils, Vector3, type Group, type PerspectiveCamera } from "three";
import type { GraphNodeData, GraphNodeId } from "@/data/graphNodes";
import type { AnchorRegistry } from "./anchors";
import { CoreNode } from "./CoreNode";
import { GraphBranch, type BranchEnd } from "./GraphBranch";
import { GraphNode, LeafNode } from "./GraphNode";
import { LabelOverlay } from "./LabelOverlay";
import { CORE_FLOAT, type GraphLayout, type Vec3 } from "./layout";
import { COMPACT_WIDTH, PANEL_SPACE, SHEET_FRACTION, SIDE_ARROW_SPACE, WIDE_WIDTH, XL_WINDOW } from "./viewport";

export interface GraphSceneProps {
  nodes: GraphNodeData[];
  layout: GraphLayout;
  selectedId: GraphNodeId | null;
  onSelect: (id: GraphNodeId | null) => void;
  dark: boolean;
  reduced: boolean;
  /** Bumped by the "Reset view" control to return to the home framing even if nothing is selected. */
  resetToken: number;
}

interface GraphProps extends GraphSceneProps {
  anchors: RefObject<AnchorRegistry>;
  hoveredId: GraphNodeId | null;
  onHover: (id: GraphNodeId | null) => void;
}

const ACCENT = { dark: "#50e3d2", light: "#0d9488" };
const CORE_END: BranchEnd = { pos: [0, 0, 0], seed: 0, amp: CORE_FLOAT };

/** Lazy-loaded entry point: everything three.js lives behind this module. */
export default function GraphScene(props: GraphSceneProps) {
  const [hoveredId, setHoveredId] = useState<GraphNodeId | null>(null);
  const anchors = useRef<AnchorRegistry>(new Map());

  return (
    <>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={props.reduced ? "demand" : "always"}
      >
        <Graph {...props} anchors={anchors} hoveredId={hoveredId} onHover={setHoveredId} />
      </Canvas>
      <LabelOverlay
        anchors={anchors}
        nodes={props.nodes}
        hoveredId={hoveredId}
        selectedId={props.selectedId}
        dark={props.dark}
        onHover={setHoveredId}
        onSelect={props.onSelect}
      />
    </>
  );
}

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Smoothly move the camera so the box spanned by `points` (plus label margins) fits inside
 * the canvas minus `pad` pixels — e.g. minus the space the detail panel takes up.
 */
function frame(
  controls: CameraControls,
  camera: PerspectiveCamera,
  size: { width: number; height: number },
  points: Vec3[],
  pad: Padding,
  view: { azimuth: number; polar: number; minHalf: number },
  smooth: boolean,
) {
  const box = new Box3().setFromPoints(points.map((p) => new Vector3(...p)));
  const center = box.getCenter(new Vector3());
  // Margins leave room for labels below / beside nodes.
  const halfW = Math.max((box.max.x - box.min.x) / 2 + 0.8, view.minHalf);
  const halfH = Math.max((box.max.y - box.min.y) / 2 + 0.7, view.minHalf);
  const t = Math.tan(MathUtils.degToRad(camera.fov) / 2);
  const { width: W, height: H } = size;
  const rw = Math.max(W - pad.left - pad.right, 120);
  const rh = Math.max(H - pad.top - pad.bottom, 120);
  // At distance d one pixel spans 2·d·t/H world units; solve for the d that fits both axes.
  const d = Math.max((halfW * H) / (rw * t), (halfH * H) / (rh * t)) + Math.max(box.max.z - center.z, 0) * 0.6;
  const unitsPerPx = (2 * d * t) / H;

  controls.normalizeRotations();
  void controls.rotateTo(view.azimuth, view.polar, smooth);
  void controls.moveTo(center.x, center.y, center.z, smooth);
  void controls.dollyTo(d, smooth);
  // Shift the view so the framed content is centred in the free area, not under the panel.
  // (camera-controls' focal offset Y is screen-down positive.)
  void controls.setFocalOffset(((pad.right - pad.left) / 2) * unitsPerPx, ((pad.bottom - pad.top) / 2) * unitsPerPx, 0, smooth);
}

function Graph({ nodes, layout, selectedId, onSelect, dark, reduced, resetToken, anchors, hoveredId, onHover }: GraphProps) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const controls = useRef<CameraControls>(null);
  const sway = useRef<Group>(null);
  const last = useRef<{ selectedId: GraphNodeId | null; resetToken: number } | null>(null);

  // Small canvases drop the satellites and decorative extras.
  const compact = size.width < COMPACT_WIDTH;
  const wide = size.width >= WIDE_WIDTH;
  const accent = dark ? ACCENT.dark : ACCENT.light;
  const selectedIndex = nodes.findIndex((n) => n.id === selectedId);

  // Pan stays near the graph.
  useEffect(() => {
    controls.current?.setBoundary(new Box3(new Vector3(-5, -4, -4), new Vector3(5, 4, 4)));
  }, []);

  // Frame the whole graph, or the selected node with the core and its satellites.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    // Animate only for user actions (select / reset); resizes and first paint snap.
    const prev = last.current;
    const smooth = !reduced && prev !== null && (prev.selectedId !== selectedId || prev.resetToken !== resetToken);
    last.current = { selectedId, resetToken };

    // The fixed carousel arrows sit over the right edge on xl screens; the panel moves in to clear them.
    const arrows = window.innerWidth >= XL_WINDOW ? SIDE_ARROW_SPACE : 0;
    const panelPad = (top: number) =>
      wide
        ? { top, right: PANEL_SPACE + arrows, bottom: 16, left: 16 + arrows }
        : { top, right: 12, bottom: size.height * SHEET_FRACTION, left: 12 };

    if (selectedId === "identity" && !wide) {
      frame(c, camera, size, [[0, 0, 0]], panelPad(44), { azimuth: 0, polar: Math.PI / 2, minHalf: 2.6 }, smooth);
    } else if (selectedIndex < 0) {
      const points: Vec3[] = [[0, 0, 0], ...layout.main.map((m) => m.pos)];
      if (!compact) points.push(...layout.leaves.flat().map((l) => l.pos));
      // The core's intro card keeps the whole graph in view, shifted aside to make room for the panel.
      const pad = selectedId === "identity" ? panelPad(44) : { top: 44, right: 16, bottom: 8, left: 16 };
      frame(c, camera, size, points, pad, { azimuth: 0, polar: Math.PI / 2, minHalf: 2 }, smooth);
    } else {
      const node = layout.main[selectedIndex].pos;
      const points: Vec3[] = [[0, 0, 0], node];
      if (!compact) points.push(...layout.leaves[selectedIndex].map((l) => l.pos));
      const pad = panelPad(wide ? 16 : 44);
      // Turn slightly towards the node so its depth reads, without flipping the scene.
      const view = {
        azimuth: MathUtils.clamp(node[0] * 0.07, -0.3, 0.3),
        polar: Math.PI / 2 - MathUtils.clamp(node[1] * 0.05, -0.15, 0.15),
        // Keep a wide frame so neighbouring nodes stay in view around the focused one.
        minHalf: compact ? 2.2 : 3.3,
      };
      frame(c, camera, size, points, pad, view, smooth);
    }
    invalidate();
  }, [selectedId, selectedIndex, resetToken, size, compact, wide, reduced, layout, camera, invalidate]);

  // In reduced-motion ("demand") mode, render a frame whenever interaction state changes.
  useEffect(() => invalidate(), [invalidate, hoveredId, dark]);

  // Reset the pointer cursor if the scene unmounts mid-hover.
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  // Very slow idle sway so the graph feels alive; settles while a node is focused.
  useFrame(({ clock }, dt) => {
    if (!sway.current || reduced) return;
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 2);
    const amp = selectedId ? 0 : 1;
    sway.current.rotation.y = MathUtils.lerp(sway.current.rotation.y, Math.sin(t * 0.1) * 0.06 * amp, k);
    sway.current.rotation.x = MathUtils.lerp(sway.current.rotation.x, Math.sin(t * 0.08) * 0.03 * amp, k);
  });

  return (
    <>
      <ambientLight intensity={dark ? 0.35 : 0.9} />
      <directionalLight position={[3, 4, 6]} intensity={dark ? 1.1 : 1.4} />
      <pointLight position={[0, 0, 3.5]} intensity={dark ? 2.5 : 1} distance={10} color={accent} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={4}
        maxDistance={28}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
        smoothTime={reduced ? 0 : 0.6}
        draggingSmoothTime={reduced ? 0 : 0.15}
        dollySpeed={0.6}
        truckSpeed={0.8}
      />

      <group ref={sway}>
        <CoreNode dark={dark} accent={accent} reduced={reduced} compact={compact} anchors={anchors} selected={selectedId === "identity"} onSelect={() => onSelect("identity")} />
        {nodes.map((node, i) => {
          const color = dark ? node.color.dark : node.color.light;
          const main = layout.main[i];
          const selected = node.id === selectedId;
          const active = selected || node.id === hoveredId;
          // The core's card is an overview, so nothing fades back for it.
          const dimmed = selectedId !== null && selectedId !== "identity" && !selected;
          const mainEnd: BranchEnd = { pos: main.pos, seed: main.seed, amp: 1 };
          return (
            <group key={node.id}>
              <GraphBranch from={CORE_END} to={mainEnd} color={color} dark={dark} variant="main" active={active} dimmed={dimmed} reduced={reduced} />
              <GraphNode
                node={node}
                seed={main.seed}
                position={main.pos}
                color={color}
                dark={dark}
                hovered={node.id === hoveredId}
                selected={selected}
                dimmed={dimmed}
                reduced={reduced}
                anchors={anchors}
                onHover={onHover}
                onSelect={onSelect}
              />
              {!compact &&
                layout.leaves[i].map((leaf, j) => (
                  <group key={j}>
                    <GraphBranch
                      from={mainEnd}
                      to={{ pos: leaf.pos, seed: leaf.seed, amp: 1 }}
                      color={color}
                      dark={dark}
                      variant="leaf"
                      active={active}
                      dimmed={dimmed}
                      reduced={reduced}
                    />
                    <LeafNode
                      anchorKey={`${node.id}:leaf:${j}`}
                      seed={leaf.seed}
                      position={leaf.pos}
                      color={color}
                      dark={dark}
                      active={active}
                      reduced={reduced}
                      anchors={anchors}
                    />
                  </group>
                ))}
            </group>
          );
        })}
      </group>
    </>
  );
}
