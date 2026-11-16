import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/data/navigation";
import { ThemeToggle } from "../ThemeToggle";

/** Clicking the page you're already on just returns to its top. */
const toTopIfCurrent = (isCurrent: boolean) => () => {
  if (isCurrent) window.scrollTo({ top: 0, behavior: "smooth" });
};

export function Navbar({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = activeId;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed top-0 right-(--chat-offset) left-0 z-50 border-b transition-[right,background-color,border-color] duration-300 ${
        solid ? "border-line bg-bg/80 backdrop-blur-lg" : "border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <div className="flex items-center gap-3 justify-self-start">
          {/* Top-left corner of the window on wide screens; just before the logo otherwise. */}
          <div className="xl:absolute xl:top-1/2 xl:left-4 xl:-translate-y-1/2">
            <ThemeToggle />
          </div>
          <a href="#top" onClick={toTopIfCurrent(active === "top")} className="font-display text-lg font-extrabold tracking-tight">
            MV<span className="text-accent">.</span>
          </a>
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={toTopIfCurrent(active === id)}
                aria-current={active === id ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-accent ${
                  active === id ? "text-accent" : "text-muted"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:text-accent lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-line px-4 lg:hidden"
          >
            {navItems.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => {
                    setOpen(false);
                    toTopIfCurrent(active === id)();
                  }}
                  className={`block py-3 text-base font-medium ${active === id ? "text-accent" : "text-fg"}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
