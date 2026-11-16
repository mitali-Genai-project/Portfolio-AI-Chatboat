// @vitest-environment node
// Guards against the chatbot's knowledge base drifting from what the site shows.
import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { loadKnowledge } from "./knowledge";

const kb = loadKnowledge();
const has = (s: string) => kb.includes(s);

/** Shown on the site but deliberately kept out of the chatbot. */
const EXCLUDED_FROM_CHATBOT = ["Clearlist"];

describe("knowledge/portfolio.md", () => {
  it("matches the profile and contact details", () => {
    expect(has(profile.name)).toBe(true);
    expect(has(profile.title)).toBe(true);
    expect(has(profile.email)).toBe(true);
    for (const s of profile.socials.filter((s) => s.kind !== "email")) expect(has(s.href), s.href).toBe(true);
  });

  it("covers every role on the site", () => {
    for (const e of experience) {
      expect(has(e.company), e.company).toBe(true);
      expect(has(e.role), e.role).toBe(true);
      if (e.client) for (const c of e.client.split(" · ")) expect(has(c), c).toBe(true);
    }
  });

  it("covers every project and listed skill", () => {
    for (const p of projects.filter((p) => !EXCLUDED_FROM_CHATBOT.includes(p.title))) {
      expect(has(p.title), p.title).toBe(true);
    }
    for (const skill of skillGroups.flatMap((g) => g.skills)) expect(has(skill), skill).toBe(true);
  });

  it("leaves out excluded projects", () => {
    for (const title of EXCLUDED_FROM_CHATBOT) expect(kb.toLowerCase()).not.toContain(title.toLowerCase());
  });
});
