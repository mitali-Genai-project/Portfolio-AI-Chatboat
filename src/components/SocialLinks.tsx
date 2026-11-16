import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import type { SocialLink } from "@/data/types";
import { composeEmail } from "@/utils/email";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "./ui/BrandIcons";

const icons: Record<SocialLink["kind"], (p: { className?: string }) => React.JSX.Element> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
  email: ({ className }) => <Mail className={className} aria-hidden />,
};

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {profile.socials.map(({ label, href, kind }) => {
        const Icon = icons[kind];
        const link = kind === "email" ? composeEmail({ to: profile.email }) : { href, external: true };
        return (
          <li key={label}>
            <a
              href={link.href}
              aria-label={label}
              title={label}
              {...(link.external && { target: "_blank", rel: "noreferrer" })}
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
