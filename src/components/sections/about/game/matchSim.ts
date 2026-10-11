"use client";

import { useCallback, useEffect, useRef } from "react";
import { MatchEngine, type MatchInput, type Team } from "./matchEngine";

export { BALL_R, MATCH, SQUAD_TEAMS, WIN_SCORE } from "./matchEngine";
export type { Entity, Team } from "./matchEngine";

// React glue for the 3v3: owns one MatchEngine per mounted scene and feeds it
// the keyboard. Keys: WASD / arrows move, Shift sprints, Space shoots (hold to
// power up), E passes, Q switches player.

const MOVE_KEYS = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"]);

function useKeyboard() {
  const keys = useRef<Set<string>>(new Set());
  const pass = useRef(false);
  const swap = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (MOVE_KEYS.has(k)) {
        keys.current.add(k);
        e.preventDefault();
      } else if (k === " " || k === "spacebar") {
        keys.current.add("space");
        e.preventDefault();
      } else if (k === "shift") {
        keys.current.add("shift");
      } else if (k === "e" && !e.repeat) {
        pass.current = true;
      } else if (k === "q" && !e.repeat) {
        swap.current = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current.delete(k === " " || k === "spacebar" ? "space" : k);
    };
    // a key released while the window is in the background would otherwise stick
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return useCallback((): MatchInput => {
    const held = keys.current;
    const x = (held.has("arrowright") || held.has("d") ? 1 : 0) - (held.has("arrowleft") || held.has("a") ? 1 : 0);
    const z = (held.has("arrowdown") || held.has("s") ? 1 : 0) - (held.has("arrowup") || held.has("w") ? 1 : 0);
    const input: MatchInput = {
      x,
      z,
      sprint: held.has("shift"),
      kickHeld: held.has("space"),
      pass: pass.current,
      swap: swap.current,
    };
    pass.current = false;
    swap.current = false;
    return input;
  }, []);
}

export function useMatchSim({
  paused,
  onGoal,
  resetToken,
}: {
  paused: boolean;
  onGoal: (team: Team) => void;
  resetToken: number;
}) {
  const readInput = useKeyboard();
  const engine = useRef<MatchEngine | null>(null);
  if (engine.current == null) {
    engine.current = new MatchEngine();
  }

  useEffect(() => {
    engine.current!.reset();
  }, [resetToken]);

  const step = useCallback(
    (dt: number) => {
      const scored = engine.current!.step(dt, readInput(), paused);
      if (scored) onGoal(scored);
    },
    [readInput, paused, onGoal]
  );

  return { engine, step };
}
