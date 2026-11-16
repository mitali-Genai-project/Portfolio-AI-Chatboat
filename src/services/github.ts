/**
 * GitHub public REST API client. Unauthenticated by design: no token is used or
 * shipped to the browser. Limit is 60 requests/hour per visitor IP, so results
 * are cached in sessionStorage.
 */

/** Fields we read from GET /users/{username}/repos. */
interface GitHubApiRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  pushed_at: string;
}

/** App-facing shape, decoupled from the API response. */
export interface Repo {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly kind: "not-found" | "rate-limited" | "http" | "network" | "invalid-response",
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

const API_BASE = "https://api.github.com";
const CACHE_TTL_MS = 30 * 60 * 1000;
const cacheKey = (username: string) => `gh-repos:v2:${username.toLowerCase()}`;

function readCache(username: string): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: Repo[] };
    return Date.now() - at < CACHE_TTL_MS && Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function writeCache(username: string, data: Repo[]) {
  try {
    sessionStorage.setItem(cacheKey(username), JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — skip caching */
  }
}

const toRepo = (r: GitHubApiRepo): Repo => ({
  id: r.id,
  name: r.name,
  description: r.description,
  url: r.html_url,
  language: r.language,
  stars: r.stargazers_count,
  forks: r.forks_count,
  pushedAt: r.pushed_at,
});

/** Stars first, then most recently pushed. */
const byStarsThenRecent = (a: Repo, b: Repo) => b.stars - a.stars || Date.parse(b.pushedAt) - Date.parse(a.pushedAt);

function errorFor(res: Response, username: string): GitHubError {
  if (res.status === 404) return new GitHubError(`GitHub user "${username}" was not found.`, "not-found");
  const rateLimited =
    res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0");
  if (rateLimited) {
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const when = reset ? ` after ${new Date(reset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : " later";
    return new GitHubError(`GitHub's rate limit was reached. Please try again${when}.`, "rate-limited");
  }
  return new GitHubError(`GitHub returned an error (${res.status}).`, "http");
}

/**
 * Public, non-fork repositories for `username`, best first.
 * Returns all of them; callers slice for display.
 */
export async function fetchRepos(username: string, signal?: AbortSignal): Promise<Repo[]> {
  const cached = readCache(username);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`,
      { headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, signal },
    );
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new GitHubError("Couldn't reach GitHub. Check your connection and try again.", "network");
  }

  if (!res.ok) throw errorFor(res, username);

  const body: unknown = await res.json();
  if (!Array.isArray(body)) throw new GitHubError("GitHub sent an unexpected response.", "invalid-response");

  const repos = (body as GitHubApiRepo[])
    .filter((r) => !r.fork)
    .map(toRepo)
    .sort(byStarsThenRecent);

  writeCache(username, repos);
  return repos;
}
