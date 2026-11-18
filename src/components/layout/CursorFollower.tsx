"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// A ring that trails the native pointer with a little lag. It grows over links and buttons and
// turns into a labelled accent disc over anything with `data-cursor-label` (the work cards).
// Fine pointers only, never under reduced motion, and the system cursor always stays visible.
export function CursorFollower() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const fine = useMediaQuery("(pointer: fine) and (hover: hover)");
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    const ring = ringRef.current;
    if (!enabled || !ring) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let frame = 0;
    let running = false;

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) frame = requestAnimationFrame(loop);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tx = event.clientX;
      ty = event.clientY;
      if (ring.dataset.visible !== "1") {
        x = tx;
        y = ty;
        ring.dataset.visible = "1";
      }
      kick();
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor-label]");
      if (labelled) {
        ring.dataset.mode = "label";
        setLabel(labelled.dataset.cursorLabel ?? "");
        return;
      }
      const interactive = target?.closest("a, button, [role='button'], input, select, textarea, [data-cursor='link']");
      ring.dataset.mode = interactive ? "link" : "";
    };

    const onLeave = () => {
      ring.dataset.visible = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ringRef} className="cursor-ring" aria-hidden>
      <span className="cursor-label">{label}</span>
    </div>
  );
}
