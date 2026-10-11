import type { CSSProperties } from "react";

// Hand-drawn pen marks. Every path uses pathLength=1 so the shared `.draw-on`
// keyframe (globals.css) can ink any of them in with one dasharray rule.
const MARKS = {
  underline: { viewBox: "0 0 200 12", d: "M3 8.5C38 4.5 86 9.8 128 6.4S182 4.2 197 6.8", aspect: "none" },
  strike: { viewBox: "0 0 100 12", d: "M1 7.2C24 5.4 52 8.4 76 5.9S94 5.6 99 6.4", aspect: "none" },
  circle: {
    viewBox: "0 0 220 90",
    d: "M40 18C80 2 170 4 204 30C226 48 196 78 128 84C62 90 8 76 6 50C4 30 38 14 92 10",
    aspect: "none",
  },
  tick: { viewBox: "0 0 32 28", d: "M3 15.5L11.5 24.5L29 3.5", aspect: "xMidYMid meet" },
  cross: { viewBox: "0 0 28 28", d: "M4 4L24 24M24 4L4 24", aspect: "xMidYMid meet" },
  caret: { viewBox: "0 0 18 16", d: "M2 14.5L9 2.5L16 14.5", aspect: "xMidYMid meet" },
  arrow: { viewBox: "0 0 120 60", d: "M4 52C30 50 70 40 108 10M108 10L90 12M108 10L104 28", aspect: "xMidYMid meet" },
  arrowDown: { viewBox: "0 0 40 80", d: "M22 3C10 24 30 44 18 74M18 74L8 60M18 74L30 63", aspect: "xMidYMid meet" },
} as const;

export type MarkKind = keyof typeof MARKS;

export function Scribble({
  kind,
  className = "",
  strokeWidth = 2.5,
  animate = true,
  delay = 0,
  duration = 0.6,
  style,
}: {
  kind: MarkKind;
  className?: string;
  strokeWidth?: number;
  /** ink the mark in on mount (CSS only; reduced motion shows it immediately) */
  animate?: boolean;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const mark = MARKS[kind];
  return (
    <svg
      aria-hidden
      viewBox={mark.viewBox}
      preserveAspectRatio={mark.aspect}
      className={`overflow-visible ${className}`}
      style={style}
      fill="none"
    >
      <path
        d={mark.d}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={animate ? "draw-on" : undefined}
        style={animate ? ({ "--delay": `${delay}s`, "--dur": `${duration}s` } as CSSProperties) : undefined}
      />
    </svg>
  );
}

/** The red underline used by `.btn-pen` links (draws on hover via CSS). */
export function PenUnderline() {
  return (
    <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="pen-underline" fill="none">
      <path
        d={MARKS.underline.d}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
