import type { CSSProperties, RefObject } from "react";
import type { GraphNodeData, GraphNodeId } from "@/data/graphNodes";
import { profile } from "@/data/profile";
import type { AnchorRegistry } from "./anchors";

interface LabelOverlayProps {
  anchors: RefObject<AnchorRegistry>;
  nodes: GraphNodeData[];
  hoveredId: GraphNodeId | null;
  selectedId: GraphNodeId | null;
  dark: boolean;
  onHover: (id: GraphNodeId | null) => void;
  onSelect: (id: GraphNodeId) => void;
}

/** Every anchored element starts hidden at the top-left until the scene positions it. */
const anchored = "absolute top-0 left-0 invisible will-change-transform";

/** Opacity = depth fade (written per frame by the scene as --depth) × the state factor. */
const fade = (factor: number): CSSProperties => ({ opacity: `calc(var(--depth, 1) * ${factor})` });

/** HTML layer over the canvas: core initials, node icons, clickable node labels and satellite labels. */
export function LabelOverlay({ anchors, nodes, hoveredId, selectedId, dark, onHover, onSelect }: LabelOverlayProps) {
  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) anchors.current.set(key, el);
    else anchors.current.delete(key);
  };

  return (
    // `isolate` keeps the per-frame z-indexes of labels below the detail panel.
    <div className="pointer-events-none absolute inset-0 isolate z-10 overflow-hidden">
      <span ref={register("core")} aria-hidden className={`${anchored} font-display text-lg font-extrabold tracking-tight text-fg select-none @2xl:text-2xl`}>
        MV<span className="text-accent">.</span>
      </span>
      <button
        ref={register("core:caption")}
        type="button"
        onClick={() => onSelect("identity")}
        aria-expanded={selectedId === "identity"}
        aria-controls="hero-graph-panel"
        className={`${anchored} pointer-events-auto cursor-pointer rounded-full px-2 py-0.5 whitespace-nowrap text-[10px] font-semibold tracking-wide text-fg/80 transition-colors select-none hover:text-accent @2xl:text-xs`}
        style={fade(1)}
      >
        {profile.name}
      </button>

      {nodes.map((node) => {
        const color = dark ? node.color.dark : node.color.light;
        const Icon = node.icon;
        const selected = node.id === selectedId;
        const lit = selected || node.id === hoveredId;
        const dimmed = selectedId !== null && selectedId !== "identity" && !selected;
        return (
          <div key={node.id}>
            <span ref={register(`${node.id}:icon`)} aria-hidden className={anchored} style={{ color: dark ? "#ffffff" : color, ...fade(dimmed ? 0.6 : 1) }}>
              <Icon className="size-3.5 @2xl:size-4" />
            </span>
            <button
              ref={register(`${node.id}:label`)}
              type="button"
              onClick={() => onSelect(node.id)}
              onMouseEnter={() => onHover(node.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(node.id)}
              onBlur={() => onHover(null)}
              aria-expanded={selected}
              aria-controls="hero-graph-panel"
              className={`${anchored} pointer-events-auto cursor-pointer rounded-full border bg-surface/75 px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap text-fg backdrop-blur transition-[border-color,box-shadow] duration-300 select-none @2xl:text-xs`}
              style={{
                borderColor: lit ? color : "var(--line)",
                boxShadow: lit ? `0 0 14px -4px ${color}` : undefined,
                ...fade(dimmed ? 0.7 : 1),
              }}
            >
              {node.label}
            </button>
            {node.leaves.map((leaf, j) => (
              <span
                key={leaf}
                ref={register(`${node.id}:leaf:${j}`)}
                aria-hidden
                className={`${anchored} hidden whitespace-nowrap text-[10px] font-medium text-muted transition-opacity duration-300 select-none @2xl:block`}
                style={fade(lit ? 1 : 0)}
              >
                {leaf}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
