import { motion } from "framer-motion";
import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "../SocialLinks";
import { ButtonLink } from "../ui/Button";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background: soft teal glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.p
            {...fadeUp(0)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur"
          >
            <span className="size-2 rounded-full bg-accent" />
            {profile.yearsOfExperience} years · Java Full Stack · GenAI
          </motion.p>

          <motion.h1 {...fadeUp(0.08)} className="text-4xl leading-[1.1] font-extrabold sm:text-6xl">
            Hi, I'm {profile.name}.
            <span className="mt-2 block bg-gradient-to-r from-accent to-sky-400 bg-clip-text text-transparent dark:to-sky-300">
              {profile.title}
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {profile.tagline}
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="#projects">
              View projects <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href={profile.resumeUrl} download={profile.resumeFileName} variant="secondary">
              <Download className="size-4" aria-hidden /> Resume
            </ButtonLink>
          </motion.div>

          <motion.div {...fadeUp(0.32)} className="mt-10 flex flex-wrap items-center gap-5">
            <SocialLinks />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-4" aria-hidden /> {profile.location}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="hidden lg:block"
        >
          <CodeCard />
        </motion.div>
      </div>
    </section>
  );
}

function CodeCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface/80 shadow-2xl shadow-black/10 backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="ml-3 font-mono text-xs text-muted">Developer.java</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-muted">
        <code>
          <K>@Service</K>
          {"\n"}
          <K>public class</K> <T>Developer</T> {"{"}
          {"\n"}  <K>String</K> name = <S>"{profile.name}"</S>;
          {"\n"}  <K>String</K> role = <S>"{profile.title}"</S>;
          {"\n"}  <K>int</K> years = <T>4</T>;
          {"\n"}
          {"\n"}  <T>List</T>&lt;<K>String</K>&gt; stack = <T>List</T>.of(
          {"\n"}    <S>"Java"</S>, <S>"Spring Boot"</S>, <S>"React"</S>,
          {"\n"}    <S>"GenAI"</S>
          {"\n"}  );
          {"\n"}{"}"}
        </code>
      </pre>
    </div>
  );
}

const K = ({ children }: { children: string }) => <span className="text-sky-600 dark:text-sky-300">{children}</span>;
const T = ({ children }: { children: string | number }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="text-accent">{children}</span>;
