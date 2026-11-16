import { useCallback, useEffect, useState } from "react";

interface CarouselState {
  index: number;
  /** +1 = slide in from the right (forward), -1 = slide in from the left (backward). */
  direction: 1 | -1;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

function indexFromHash(ids: string[]): number {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const i = ids.indexOf(id);
  return i === -1 ? 0 : i;
}

/**
 * Hash-driven circular page carousel. The URL hash (#about, #projects …) selects the page,
 * so plain anchor links, the back/forward buttons and deep links all keep working.
 * The slide direction follows the shortest way around the ring (Contact → About goes forward via Home).
 */
export function usePageCarousel(ids: string[]) {
  const [state, setState] = useState<CarouselState>(() => ({ index: indexFromHash(ids), direction: 1 }));
  const count = ids.length;

  useEffect(() => {
    const onHashChange = () => {
      const next = indexFromHash(ids);
      setState((prev) => {
        if (next === prev.index) return prev;
        const forward = mod(next - prev.index, count);
        return { index: next, direction: forward <= count - forward ? 1 : -1 };
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ids, count]);

  // Each page starts at its top (also overrides the browser's jump-to-anchor).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [state.index]);

  const goTo = useCallback((i: number) => {
    window.location.hash = ids[mod(i, count)];
  }, [ids, count]);

  const next = useCallback(() => goTo(state.index + 1), [goTo, state.index]);
  const prev = useCallback(() => goTo(state.index - 1), [goTo, state.index]);

  // ← / → keys, ignored while typing (e.g. in the chat composer).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Horizontal swipe on touch screens.
  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      // Leave horizontally scrollable bits (code blocks, the chat panel) alone.
      const inside = (e.target as Element | null)?.closest?.("pre, [role='dialog'], [data-no-swipe]");
      start = e.touches.length === 1 && !inside ? { x: t.clientX, y: t.clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  return { index: state.index, direction: state.direction, activeId: ids[state.index], goTo, next, prev };
}
