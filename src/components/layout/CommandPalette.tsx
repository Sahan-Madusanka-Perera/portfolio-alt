"use client";

import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CircleHalfIcon,
  CopyIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  HashIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
  type Icon,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { flagships } from "@/data/projects";
import { allSections, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { tick } from "@/lib/sound";

type Item = {
  id: string;
  group: "Go to" | "Case studies" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  icon: Icon;
  run: () => void;
};

/** Open the palette from anywhere (the nav's Menu and ⌘K buttons dispatch this). */
export const openPalette = () => window.dispatchEvent(new Event("palette:open"));

// ⌘K / Ctrl+K command palette: every section, every case study and the useful actions, reachable
// from the keyboard. Arrow keys move, Enter runs, Escape closes (native <dialog> handles focus).
export function CommandPalette() {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { scrollTo, setScrollLocked } = useSmoothScroll();
  const { theme, toggleTheme } = useTheme();
  const listId = useId();

  const close = useCallback(() => dialog?.close(), [dialog]);

  const open = useCallback(() => {
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    setNotice("");
    dialog.showModal();
    setScrollLocked(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [dialog, setScrollLocked]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", open);
    };
  }, [dialog, open, close]);

  const goToSection = useCallback(
    (id: string) => {
      close();
      if (pathname === "/") {
        if (id === "top") scrollTo(0, { offset: 0 });
        else scrollTo(`#${id}`);
        history.replaceState(null, "", id === "top" ? "/" : `/#${id}`);
      } else {
        router.push(id === "top" ? "/" : `/#${id}`);
      }
    },
    [close, pathname, router, scrollTo],
  );

  const items = useMemo<Item[]>(() => {
    const external = (href: string) => () => {
      close();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    return [
      ...allSections.map<Item>((s) => ({
        id: `s-${s.id}`,
        group: "Go to",
        label: s.label,
        icon: HashIcon,
        run: () => goToSection(s.id),
      })),
      ...flagships.map<Item>((p) => ({
        id: `p-${p.slug}`,
        group: "Case studies",
        label: p.title,
        hint: p.kind,
        keywords: p.stack.join(" "),
        icon: ArrowRightIcon,
        run: () => {
          close();
          router.push(`/work/${p.slug}`);
        },
      })),
      {
        id: "a-copy",
        group: "Actions",
        label: "Copy email address",
        hint: site.email,
        keywords: "mail contact",
        icon: CopyIcon,
        run: async () => {
          try {
            await navigator.clipboard.writeText(site.email);
            setNotice("Email copied to the clipboard.");
          } catch {
            setNotice(site.email);
          }
          window.setTimeout(close, 900);
        },
      },
      {
        id: "a-mail",
        group: "Actions",
        label: "Write an email",
        keywords: "contact mail hire",
        icon: EnvelopeSimpleIcon,
        run: () => {
          close();
          window.location.href = `mailto:${site.email}`;
        },
      },
      {
        id: "a-cv",
        group: "Actions",
        label: "Download CV (PDF)",
        keywords: "resume curriculum vitae",
        icon: DownloadSimpleIcon,
        run: () => {
          close();
          window.open(site.cvUrl, "_blank", "noopener");
        },
      },
      {
        id: "a-theme",
        group: "Actions",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        keywords: "theme dark light mode colour",
        icon: CircleHalfIcon,
        run: () => {
          toggleTheme();
          close();
        },
      },
      { id: "a-gh", group: "Actions", label: "GitHub", hint: site.githubHandle, keywords: "code source", icon: GithubLogoIcon, run: external(site.githubUrl) },
      { id: "a-li", group: "Actions", label: "LinkedIn", keywords: "profile", icon: LinkedinLogoIcon, run: external(site.linkedinUrl) },
    ];
  }, [close, goToSection, router, theme, toggleTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.group}`.toLowerCase().includes(q));
  }, [items, query]);

  const safeActive = Math.min(active, Math.max(filtered.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${safeActive}"]`)?.scrollIntoView({ block: "nearest" });
  }, [safeActive]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((safeActive + 1) % Math.max(filtered.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((safeActive - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      tick("select");
      filtered[safeActive]?.run();
    }
  }

  let lastGroup = "";

  return (
    <dialog
      ref={setDialog}
      className="palette"
      aria-label="Command menu"
      onClose={() => setScrollLocked(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-5">
        <MagnifyingGlassIcon aria-hidden size={18} className="shrink-0 text-fg-2" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section, a project or an action"
          aria-label="Search commands"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={filtered[safeActive] ? `${listId}-${filtered[safeActive].id}` : undefined}
          className="h-16 w-full bg-transparent text-[1rem] text-fg outline-none placeholder:text-fg-2"
        />
        <kbd className="hidden shrink-0 rounded-[6px] px-2 py-1 font-mono text-[0.8125rem] text-fg-2 ring-1 ring-line-2 sm:block">esc</kbd>
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label="Commands" className="max-h-[min(52vh,440px)] overflow-y-auto overscroll-contain p-2">
        {filtered.length === 0 && <p className="px-4 py-10 text-center text-[0.875rem] text-fg-2">Nothing matches “{query}”.</p>}
        {filtered.map((item, index) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          const Glyph = item.icon;
          const isExternal = item.id === "a-gh" || item.id === "a-li";
          return (
            <div key={item.id}>
              {showGroup && <p className="px-3 pb-1.5 pt-3 font-mono text-[0.8125rem] text-fg-2">{item.group}</p>}
              <div
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={index === safeActive}
                data-index={index}
                onPointerMove={() => setActive(index)}
                onClick={() => {
                  tick("select");
                  item.run();
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-[0.9375rem] transition-colors duration-150",
                  index === safeActive ? "bg-fg/[0.07] text-fg" : "text-fg-2",
                )}
              >
                <Glyph aria-hidden size={17} className={index === safeActive ? "text-accent" : ""} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint && <span className="hidden truncate font-mono text-[0.8125rem] text-fg-2 sm:block">{item.hint}</span>}
                {isExternal && <ArrowUpRightIcon aria-hidden size={14} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 font-mono text-[0.8125rem] text-fg-2">
        <span aria-live="polite">{notice || "↑ ↓ to move, enter to run"}</span>
        <span className="hidden sm:block">⌘K anywhere</span>
      </div>
    </dialog>
  );
}
