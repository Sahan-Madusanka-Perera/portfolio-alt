"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MOODS = [
  { name: "happy", mouth: "M34 66 Q50 82 66 66", brow: 0, eye: 1, music: "Upbeat, high-tempo tracks", probs: [0.72, 0.14, 0.09, 0.05] },
  { name: "calm", mouth: "M36 70 Q50 74 64 70", brow: 2, eye: 0.35, music: "Slow lo-fi and ambient", probs: [0.12, 0.68, 0.14, 0.06] },
  { name: "focused", mouth: "M38 71 Q50 69 62 71", brow: -5, eye: 0.8, music: "Instrumental, no lyrics", probs: [0.08, 0.17, 0.66, 0.09] },
  { name: "sad", mouth: "M36 74 Q50 62 64 74", brow: 6, eye: 0.9, music: "Mellow acoustic", probs: [0.05, 0.16, 0.11, 0.68] },
];
const LABELS = ["happy", "calm", "focused", "sad"];

// Fig: detect the listener's state, then map it to what to play.
export function MoodFigure({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const mood = MOODS[index];

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MOODS.length), 2600);
    return () => window.clearInterval(id);
  }, [active]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <figure className="flex h-full flex-col">
      <div className="grid flex-1 items-center gap-6 sm:grid-cols-[9rem_1fr]">
        <svg viewBox="0 0 100 100" className="mx-auto w-36 text-ink" aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2.2}>
          <path d="M50 8C75 7 92 26 91 52C90 78 72 93 49 92C25 91 8 74 9 49C10 26 27 9 52 9" />
          <motion.path d="M30 34 L42 34" animate={{ d: `M30 ${34 + mood.brow * 0.4} L42 ${34 - mood.brow * 0.4}` }} transition={{ duration: 0.5, ease }} />
          <motion.path d="M58 34 L70 34" animate={{ d: `M58 ${34 - mood.brow * 0.4} L70 ${34 + mood.brow * 0.4}` }} transition={{ duration: 0.5, ease }} />
          <motion.ellipse cx="36" cy="46" rx="2.6" ry="3" fill="currentColor" animate={{ ry: 3 * mood.eye }} transition={{ duration: 0.4 }} />
          <motion.ellipse cx="64" cy="46" rx="2.6" ry="3" fill="currentColor" animate={{ ry: 3 * mood.eye }} transition={{ duration: 0.4 }} />
          <motion.path d={MOODS[0].mouth} animate={{ d: mood.mouth }} transition={{ duration: 0.6, ease }} />
        </svg>

        <div>
          <ul className="space-y-2" role="list">
            {LABELS.map((label, i) => (
              <li key={label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                <span className={i === index ? "font-semibold text-text" : "text-muted"}>{label}</span>
                <span className="h-3 rounded-[2px] border border-rule">
                  <motion.span
                    className={`block h-full ${i === index ? "bg-pen" : "bg-ink/35"}`}
                    animate={{ width: `${mood.probs[i] * 100}%` }}
                    transition={{ duration: 0.6, ease }}
                  />
                </span>
                <span className="text-right text-muted tabular-nums">{mood.probs[i].toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-rule pt-3" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={mood.name}
                className="mt-1 font-hand text-2xl font-bold leading-tight text-pen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease }}
              >
                <span className="font-sans text-base font-normal text-muted">Play: </span>
                {mood.music}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 6</span>{" "}A vision model estimates the listener&apos;s state and
        the recommender maps it to music. Illustrative face and probabilities.
      </figcaption>
    </figure>
  );
}
