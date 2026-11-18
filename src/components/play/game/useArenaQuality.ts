"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Stadium (HD) graphics: on by default for desktop pointers with WebGL2, off
// for touch, small screens and reduced motion. A visitor's explicit choice
// (the HD toggle) is remembered and wins over the default.

type Preference = "auto" | "hd" | "lite";
const STORAGE_KEY = "arena-graphics";
const listeners = new Set<() => void>();

function readPreference(): Preference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "hd" || value === "lite" ? value : "auto";
  } catch {
    return "auto";
  }
}

function subscribePreference(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

let webgl2: boolean | null = null;
function readWebGL2() {
  if (webgl2 === null) {
    try {
      webgl2 = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

const noopSubscribe = () => () => {};

export function useArenaQuality() {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => "auto" as Preference);
  const capable = useSyncExternalStore(noopSubscribe, readWebGL2, () => false);
  const desktop = useMediaQuery("(min-width: 1024px) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();

  const canHd = capable && !reduced;
  const hd = canHd && (preference === "hd" || (preference === "auto" && desktop));

  const setHd = useCallback((on: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, on ? "hd" : "lite");
    } catch {
      // storage blocked: the choice just won't persist
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { hd, canHd, setHd };
}
