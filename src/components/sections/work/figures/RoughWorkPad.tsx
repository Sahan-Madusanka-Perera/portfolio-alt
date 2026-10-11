"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Eraser, MoveHorizontal, Sparkles } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

type Point = [number, number]; // normalised 0..1
type Stroke = Point[];

const STORAGE_KEY = "roughwork-strokes-v1";
const PROC_WIDTH = 520;
const MAX_STROKES = 80;

// A loose five-point star and a swoosh, the doodle you'd leave while thinking.
function exampleStrokes(): Stroke[] {
  const star: Stroke = [];
  for (let k = 0; k < 5; k++) {
    const a0 = -Math.PI / 2 + ((k * 4) / 5) * Math.PI;
    const a1 = -Math.PI / 2 + (((k + 1) * 4) / 5) * Math.PI;
    for (let t = 0; t <= 1; t += 0.1) {
      const a = [0.5 + 0.2 * Math.cos(a0), 0.44 + 0.27 * Math.sin(a0)];
      const b = [0.5 + 0.2 * Math.cos(a1), 0.44 + 0.27 * Math.sin(a1)];
      star.push([a[0] + (b[0] - a[0]) * t + Math.sin(k + t * 3) * 0.004, a[1] + (b[1] - a[1]) * t]);
    }
  }
  const swoosh: Stroke = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    return [0.24 + t * 0.52, 0.86 - Math.sin(t * Math.PI) * 0.035 + t * 0.02];
  });
  return [star, swoosh];
}

function loadStrokes(): Stroke[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Stroke[];
    }
  } catch {
    // storage blocked or corrupt: fall through to the example
  }
  return exampleStrokes();
}

function cssColor(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#1c3a8f";
  const hex = value.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return { css: value, r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}

// Fig: HoloDraw's idea on paper. You draw with the pointer (standing in for a
// tracked hand); a Sobel pass over the stroke's alpha computes an edge map in
// the browser. A divider compares (a) input with (b) edges.
export function RoughWorkPad() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLCanvasElement | null>(null);
  const edgeRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const frameRef = useRef(0);
  const [split, setSplit] = useState(0.5);
  const splitRef = useRef(0.5);
  const [touched, setTouched] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const input = inputRef.current;
    const edge = edgeRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !input || !edge || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const sx = splitRef.current * w;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, sx, h);
    ctx.clip();
    ctx.drawImage(input, 0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, 0, w - sx, h);
    ctx.clip();
    ctx.drawImage(edge, 0, 0, w, h);
    ctx.restore();
  }, []);

  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.clientWidth === 0) return;
    const pw = PROC_WIDTH;
    const ph = Math.max(1, Math.round((PROC_WIDTH * canvas.clientHeight) / canvas.clientWidth));
    const input = (inputRef.current ??= document.createElement("canvas"));
    const edge = (edgeRef.current ??= document.createElement("canvas"));
    input.width = edge.width = pw;
    input.height = edge.height = ph;
    const ictx = input.getContext("2d", { willReadFrequently: true });
    const ectx = edge.getContext("2d");
    if (!ictx || !ectx) return;

    const graphite = cssColor("--muted");
    const ink = cssColor("--ink");
    ictx.clearRect(0, 0, pw, ph);
    ictx.strokeStyle = graphite.css;
    ictx.fillStyle = graphite.css;
    ictx.lineWidth = pw * 0.034;
    ictx.lineCap = "round";
    ictx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.length === 0) continue;
      ictx.beginPath();
      ictx.moveTo(stroke[0][0] * pw, stroke[0][1] * ph);
      if (stroke.length === 1) ictx.lineTo(stroke[0][0] * pw + 0.1, stroke[0][1] * ph);
      for (let i = 1; i < stroke.length; i++) ictx.lineTo(stroke[i][0] * pw, stroke[i][1] * ph);
      ictx.stroke();
    }

    const src = ictx.getImageData(0, 0, pw, ph).data;
    const out = ectx.createImageData(pw, ph);
    const o = out.data;
    const a = (x: number, y: number) => src[(y * pw + x) * 4 + 3];
    for (let y = 1; y < ph - 1; y++) {
      for (let x = 1; x < pw - 1; x++) {
        const gx = -a(x - 1, y - 1) - 2 * a(x - 1, y) - a(x - 1, y + 1) + a(x + 1, y - 1) + 2 * a(x + 1, y) + a(x + 1, y + 1);
        const gy = -a(x - 1, y - 1) - 2 * a(x, y - 1) - a(x + 1, y - 1) + a(x - 1, y + 1) + 2 * a(x, y + 1) + a(x + 1, y + 1);
        const mag = Math.min(255, Math.hypot(gx, gy) * 0.85);
        if (mag < 24) continue;
        const i = (y * pw + x) * 4;
        o[i] = ink.r;
        o[i + 1] = ink.g;
        o[i + 2] = ink.b;
        o[i + 3] = mag;
      }
    }
    ectx.putImageData(out, 0, 0);
    render();
  }, [render]);

  const scheduleRebuild = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      rebuild();
    });
  }, [rebuild]);

  useEffect(() => {
    strokesRef.current = loadStrokes();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(rebuild);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [rebuild]);

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(strokesRef.current));
    } catch {
      // private mode: the drawing just won't survive a reload
    }
  }

  function toPoint(event: PointerEvent<HTMLElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    ];
  }

  function handleDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setTouched(true);
    strokesRef.current.push([toPoint(event)]);
    if (strokesRef.current.length > MAX_STROKES) strokesRef.current.shift();
    scheduleRebuild();
  }

  function handleMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const next = toPoint(event);
    const last = stroke[stroke.length - 1];
    if (Math.hypot(next[0] - last[0], next[1] - last[1]) < 0.004) return;
    stroke.push(next);
    scheduleRebuild();
  }

  function handleUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    persist();
  }

  function setSplitValue(value: number) {
    const clamped = Math.min(0.95, Math.max(0.05, value));
    splitRef.current = clamped;
    setSplit(clamped);
    render();
  }

  function handleSliderDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.buttons !== 1 && event.type !== "pointerdown") return;
    if (event.type === "pointerdown") event.currentTarget.setPointerCapture(event.pointerId);
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setSplitValue((event.clientX - rect.left) / rect.width);
  }

  function handleSliderKey(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowUp: 0.05 };
    if (event.key in steps) {
      event.preventDefault();
      setSplitValue(splitRef.current + steps[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setSplitValue(event.key === "Home" ? 0.05 : 0.95);
    }
  }

  function clearPage() {
    strokesRef.current = [];
    persist();
    rebuild();
  }

  function restoreExample() {
    strokesRef.current = exampleStrokes();
    persist();
    rebuild();
  }

  return (
    <figure className="flex h-full flex-col">
      <div
        ref={wrapRef}
        className="relative min-h-[15rem] flex-1 overflow-hidden rounded-[3px] border border-rule bg-sheet"
        style={{
          backgroundImage:
            "linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)",
          backgroundSize: "1.25rem 1.25rem",
        }}
      >
        <canvas
          ref={canvasRef}
          data-draw-surface
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          aria-label="Drawing pad. Draw with your pointer; the right side shows the edge map computed from your strokes."
          role="img"
          className="absolute inset-0 h-full w-full touch-none"
        />

        <span className="pointer-events-none absolute left-2 top-1.5 font-hand text-base text-muted">(a) your stroke</span>
        <span className="pointer-events-none absolute right-2 top-1.5 font-hand text-base text-ink">(b) edge map</span>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare input and edge map"
          aria-valuemin={5}
          aria-valuemax={95}
          aria-valuenow={Math.round(split * 100)}
          aria-valuetext={`${Math.round(split * 100)}% input`}
          data-cursor="link"
          onPointerDown={handleSliderDrag}
          onPointerMove={handleSliderDrag}
          onKeyDown={handleSliderKey}
          className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-ew-resize touch-none"
          style={{ left: `${split * 100}%` }}
        >
          <span className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-pen" />
          <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pen bg-sheet text-pen">
            <MoveHorizontal className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        <p className={`flex items-center gap-1 font-hand text-lg font-bold text-pen transition-opacity ${touched ? "opacity-0" : ""}`} aria-hidden>
          <Scribble kind="arrow" animate={false} className="h-5 w-8 -scale-x-100 rotate-180" strokeWidth={2} />
          draw on the grid
        </p>
        <button
          type="button"
          data-cursor="link"
          onClick={clearPage}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ink hover:text-pen"
        >
          <Eraser className="h-4 w-4" aria-hidden /> Clear the page
        </button>
        <button
          type="button"
          data-cursor="link"
          onClick={restoreExample}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ink hover:text-pen"
        >
          <Sparkles className="h-4 w-4" aria-hidden /> Put the doodle back
        </button>
      </div>
      <figcaption className="mt-1 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 1</span>{" "}Sobel edges computed live in your browser, and your
        drawing is kept for next time. HoloDraw itself tracks your hand with MediaPipe and draws with a U-Net trained on
        BSDS500; here the pointer stands in for your hand.
      </figcaption>
    </figure>
  );
}
