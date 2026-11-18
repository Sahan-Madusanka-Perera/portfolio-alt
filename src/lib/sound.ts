// Interface ticks, synthesised with WebAudio (no files). Off by default; the choice is kept in
// localStorage as a per-visitor convenience. Nothing plays until the visitor turns it on.

const KEY = "sound-on";
const listeners = new Set<() => void>();
let enabled: boolean | null = null;
let ctx: AudioContext | null = null;

function read() {
  if (enabled === null) {
    try {
      enabled = window.localStorage.getItem(KEY) === "1";
    } catch {
      enabled = false;
    }
  }
  return enabled;
}

export const soundStore = {
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  get: () => read(),
  getServer: () => false,
  set(on: boolean) {
    enabled = on;
    try {
      window.localStorage.setItem(KEY, on ? "1" : "0");
    } catch {}
    listeners.forEach((l) => l());
    if (on) tick("on");
  },
};

/** A short, quiet click. `kind` changes the pitch a little. */
export function tick(kind: "soft" | "on" | "select" = "soft") {
  if (!read()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(kind === "on" ? 880 : kind === "select" ? 660 : 1320, now);
    osc.frequency.exponentialRampToValueAtTime(kind === "on" ? 1320 : 440, now + 0.06);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // No audio available: stay silent.
  }
}
