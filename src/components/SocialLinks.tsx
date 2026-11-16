import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import type { SocialLink } from "@/data/types";
import { GitHubIcon, LinkedInIcon } from "./ui/BrandIcons";

const icons: Record<SocialLink["kind"], (p: { className?: string }) => React.JSX.Element> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: ({ className }) => <Mail className={className} aria-hidden />,
};

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {profile.socials.map(({ label, href, kind }) => {
        const Icon = icons[kind];
        const external = kind !== "email";
        return (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              title={label}
              {...(external && { target: "_blank", rel: "noreferrer" })}
              className="grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:border-accent/60 hover:text-accent"
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
