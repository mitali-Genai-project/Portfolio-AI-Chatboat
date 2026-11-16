import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "resume", label: "Resume" },
  { id: "contact", label: "Contact" },
];

/** Every page in the circular carousel, in order. "top" is the Hero / home page. */
export const pages: NavItem[] = [{ id: "top", label: "Home" }, ...navItems];
