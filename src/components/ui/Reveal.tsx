"use client";

import { createElement, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span" | "section" | "li" | "article" | "header";
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  [key: string]: unknown;
};

// A heavy fade-up as the element enters the viewport. The hidden start state lives in CSS and
// only applies once ThemeScript has marked <html class="js">, so without JavaScript (or before
// hydration fails) the content is simply visible.
export function Reveal({ as = "div", children, className, delay = 0, ...rest }: RevealProps) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return createElement(
    as,
    { ref: setEl, "data-reveal": "", className: cn(className), style: { transitionDelay: delay ? `${delay}s` : undefined }, ...rest },
    children,
  );
}
