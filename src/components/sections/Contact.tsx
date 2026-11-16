import { Mail, MapPin, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "@/data/profile";
import { SocialLinks } from "../SocialLinks";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

/** No backend yet: the form composes an email in the visitor's mail client. */
export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `Portfolio enquiry from ${form.name}`;
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Section
      id="contact"
      eyebrow="07 · Contact"
      title="Let's work together"
      intro="Have a role, project or idea in mind? I'd be glad to hear about it."
      className="bg-surface-2/40"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-6">
          <a href={`mailto:${profile.email}`} className="group flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <Mail className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm text-muted">Email</span>
              <span className="font-medium break-all transition group-hover:text-accent">{profile.email}</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <MapPin className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm text-muted">Location</span>
              <span className="font-medium">{profile.location}</span>
            </span>
          </div>
          <SocialLinks className="pt-2" />
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
