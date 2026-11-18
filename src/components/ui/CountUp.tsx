"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number };

const format = (n: number, decimals: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// Counts from zero to `to` the first time it is seen. The server renders the final value, so it is
// right without JavaScript, for crawlers and under reduced motion; screen readers always get the
// final value (the moving digits are aria-hidden).
export function CountUp({ to, decimals = 0, prefix = "", suffix = "", duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen
    let frame = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          setValue(to * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    // Start from zero only once we know it will animate in.
    frame = requestAnimationFrame(() => setValue(0));
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  const final = `${prefix}${format(to, decimals)}${suffix}`;
  return (
    <span ref={ref} className="tabular">
      <span className="sr-only">{final}</span>
      <span aria-hidden>
        {prefix}
        {format(value, decimals)}
        {suffix}
      </span>
    </span>
  );
}
