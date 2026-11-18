// What the device can afford. Read once, client side only.

let webgl2Cache: boolean | null = null;

export function hasWebGL2() {
  if (webgl2Cache !== null) return webgl2Cache;
  try {
    const canvas = document.createElement("canvas");
    webgl2Cache = Boolean(canvas.getContext("webgl2"));
  } catch {
    webgl2Cache = false;
  }
  return webgl2Cache;
}

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

/** True when the full 3D portrait should not run: no WebGL2, data saver, or a weak device. */
export function prefersStaticHero() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (!hasWebGL2()) return true;
  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return true;
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return true;
  if ((nav.hardwareConcurrency ?? 8) < 4) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return true;
  return false;
}

export function isFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}
