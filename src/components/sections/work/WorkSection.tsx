"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { projects, type Project } from "@/data/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Scribble } from "@/components/ui/Scribble";
import { FlipBook } from "./FlipBook";
import { ProjectText } from "./ProjectText";
import { PROJECT_FIGURES } from "./figures";

// Phones, short screens and reduced motion get the same pages laid out flat.
function StackedProject({ project, index }: { project: Project; index: number }) {
  const figureRef = useRef<HTMLDivElement>(null);
  const inView = useInView(figureRef, { amount: 0.35 });
  const Figure = PROJECT_FIGURES[project.slug];

  return (
    <div className="margin-rule sheet-x grid gap-x-12 gap-y-8 border-t border-rule bg-sheet py-12 [--rule-shift:-0.4rem] md:grid-cols-2 md:py-16">
      <div className="ruled">
        <ProjectText project={project} index={index} total={projects.length} variant="flat" />
      </div>
      <div ref={figureRef} className="min-h-[22rem]">
        {Figure && <Figure active={inView} />}
      </div>
    </div>
  );
}

export function WorkSection() {
  const reduced = usePrefersReducedMotion();
  const roomy = useMediaQuery("(min-width: 1024px) and (min-height: 680px)");
  const asBook = roomy && !reduced;

  return (
    <section id="work" aria-labelledby="work-heading" className="relative scroll-mt-16">
      <div className="ruled margin-rule sheet-x border-t-2 border-rule pb-[calc(var(--line)*2)] pt-[calc(var(--line)*2)] sm:pt-[calc(var(--line)*4)]">
        <h2 id="work-heading" className="font-display text-[clamp(3rem,7.5vw,6rem)] font-bold leading-[0.95] text-ink">
          Things I&apos;ve built
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg leading-8 text-text">
          Six projects, from neural networks trained from scratch to full-stack apps for real clients. Every page runs
          a small live figure of the idea, so you can play with it, not just read about it.
        </p>
        {asBook && (
          <p className="mt-2 flex items-center gap-2 font-hand text-xl leading-8 text-pen">
            Keep scrolling to open the book
            <Scribble kind="arrowDown" animate={false} className="h-10 w-5" strokeWidth={2.25} />
          </p>
        )}
      </div>

      {asBook ? (
        <FlipBook projects={projects} />
      ) : (
        <div className="bg-paper-2 pb-2">
          {projects.map((project, index) => (
            <StackedProject key={project.slug} project={project} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
