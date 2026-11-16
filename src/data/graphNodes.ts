import { Briefcase, Code2, FolderKanban, Mail, Sparkles, UserRound } from "lucide-react";
import type { ComponentType } from "react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { skillGroups } from "./skills";

/**
 * The six "petals" of the hero knowledge graph. Everything shown in the detail
 * panels is derived from the existing portfolio data — nothing is duplicated here.
 */

/** "identity" is the central node; the rest are the six surrounding nodes. */
export type GraphNodeId = "identity" | "about" | "skills" | "experience" | "projects" | "github" | "contact";

export interface GraphLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface GraphNodeDetail {
  summary: string;
  chips?: string[];
  list?: { title: string; meta?: string; href?: string }[];
  cta: GraphLink;
  secondaryCta?: GraphLink;
}

export interface GraphNodeData {
  id: GraphNodeId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Accent per theme; dark values sit on navy, light values on white. */
  color: { dark: string; light: string };
  /** Small satellite nodes around this node (desktop/tablet only). */
  leaves: string[];
  detail: GraphNodeDetail;
}

const githubUrl = profile.socials.find((s) => s.kind === "github")?.href ?? `https://github.com/${profile.githubUsername}`;
const linkedinUrl = profile.socials.find((s) => s.kind === "linkedin")?.href;

const featuredSkills = ["Java", "Spring Boot", "Microservices", "Spring Security", "React", "Angular", "Apache Kafka", "Redis", "AWS"];
const allSkills = skillGroups.flatMap((g) => g.skills);
const repoName = (url: string) => url.replace(/\/+$/, "").split("/").pop() ?? url;
const clients = [...new Set(experience.map((e) => e.client).filter((c): c is string => Boolean(c)))];

/** The central node's card: a brief intro, shown when the core sphere is clicked. */
export const identityNode: GraphNodeData = {
  id: "identity",
  label: profile.name,
  icon: Sparkles,
  color: { dark: "#50e3d2", light: "#0d9488" },
  leaves: [],
  detail: {
    summary: profile.tagline,
    chips: [`${profile.yearsOfExperience} years`, "Java · Spring Boot", "GenAI", profile.location],
    cta: { label: "View details", href: "#about" },
  },
};

/** Clockwise from the top, matching the navbar order. */
export const graphNodes: GraphNodeData[] = [
  {
    id: "about",
    label: "About",
    icon: UserRound,
    color: { dark: "#e6edf7", light: "#475569" },
    leaves: clients.slice(0, 3),
    detail: {
      summary: profile.about[0],
      chips: [`${profile.yearsOfExperience} years`, ...clients],
      cta: { label: "View details", href: "#about" },
    },
  },
  {
    id: "skills",
    label: "Skills",
    icon: Code2,
    color: { dark: "#50e3d2", light: "#0d9488" },
    leaves: ["Java", "Spring Boot", "Apache Kafka"].filter((s) => allSkills.includes(s)),
    detail: {
      summary: skillGroups.map((g) => g.title).join(" · "),
      chips: featuredSkills.filter((s) => allSkills.includes(s)),
      cta: { label: "View details", href: "#skills" },
    },
  },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase,
    color: { dark: "#4f9dff", light: "#2563eb" },
    leaves: experience.map((e) => e.company.replace(/ (Pvt )?Limited$| Solutions$/, "")).slice(0, 3),
    detail: {
      summary: `${profile.yearsOfExperience} years building enterprise applications across banking, payments and risk.`,
      list: experience.map((e) => ({
        title: `${e.role} · ${e.company}`,
        meta: [e.client, e.period].filter(Boolean).join(" · "),
      })),
      cta: { label: "View details", href: "#experience" },
    },
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    color: { dark: "#a78bfa", light: "#7c3aed" },
    leaves: projects.map((p) => p.title).slice(0, 3),
    detail: {
      summary: "Independent GenAI and AI projects built alongside client work.",
      list: projects.map((p) => ({ title: p.title, meta: p.category, href: p.repoUrl })),
      cta: { label: "View details", href: "#projects" },
    },
  },
  {
    id: "github",
    label: "GitHub",
    icon: GitHubIcon,
    color: { dark: "#7dd3fc", light: "#0284c7" },
    leaves: projects.flatMap((p) => (p.repoUrl ? [repoName(p.repoUrl)] : [])).slice(0, 2),
    detail: {
      summary: `@${profile.githubUsername} — source code for my projects and experiments.`,
      list: projects.filter((p) => p.repoUrl).map((p) => ({ title: p.title, meta: "Repository", href: p.repoUrl })),
      cta: { label: "Open GitHub profile", href: githubUrl, external: true },
      secondaryCta: { label: "Repositories", href: "#github" },
    },
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    color: { dark: "#818cf8", light: "#4f46e5" },
    leaves: ["Email", ...(linkedinUrl ? ["LinkedIn"] : [])],
    detail: {
      summary: "Open to Java full stack and GenAI roles. The quickest way to reach me is email.",
      list: [
        { title: "Email", meta: profile.email, href: `mailto:${profile.email}` },
        ...(linkedinUrl ? [{ title: "LinkedIn", meta: "Connect with me", href: linkedinUrl }] : []),
      ],
      cta: { label: "View details", href: "#contact" },
    },
  },
];
