import { ArrowUpRight, Check, Copy, Mail, MapPin, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "@/data/profile";
import { composeEmail } from "@/utils/email";
import { SocialLinks } from "../SocialLinks";
import { WhatsAppIcon } from "../ui/BrandIcons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

/** No backend yet: the form composes an email (Gmail on desktop, the mail app on phones). */
export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { href, external } = composeEmail({
      to: profile.email,
      subject: `Portfolio enquiry from ${form.name}`,
      body: `${form.message}\n\n— ${form.name} (${form.email})`,
    });
    if (external) window.open(href, "_blank", "noopener");
    else window.location.href = href;
  };

  const emailLink = composeEmail({ to: profile.email });

  return (
    <Section
      id="contact"
      eyebrow="07 · Contact"
      title="Let's work together"
      intro="Have a role, project or idea in mind? I'd be glad to hear about it."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-4">
          <ContactLink
            href={emailLink.href}
            external={emailLink.external}
            icon={<Mail className="size-5" aria-hidden />}
            label="Email me"
            value={profile.email}
            copyValue={profile.email}
          />
          <ContactLink
            href={profile.whatsappUrl}
            external
            icon={<WhatsAppIcon className="size-5" />}
            label="Text me on WhatsApp"
            value={profile.phone}
          />
          <div className="flex items-center gap-4 px-4 py-2">
            <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <MapPin className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm text-muted">Location</span>
              <span className="font-medium">{profile.location}</span>
            </span>
          </div>
          <SocialLinks className="px-4 pt-2" />
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" id="contact-name">
                  <input id="contact-name" required autoComplete="name" value={form.name} onChange={update("name")} className={inputClass} placeholder="Your name" />
                </Field>
                <Field label="Email" id="contact-email">
                  <input id="contact-email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@company.com" />
                </Field>
              </div>
              <Field label="Message" id="contact-message">
                <textarea id="contact-message" required rows={5} value={form.message} onChange={update("message")} className={`${inputClass} resize-y`} placeholder="Tell me a little about what you have in mind…" />
              </Field>
              <Button type="submit" className="justify-self-start">
                <Send className="size-4" aria-hidden /> Send message
              </Button>
            </form>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

interface ContactLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
  /** Adds a "copy" button (e.g. for visitors who don't use Gmail). */
  copyValue?: string;
}

function ContactLink({ href, icon, label, value, external, copyValue }: ContactLinkProps) {
  return (
    <div className="relative">
      <a
        href={href}
        {...(external && { target: "_blank", rel: "noreferrer" })}
        className={`group flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 focus-visible:border-accent focus-visible:outline-none ${
          copyValue ? "pr-16" : ""
        }`}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-accent-fg">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-muted">{label}</span>
          <span className="font-medium break-all transition group-hover:text-accent">{value}</span>
        </span>
        {!copyValue && (
          <ArrowUpRight
            className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
            aria-hidden
          />
        )}
      </a>
      {copyValue && <CopyButton value={copyValue} label={label} />}
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy:", value);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${label.toLowerCase()} address`}
      title={copied ? "Copied!" : "Copy"}
      className="absolute top-1/2 right-4 grid size-9 -translate-y-1/2 place-items-center rounded-lg border border-line text-muted transition hover:border-accent/60 hover:text-accent"
    >
      {copied ? <Check className="size-4 text-accent" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
