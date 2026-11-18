"use client";

import { ArrowClockwiseIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { terminalRuns } from "@/data/terminal";
import { cn } from "@/lib/cn";

const COMMAND = "dbops health";

function lineClass(line: string) {
  if (/^\s+CRIT\b/.test(line) || /^CRIT\b/.test(line)) return "text-crit";
  if (/^\s+WARN\b/.test(line) || /^WARN\b/.test(line)) return "text-warn";
  if (/^\s+OK\b/.test(line)) return "text-fg-2";
  if (/^OK\b/.test(line)) return "text-ok";
  if (/^\S/.test(line)) return "text-fg";
  return "text-fg-2";
}

// A replay of real `dbops health` output from the DBOps Lab repository (results/*.txt), line for
// line. It types the command, streams the checks, then lights the verdict with the real exit code.
// Under reduced motion the whole run is shown at once.
export function OperationsSection() {
  const [runIndex, setRunIndex] = useState(0);
  const [typed, setTyped] = useState(COMMAND.length);
  const [shown, setShown] = useState(Number.MAX_SAFE_INTEGER);
  const [playing, setPlaying] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const run = terminalRuns[runIndex];
  const done = shown >= run.lines.length;

  const play = useCallback((index: number) => {
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(COMMAND.length);
      setShown(Number.MAX_SAFE_INTEGER);
      return;
    }
    const total = terminalRuns[index].lines.length;
    setPlaying(true);
    setTyped(0);
    setShown(0);
    let c = 0;
    let l = 0;
    const typeStep = () => {
      c += 1;
      setTyped(c);
      if (c < COMMAND.length) timer.current = window.setTimeout(typeStep, 45 + Math.random() * 40);
      else timer.current = window.setTimeout(lineStep, 380);
    };
    const lineStep = () => {
      l += 1;
      setShown(l);
      if (l < total) timer.current = window.setTimeout(lineStep, 14 + Math.random() * 22);
      else setPlaying(false);
    };
    timer.current = window.setTimeout(typeStep, 250);
  }, []);

  // Play the first time it scrolls into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          play(0);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [play]);

  // Keep the newest line in view while streaming.
  useEffect(() => {
    const screen = screenRef.current;
    if (screen && playing) screen.scrollTop = screen.scrollHeight;
  }, [shown, playing]);

  const ok = run.exitCode === 0;

  return (
    <section ref={sectionRef} id="operations" aria-labelledby="operations-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading
          id="operations-title"
          title="Breaking databases on purpose"
          intro="DBOps Lab runs Oracle, MariaDB, MongoDB and PostgreSQL side by side. This is its health check, replayed from the real output in the repository."
        />

        <div className="mt-14 overflow-hidden rounded-[20px] bg-bg-2 ring-1 ring-inset ring-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <div role="tablist" aria-label="Health check runs" className="flex gap-1">
              {terminalRuns.map((r, i) => (
                <button
                  key={r.id}
                  role="tab"
                  type="button"
                  aria-selected={i === runIndex}
                  aria-controls="terminal-screen"
                  onClick={() => {
                    setRunIndex(i);
                    play(i);
                  }}
                  className={cn(
                    "h-9 rounded-full px-4 text-[0.875rem] transition-colors",
                    i === runIndex ? "bg-fg text-bg" : "text-fg-2 hover:bg-fg/[0.06] hover:text-fg",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[0.8125rem] text-fg-2 md:inline">results/{run.file}</span>
              <button
                type="button"
                onClick={() => play(runIndex)}
                className="grid h-9 w-9 place-items-center rounded-full text-fg-2 transition-colors hover:bg-fg/[0.06] hover:text-fg"
                aria-label="Replay"
              >
                <ArrowClockwiseIcon aria-hidden size={16} />
              </button>
            </div>
          </div>

          <div
            ref={screenRef}
            id="terminal-screen"
            role="tabpanel"
            tabIndex={0}
            aria-label={`${run.label}: dbops health output`}
            className="h-[min(62vh,560px)] overflow-auto overscroll-contain px-4 py-5 font-mono text-[0.8125rem] leading-[1.7] sm:px-6"
          >
            <p className="text-fg">
              <span className="text-accent">$ </span>
              {COMMAND.slice(0, typed)}
              {typed < COMMAND.length && <span className="caret ml-0.5" aria-hidden />}
            </p>
            <pre className="mt-2 font-mono">
              {run.lines.slice(0, shown).map((line, i) => (
                <span key={i} className={cn("block min-h-[1.7em] whitespace-pre", lineClass(line))}>
                  {line}
                </span>
              ))}
            </pre>
            {done && (
              <p className={cn("mt-4 border-t border-line pt-4 font-medium", ok ? "text-ok" : "text-crit")}>
                {run.verdictLine}
                <span className="ml-3 text-fg-2">exit {run.exitCode}</span>
              </p>
            )}
            {!done && typed >= COMMAND.length && <span className="caret" aria-hidden />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-4 sm:px-5">
            <p className="flex items-center gap-3 text-[0.875rem] text-fg-2" aria-live="polite">
              <span
                aria-hidden
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-[background-color,box-shadow] duration-500",
                  !done ? "bg-fg-3" : ok ? "bg-ok shadow-[0_0_14px_var(--ok)]" : "bg-crit shadow-[0_0_14px_var(--crit)]",
                )}
              />
              {/* Both texts share one grid cell, so the bar keeps the verdict's height while running (no layout shift). */}
              <span className="grid">
                <span className={cn("col-start-1 row-start-1", !done && "invisible")}>{`${run.verdict}: ${run.notes[0]}`}</span>
                <span className={cn("col-start-1 row-start-1", done && "invisible")}>Running checks</span>
              </span>
            </p>
            <Link href="/work/dbops-lab" className="inline-flex items-center gap-1.5 text-[0.875rem] text-fg transition-colors hover:text-accent">
              Read the case study
              <ArrowUpRightIcon aria-hidden size={13} />
            </Link>
          </div>
        </div>
        {run.notes[1] && <p className="mt-4 max-w-[80ch] text-[0.875rem] leading-[1.55] text-fg-2">Faults in this run: {run.notes[1]}.</p>}
      </div>
    </section>
  );
}
