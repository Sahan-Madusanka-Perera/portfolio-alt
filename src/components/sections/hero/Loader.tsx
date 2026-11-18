"use client";

import { useEffect, useRef } from "react";

const MIN_MS = 650;
const MAX_MS = 1000;

function markLoaded() {
  const root = document.documentElement;
  if (root.dataset.loaded === "1") return;
  root.dataset.loaded = "1";
  window.dispatchEvent(new Event("site:loaded"));
}

// First visit of a session: a count from 000 to 100 that follows the real download of the
// portrait points and the fonts, then the curtain lifts. Never longer than a second, skipped
// by any key or click, and not shown again this session or at all under reduced motion
// (ThemeScript hides it before first paint). CSS removes it on its own if JavaScript never runs.
export function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || root.dataset.loader === "skip" || getComputedStyle(el).display === "none") {
      markLoaded();
      return;
    }
    // JavaScript takes over from the CSS timer.
    el.style.animation = "none";

    const start = performance.now();
    let portrait = 0;
    let fonts = 0;
    let shown = 0;
    let frame = 0;
    let finished = false;

    const onProgress = (event: Event) => {
      portrait = Math.max(portrait, (event as CustomEvent<number>).detail);
    };
    window.addEventListener("portrait:progress", onProgress);
    document.fonts?.ready.then(() => (fonts = 1));

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      if (countRef.current) countRef.current.textContent = "100";
      if (barRef.current) barRef.current.style.transform = "scaleX(1)";
      el.style.animation = "";
      el.dataset.state = "done";
      try {
        sessionStorage.setItem("loader-seen", "1");
      } catch {}
      markLoaded();
      window.setTimeout(() => el.setAttribute("hidden", ""), 950);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const real = portrait * 0.75 + fonts * 0.25;
      const timeFloor = Math.min(elapsed / MAX_MS, 1);
      // Never ahead of the real work by much, never stalled past the time cap.
      const target = Math.max(Math.min(real, elapsed / MIN_MS), timeFloor);
      shown += (target - shown) * 0.22;
      const value = Math.min(100, Math.round(shown * 100));
      if (countRef.current) countRef.current.textContent = String(value).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;
      if ((elapsed >= MIN_MS && real >= 0.999) || elapsed >= MAX_MS) finish();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("portrait:progress", onProgress);
      window.removeEventListener("keydown", skip);
      el.removeEventListener("pointerdown", skip);
    };
  }, []);

  return (
    <div ref={ref} className="loader" role="presentation">
      <p className="text-[0.9375rem] text-fg-2">
        Sahan Perera
        <span lang="si" className="ml-2 font-sinhala">
          සහන් පෙරේරා
        </span>
      </p>
      <p className="font-mono text-[clamp(3rem,8vw,6rem)] font-normal leading-none tracking-[-0.04em] text-fg tabular" aria-hidden>
        <span ref={countRef}>000</span>
      </p>
      <span aria-hidden className="block h-px w-40 overflow-hidden bg-line">
        <span ref={barRef} className="block h-full w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </span>
      <span className="sr-only">Loading</span>
    </div>
  );
}
