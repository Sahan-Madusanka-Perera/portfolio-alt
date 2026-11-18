"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "@/lib/gsap";

type ScrollTarget = string | HTMLElement | number;
type ScrollToOptions = { offset?: number; duration?: number; immediate?: boolean };
type ScrollContextValue = {
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  setScrollLocked: (locked: boolean) => void;
  /** Current scroll velocity in px per frame (0 without Lenis). */
  velocity: () => number;
};

function fallbackScrollTo(target: ScrollTarget, behavior: ScrollBehavior, offset = 0) {
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: (target) => fallbackScrollTo(target, "smooth"),
  setScrollLocked: () => {},
  velocity: () => 0,
});

export const useSmoothScroll = () => useContext(ScrollContext);

// Lenis smooth scroll, ticked by GSAP's ticker and feeding ScrollTrigger, so pinned and scrubbed
// scenes stay in sync. Both load after first paint. Under reduced motion, native scroll only.
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: LenisConstructor }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (cancelled) return;

      const lenis = new LenisConstructor({ duration: 1.1, smoothWheel: true, anchors: false });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  const scrollTo = useCallback(
    (target: ScrollTarget, options?: ScrollToOptions) => {
      const lenis = lenisRef.current;
      const offset = options?.offset ?? -72;
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: options?.duration ?? 1.2, immediate: options?.immediate });
        return;
      }
      fallbackScrollTo(target, reduced || options?.immediate ? "auto" : "smooth", offset);
    },
    [reduced],
  );

  const setScrollLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  const velocity = useCallback(() => lenisRef.current?.velocity ?? 0, []);

  return <ScrollContext.Provider value={{ scrollTo, setScrollLocked, velocity }}>{children}</ScrollContext.Provider>;
}
