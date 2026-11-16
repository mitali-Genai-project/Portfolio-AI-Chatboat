import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GitHubRepos } from "./GitHubRepos";

const apiRepo = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  name: `repo-${id}`,
  description: `Description ${id}`,
  html_url: `https://github.com/mitali-Genai-project/repo-${id}`,
  language: "Java",
  stargazers_count: id,
  forks_count: 0,
  fork: false,
  pushed_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("<GitHubRepos />", () => {
  it("shows a loading state, then the repositories", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok([apiRepo(1), apiRepo(5, { description: null, language: null })])));
    render(<GitHubRepos />);

    expect(screen.getByLabelText("Loading repositories").getAttribute("aria-busy")).toBe("true");

    const link = await screen.findByRole("link", { name: "repo-5 on GitHub" });
    expect(link.getAttribute("href")).toBe("https://github.com/mitali-Genai-project/repo-5");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.textContent).toContain("No description provided.");
    expect(link.textContent).toContain("Stars: 5");

    const other = screen.getByRole("link", { name: "repo-1 on GitHub" });
    expect(other.textContent).toContain("Description 1");
    expect(other.textContent).toContain("Java");
    expect(other.textContent).toContain("Stars: 1");

    // Highest-starred first.
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["repo-5", "repo-1"]);
    expect(screen.queryByLabelText("Loading repositories")).toBeNull();
  });

  it("shows at most 6 repositories with a count", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok(Array.from({ length: 8 }, (_, i) => apiRepo(i + 1)))));
    render(<GitHubRepos />);

    expect(await screen.findByText("Showing 6 of 8 repositories")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /^repo-\d+ on GitHub$/ })).toHaveLength(6);
  });

  it("shows an empty state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok([apiRepo(1, { fork: true })])));
    render(<GitHubRepos />);

    expect(await screen.findByText("No public repositories yet")).toBeTruthy();
  });

  it("shows an error state and recovers on retry", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 403, headers: { "x-ratelimit-remaining": "0" } }))
      .mockResolvedValueOnce(ok([apiRepo(1)]));
    vi.stubGlobal("fetch", fetch);
    render(<GitHubRepos />);

    expect(await screen.findByText("Couldn't load repositories")).toBeTruthy();
    expect(screen.getByText(/rate limit was reached/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "repo-1 on GitHub" })).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("always links to the GitHub profile", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<GitHubRepos />);

    const link = screen.getByRole("link", { name: "View all on GitHub" });
    expect(link.getAttribute("href")).toBe("https://github.com/mitali-Genai-project");
  });
});
