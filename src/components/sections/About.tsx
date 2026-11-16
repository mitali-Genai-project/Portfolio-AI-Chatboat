import { profile } from "@/data/profile";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

export function About() {
  return (
    <Section id="about" eyebrow="01 · About" title="Engineering dependable software, curious about AI">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {profile.highlights.map((h, i) => (
            <li key={h.label}>
              <Reveal delay={i * 0.08}>
                <Card>
                  <p className="font-display text-3xl font-bold text-accent">{h.value}</p>
                  <p className="mt-1 text-sm text-muted">{h.label}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
