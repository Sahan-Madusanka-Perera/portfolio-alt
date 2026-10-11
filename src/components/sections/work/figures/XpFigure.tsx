"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scribble } from "@/components/ui/Scribble";

const EVENTS = [
  { label: "Checked in at the gym", xp: 20 },
  { label: "Logged leg day", xp: 45 },
  { label: "Asked the coach bot for a plan", xp: 10 },
  { label: "Seven-day streak", xp: 80 },
  { label: "New personal best", xp: 60 },
  { label: "Joined a group class", xp: 35 },
  { label: "Checked in at the gym", xp: 20 },
];
const LEVEL_XP = 100;
const START_LEVEL = 7;
const XP_PER_MARK = 10;

function TallyGroup({ marks, firstIndex }: { marks: number; firstIndex: number }) {
  const strokes = [
    "M5 3 L4 29",
    "M11 3 L11 29",
    "M17 3 L18 29",
    "M24 3 L23 29",
    "M1 25 L28 6",
  ];
  return (
    <svg viewBox="0 0 30 32" className="h-9 w-8 text-ink" aria-hidden fill="none">
      {strokes.slice(0, marks).map((d, i) => (
        <path
          key={firstIndex + i}
          d={d}
          pathLength={1}
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          className={`draw-on ${i === 4 ? "text-pen" : ""}`}
          style={{ "--dur": "0.25s", "--delay": `${i * 0.05}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

// Fig: the member's XP log, kept like a tally in an exercise book. XP events
// written back to the database add up; every 100 XP the red pen levels them up.
export function XpFigure({ active }: { active: boolean }) {
  const [tick, setTick] = useState(3);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => (t >= EVENTS.length + 2 ? 0 : t + 1)), 1300);
    return () => window.clearInterval(id);
  }, [active]);

  const shown = Math.min(tick, EVENTS.length);
  const rows = EVENTS.slice(0, shown).map((event, i) => ({
    ...event,
    key: i,
    total: EVENTS.slice(0, i + 1).reduce((sum, e) => sum + e.xp, 0),
  }));
  const total = rows.length ? rows[rows.length - 1].total : 0;
  const level = START_LEVEL + Math.floor(total / LEVEL_XP);
  const levels = Array.from({ length: level - START_LEVEL + 1 }, (_, i) => START_LEVEL + i);
  const marks = Math.floor(total / XP_PER_MARK);
  const groups = Array.from({ length: Math.ceil(marks / 5) }, (_, g) => Math.min(5, marks - g * 5));

  return (
    <figure className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-live="polite">
        <span className="font-hand text-3xl leading-none text-ink">Level</span>
        {levels.map((n) => {
          const current = n === level;
          return (
            <span key={n} className={`relative inline-block px-2 font-hand text-5xl font-bold leading-none tabular-nums ${current ? "text-pen" : "text-ink/60"}`}>
              {n}
              {current ? (
                n !== START_LEVEL && (
                  <Scribble kind="circle" duration={0.5} delay={0.2} strokeWidth={2.5} className="pointer-events-none absolute -inset-x-2 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]" />
                )
              ) : (
                <Scribble kind="strike" duration={0.25} strokeWidth={3} className="pointer-events-none absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 -rotate-12 text-pen" />
              )}
            </span>
          );
        })}
        <AnimatePresence>
          {level > START_LEVEL && (
            <motion.span
              key={level}
              className="stamp text-base text-pen"
              initial={{ scale: 1.5, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              Level up
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <table className="mt-5 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-ink/70 text-sm text-muted">
            <th scope="col" className="py-1 font-medium">What the member did</th>
            <th scope="col" className="w-16 py-1 text-right font-medium">XP</th>
            <th scope="col" className="w-20 py-1 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: EVENTS.length }, (_, i) => {
            const row = rows[i];
            return (
              <tr key={i} className="h-9 border-b border-rule">
                {row ? (
                  <>
                    <td className="font-hand text-lg text-ink">
                      <motion.span className="inline-block" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        {row.label}
                      </motion.span>
                    </td>
                    <td className="text-right font-hand text-lg font-bold text-pen tabular-nums">+{row.xp}</td>
                    <td className={`text-right text-sm tabular-nums ${Math.floor(row.total / LEVEL_XP) > Math.floor((row.total - row.xp) / LEVEL_XP) ? "font-semibold text-pen" : "text-muted"}`}>
                      {row.total}
                    </td>
                  </>
                ) : (
                  <td colSpan={3} />
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-h-9 flex-wrap items-end gap-1.5" aria-hidden>
          {groups.map((n, g) => (
            <TallyGroup key={g} marks={n} firstIndex={g * 5} />
          ))}
        </div>
        <p className="text-right">
          <span className="block text-sm text-muted">Total</span>
          <span className="inline-block border-b-[3px] border-double border-ink font-hand text-3xl font-bold leading-tight text-ink tabular-nums">
            {total} XP
          </span>
        </p>
      </div>

      <figcaption className="mt-auto pt-3 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 2</span>{" "}
        XP events written back to Supabase level a member up; each tally stroke is 10 XP. Illustrative member and values.
      </figcaption>
    </figure>
  );
}
