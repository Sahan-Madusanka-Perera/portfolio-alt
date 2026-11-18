"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { flagships } from "@/data/projects";
import { loadGsap } from "@/lib/gsap";
import { WorkCard } from "./WorkCard";

// Selected work. Desktop with motion: the section pins and the cards travel sideways as you
// scroll (GSAP ScrollTrigger, scrubbed through Lenis). Phones and reduced motion: a plain stack
// (a two-column grid on wide screens), no pinning, no scroll-jacking.
export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        return () => tween.scrollTrigger?.kill();
      });
      ScrollTrigger.refresh();
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  // GSAP wraps a pinned element in a pin-spacer. The outer div keeps that wrapper inside a node
  // React owns, so unmounting (navigating to a case study) never trips over the moved section.
  return (
    <div>
    <section ref={sectionRef} id="work" aria-labelledby="work-title" className="relative overflow-hidden py-[clamp(96px,14vw,200px)] lg:motion-safe:flex lg:motion-safe:h-[100svh] lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:pb-6 lg:motion-safe:pt-[calc(var(--nav-h)+40px)]">
      <div className="container-x mb-12 grid gap-6 lg:mb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <SplitText
          as="h2"
          id="work-title"
          text="Selected work"
          className="text-[clamp(2.5rem,5.4vw,5.5rem)] font-light leading-[1.02] tracking-[-0.042em]"
        />
        <Reveal as="p" className="max-w-[40ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] text-fg-2">
          {flagships.length} projects, each with a case study: the problem, what I built, and the part that fought back.
        </Reveal>
      </div>

      <div
        ref={trackRef}
        className="container-x flex flex-col gap-20 will-change-transform lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:gap-[clamp(40px,4vw,72px)] lg:motion-safe:pr-[var(--gutter)] lg:motion-reduce:grid lg:motion-reduce:grid-cols-2 lg:motion-reduce:gap-x-10 lg:motion-reduce:gap-y-20"
      >
        {flagships.map((project, i) => (
          <WorkCard key={project.slug} project={project} index={i} total={flagships.length} />
        ))}
      </div>

      <div aria-hidden className="container-x mt-10 hidden lg:motion-safe:block">
        <span className="block h-px w-full overflow-hidden bg-line">
          <span ref={barRef} className="block h-full w-full origin-left bg-fg" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>
    </section>
    </div>
  );
}
