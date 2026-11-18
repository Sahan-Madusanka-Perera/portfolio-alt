"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type GameState = "idle" | "waiting" | "ready" | "tooSoon" | "result";

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 3500;
const CANVAS_HEIGHT = 200;
const BEST_TIME_KEY = "reflex-best-ms";

const PALETTE: Record<GameState, { bg: string; text: string; sub: string }> = {
  idle: { bg: "#1c3a8f", text: "Click to test your reflexes", sub: "" },
  waiting: { bg: "#9b1c28", text: "Wait for green…", sub: "" },
  ready: { bg: "#1f7a4d", text: "Click now!", sub: "" },
  tooSoon: { bg: "#9b1c28", text: "Too soon!", sub: "Click to try again" },
  result: { bg: "#1c3a8f", text: "", sub: "Click to try again" },
};

// A reaction-time test: click, wait for the panel to turn green, click
// again as fast as you can. Unlocked by the Konami code in AboutSection.
export function EasterEggGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GameState>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  // This component only ever mounts client-side (after the Konami code
  // fires), never during SSR/hydration, so reading localStorage directly in
  // the initializer is safe — there's no server-rendered output to mismatch.
  const [bestMs, setBestMs] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(BEST_TIME_KEY);
    return stored ? Number(stored) : null;
  });
  const timeoutRef = useRef<number | undefined>(undefined);
  const readyAtRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const ctx2d = canvasEl?.getContext("2d");
    if (!canvasEl || !ctx2d) return;

    // Re-bind as non-nullable locals: TS's narrowing above doesn't carry
    // into the nested `draw` function declaration below.
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctx2d;

    function draw() {
      const width = canvas.clientWidth;
      const height = CANVAS_HEIGHT;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { bg, sub } = PALETTE[state];
      const text = state === "result" && reactionMs !== null ? `${reactionMs} ms` : PALETTE[state].text;

      const displayFace = getComputedStyle(document.documentElement).getPropertyValue("--font-inter-tight").trim() || "sans-serif";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#f3f4f6";
      ctx.font = `700 30px ${displayFace}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width / 2, sub ? height / 2 - 12 : height / 2);

      if (sub) {
        ctx.font = "400 13px system-ui, sans-serif";
        ctx.fillStyle = "rgba(243,244,246,0.7)";
        ctx.fillText(sub, width / 2, height / 2 + 16);
      }
    }

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [state, reactionMs]);

  function handleActivate() {
    if (state === "idle" || state === "tooSoon" || state === "result") {
      setReactionMs(null);
      setState("waiting");
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      timeoutRef.current = window.setTimeout(() => {
        readyAtRef.current = performance.now();
        setState("ready");
      }, delay);
      return;
    }

    if (state === "waiting") {
      window.clearTimeout(timeoutRef.current);
      setState("tooSoon");
      return;
    }

    if (state === "ready") {
      const elapsed = Math.round(performance.now() - readyAtRef.current);
      setReactionMs(elapsed);
      setState("result");
      setBestMs((previousBest) => {
        if (previousBest === null || elapsed < previousBest) {
          window.localStorage.setItem(BEST_TIME_KEY, String(elapsed));
          return elapsed;
        }
        return previousBest;
      });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  return (
    <div className="w-full max-w-md">
      <canvas
        ref={canvasRef}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Reaction time test. Click to start, then click again as soon as the panel turns green."
        className="h-[200px] w-full cursor-pointer rounded-xl border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {bestMs !== null && (
        <p className="mt-2 text-center text-[0.8125rem] text-fg-2">
          Personal best: <span className="font-mono text-accent">{bestMs} ms</span>
        </p>
      )}
    </div>
  );
}
