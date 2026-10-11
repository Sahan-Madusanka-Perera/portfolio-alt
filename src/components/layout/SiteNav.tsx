"use client";

import { useEffect, useState } from "react";
import { useScrollTo } from "@/components/providers/SmoothScrollProvider";
import { NAV_SCROLL_OFFSET } from "@/lib/scroll";
import { site } from "@/data/site";
import { Scribble } from "@/components/ui/Scribble";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { id: "work", label: "Work" },
  { id: "research", label: "Research" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

// The book's name label, then the contents. The section you're reading gets a
// red tick, the way a teacher marks a finished exercise.
export function SiteNav() {
  const scrollTo = useScrollTo();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const sections = ["hero", ...NAV_ITEMS.map((item) => item.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) setActiveId(mostVisible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <nav aria-label="Primary" className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6">
        <button
          type="button"
          data-cursor="link"
          onClick={() => scrollTo("#hero")}
          aria-label="Sahan Perera — back to top"
          className="group flex h-11 shrink-0 items-stretch overflow-hidden rounded-[5px] border-[1.5px] border-ink/70 bg-sheet text-left"
        >
          <span className="hidden items-center border-r-[1.5px] border-ink/70 px-2 font-display text-sm font-semibold uppercase leading-none tracking-[0.08em] text-muted sm:flex">
            Name
          </span>
          <span className="flex items-center px-2.5 pt-1 font-hand text-lg leading-none text-ink transition-transform duration-300 group-hover:-rotate-2 sm:px-3 sm:text-xl">
            <span className="sm:hidden">S. Perera</span>
            <span className="hidden sm:inline">{site.name}</span>
          </span>
        </button>

        <ul className="flex items-center gap-0.5 sm:gap-2" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={() => scrollTo(`#${item.id}`, { offset: NAV_SCROLL_OFFSET })}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative flex h-11 items-center px-1.5 font-display text-base font-semibold transition-colors sm:px-3 sm:text-lg ${
                    isActive ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <Scribble
                      key={item.id}
                      kind="tick"
                      duration={0.35}
                      className="absolute -left-1 top-0.5 h-3 w-3 text-pen sm:-left-2.5 sm:top-2 sm:h-4 sm:w-4"
                      strokeWidth={2.75}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            className="hidden h-11 items-center font-display text-lg font-semibold text-pen underline decoration-2 underline-offset-4 md:flex"
          >
            CV
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
