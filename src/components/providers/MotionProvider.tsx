"use client";

import { MotionConfig } from "motion/react";

// `reducedMotion="user"` makes every Motion component respect the OS setting: transforms snap
// to their end state. GSAP, anime.js and WebGL check the setting themselves.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}>
      {children}
    </MotionConfig>
  );
}
