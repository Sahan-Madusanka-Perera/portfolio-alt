"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useArenaQuality } from "./game/useArenaQuality";

type Mode = "menu" | "penalty" | "match";

const loading = () => (
  <div className="absolute inset-0 grid place-items-center bg-[#0b3d1f]">
    <span className="animate-pulse font-mono text-sm text-white/70">Loading pitch…</span>
  </div>
);

// Each mode pulls in three.js / r3f, so both are code-split and only fetched
// when the player actually picks that mode.
const PenaltyGame = dynamic(() => import("./game/PenaltyGame").then((m) => m.PenaltyGame), { ssr: false, loading });
const MatchGame = dynamic(() => import("./game/MatchGame").then((m) => m.MatchGame), { ssr: false, loading });

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      {active ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9H4m5 0V4m0 5L4 4m11 5h5m-5 0V4m0 5 5-5M9 15H4m5 0v5m0-5-5 5m11-5h5m-5 0v5m0-5 5 5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      )}
    </svg>
  );
}

function GoalIcon() {
  return (
    <svg viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="h-8 w-10" aria-hidden>
      <path d="M3 22V3h26v19" />
      <path d="M8 3v19M13 3v19M18 3v19M23 3v19M3 8h26M3 13h26M3 18h26" strokeWidth={0.9} opacity={0.6} />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" className="h-8 w-8" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" fill="currentColor" />
      <path d="M12 7.5V2.5M16 10.4l4.6-1.6M14.5 15.1l2.9 3.9M9.5 15.1l-2.9 3.9M8 10.4L3.4 8.8" />
    </svg>
  );
}

const MODES = [
  {
    id: "penalty" as const,
    title: "Penalty shootout",
    blurb: "Pick your corner, beat the keeper, chase a streak.",
    Icon: GoalIcon,
    tag: "Tap to play",
  },
  {
    id: "match" as const,
    title: "Quick match · 3v3",
    blurb: "WASD to move, Shift to sprint, hold Space for a power shot, E to pass. First to three.",
    Icon: BallIcon,
    tag: "Keyboard",
  },
];

export function FootballGame() {
  const reduced = usePrefersReducedMotion();
  const quality = useArenaQuality();
  const stageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("menu");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={stageRef}
      className={`arena relative w-full overflow-hidden rounded-2xl border border-border bg-[#0b3d1f] shadow-xl ${
        isFullscreen ? "h-full" : "aspect-[16/10] max-h-[520px]"
      }`}
    >
      {mode === "menu" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 py-8">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/50">Arcade</p>
            <h4 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Sahan&apos;s pitch</h4>
            <p className="mt-1 text-sm text-white/60">Two ways to play. Pick one.</p>
          </div>
          <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
            {MODES.map((m, i) => (
              <motion.button
                key={m.id}
                type="button"
                data-cursor="link"
                onClick={() => setMode(m.id)}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 0.05 + i * 0.06 }}
                whileHover={reduced ? undefined : { y: -4 }}
                className="group flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm transition-colors hover:border-[color:var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
              >
                <span className="text-white/90">
                  <m.Icon />
                </span>
                <span className="text-base font-bold text-white">{m.title}</span>
                <span className="text-xs leading-snug text-white/60">{m.blurb}</span>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  {m.tag} →
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="absolute inset-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {mode === "penalty" ? <PenaltyGame hd={quality.hd} /> : <MatchGame hd={quality.hd} />}
          </motion.div>
        </AnimatePresence>
      )}

      {/* chrome: mode switch + fullscreen (top-right) */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {mode !== "menu" && (
          <button
            type="button"
            data-cursor="link"
            onClick={() => setMode("menu")}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden /> Modes
          </button>
        )}
        {quality.canHd && (
          <button
            type="button"
            data-cursor="link"
            onClick={() => quality.setHd(!quality.hd)}
            aria-pressed={quality.hd}
            aria-label="Stadium graphics (HD)"
            title={quality.hd ? "Switch to lighter graphics" : "Switch to stadium graphics"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              quality.hd ? "bg-[#ffd166] text-[#0b3d1f] hover:bg-[#ffe08f]" : "bg-black/45 text-white hover:bg-black/65"
            }`}
          >
            HD
          </button>
        )}
        <button
          type="button"
          data-cursor="link"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FullscreenIcon active={isFullscreen} />
        </button>
      </div>
    </div>
  );
}
