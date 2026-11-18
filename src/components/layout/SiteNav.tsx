"use client";

import { CommandIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { openPalette } from "@/components/layout/CommandPalette";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { navSections, site } from "@/data/site";
import { cn } from "@/lib/cn";

// A floating glass pill. Desktop: name, five sections with a scroll-spy, ⌘K, theme, CV.
// Mobile: name, theme and a Menu button that opens the command palette (one menu, not two).
export function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { scrollTo } = useSmoothScroll();
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) return;
    const targets = navSections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [onHome]);

  function onSectionClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (!onHome) return;
    event.preventDefault();
    scrollTo(`#${id}`);
    history.replaceState(null, "", `/#${id}`);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        aria-label="Primary"
        className="glass pointer-events-auto flex h-14 w-full max-w-[1100px] items-center justify-between gap-2 rounded-full pl-5 pr-2"
      >
        <Link
          href="/"
          onClick={(event) => {
            if (onHome) {
              event.preventDefault();
              scrollTo(0, { offset: 0 });
              history.replaceState(null, "", "/");
            }
          }}
          className="flex items-baseline gap-2 whitespace-nowrap text-[0.9375rem] font-normal tracking-[-0.01em]"
        >
          {site.name}
          <span lang="si" className="hidden font-sinhala text-[0.875rem] text-fg-2 md:inline">
            {site.nameSinhala}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navSections.map((s) => (
            <li key={s.id}>
              <a
                href={`/#${s.id}`}
                onClick={(event) => onSectionClick(event, s.id)}
                aria-current={current === s.id ? "true" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center rounded-full px-4 text-[0.875rem] transition-colors duration-300",
                  current === s.id ? "text-fg" : "text-fg-2 hover:text-fg",
                )}
              >
                {s.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-opacity duration-300",
                    current === s.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-[0.875rem] text-fg-2 transition-colors hover:bg-fg/[0.07] hover:text-fg sm:inline-flex"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <CommandIcon aria-hidden size={15} />
            <span className="font-mono text-[0.8125rem]">K</span>
          </button>
          <ThemeToggle />
          <a
            href={site.cvUrl}
            target="_blank"
            rel="noopener"
            className="hidden h-10 items-center gap-2 rounded-full bg-fg pl-4 pr-3 text-[0.875rem] font-normal text-bg transition-colors hover:bg-fg/90 sm:inline-flex"
          >
            CV
            <DownloadSimpleIcon aria-hidden size={15} />
          </a>
          <button
            type="button"
            onClick={openPalette}
            className="inline-flex h-10 items-center rounded-full bg-fg px-4 text-[0.875rem] font-normal text-bg sm:hidden"
          >
            Menu
          </button>
        </div>
      </nav>
    </header>
  );
}
