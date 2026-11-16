import { AnimatePresence, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { graphNodes, identityNode, type GraphNodeId } from "@/data/graphNodes";
import { profile } from "@/data/profile";
import { useIsDark } from "@/hooks/useIsDark";
import { GraphFallback } from "./GraphFallback";
import { buildLayout } from "./layout";
import { NodeDetailPanel } from "./NodeDetailPanel";

// three.js is split into its own chunk and only fetched when the hero renders.
const GraphScene = lazy(() => import("./GraphScene"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

/** If the 3D scene throws (e.g. GPU context lost on creation), show the 2D graph instead. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Full-area interactive knowledge graph for the hero: 3D when possible, 2D otherwise, with a shared detail panel. */
export function HeroGraph() {
  const [selectedId, setSelectedId] = useState<GraphNodeId | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [webgl] = useState(supportsWebGL);
  const reduced = useReducedMotion() ?? false;
  const dark = useIsDark();
  const layout = useMemo(() => buildLayout(graphNodes.map((n) => n.leaves.length)), []);

  const select = useCallback((id: GraphNodeId | null) => setSelectedId(id), []);
  const reset = useCallback(() => {
    setSelectedId(null);
    setResetToken((t) => t + 1);
  }, []);
  const selected = selectedId === "identity" ? identityNode : (graphNodes.find((n) => n.id === selectedId) ?? null);

  // Escape returns to the home view.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && reset();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, reset]);

  const fallback = <GraphFallback nodes={graphNodes} layout={layout} selectedId={selectedId} onSelect={select} dark={dark} />;

  return (
    <div className="@container flex size-full flex-col">
      <div
        role="group"
        aria-label={`Interactive map of ${profile.name}'s portfolio. Choose a topic to see a summary.`}
        // Dragging here rotates the graph, so the page carousel shouldn't treat it as a swipe.
        data-no-swipe
        className="relative isolate min-h-0 flex-1"
      >
        {webgl ? (
          <SceneBoundary fallback={fallback}>
            <Suspense fallback={<LoadingOrb />}>
              <div className="absolute inset-0">
                <GraphScene
                  nodes={graphNodes}
                  layout={layout}
                  selectedId={selectedId}
                  onSelect={select}
                  dark={dark}
                  reduced={reduced}
                  resetToken={resetToken}
                />
              </div>
            </Suspense>
          </SceneBoundary>
        ) : (
          fallback
        )}

        {/* Aligned with the hero's identity column, directly under the Resume button. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <button
              type="button"
              onClick={reset}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur transition hover:border-accent/60 hover:text-accent"
            >
              <RotateCcw className="size-3.5" aria-hidden /> Reset view
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <NodeDetailPanel key={selected.id} node={selected} color={dark ? selected.color.dark : selected.color.light} onClose={reset} />
          )}
        </AnimatePresence>
      </div>

      {/* Plain links on small screens, so nothing depends on drag gestures. */}
      <nav aria-label="Portfolio sections" data-no-swipe className="shrink-0 pt-2 @3xl:hidden">
        <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {graphNodes.map((node) => {
            const Icon = node.icon;
            const color = dark ? node.color.dark : node.color.light;
            return (
              <li key={node.id}>
                <a
                  href={`#${node.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-2 text-xs font-medium whitespace-nowrap text-fg transition hover:border-accent"
                >
                  <span style={{ color }}>
                    <Icon className="size-3.5" />
                  </span>
                  {node.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function LoadingOrb() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="grid size-24 place-items-center rounded-full border border-accent/40 bg-surface/40 motion-safe:animate-pulse">
        <span className="font-display text-xl font-extrabold text-fg/70">MV</span>
      </div>
    </div>
  );
}
