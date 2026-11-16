import { Briefcase, Calendar, MapPin } from "lucide-react";
import { experience } from "@/data/experience";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TagList } from "../ui/Tag";

export function Experience() {
  return (
    <Section id="experience" eyebrow="03 · Experience" title="Professional experience">
      <ol className="relative space-y-10 border-l border-line pl-8 sm:pl-10">
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.period}`} className="relative">
            <span
              aria-hidden
              className="absolute top-1 -left-[49px] grid size-8 place-items-center rounded-full border border-line bg-bg text-accent sm:-left-[57px]"
            >
              <Briefcase className="size-4" />
            </span>
            <Reveal delay={i * 0.05}>
              <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{job.role}</h3>
                    <p className="mt-1 font-medium text-accent">{job.company}</p>
                    {job.client && <p className="mt-0.5 text-sm text-muted">Client: {job.client}</p>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted sm:flex-col sm:items-end">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4" aria-hidden /> {job.period}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden /> {job.location}
                    </span>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5 text-muted">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-3 leading-relaxed">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <TagList items={job.stack} />
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
