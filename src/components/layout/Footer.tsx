import { profile } from "@/data/profile";
import { SocialLinks } from "../SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {profile.name}. Built with React, TypeScript &amp; Tailwind CSS.
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
