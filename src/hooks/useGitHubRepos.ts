import { useCallback, useEffect, useState } from "react";
import { fetchRepos, type Repo } from "@/services/github";

export type GitHubReposState =
  | { status: "loading" }
  | { status: "success"; repos: Repo[]; total: number }
  | { status: "error"; message: string };

type Settled = Exclude<GitHubReposState, { status: "loading" }> & { key: string };

export function useGitHubRepos(username: string, limit = 6) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);

  // Each request is identified by its inputs; a result for any other key is stale,
  // so "loading" is derived instead of being set synchronously inside the effect.
  const key = `${username}|${limit}|${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchRepos(username, controller.signal)
      .then((repos) => setSettled({ key, status: "success", repos: repos.slice(0, limit), total: repos.length }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setSettled({ key, status: "error", message: err instanceof Error ? err.message : "Could not load repositories." });
      });
    return () => controller.abort();
  }, [key, username, limit]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let state: GitHubReposState = { status: "loading" };
  if (settled?.key === key) {
    state =
      settled.status === "success"
        ? { status: "success", repos: settled.repos, total: settled.total }
        : { status: "error", message: settled.message };
  }

  return { state, retry };
}
