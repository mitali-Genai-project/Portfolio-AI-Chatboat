import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, intro, children, className = "" }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p className="mb-3 font-mono text-sm text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="text-3xl font-bold sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
