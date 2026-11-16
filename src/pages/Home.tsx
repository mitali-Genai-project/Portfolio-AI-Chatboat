import type { ReactNode } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { PageCarousel, PagerBar, SideArrows } from "@/components/layout/PageCarousel";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { GitHubRepos } from "@/components/sections/GitHubRepos";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Resume } from "@/components/sections/Resume";
import { Skills } from "@/components/sections/Skills";
import { pages } from "@/data/navigation";
import { usePageCarousel } from "@/hooks/usePageCarousel";

const pageIds = pages.map((p) => p.id);

const pageContent: Record<string, () => ReactNode> = {
  top: () => <Hero />,
  about: () => <About />,
  skills: () => <Skills />,
  experience: () => <Experience />,
  projects: () => <Projects />,
  github: () => <GitHubRepos />,
  resume: () => <Resume />,
  contact: () => <Contact />,
};

export default function Home() {
  const { index, direction, activeId, goTo, next, prev } = usePageCarousel(pageIds);

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      <Navbar activeId={activeId} />
      <main className="flex min-h-svh flex-col">
        <PageCarousel activeId={activeId} direction={direction}>
          {pageContent[activeId]()}
        </PageCarousel>
        <PagerBar pages={pages} index={index} onPrev={prev} onNext={next} onSelect={goTo} />
      </main>
      <SideArrows pages={pages} index={index} onPrev={prev} onNext={next} />
      <ChatWidget />
    </>
  );
}
