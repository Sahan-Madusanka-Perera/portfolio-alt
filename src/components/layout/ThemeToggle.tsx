"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";

type DocWithTransition = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

// Switches theme. Where the browser has view transitions, the new theme opens as a circle from
// the button; elsewhere, and under reduced motion, it simply swaps.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    const doc = document as DocWithTransition;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced) {
      toggleTheme();
      return;
    }
    const x = event.clientX || window.innerWidth - 40;
    const y = event.clientY || 32;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = doc.startViewTransition(() => toggleTheme());
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      data-cursor="link"
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full text-fg transition-colors duration-300 hover:bg-fg/[0.07]",
        className,
      )}
    >
      {/* Both icons render on the server; CSS picks one so there is no hydration flash. */}
      <SunIcon aria-hidden size={18} className="hidden light:block" />
      <MoonIcon aria-hidden size={18} className="block light:hidden" />
    </button>
  );
}
