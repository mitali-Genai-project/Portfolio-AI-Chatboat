import { BrainCircuit, ExternalLink, Layers } from "lucide-react";
import { projects } from "@/data/projects";
import { GitHubIcon } from "../ui/BrandIcons";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TagList } from "../ui/Tag";

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="04 · Projects"
      title="Selected projects"
      intro="A selection of things I've built."
    >
      <ul className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => {
          const Icon = p.category === "Full Stack" ? Layers : BrainCircuit;
          return (
            <li key={p.title}>
              <Reveal delay={(i % 2) * 0.08} className="h-full">
                <Card interactive className="flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      <Icon className="size-3.5" aria-hidden /> {p.category}
                    </span>
                    <div className="flex gap-1">
                      {p.repoUrl && (
                        <IconLink href={p.repoUrl} label={`${p.title} source code`}>
                          <GitHubIcon className="size-[18px]" />
                        </IconLink>
                      )}
                      {p.liveUrl && (
                        <IconLink href={p.liveUrl} label={`${p.title} live demo`}>
                          <ExternalLink className="size-[18px]" aria-hidden />
                        </IconLink>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{p.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{p.description}</p>
                  {p.stack.length > 0 && (
                    <div className="mt-6">
                      <TagList items={p.stack} />
                    </div>
                  )}
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-accent"
    >
      {children}
    </a>
  );
}
