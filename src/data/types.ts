import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  label: string;
  href: string;
  kind: "github" | "linkedin" | "email" | "whatsapp";
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  /** Shown to visitors, e.g. "+91 73183 38652". */
  phone: string;
  /** WhatsApp click-to-chat link (https://wa.me/<country code + number, digits only>). */
  whatsappUrl: string;
  yearsOfExperience: string;
  about: string[];
  highlights: { value: string; label: string }[];
  githubUsername: string;
  /** Path under /public. */
  resumeUrl: string;
  /** File name the browser saves the resume as. */
  resumeFileName: string;
  socials: SocialLink[];
}

export interface SkillGroup {
  title: string;
  icon: LucideIcon;
  skills: string[];
}

export interface ExperienceItem {
  role: string;
  /** Employer of record. */
  company: string;
  /** Client(s) the work was delivered for, if any. */
  client?: string;
  /** Display string, e.g. "Apr 2022 — Aug 2025". */
  period: string;
  location: string;
  points: string[];
  stack: string[];
}

export interface Project {
  title: string;
  description: string;
  /** Leave empty to hide the tag list. */
  stack: string[];
  category: "GenAI" | "AI" | "Full Stack";
  repoUrl?: string;
  liveUrl?: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  location: string;
  grade?: string;
}

export interface Credential {
  title: string;
  issuer: string;
  /** e.g. "Jun 2023 — Jun 2026". */
  period?: string;
  verifyUrl?: string;
}

export interface NavItem {
  id: string;
  label: string;
}
