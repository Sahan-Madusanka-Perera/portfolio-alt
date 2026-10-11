// Shared look-and-feel + dimensions for the football minigames. Kept in one
// place so the penalty and match scenes read as the same little world.

export type Kit = {
  jersey: string;
  shorts: string;
  socks: string;
  skin: string;
  hair: string;
  boots: string;
};

const SKIN_TONES = ["#f2c9a0", "#e0a878", "#c68642", "#8d5524"];
const HAIR_TONES = ["#1f2937", "#3b2417", "#6b4423", "#0f0f0f", "#4b5563"];

// Deterministic per-index skin/hair so a given squad slot always looks the
// same across re-renders (no Math.random at module scope → no hydration/SSR
// surprises; these scenes are client-only anyway).
export function skinFor(index: number) {
  return SKIN_TONES[index % SKIN_TONES.length];
}
export function hairFor(index: number) {
  return HAIR_TONES[(index * 3 + 1) % HAIR_TONES.length];
}

// Home = Sahan's side in ballpoint blue; away wear the red pen, so the match
// plays out in the site's two inks. Keeper wears a high-vis amber that pops
// against both kits and the pitch.
export const HOME_KIT: Kit = {
  jersey: "#2447b8",
  shorts: "#f8fafc",
  socks: "#1c3a8f",
  skin: SKIN_TONES[0],
  hair: HAIR_TONES[0],
  boots: "#0f172a",
};

export const AWAY_KIT: Kit = {
  jersey: "#c81e2d",
  shorts: "#1b2130",
  socks: "#c81e2d",
  skin: SKIN_TONES[2],
  hair: HAIR_TONES[1],
  boots: "#f8fafc",
};

export const KEEPER_KIT: Kit = {
  jersey: "#f59e0b",
  shorts: "#1f2937",
  socks: "#d97706",
  skin: SKIN_TONES[1],
  hair: HAIR_TONES[2],
  boots: "#0f172a",
};

export const GLOVE_COLOR = "#f8fafc";

// Pitch palette — two mown-stripe greens plus line white.
export const GRASS_LIGHT = "#2f9e44";
export const GRASS_DARK = "#268a3b";
export const LINE_COLOR = "#f8fafc";
export const SKY_COLOR = "#0b3d1f";

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
