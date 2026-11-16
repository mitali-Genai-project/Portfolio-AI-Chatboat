import type { RootState, ThreeEvent } from "@react-three/fiber";
import { Vector3, type Camera, type Object3D } from "three";

/**
 * Registry of DOM overlay elements (labels, icons) keyed by name. The DOM layer registers
 * elements via callback refs; the 3D scene moves them every frame with `placeAnchor`.
 * This keeps all text as normal, accessible HTML in a single React tree.
 */
export type AnchorRegistry = Map<string, HTMLElement>;

const world = new Vector3();
const ndc = new Vector3();

/**
 * Position `el` over the point `(0, offsetY, 0)` in `obj`'s local space.
 * `focusDistance` is the camera's distance to its target: things nearer than that render
 * slightly larger and fully opaque, things further away smaller and fainter (exposed to CSS
 * as `--depth`, 0.4–1). Elements behind the camera are hidden.
 */
export function placeAnchor(
  el: HTMLElement | undefined,
  obj: Object3D,
  offsetY: number,
  camera: Camera,
  width: number,
  height: number,
  focusDistance: number,
  /** "center" centres the element on the point; "below" hangs it just under the point. */
  align: "center" | "below" = "center",
) {
  if (!el) return;
  world.set(0, offsetY, 0);
  obj.localToWorld(world);
  ndc.copy(world).project(camera);
  if (ndc.z > 1) {
    el.style.visibility = "hidden";
    return;
  }
  const ratio = focusDistance / Math.max(camera.position.distanceTo(world), 0.001);
  const scale = Math.min(Math.max(ratio, 0.8), 1.15);
  const depth = Math.min(Math.max(0.4 + (ratio - 0.75) * 1.5, 0.4), 1);
  const x = ((ndc.x + 1) / 2) * width;
  const y = ((1 - ndc.y) / 2) * height;
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) ${align === "below" ? "translate(-50%, 3px)" : "translate(-50%, -50%)"} scale(${scale.toFixed(3)})`;
  el.style.transformOrigin = align === "below" ? "top center" : "center";
  el.style.setProperty("--depth", depth.toFixed(2));
  el.style.zIndex = String(Math.round(ratio * 100));
  el.style.visibility = "visible";
}

/** Camera-to-target distance used for depth scaling of labels. */
export function focusDistance(state: RootState) {
  return (state.controls as { distance?: number } | null)?.distance ?? state.camera.position.length();
}

/** Clicks that end a drag-to-rotate shouldn't select anything. */
export const isDragClick = (e: ThreeEvent<MouseEvent>) => e.delta > 6;
