"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { site } from "@/data/site";
import { useScrollTo } from "@/components/providers/SmoothScrollProvider";
import { ProjectText } from "./ProjectText";
import { PROJECT_FIGURES } from "./figures";

const SCROLL_PER_FLIP_VH = 110;

/** Scroll progress → leaf angle. Each turn uses the middle 70% of its slot so spreads rest between turns. */
function useLeafAngle(progress: MotionValue<number>, index: number, flips: number) {
  return useTransform(progress, [(index + 0.15) / flips, (index + 0.85) / flips], [0, -180], { clamp: true });
}

function LeftPage({ children }: { children: ReactNode }) {
  return (
    <div className="ruled margin-rule absolute inset-0 overflow-hidden rounded-l-[4px] bg-sheet py-6 pl-[calc(var(--gutter)+1.75rem)] pr-9 [--gutter:2.25rem] [--rule-shift:-0.4rem]">
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[rgb(var(--shadow)/0.14)] to-transparent dark:from-black/35" />
    </div>
  );
}

function RightPage({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-r-[4px] bg-sheet py-6 pl-10 pr-8">
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[rgb(var(--shadow)/0.16)] to-transparent dark:from-black/40" />
    </div>
  );
}

// The front of the book: maroon cloth, a foil-blocked title, and the white
// name label every Sri Lankan student fills in on the first day.
function Cover({ pages }: { pages: number }) {
  return (
    <div className="cloth absolute inset-0 overflow-hidden rounded-r-[7px] rounded-l-[2px] text-foil">
      <div aria-hidden className="absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
      <div aria-hidden className="absolute inset-y-0 left-7 w-px bg-black/25" />
      <div aria-hidden className="absolute inset-[6%] rounded-[3px] border-2 border-foil/70" />
      <div aria-hidden className="absolute inset-[calc(6%+7px)] rounded-[2px] border border-foil/45" />

      <div className="relative flex h-full flex-col items-center justify-center px-[14%] text-center">
        <p className="font-display text-[clamp(3rem,4.6vw,4.5rem)] font-bold leading-[0.9] tracking-[0.01em]">
          Project
          <br />
          Book
        </p>
        <div aria-hidden className="mt-5 flex items-center gap-3">
          <span className="h-px w-10 bg-foil/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-foil/80" />
          <span className="h-px w-10 bg-foil/70" />
        </div>

        <dl className="mt-8 w-full max-w-[19rem] -rotate-1 rounded-[12px/9px] border-2 border-[#1c3a8f]/70 bg-[#fbfcfd] px-4 py-3 text-left shadow-[0_2px_3px_rgb(0_0_0/0.25)]">
          {[
            ["Name", site.name],
            ["Subject", "Things I've built"],
            ["Pages", String(pages)],
          ].map(([field, value]) => (
            <div key={field} className="flex items-baseline gap-3 border-b border-dotted border-[#1c3a8f]/40 py-1 last:border-b-0">
              <dt className="w-16 shrink-0 font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#515a6b]">{field}</dt>
              <dd className="font-hand text-lg leading-7 text-[#1c3a8f]">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 font-hand text-xl text-foil/90">scroll to open</p>
      </div>
    </div>
  );
}

function Leaf({
  index,
  flips,
  progress,
  front,
  back,
  frontInert,
  backInert,
}: {
  index: number;
  flips: number;
  progress: MotionValue<number>;
  front: ReactNode;
  back: ReactNode;
  frontInert: boolean;
  backInert: boolean;
}) {
  const rotateY = useLeafAngle(progress, index, flips);
  const zIndex = useTransform(rotateY, (r) => (r > -90 ? flips * 2 - index : flips + index));
  const frontShade = useTransform(rotateY, [0, -90], [0, 0.45]);
  const backShade = useTransform(rotateY, [-90, -180], [0.45, 0]);

  return (
    <motion.div
      className="absolute inset-y-0 right-0 w-1/2"
      style={{ rotateY, zIndex, transformOrigin: "left center", transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]" inert={frontInert}>
        {front}
        <motion.div aria-hidden style={{ opacity: frontShade }} className="pointer-events-none absolute inset-0 rounded-r-[4px] bg-gradient-to-l from-black/45 to-black/5" />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" inert={backInert}>
        {back}
        <motion.div aria-hidden style={{ opacity: backShade }} className="pointer-events-none absolute inset-0 rounded-l-[4px] bg-gradient-to-r from-black/45 to-black/5" />
      </div>
    </motion.div>
  );
}

// The work, as an exercise book on the desk. The first scroll opens the cover;
// each spread after that is one project: the write-up on the left and its live
// figure on the right.
export function FlipBook({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollTo();
  const count = projects.length;
  const flips = count; // the cover + one leaf between each pair of projects
  const [spread, setSpread] = useState(0); // 0 = closed, n = project n-1
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const coverAngle = useLeafAngle(scrollYProgress, 0, flips);
  const bookX = useTransform(coverAngle, [0, -180], ["-25%", "0%"]);
  const openness = useTransform(coverAngle, (r) => (r < -90 ? 1 : 0));

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setSpread(Math.min(flips, Math.max(0, Math.round(p * flips))));
  });

  function goTo(target: number) {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = track.offsetHeight - window.innerHeight;
    scrollTo(top + (target / flips) * span, { duration: 1.1 });
  }

  const text = (i: number) => <ProjectText project={projects[i]} index={i} total={count} variant="book" />;
  const figure = (i: number) => {
    const Figure = PROJECT_FIGURES[projects[i].slug];
    return Figure ? <Figure active={spread === i + 1} /> : null;
  };

  return (
    <div ref={trackRef} className="relative bg-paper-2" style={{ height: `calc(100vh + ${flips * SCROLL_PER_FLIP_VH}vh)` }}>
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 overflow-hidden px-8 pb-4 pt-6">
        <motion.div className="relative max-h-[46rem] w-full max-w-[78rem] flex-1" style={{ x: bookX }}>
          <div
            aria-hidden
            className="cloth absolute -inset-y-3 -right-3 left-1/2 rounded-r-[10px] shadow-[0_2px_3px_rgb(var(--shadow)/0.2),0_40px_70px_-35px_rgb(var(--shadow)/0.7)]"
          />
          <motion.div
            aria-hidden
            className="cloth absolute -inset-y-3 -left-3 right-1/2 rounded-l-[10px] shadow-[0_2px_3px_rgb(var(--shadow)/0.2),0_40px_70px_-35px_rgb(var(--shadow)/0.7)]"
            style={{ opacity: openness }}
          />

          <div
            className="absolute inset-0 overflow-clip"
            style={{ perspective: "3200px", overflowClipMargin: "12px" } as CSSProperties}
          >
            <div className="absolute inset-y-0 right-0 w-1/2" inert={spread !== flips}>
              <RightPage>{figure(count - 1)}</RightPage>
            </div>

            <Leaf
              index={0}
              flips={flips}
              progress={scrollYProgress}
              front={<Cover pages={count} />}
              back={<LeftPage>{text(0)}</LeftPage>}
              frontInert={spread !== 0}
              backInert={spread !== 1}
            />
            {Array.from({ length: count - 1 }, (_, k) => (
              <Leaf
                key={projects[k].slug}
                index={k + 1}
                flips={flips}
                progress={scrollYProgress}
                front={<RightPage>{figure(k)}</RightPage>}
                back={<LeftPage>{text(k + 1)}</LeftPage>}
                frontInert={spread !== k + 1}
                backInert={spread !== k + 2}
              />
            ))}

            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 z-[100] w-[2px] -translate-x-1/2 bg-[rgb(var(--shadow)/0.22)] dark:bg-black/50"
              style={{ opacity: openness }}
            />
          </div>
        </motion.div>

        <nav aria-label="Turn the pages" className="flex items-center gap-2">
          <button
            type="button"
            data-cursor="link"
            disabled={spread === 0}
            onClick={() => goTo(spread - 1)}
            className="inline-flex h-11 items-center gap-1 rounded-full px-3 font-display text-lg font-semibold text-ink transition-colors hover:text-pen disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden /> {spread === 1 ? "Close the book" : "Previous page"}
          </button>
          <ol className="flex items-center gap-1.5 px-2" role="list">
            {projects.map((project, i) => (
              <li key={project.slug}>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={() => goTo(i + 1)}
                  aria-label={`Go to ${project.title}`}
                  aria-current={spread === i + 1 ? "page" : undefined}
                  className="flex h-11 w-7 items-center justify-center"
                >
                  <span className={`block h-2.5 w-2.5 rounded-full border-[1.5px] border-ink transition-colors ${spread === i + 1 ? "bg-ink" : "bg-transparent"}`} />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            data-cursor="link"
            disabled={spread === flips}
            onClick={() => goTo(spread + 1)}
            className="inline-flex h-11 items-center gap-1 rounded-full px-3 font-display text-lg font-semibold text-ink transition-colors hover:text-pen disabled:pointer-events-none disabled:opacity-30"
          >
            {spread === 0 ? "Open the book" : "Next page"} <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </nav>
      </div>
    </div>
  );
}
