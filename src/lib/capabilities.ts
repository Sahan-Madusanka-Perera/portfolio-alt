// What the device can afford. Read once, client side only.

let webgl2Cache: boolean | null = null;
let softwareCache = false;

// One probe context answers both questions, then is released.
function probe() {
  if (webgl2Cache !== null) return;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl2Cache = Boolean(gl);
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      softwareCache = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl2Cache = false;
  }
}

export function hasWebGL2() {
  probe();
  return Boolean(webgl2Cache);
}

/** WebGL drawn by the CPU (no GPU, or a blocklisted driver): too slow for 20k live particles. */
export function isSoftwareWebGL() {
  probe();
  return softwareCache;
}

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

/** True when the full 3D portrait should not run: no WebGL2, data saver, or a weak device. */
export function prefersStaticHero() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (!hasWebGL2() || isSoftwareWebGL()) return true;
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
