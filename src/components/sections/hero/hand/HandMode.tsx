"use client";

import { HandIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { HandStatus, HandTracker } from "./tracker";

const noopSubscribe = () => () => {};

type State = "off" | "asking" | HandStatus | "error";

const statusText: Record<Exclude<State, "off" | "error">, string> = {
  asking: "Waiting for camera permission",
  loading: "Loading the hand model",
  running: "Point to push the particles. Pinch to paint.",
  "no-hand": "Raise one hand in front of the camera",
  pinching: "Painting",
};

// "Use your hand": opt-in webcam hand tracking that steers the hero portrait. Desktop only (the
// row is hidden by CSS on touch screens, small widths and reduced motion, so markup is identical
// on server and client). The tracker and MediaPipe load only after the click.
export function HandMode() {
  const [state, setState] = useState<State>("off");
  const [error, setError] = useState("");
  const tracker = useRef<HandTracker | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const active = state !== "off" && state !== "error";

  // False on the server and during hydration, true after: the portal mounts only on the client.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const stop = useCallback(() => {
    tracker.current?.stop();
    tracker.current = null;
    setState("off");
  }, []);

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setError("This browser has no camera access.");
      return;
    }
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
    } catch (e) {
      setState("error");
      setError(
        (e as DOMException).name === "NotAllowedError"
          ? "Camera blocked. You can allow it in the browser's site settings."
          : "No camera found.",
      );
      return;
    }
    try {
      const [{ startHandTracker }] = await Promise.all([import("./tracker")]);
      const stage = document.getElementById("top");
      if (!video.current || !preview.current || !overlay.current || !stage) throw new Error("not mounted");
      tracker.current = await startHandTracker(stream, {
        video: video.current,
        preview: preview.current,
        overlay: overlay.current,
        stage,
        accent: () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#8aa2ff",
        onStatus: setState,
      });
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      tracker.current?.stop();
      tracker.current = null;
      setState("error");
      setError("Hand tracking could not start on this device.");
    }
  }

  // Esc turns it off; leaving the page always releases the camera.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && stop();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stop]);
  useEffect(() => () => tracker.current?.stop(), []);

  return (
    <div className="-mt-2 hidden items-center gap-4 lg:flex motion-reduce:hidden pointer-coarse:hidden">
      <button
        type="button"
        onClick={active ? stop : start}
        aria-pressed={active}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-[0.875rem] ring-1 ring-inset transition-colors",
          active ? "bg-accent/10 text-fg ring-accent" : "text-fg ring-line-2 hover:bg-fg/[0.05] hover:ring-fg/40",
        )}
      >
        <HandIcon aria-hidden size={16} />
        {active ? "Stop hand mode" : "Use your hand"}
      </button>
      <p className="text-[0.875rem] text-fg-2" aria-live="polite">
        {state === "error" ? error : active ? statusText[state] : "Camera, optional. Video never leaves your device."}
      </p>

      {mounted &&
        createPortal(
          <>
            <canvas ref={overlay} aria-hidden className={cn("pointer-events-none fixed inset-0 z-40 h-full w-full", !active && "hidden")} />
            <div
              className={cn(
                "fixed bottom-5 right-5 z-40 w-[208px] overflow-hidden rounded-[20px] bg-bg-2/90 ring-1 ring-line-2 backdrop-blur-md",
                !active && "hidden",
              )}
              role="region"
              aria-label="Hand mode camera preview"
            >
              <video ref={video} className="pointer-events-none absolute h-px w-px opacity-0" muted playsInline />
              <canvas ref={preview} className="block aspect-[4/3] w-full bg-bg" aria-hidden />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex items-center gap-2 text-[0.8125rem] text-fg-2">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                  Stays on this device
                </span>
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop hand mode"
                  className="grid h-8 w-8 place-items-center rounded-full text-fg-2 transition-colors hover:bg-fg/[0.06] hover:text-fg"
                >
                  <XIcon aria-hidden size={14} />
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
