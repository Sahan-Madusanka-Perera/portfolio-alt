// Hand mode: the visitor's index fingertip steers the particle portrait, and a pinch paints a
// fading light trail. Loaded only after the visitor presses "Use your hand" and allows the camera.
// Frames go from the <video> element straight into MediaPipe's WASM runtime in this tab; nothing
// is uploaded. Only the runtime files and the model are downloaded, from pinned public URLs.

import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PORTRAIT_POINTER_EVENT, type PortraitPointerDetail } from "../portrait/HeroPortrait";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type HandStatus = "loading" | "running" | "no-hand" | "pinching";

type TrailPoint = { x: number; y: number; t: number };

export type HandTracker = { stop: () => void };

type Options = {
  video: HTMLVideoElement;
  preview: HTMLCanvasElement;
  overlay: HTMLCanvasElement;
  /** The hero; detection pauses while it is off screen. */
  stage: HTMLElement;
  accent: () => string;
  onStatus: (status: HandStatus) => void;
};

const TRAIL_MS = 1400;
// Pinch hysteresis, as a fraction of hand size (wrist to middle knuckle).
const PINCH_ON = 0.32;
const PINCH_OFF = 0.45;

function dist(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export async function startHandTracker(stream: MediaStream, opts: Options): Promise<HandTracker> {
  const { video, preview, overlay, stage, accent, onStatus } = opts;
  onStatus("loading");

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  const { FilesetResolver, HandLandmarker: Landmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  const make = (delegate: "GPU" | "CPU") =>
    Landmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });
  let landmarker: HandLandmarker;
  try {
    landmarker = await make("GPU");
  } catch {
    landmarker = await make("CPU");
  }
  const connections = Landmarker.HAND_CONNECTIONS;

  const pctx = preview.getContext("2d")!;
  const octx = overlay.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sizeOverlay = () => {
    overlay.width = Math.round(window.innerWidth * dpr);
    overlay.height = Math.round(window.innerHeight * dpr);
  };
  sizeOverlay();
  window.addEventListener("resize", sizeOverlay);

  let stopped = false;
  let raf = 0;
  let onScreen = true;
  let lastVideoTime = -1;
  let pinching = false;
  let lastStatus: HandStatus | null = null;
  const trail: TrailPoint[] = [];
  // Smoothed fingertip in viewport pixels.
  let tip: { x: number; y: number } | null = null;

  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (!onScreen) release();
  });
  io.observe(stage);

  const status = (s: HandStatus) => {
    if (s !== lastStatus) onStatus((lastStatus = s));
  };

  function dispatch(detail: PortraitPointerDetail) {
    window.dispatchEvent(new CustomEvent(PORTRAIT_POINTER_EVENT, { detail }));
  }

  function release() {
    tip = null;
    pinching = false;
    dispatch(null);
  }

  function drawPreview(hand: NormalizedLandmark[] | undefined) {
    const w = (preview.width = video.videoWidth / 2);
    const h = (preview.height = video.videoHeight / 2);
    pctx.save();
    pctx.translate(w, 0);
    pctx.scale(-1, 1); // mirror, like a mirror
    pctx.drawImage(video, 0, 0, w, h);
    if (hand) {
      pctx.strokeStyle = accent();
      pctx.lineWidth = 2;
      pctx.beginPath();
      for (const { start, end } of connections) {
        pctx.moveTo(hand[start].x * w, hand[start].y * h);
        pctx.lineTo(hand[end].x * w, hand[end].y * h);
      }
      pctx.stroke();
      pctx.fillStyle = "#fff";
      for (const p of hand) {
        pctx.beginPath();
        pctx.arc(p.x * w, p.y * h, 2.2, 0, Math.PI * 2);
        pctx.fill();
      }
    }
    pctx.restore();
  }

  function drawOverlay(now: number) {
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
    const color = accent();
    octx.lineCap = "round";
    octx.lineJoin = "round";
    octx.strokeStyle = color;
    octx.shadowColor = color;
    octx.shadowBlur = 18;
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1];
      const b = trail[i];
      if (b.t - a.t > 120) continue; // a gap between pinches
      const life = 1 - (now - b.t) / TRAIL_MS;
      octx.globalAlpha = Math.max(0, life) * 0.9;
      octx.lineWidth = 2 + life * 5;
      octx.beginPath();
      octx.moveTo(a.x, a.y);
      octx.lineTo(b.x, b.y);
      octx.stroke();
    }
    octx.shadowBlur = 0;
    if (tip) {
      octx.globalAlpha = 1;
      octx.fillStyle = color;
      octx.beginPath();
      octx.arc(tip.x, tip.y, pinching ? 7 : 5, 0, Math.PI * 2);
      octx.fill();
      octx.globalAlpha = 0.35;
      octx.lineWidth = 1.5;
      octx.beginPath();
      octx.arc(tip.x, tip.y, pinching ? 18 : 14, 0, Math.PI * 2);
      octx.stroke();
    }
    octx.globalAlpha = 1;
  }

  function frame() {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    if (!onScreen || document.hidden) {
      drawOverlay(now);
      return;
    }
    if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
      lastVideoTime = video.currentTime;
      const result = landmarker.detectForVideo(video, now);
      const hand = result.landmarks[0];
      drawPreview(hand);
      if (!hand) {
        if (tip) release();
        status("no-hand");
      } else {
        const index = hand[8];
        // Use the middle of the camera frame as the whole screen, so small movements reach the edges.
        const nx = Math.min(1, Math.max(0, (1 - index.x - 0.15) / 0.7));
        const ny = Math.min(1, Math.max(0, (index.y - 0.12) / 0.66));
        const target = { x: nx * window.innerWidth, y: ny * window.innerHeight };
        tip = tip ? { x: tip.x + (target.x - tip.x) * 0.45, y: tip.y + (target.y - tip.y) * 0.45 } : target;

        const size = Math.max(dist(hand[0], hand[9]), 1e-3);
        const pinch = dist(hand[4], hand[8]) / size;
        pinching = pinching ? pinch < PINCH_OFF : pinch < PINCH_ON;
        if (pinching) trail.push({ x: tip.x, y: tip.y, t: now });
        status(pinching ? "pinching" : "running");
        dispatch({ clientX: tip.x, clientY: tip.y, strength: pinching ? 1.5 : 1.1 });
      }
    }
    drawOverlay(now);
  }
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", sizeOverlay);
      release();
      octx.clearRect(0, 0, overlay.width, overlay.height);
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
      landmarker.close();
    },
  };
}
