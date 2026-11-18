"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

// A tiny external store read through useSyncExternalStore: the server renders dark, and the
// client picks up what ThemeScript already applied to <html>, without a flash.
const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // storage blocked: the choice lasts for this page only
  }
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
  const setTheme = useCallback((next: Theme) => writeTheme(next), []);
  const toggleTheme = useCallback(() => writeTheme(readTheme() === "dark" ? "light" : "dark"), []);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
