"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const COLS = 40;
const ROWS = 25;
const TOTAL = COLS * ROWS; // 1000 already-correct sentences
const CHANGED = 14; // 98.6% left alone

// Deterministic scatter so the server and client agree on which dots change.
const changed = (() => {
  const picked = new Set<number>();
  // mulberry32: a small hash with good low bits, so the picks scatter instead of lining up.
  let seed = 20260617;
  const next = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  while (picked.size < CHANGED) picked.add(Math.floor(next() * TOTAL));
  return picked;
})();
const order = [...changed];

// 1000 correct sentences as dots: 986 stay quiet, 14 light up as the ones SinGECToR changed.
// The changed dots light one after another when the figure scrolls into view.
export function DoNoHarmDots() {
  const [el, setEl] = useState<SVGSVGElement | null>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return (
    <figure className="space-y-5">
      <svg
        ref={setEl}
        viewBox={`0 0 ${COLS * 12} ${ROWS * 12}`}
        className="h-auto w-full"
        role="img"
        aria-label="1000 dots, one per correct sentence. 986 are left unchanged; 14 are highlighted as the ones the model changed."
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const isChanged = changed.has(i);
          return (
            <circle
              key={i}
              cx={(i % COLS) * 12 + 6}
              cy={Math.floor(i / COLS) * 12 + 6}
              r={isChanged && lit ? 4.2 : 2.6}
              className={cn(
                "transition-[fill,r] duration-700",
                isChanged && lit ? "fill-accent" : "fill-fg/25",
              )}
              style={isChanged ? { transitionDelay: `${0.3 + order.indexOf(i) * 0.09}s` } : undefined}
            />
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.875rem] text-fg-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-fg/25" />
          986 correct sentences left alone
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          14 changed
        </span>
      </figcaption>
    </figure>
  );
}
