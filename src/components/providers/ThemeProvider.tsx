"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Modeled as a tiny external store (rather than useState) so reads go
// through useSyncExternalStore: no effect+setState needed, and it resolves
// the SSR-vs-localStorage mismatch the way React intends, without a flash.
const listeners = new Set<() => void>();
let currentTheme: Theme = "light";
let hasReadStorage = false;

function applyToDocument(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
  if (!hasReadStorage) {
    hasReadStorage = true;
    const stored = window.localStorage.getItem("theme");
    currentTheme = stored === "dark" ? "dark" : "light";
  }
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "light";
}

function setTheme(theme: Theme) {
  currentTheme = theme;
  window.localStorage.setItem("theme", theme);
  applyToDocument(theme);
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
