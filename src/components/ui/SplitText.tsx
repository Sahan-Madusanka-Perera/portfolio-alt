"use client";

import { createElement, Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type SplitTextProps = {
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span" | "section" | "li" | "article" | "header";
  /** Plain text. Words listed in `em` are set in the serif italic. */
  text: string;
  em?: string[];
  className?: string;
  /** Milliseconds before the first word moves. */
  delay?: number;
  /** "view" plays when scrolled into view; "loaded" waits for the loader to leave. */
  when?: "view" | "loaded";
  id?: string;
};

const clean = (word: string) => word.replace(/[.,;:!?]+$/, "");

// Words rise out of their own masks one after another. Screen readers get the sentence once,
// from a visually hidden copy; the animated words are aria-hidden. The hidden start state is
// CSS behind `.js`, so the words are always readable without JavaScript and under reduced motion.
export function SplitText({ as = "p", text, em = [], className, delay = 0, when = "view", id }: SplitTextProps) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!el) return;
    const play = () => el.classList.add("is-in");

    if (when === "loaded") {
      const root = document.documentElement;
      const noLoader = root.dataset.loader === "skip" || !document.querySelector(".loader");
      if (root.dataset.loaded === "1" || noLoader) play();
      else window.addEventListener("site:loaded", play, { once: true });
      return () => window.removeEventListener("site:loaded", play);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, when]);

  const words = text.split(" ");

  return createElement(
    as,
    { ref: setEl, id, className: cn("split", className), style: { "--d": `${delay}ms` } as React.CSSProperties },
    <span className="sr-only">{text}</span>,
    <span aria-hidden>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="split-w">
            <span style={{ "--i": i } as React.CSSProperties}>{em.includes(clean(word)) ? <em>{word}</em> : word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>,
  );
}
