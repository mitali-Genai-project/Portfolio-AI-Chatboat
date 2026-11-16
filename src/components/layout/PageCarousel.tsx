import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { NavItem } from "@/data/types";

const slide: Variants = {
  enter: (dir: 1 | -1) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

interface PageCarouselProps {
  activeId: string;
  direction: 1 | -1;
  children: ReactNode;
}

/** Renders only the active page; pages slide horizontally in and out of a single stacked grid cell. */
export function PageCarousel({ activeId, direction, children }: PageCarouselProps) {
  return (
    <div className="grid overflow-x-clip">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeId}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }, opacity: { duration: 0.3 } }}
          className="[grid-area:1/1]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PagerProps {
  pages: NavItem[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
}

const wrap = (i: number, n: number) => (i + n) % n;

/** Fixed side arrows on wide screens. */
export function SideArrows({ pages, index, onPrev, onNext }: Omit<PagerProps, "onSelect">) {
  const prev = pages[wrap(index - 1, pages.length)];
  const next = pages[wrap(index + 1, pages.length)];
  const cls =
    "fixed top-1/2 z-40 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/80 text-muted shadow-lg backdrop-blur transition-all duration-300 hover:border-accent hover:text-accent xl:grid";
  return (
    <>
      <button type="button" onClick={onPrev} aria-label={`Previous: ${prev.label}`} title={prev.label} className={`${cls} left-4`}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button type="button" onClick={onNext} aria-label={`Next: ${next.label}`} title={next.label} className={`${cls} right-[calc(var(--chat-offset)+1rem)]`}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </>
  );
}

/** Prev / dots / next bar shown at the bottom of every page. */
export function PagerBar({ pages, index, onPrev, onNext, onSelect }: PagerProps) {
  const prev = pages[wrap(index - 1, pages.length)];
  const next = pages[wrap(index + 1, pages.length)];
  return (
    <nav aria-label="Page navigation" className="mx-auto mt-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pb-10 sm:px-6">
      <button
        type="button"
        onClick={onPrev}
        className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        <ChevronLeft className="size-4" aria-hidden /> {prev.label}
      </button>

      <ol className="flex items-center gap-2">
        {pages.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={p.label}
              aria-current={i === index ? "page" : undefined}
              className={`block h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-2 bg-line hover:bg-muted"
              }`}
            />
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        {next.label} <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
