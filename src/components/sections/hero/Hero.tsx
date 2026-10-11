"use client";

import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Download, RotateCcw } from "lucide-react";
import { useScrollTo } from "@/components/providers/SmoothScrollProvider";
import { NAV_SCROLL_OFFSET } from "@/lib/scroll";
import { site } from "@/data/site";
import { PenUnderline, Scribble } from "@/components/ui/Scribble";

const delay = (seconds: number, extra?: Record<string, string>) =>
  ({ "--delay": `${seconds}s`, ...extra }) as CSSProperties;

// Timeline (seconds). The name lands first; the answer is written; then the
// red pen works through it one edit at a time.
const T = { name: 0.05, sinhala: 0.45, cta: 0.7, line1: 0.9, line2: 1.5, line3: 2.1, edits: 2.9, gap: 0.42 };
const EDIT_COUNT = 5;

/** A substitution: strike the written word, write the correction above it. */
function Sub({ wrong, right, at, sinhala = false }: { wrong: string; right: string; at: number; sinhala?: boolean }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-[1.2]">
      {wrong}
      <Scribble
        kind="strike"
        delay={at}
        duration={0.3}
        strokeWidth={3}
        className="pointer-events-none absolute -left-[6%] top-[56%] h-[0.45em] w-[112%] -translate-y-1/2 text-pen"
      />
      <span
        className={`scrawl-in absolute bottom-[80%] left-1/2 -translate-x-1/2 whitespace-nowrap leading-none text-pen ${
          sinhala ? "font-sinhala text-[0.8em] font-bold" : "font-hand text-[0.86em] font-bold"
        }`}
        style={delay(at + 0.22, { "--tilt": "-4deg" })}
      >
        {right}
      </span>
    </span>
  );
}

/** An insertion: a caret at the end of the word, the missing letters above it. */
function Ins({ base, add, at }: { base: string; add: string; at: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-[1.2]">
      {base}
      <Scribble
        kind="caret"
        delay={at}
        duration={0.22}
        strokeWidth={2.5}
        className="pointer-events-none absolute left-full top-[78%] h-[0.36em] w-[0.44em] -translate-x-1/2 text-pen"
      />
      <span
        className="scrawl-in absolute bottom-[84%] left-full -translate-x-1/2 font-hand text-[0.86em] font-bold leading-none text-pen"
        style={delay(at + 0.18, { "--tilt": "-6deg" })}
      >
        {add}
      </span>
    </span>
  );
}

function Line({ at, children, className = "" }: { at: number; children: ReactNode; className?: string }) {
  return (
    <span className={`write-on block ${className}`} style={delay(at, { "--dur": "0.9s" })}>
      {children}
    </span>
  );
}

function subscribeNever() {
  return () => {};
}
function todayString() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
}

export function Hero() {
  const scrollTo = useScrollTo();
  const [run, setRun] = useState(0);
  const today = useSyncExternalStore(subscribeNever, todayString, () => "");
  const at = (i: number) => T.edits + i * T.gap;

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="ruled margin-rule sheet-x relative flex min-h-[calc(100svh-4rem)] flex-col pb-[calc(var(--line)*2)] pt-[calc(var(--line)*2)] sm:pt-[calc(var(--line)*3)]"
    >
      {/* Top of the page: the date, the way every exercise starts. */}
      <div className="mb-[var(--line)] flex items-center justify-between gap-4 lg:justify-end">
        {/* Small screens: the GPA rides up here so it stays in the first viewport. */}
        <p className="ink-in relative ml-3 inline-flex items-baseline gap-1.5 px-1.5 lg:hidden" style={delay(0.9)}>
          <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-muted">GPA</span>
          <span className="font-hand text-2xl font-bold leading-none text-ink">{site.gpa}</span>
          <Scribble
            kind="circle"
            delay={at(EDIT_COUNT) + 0.55}
            duration={0.7}
            strokeWidth={2.5}
            className="pointer-events-none absolute -left-3 -top-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.5rem)] text-pen"
          />
        </p>
        <p
          aria-hidden
          className="ink-in font-hand text-lg leading-[var(--line)] text-ink sm:text-xl"
          style={delay(0)}
        >
          <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted">Date</span>{" "}
          <span className="inline-block min-w-[6.5ch] border-b border-dotted border-muted/60">{today}</span>
        </p>
      </div>

      <div className="grid flex-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <h1 className="text-ink">
            <span
              className="ink-in block font-display text-[clamp(4rem,12.5vw,9.5rem)] font-bold leading-[0.84] tracking-[-0.01em]"
              style={delay(T.name, { "--dur": "1.1s" })}
            >
              {site.name}
            </span>
            <span
              lang="si"
              className="write-on mt-3 block font-sinhala text-[clamp(1.6rem,3.6vw,2.6rem)] font-bold leading-[1.4] text-ink/80"
              style={delay(T.sinhala, { "--dur": "1s" })}
            >
              සහන් පෙරේරා
            </span>
          </h1>

          {/* The answer, written in ballpoint, then marked by the red pen. */}
          <div key={run} className="mt-[var(--line)] max-w-[44rem]">
            <p className="sr-only">
              I train neural nets from scratch and ship apps for real clients.{" "}
              <span lang="si">මම පරිගණක විද්‍යාව හදාරමි.</span> (I study computer science.)
            </p>
            <p
              aria-hidden
              className="font-hand text-[clamp(1.35rem,2.7vw,2.05rem)] leading-[3.25rem] text-ink sm:leading-[calc(var(--line)*2)]"
            >
              <Line at={T.line1}>
                I <Sub wrong="trains" right="train" at={at(0)} /> neural <Ins base="net" add="s" at={at(1)} /> from
                scratch
              </Line>
              <Line at={T.line2}>
                and ship <Ins base="app" add="s" at={at(2)} /> for real <Ins base="client" add="s" at={at(3)} />.
              </Line>
              <Line at={T.line3} className="font-sinhala text-[0.92em] font-medium">
                <span lang="si">
                  මම පරිගණක විද්‍යාව <Sub wrong="හදාරයි" right="හදාරමි" at={at(4)} sinhala />.
                </span>
              </Line>
              <Line at={T.line3 + 0.4} className="font-sans text-sm font-normal leading-8 text-muted">
                Sinhala for &ldquo;I study computer science.&rdquo;
              </Line>
            </p>

            <p
              aria-hidden
              className="scrawl-in mt-1 flex items-center gap-2 font-hand text-xl font-bold text-pen"
              style={delay(at(EDIT_COUNT) + 0.2, { "--tilt": "-2deg" })}
            >
              <Scribble kind="tick" delay={at(EDIT_COUNT) + 0.2} duration={0.3} className="h-6 w-6" strokeWidth={3} />
              5 corrections
            </p>
          </div>

          <div className="ink-in mt-[var(--line)] flex flex-wrap items-center gap-x-7 gap-y-3" style={delay(T.cta)}>
            <button
              type="button"
              data-cursor="link"
              onClick={() => scrollTo("#work", { offset: NAV_SCROLL_OFFSET })}
              className="btn-ink"
            >
              See the work
              <Scribble kind="arrowDown" animate={false} strokeWidth={2.25} className="h-6 w-3" />
            </button>
            <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className="btn-pen">
              <Download className="h-4 w-4" aria-hidden /> Download CV
              <PenUnderline />
            </a>
            <button
              type="button"
              data-cursor="link"
              onClick={() => scrollTo("#contact", { offset: NAV_SCROLL_OFFSET })}
              className="btn-pen hidden sm:inline-flex"
            >
              Get in touch
              <PenUnderline />
            </button>
          </div>
        </div>

        {/* Right margin: the teacher's notes. Moves under the answer on small screens. */}
        <aside
          aria-label="At a glance"
          className="mt-[var(--line)] flex flex-wrap items-start gap-x-10 gap-y-6 lg:mt-[calc(var(--line)*2)] lg:flex-col lg:gap-8"
        >
          <p className="ink-in relative ml-4 hidden px-2 pt-2 lg:inline-block" style={delay(0.9)}>
            <span className="block font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted">GPA</span>
            <span className="block font-hand text-5xl font-bold leading-none text-ink">{site.gpa}</span>
            <Scribble
              kind="circle"
              delay={at(EDIT_COUNT) + 0.55}
              duration={0.7}
              strokeWidth={2.75}
              className="pointer-events-none absolute -left-5 -top-3 h-[calc(100%+1.75rem)] w-[calc(100%+2.75rem)] text-pen"
            />
          </p>
          <p className="ink-in max-w-[16rem] text-base leading-[var(--line)] text-muted" style={delay(1)}>
            {site.degree}
            <br />
            {site.university}
          </p>
          <p
            className="stamp scrawl-in whitespace-nowrap text-[0.85rem] text-pen"
            style={delay(at(EDIT_COUNT) + 0.9, { "--tilt": "-5deg", "--dur": "0.3s" })}
          >
            {site.availability}
          </p>
        </aside>
      </div>

      <div className="mt-[var(--line)] flex flex-wrap items-center gap-x-6 gap-y-2 font-hand text-lg leading-[var(--line)] text-pen">
        <p className="ink-in" style={delay(at(EDIT_COUNT) + 1.1)}>
          The red pen above is a scripted replay. Teaching a model to do it for Sinhala is{" "}
          <button
            type="button"
            data-cursor="link"
            onClick={() => scrollTo("#research", { offset: NAV_SCROLL_OFFSET })}
            className="font-bold underline decoration-2 underline-offset-4"
          >
            my research
          </button>
          .
        </p>
        <button
          type="button"
          data-cursor="link"
          onClick={() => setRun((n) => n + 1)}
          className="ink-in inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-medium text-muted transition-colors hover:text-pen"
          style={delay(at(EDIT_COUNT) + 1.2)}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Run the red pen again
        </button>
      </div>
    </section>
  );
}
