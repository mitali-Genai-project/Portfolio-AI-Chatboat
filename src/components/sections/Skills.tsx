import { skillGroups } from "@/data/skills";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TagList } from "../ui/Tag";

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="02 · Skills"
      title="Technical skills"
      intro="A full stack toolkit centred on the Java ecosystem, with React and Angular front ends, event-driven messaging and cloud delivery."
      className="bg-surface-2/40"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map(({ title, icon: Icon, skills }, i) => (
          <li key={title}>
            <Reveal delay={(i % 3) * 0.08} className="h-full">
              <Card interactive className="h-full">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <TagList items={skills} />
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
