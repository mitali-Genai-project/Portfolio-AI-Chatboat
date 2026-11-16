import { motion } from "framer-motion";
import { ArrowUpRight, FolderGit2, GitFork, RefreshCw, Star, TriangleExclamationPoint } from "lucide-react";
import type { ReactNode } from "react";
import { profile } from "@/data/profile";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import type { Repo } from "@/services/github";
import { GitHubIcon } from "../ui/BrandIcons";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

const profileUrl = `https://github.com/${profile.githubUsername}`;

export function GitHubRepos() {
  const { state, retry } = useGitHubRepos(profile.githubUsername);

  return (
    <Section
      id="github"
      eyebrow="05 · Open source"
      title="GitHub repositories"
      intro="Live from my GitHub profile, sorted by stars and recent activity."
    >
      <div aria-live="polite">
        {state.status === "loading" && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading repositories">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-44 animate-pulse rounded-2xl border border-line bg-surface" />
            ))}
          </ul>
        )}

        {state.status === "error" && (
          <StatusCard icon={<TriangleExclamationPoint className="size-6" aria-hidden />} title="Couldn't load repositories">
            <p className="text-muted">{state.message}</p>
            <Button type="button" variant="secondary" onClick={retry} className="mt-5">
              <RefreshCw className="size-4" aria-hidden /> Try again
            </Button>
          </StatusCard>
        )}

        {state.status === "success" && state.repos.length === 0 && (
          <StatusCard icon={<FolderGit2 className="size-6" aria-hidden />} title="No public repositories yet">
            <p className="text-muted">New projects will appear here as soon as they're published.</p>
          </StatusCard>
        )}

        {state.status === "success" && state.repos.length > 0 && (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.repos.map((repo, i) => (
                // Data arrives async, so fade in on mount rather than on scroll.
                <motion.li
                  key={repo.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
                >
                  <RepoCard repo={repo} />
                </motion.li>
              ))}
            </ul>
            {state.total > state.repos.length && (
              <p className="mt-6 text-center text-sm text-muted">
                Showing {state.repos.length} of {state.total} repositories
              </p>
            )}
          </>
        )}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <ButtonLink href={profileUrl} target="_blank" rel="noreferrer" variant="secondary">
          <GitHubIcon className="size-4" /> View all on GitHub
        </ButtonLink>
      </Reveal>
    </Section>
  );
}

function StatusCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {children}
    </Card>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${repo.name} on GitHub`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-base font-medium break-all">{repo.name}</h3>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
        {repo.description ?? "No description provided."}
      </p>
      <div className="mt-5 flex items-center gap-4 text-xs text-muted">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent" aria-hidden /> {repo.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1" title="Stars">
          <Star className="size-3.5" aria-hidden />
          <span className="sr-only">Stars:</span> {repo.stars}
        </span>
        <span className="inline-flex items-center gap-1" title="Forks">
          <GitFork className="size-3.5" aria-hidden />
          <span className="sr-only">Forks:</span> {repo.forks}
        </span>
      </div>
    </a>
  );
}
