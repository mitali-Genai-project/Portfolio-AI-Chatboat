// @vitest-environment node
// Hits the real GitHub API. Excluded from `npm test`; run with `npm run test:live`.
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";
import { fetchRepos } from "./github";

describe("GitHub API (live)", () => {
  it(`fetches public repositories for ${profile.githubUsername}`, async () => {
    const repos = await fetchRepos(profile.githubUsername);

    expect(repos.length).toBeGreaterThan(0);
    for (const r of repos) {
      expect(typeof r.name).toBe("string");
      expect(r.url).toMatch(/^https:\/\/github\.com\//);
      expect(typeof r.stars).toBe("number");
    }
    console.table(repos.map(({ name, language, stars, description }) => ({ name, language, stars, description })));
  });
});
