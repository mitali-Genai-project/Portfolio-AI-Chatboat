import { Download, ExternalLink, FileText } from "lucide-react";
import { profile } from "@/data/profile";
import { ButtonLink } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

export function Resume() {
  return (
    <section id="resume" aria-labelledby="resume-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface p-8 sm:p-12">
            <div
              aria-hidden
              className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-accent/15 blur-3xl"
            />
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <FileText className="size-7" aria-hidden />
                </span>
                <div>
                  <p className="mb-2 font-mono text-sm text-accent">06 · Resume</p>
                  <h2 id="resume-title" className="text-2xl font-bold sm:text-3xl">
                    Want the full picture?
                  </h2>
                  <p className="mt-2 max-w-lg text-muted">
                    Download my resume for a detailed view of my experience, projects and technical skills.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={profile.resumeUrl} download={profile.resumeFileName}>
                  <Download className="size-4" aria-hidden /> Download PDF
                </ButtonLink>
                <ButtonLink href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="secondary">
                  <ExternalLink className="size-4" aria-hidden /> View
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
