import { describe, expect, it, vi } from "vitest";
import { fetchRepos, GitHubError } from "./github";

const apiRepo = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "repo",
  description: "desc",
  html_url: "https://github.com/u/repo",
  language: "Java",
  stargazers_count: 0,
  forks_count: 0,
  fork: false,
  pushed_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });

const mockFetch = (...responses: (Response | Error)[]) => {
  const fn = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) fn.mockRejectedValueOnce(r);
    else fn.mockResolvedValueOnce(r);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("fetchRepos", () => {
  it("calls the public API without credentials", async () => {
    const fetch = mockFetch(json([]));
    await fetchRepos("mitali-Genai-project");

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.github.com/users/mitali-Genai-project/repos?type=owner&sort=pushed&per_page=100");
    expect(Object.keys(init.headers as Record<string, string>).map((h) => h.toLowerCase())).not.toContain(
      "authorization",
    );
  });

  it("maps fields, drops forks and sorts by stars then most recent push", async () => {
    mockFetch(
      json([
        apiRepo({ id: 1, name: "old", stargazers_count: 2, pushed_at: "2025-01-01T00:00:00Z" }),
        apiRepo({ id: 2, name: "forked", fork: true, stargazers_count: 99 }),
        apiRepo({ id: 3, name: "new", stargazers_count: 2, pushed_at: "2026-06-01T00:00:00Z" }),
        apiRepo({ id: 4, name: "popular", stargazers_count: 10, description: null, language: null }),
      ]),
    );

    const repos = await fetchRepos("u");

    expect(repos.map((r) => r.name)).toEqual(["popular", "new", "old"]);
    expect(repos[0]).toEqual({
      id: 4,
      name: "popular",
      description: null,
      url: "https://github.com/u/repo",
      language: null,
      stars: 10,
      forks: 0,
      pushedAt: "2026-01-01T00:00:00Z",
    });
  });

  it("serves repeat calls from the session cache", async () => {
    const fetch = mockFetch(json([apiRepo()]));
    await fetchRepos("u");
    const second = await fetchRepos("u");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second).toHaveLength(1);
  });

  it("does not cache failures", async () => {
    const fetch = mockFetch(new Response("", { status: 500 }), json([apiRepo()]));
    await expect(fetchRepos("u")).rejects.toThrow("GitHub returned an error (500).");
    await expect(fetchRepos("u")).resolves.toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("reports an unknown user", async () => {
    mockFetch(json({ message: "Not Found" }, { status: 404 }));
    await expect(fetchRepos("ghost")).rejects.toMatchObject({ kind: "not-found", message: 'GitHub user "ghost" was not found.' });
  });

  it.each([
    ["403 with no remaining quota", 403, { "x-ratelimit-remaining": "0" }],
    ["429", 429, {}],
  ])("reports rate limiting (%s)", async (_label, status, headers) => {
    mockFetch(new Response("", { status, headers }));
    const err = await fetchRepos("u").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GitHubError);
    expect(err).toMatchObject({ kind: "rate-limited" });
    expect((err as Error).message).toMatch(/rate limit/);
  });

  it("treats other 403s as plain HTTP errors", async () => {
    mockFetch(new Response("", { status: 403, headers: { "x-ratelimit-remaining": "42" } }));
    await expect(fetchRepos("u")).rejects.toMatchObject({ kind: "http" });
  });

  it("reports network failures", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    await expect(fetchRepos("u")).rejects.toMatchObject({ kind: "network" });
  });

  it("rejects a non-array body", async () => {
    mockFetch(json({ unexpected: true }));
    await expect(fetchRepos("u")).rejects.toMatchObject({ kind: "invalid-response" });
  });
});
