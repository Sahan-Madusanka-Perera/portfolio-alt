"use client";

import { MotionConfig } from "framer-motion";

// `reducedMotion="user"` makes every Framer Motion component in the tree
// (including layoutId shared-element transitions) respect the OS setting
// automatically — transform/layout animations snap instantly, opacity still
// fades. This is on top of, not instead of, the manual checks in components
// that don't go through Framer Motion (the hero canvas, GSAP timelines).
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
