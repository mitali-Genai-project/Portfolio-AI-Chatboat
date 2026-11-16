import type { GraphNodeData, GraphNodeId } from "@/data/graphNodes";
import { layout2D, type GraphLayout } from "./layout";

interface GraphFallbackProps {
  nodes: GraphNodeData[];
  layout: GraphLayout;
  selectedId: GraphNodeId | null;
  onSelect: (id: GraphNodeId | null) => void;
  dark: boolean;
}

/** Flat 2D version of the graph for browsers without WebGL. Same layout, same nodes, same panel. */
export function GraphFallback({ nodes, layout, selectedId, onSelect, dark }: GraphFallbackProps) {
  const points = layout2D(layout);

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative aspect-square h-full max-h-full max-w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          {points.map((p, i) => {
            const color = dark ? nodes[i].color.dark : nodes[i].color.light;
            const active = selectedId === null || selectedId === "identity" || selectedId === nodes[i].id;
            return (
              <path
                key={nodes[i].id}
                d={`M50 50 Q ${(50 + p.x) / 2 + (p.y - 50) * 0.18} ${(50 + p.y) / 2 - (p.x - 50) * 0.18} ${p.x} ${p.y}`}
                fill="none"
                stroke={color}
                strokeWidth={0.4}
                opacity={active ? 0.7 : 0.25}
              />
            );
          })}
        </svg>

        <button
          type="button"
          onClick={() => onSelect("identity")}
          aria-label="About Mitali Verma"
          className="absolute top-1/2 left-1/2 grid size-[20%] -translate-1/2 place-items-center rounded-full border-2 border-accent bg-surface shadow-[0_0_40px_-8px_var(--accent)]"
        >
          <span className="font-display text-xl font-extrabold text-fg sm:text-2xl">
            MV<span className="text-accent">.</span>
          </span>
        </button>

        {nodes.map((node, i) => {
          const color = dark ? node.color.dark : node.color.light;
          const Icon = node.icon;
          const selected = node.id === selectedId;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              aria-expanded={selected}
              aria-controls="hero-graph-panel"
              className="absolute flex -translate-1/2 flex-col items-center gap-1"
              style={{ left: `${points[i].x}%`, top: `${points[i].y}%` }}
            >
              <span
                className="grid size-10 place-items-center rounded-full border-2 bg-surface transition-transform hover:scale-110"
                style={{ borderColor: color, color, transform: selected ? "scale(1.15)" : undefined }}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-[11px] font-semibold text-fg">{node.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
