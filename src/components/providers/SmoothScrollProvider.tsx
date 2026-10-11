"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type ScrollTarget = string | HTMLElement | number;
type ScrollToOptions = { offset?: number; duration?: number };
type ScrollContextValue = {
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  setScrollLocked: (locked: boolean) => void;
};

function fallbackScrollTo(target: ScrollTarget, behavior: ScrollBehavior) {
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior, block: "start" });
}

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: (target) => fallbackScrollTo(target, "smooth"),
  setScrollLocked: () => {},
});

export function useScrollTo() {
  return useContext(ScrollContext).scrollTo;
}

// Pauses/resumes Lenis (e.g. while a modal is open). When Lenis isn't
// running (reduced motion), callers should also fall back to
// `document.body.style.overflow = "hidden"`, which this doesn't touch.
export function useScrollLock() {
  return useContext(ScrollContext).setScrollLocked;
}

// Wires Lenis smooth-scroll into GSAP's ticker + ScrollTrigger so future
// scroll-scrubbed reveals stay in sync. Both libraries are dynamically
// imported on mount to keep them out of the initial bundle, and the whole
// thing is skipped under prefers-reduced-motion in favor of native scroll.
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: LenisConstructor }, gsapModule, scrollTriggerModule] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new LenisConstructor({ duration: 1.1, smoothWheel: true });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

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
  }, [prefersReducedMotion]);

  const scrollTo = useCallback(
    (target: ScrollTarget, options?: ScrollToOptions) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset: options?.offset ?? 0, duration: options?.duration ?? 1.2 });
        return;
      }
      fallbackScrollTo(target, prefersReducedMotion ? "auto" : "smooth");
    },
    [prefersReducedMotion]
  );

  const setScrollLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, []);

  return <ScrollContext.Provider value={{ scrollTo, setScrollLocked }}>{children}</ScrollContext.Provider>;
}
