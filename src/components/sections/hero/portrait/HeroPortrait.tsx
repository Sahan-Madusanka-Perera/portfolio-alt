"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { prefersStaticHero } from "@/lib/capabilities";
import { cn } from "@/lib/cn";
import { loadPortrait, portraitUrl, type PortraitData } from "./data";
import type { PortraitGL, PortraitTheme } from "./PortraitGL";
import { drawStaticPortrait } from "./staticPortrait";

const themes: Record<"dark" | "light", PortraitTheme> = {
  dark: { ink: [0.925, 0.914, 0.886], accent: [0.541, 0.635, 1], additive: true },
  light: { ink: [0.078, 0.078, 0.075], accent: [0.169, 0.275, 0.788], additive: false },
};

/** Hand mode (and anything else) can steer the portrait through this event, in viewport pixels. */
export type PortraitPointerDetail = { clientX: number; clientY: number; strength: number } | null;
export const PORTRAIT_POINTER_EVENT = "portrait:pointer";

// The hero's particle portrait. Chooses between the live WebGL2 scene and the still 2D canvas,
// loads the right point set for the screen, follows the pointer, dissolves on scroll and stops
// drawing whenever it is off screen or the tab is hidden.
export function HeroPortrait({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<PortraitGL | null>(null);
  const dataRef = useRef<PortraitData | null>(null);
  const modeRef = useRef<"gl" | "static" | null>(null);
  const [mode, setMode] = useState<"gl" | "static" | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const still = stillRef.current;
    if (!wrap || !canvas || !still) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    const isStatic = prefersStaticHero();
    const small = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const reportProgress = (p: number) => window.dispatchEvent(new CustomEvent("portrait:progress", { detail: p }));

    const size = () => {
      const rect = wrap.getBoundingClientRect();
      return { w: rect.width, h: rect.height, dpr: window.devicePixelRatio || 1 };
    };

    const drawStill = () => {
      const data = dataRef.current;
      if (!data) return;
      const { w, h, dpr } = size();
      drawStaticPortrait(still, data, themes[themeRef.current], w, h, dpr);
    };

    (async () => {
      let data: PortraitData;
      try {
        data = await loadPortrait(portraitUrl(isStatic || small), reportProgress);
      } catch {
        reportProgress(1);
        return;
      }
      if (disposed) return;
      dataRef.current = data;

      if (!isStatic) {
        try {
          const { PortraitGL } = await import("./PortraitGL");
          if (disposed) return;
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const gl = new PortraitGL(canvas, data, { theme: themes[themeRef.current], reduced });
          glRef.current = gl;
          modeRef.current = "gl";
        } catch {
          modeRef.current = "static";
        }
      } else {
        modeRef.current = "static";
      }

      const { w, h, dpr } = size();
      if (modeRef.current === "gl" && glRef.current) {
        glRef.current.resize(w, h, dpr);
        const startAssemble = () => glRef.current?.assemble(80);
        if (document.documentElement.dataset.loaded === "1" || document.documentElement.dataset.loader === "skip") startAssemble();
        else window.addEventListener("site:loaded", startAssemble, { once: true });
        cleanups.push(() => window.removeEventListener("site:loaded", startAssemble));
      } else {
        drawStill();
      }
      setMode(modeRef.current);

      // Resize
      const ro = new ResizeObserver(() => {
        const s = size();
        if (modeRef.current === "gl") glRef.current?.resize(s.w, s.h, s.dpr);
        else drawStill();
      });
      ro.observe(wrap);
      cleanups.push(() => ro.disconnect());

      if (modeRef.current !== "gl") return;
      const gl = glRef.current!;

      // Draw only while on screen and the tab is visible.
      let onScreen = true;
      const sync = () => (onScreen && !document.hidden ? gl.play() : gl.pause());
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      io.observe(wrap);
      document.addEventListener("visibilitychange", sync);
      cleanups.push(() => {
        io.disconnect();
        document.removeEventListener("visibilitychange", sync);
      });
      sync();

      // Pointer (mouse, pen and touch) mapped into the canvas.
      const onPointer = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        const inside = Math.abs(x) < 1.25 && Math.abs(y) < 1.25;
        if (inside) gl.setPointer(x, y, event.pointerType === "touch" ? 1.2 : 1);
        else gl.releasePointer();
      };
      const onLeave = () => gl.releasePointer();
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      const onUp = (event: PointerEvent) => event.pointerType === "touch" && onLeave();
      window.addEventListener("pointerup", onUp, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerdown", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });

      // External steering, e.g. the visitor's hand.
      const onExternal = (event: Event) => {
        const detail = (event as CustomEvent<PortraitPointerDetail>).detail;
        if (!detail) return gl.releasePointer();
        const rect = canvas.getBoundingClientRect();
        const x = ((detail.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((detail.clientY - rect.top) / rect.height) * 2 - 1);
        if (Math.abs(x) < 1.25 && Math.abs(y) < 1.25) gl.setPointer(x, y, detail.strength);
        else gl.releasePointer();
      };
      window.addEventListener(PORTRAIT_POINTER_EVENT, onExternal);
      cleanups.push(() => window.removeEventListener(PORTRAIT_POINTER_EVENT, onExternal));

      // Scroll: dissolve as the hero leaves.
      const onScroll = () => {
        const rect = wrap.getBoundingClientRect();
        gl.setScroll(-rect.top / Math.max(rect.height * 0.9, 1));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
      onScroll();

      // GPU reset: fall back to the still.
      const onLost = (event: Event) => {
        event.preventDefault();
        gl.pause();
        modeRef.current = "static";
        setMode("static");
        drawStill();
      };
      canvas.addEventListener("webglcontextlost", onLost);
      cleanups.push(() => canvas.removeEventListener("webglcontextlost", onLost));
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
      glRef.current?.destroy();
      glRef.current = null;
    };
  }, []);

  // Theme follows the page.
  useEffect(() => {
    themeRef.current = theme;
    if (modeRef.current === "gl") glRef.current?.setTheme(themes[theme]);
    else if (modeRef.current === "static" && dataRef.current && stillRef.current && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      drawStaticPortrait(stillRef.current, dataRef.current, themes[theme], rect.width, rect.height, window.devicePixelRatio || 1);
    }
  }, [theme]);

  return (
    <div ref={wrapRef} className={className ?? "relative"} aria-hidden>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", mode === "gl" ? "opacity-100" : "opacity-0")}
      />
      <canvas
        ref={stillRef}
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", mode === "static" ? "opacity-100" : "opacity-0")}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/me/portrait-poster-dark.webp" alt="" className="absolute inset-0 h-full w-full object-contain" />
      </noscript>
    </div>
  );
}
