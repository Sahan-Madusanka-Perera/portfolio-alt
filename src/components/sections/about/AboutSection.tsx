"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";
import { useKonamiCode } from "./useKonamiCode";
import { EasterEggGame } from "./EasterEggGame";
import { FootballGame } from "./FootballGame";

const LABEL = [
  { field: "Name", value: site.name },
  { field: "School", value: site.university },
  { field: "Subject", value: site.degree },
  { field: "GPA", value: site.gpa },
  { field: "From", value: site.location },
  { field: "Since 2025", value: "Freelance web developer" },
];

const SUBJECTS = [
  {
    subject: "Machine learning & computer vision",
    tools: "PyTorch, U-Net, OpenCV, MediaPipe, scikit-learn, XGBoost, LightGBM",
    seen: "HoloDraw, box-office predictor, music recommender",
  },
  {
    subject: "Language research",
    tools: "Sinhala GEC, synthetic error generation, transfer learning",
    seen: "Review paper, JCoS 2026",
  },
  {
    subject: "Full-stack web",
    tools: "TypeScript, React, Next.js, Node.js, Express, Vite",
    seen: "Gym Leveling, QR attendance",
  },
  {
    subject: "Data & backend",
    tools: "PostgreSQL, PostGIS, Supabase, JWT, Server-Sent Events",
    seen: "QR attendance, Gym Leveling",
  },
  { subject: "Mobile & AI APIs", tools: "React Native, Gemini API", seen: "Gym Leveling" },
  {
    subject: "Algorithms & data apps",
    tools: "Python, NetworkX, Dijkstra, Streamlit",
    seen: "Shortest-path routing, box-office predictor",
  },
];

export function AboutSection() {
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  useKonamiCode(() => setEasterEggUnlocked(true));

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="ruled margin-rule sheet-x relative scroll-mt-16 border-t-2 border-rule pb-[calc(var(--line)*3)] pt-[calc(var(--line)*2)] sm:pb-[calc(var(--line)*4)] sm:pt-[calc(var(--line)*4)]"
    >
      <h2 id="about-heading" className="font-display text-[clamp(3rem,7.5vw,6rem)] font-bold leading-[0.95] text-ink">
        About me
      </h2>

      <div className="mt-[calc(var(--line)*2)] grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="max-w-[62ch] space-y-[var(--line)] text-lg leading-8 text-text">
          <p>
            I&apos;m a Computer Science undergraduate at the University of Sri Jayewardenepura, working across machine
            learning, computer vision, and full-stack development. My project work runs from training neural networks
            from scratch to shipping production web apps for real clients.
          </p>
          <p>
            I&apos;m most drawn to applied ML and NLP, with an emerging research focus on low-resource language
            processing for <span className="font-hand text-xl font-bold text-pen">Sinhala</span>, the language I grew up
            writing in exercise books like this one. Outside the editor: football, music, and games.
          </p>
        </div>

        {/* The name label stuck on the front of every exercise book. */}
        <dl className="relative rotate-[0.6deg] rounded-[14px_14px_14px_14px/10px] border-2 border-ink/80 bg-sheet p-5 shadow-[0_1px_2px_rgb(var(--shadow)/0.15),0_16px_30px_-20px_rgb(var(--shadow)/0.5)]">
          {LABEL.map(({ field, value }) => (
            <div key={field} className="flex items-baseline gap-3 border-b border-dotted border-ink/40 py-1 last:border-b-0">
              <dt className="w-[5.5rem] shrink-0 font-display text-sm font-semibold uppercase tracking-[0.06em] text-muted">
                {field}
              </dt>
              <dd className="min-w-0 font-hand text-lg leading-7 text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-[calc(var(--line)*3)]">
        <h3 className="font-display text-3xl font-bold leading-10 text-ink sm:text-4xl">What I work with</h3>
        <div className="mt-4 border-t-2 border-ink/70">
          <div aria-hidden className="hidden grid-cols-[15rem_1fr_17rem] gap-6 border-b border-ink/70 py-2 font-display text-sm font-semibold uppercase tracking-[0.06em] text-muted md:grid">
            <span>Subject</span>
            <span>Tools</span>
            <span>Where you&apos;ll see it</span>
          </div>
          <ul role="list">
            {SUBJECTS.map((row) => (
              <li key={row.subject} className="grid gap-x-6 gap-y-0.5 border-b border-rule py-3 md:grid-cols-[15rem_1fr_17rem]">
                <p className="font-display text-xl font-bold leading-7 text-ink">{row.subject}</p>
                <p className="leading-7 text-text">
                  <span className="sr-only">Tools: </span>
                  {row.tools}
                </p>
                <p className="font-hand text-lg leading-7 text-pen">
                  <span className="sr-only">Where you&apos;ll see it: </span>
                  {row.seen}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-[calc(var(--line)*3)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <h3 className="flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-bold leading-10 text-ink sm:text-4xl">
              Interval
              <span lang="si" className="font-sinhala text-2xl font-bold text-ink/60">
                විවේකය
              </span>
            </h3>
            <p className="max-w-[52ch] text-lg leading-8 text-text">
              Every school day has an interval, and mine was always football. Take a penalty or play a quick 3v3.
            </p>
          </div>
          <button
            type="button"
            data-cursor="link"
            onClick={() => setGameOpen((open) => !open)}
            aria-expanded={gameOpen}
            className="btn-ink"
          >
            {gameOpen ? "Back to class" : "Go out to the field"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {gameOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                <FootballGame />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {easterEggUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-[calc(var(--line)*3)]"
          >
            <h3 className="font-display text-3xl font-bold leading-10 text-ink">Surprise test: how fast are you?</h3>
            <p className="mb-4 font-hand text-lg leading-8 text-pen">You found the hidden page.</p>
            <EasterEggGame />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only">Hint: try the Konami code.</p>
    </section>
  );
}
