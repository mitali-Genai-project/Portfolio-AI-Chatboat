import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import type { GraphLink, GraphNodeData } from "@/data/graphNodes";

interface NodeDetailPanelProps {
  node: GraphNodeData;
  color: string;
  onClose: () => void;
}

/**
 * Floating glass card for the selected node. On wide graph areas it docks to the right
 * (the camera shifts the graph left to keep the node visible); on narrow ones it's a
 * bottom sheet (the camera shifts the graph up). Sizes match PANEL_SPACE / SHEET_FRACTION.
 */
export function NodeDetailPanel({ node, color, onClose }: NodeDetailPanelProps) {
  const { detail } = node;
  const Icon = node.icon;

  return (
    <motion.div
      id="hero-graph-panel"
      role="region"
      aria-label={`${node.label} details`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-x-3 bottom-3 z-30 max-h-[56%] overflow-y-auto rounded-2xl border border-line/80 bg-surface/70 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl @3xl:inset-x-auto @3xl:top-1/2 @3xl:right-5 @3xl:bottom-auto @3xl:max-h-[calc(100%-2.5rem)] @3xl:w-[320px] @3xl:-translate-y-1/2 @3xl:p-5 xl:@3xl:right-20"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-base font-bold">
          <span className="grid size-8 place-items-center rounded-xl border border-line bg-surface-2/70" style={{ color }}>
            <Icon className="size-4" />
          </span>
          {node.label}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and reset view"
          className="-m-1 grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-muted">{detail.summary}</p>

      {detail.chips && detail.chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {detail.chips.map((chip) => (
            <li key={chip} className="rounded-md border border-line bg-surface-2/50 px-2 py-0.5 text-[11px] font-medium text-fg">
              {chip}
            </li>
          ))}
        </ul>
      )}

      {detail.list && detail.list.length > 0 && (
        <ul className="mt-3 space-y-2">
          {detail.list.map((item) => {
            const body = (
              <>
                <span className="block truncate text-[13px] font-semibold text-fg">{item.title}</span>
                {item.meta && <span className="block truncate text-[11px] text-muted">{item.meta}</span>}
              </>
            );
            return (
              <li key={item.title} className="border-l-2 pl-2.5" style={{ borderColor: color }}>
                {item.href ? (
                  <a href={item.href} {...externalProps(item.href)} className="block transition hover:opacity-80">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PanelLink link={detail.cta} primary />
        {detail.secondaryCta && <PanelLink link={detail.secondaryCta} />}
      </div>
    </motion.div>
  );
}

const externalProps = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});

function PanelLink({ link, primary = false }: { link: GraphLink; primary?: boolean }) {
  const Arrow = link.external ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={link.href}
      {...externalProps(link.href)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
        primary ? "bg-accent text-accent-fg hover:brightness-110" : "border border-line text-fg hover:border-accent/60 hover:text-accent"
      }`}
    >
      {link.label} <Arrow className="size-3.5" aria-hidden />
    </a>
  );
}
