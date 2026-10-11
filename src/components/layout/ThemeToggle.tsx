"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M16.5 3.5l4 4L8 20l-5 1 1-5L16.5 3.5z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M7 12c1.5-2 2.5-2 3.5 0s2 2 3.5 0" />
      <path d="M8 20l2-4M16 20l-2-4" />
    </svg>
  );
}

// Light is the exercise book, dark is the classroom blackboard.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-cursor="link"
      aria-label={isDark ? "Switch to the exercise book (light theme)" : "Switch to the blackboard (dark theme)"}
      title={isDark ? "Exercise book" : "Blackboard"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "board" : "pen"}
          initial={prefersReducedMotion ? false : { opacity: 0, rotate: -30, y: 4 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: 30, y: -4 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="block h-5 w-5"
        >
          {isDark ? <BoardIcon /> : <PenIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
