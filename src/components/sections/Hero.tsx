import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { profile } from "@/data/profile";
import { HeroGraph } from "../hero-graph/HeroGraph";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

/**
 * Home page: a compact identity line above a full-area 3D knowledge graph.
 * Height = viewport minus the pager bar below (5rem); the fixed navbar is cleared with pt-16.
 */
export function Hero() {
  return (
    <section id="top" className="relative isolate flex h-[calc(100svh-5rem)] min-h-[560px] flex-col overflow-hidden pt-16">
      {/* Background: soft teal glow behind the graph + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[min(70vh,640px)] w-[min(90vw,900px)] -translate-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pt-3 sm:px-6 sm:pt-6">
        <motion.div {...fadeUp(0)}>
          <h1 className="text-2xl leading-tight font-extrabold sm:text-3xl">{profile.name}</h1>
          <p className="mt-1 text-sm font-medium text-accent sm:text-[15px]">{profile.title} | GenAI Enthusiast</p>
          <p className="mt-1.5 inline-flex items-center gap-2 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {profile.yearsOfExperience} Years of Experience
          </p>
        </motion.div>
        {/* The graph's "Reset view" button sits directly below this, aligned to the same column. */}
        <motion.a
          {...fadeUp(0.1)}
          href={profile.resumeUrl}
          download={profile.resumeFileName}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-fg backdrop-blur transition hover:border-accent/60 hover:text-accent"
        >
          <Download className="size-3.5" aria-hidden /> Download Resume
        </motion.a>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        className="min-h-0 w-full flex-1 pt-2"
      >
        <HeroGraph />
      </motion.div>
    </section>
  );
}
