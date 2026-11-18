// The still version of the portrait, drawn once on a 2D canvas from the same points. Used under
// reduced motion, on devices without WebGL2 or with little power, and if the GPU context is lost.
// A canvas is not an LCP candidate, so the still never holds up the first paint.

import type { PortraitData } from "./data";
import type { PortraitTheme } from "./PortraitGL";

const HALF = 3.2 * Math.tan((15 * Math.PI) / 180);

export function drawStaticPortrait(canvas: HTMLCanvasElement, data: PortraitData, theme: PortraitTheme, width: number, height: number, dprIn: number) {
  const dpr = Math.min(dprIn, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const aspect = width / height;
  const scale = Math.min(HALF * 0.96, (HALF * aspect * 0.96) / 0.75);
  const pxPerUnit = (height / (2 * HALF)) * scale;
  const offsetY = (-HALF * 0.02 * height) / (2 * HALF);
  const cx = width / 2;
  const cy = height / 2 - offsetY;
  const size = Math.max(1, Math.min(2.6, pxPerUnit / 230)) * Math.sqrt(48000 / data.count) * 0.78;
  const [r, g, b] = theme.ink.map((v) => Math.round(v * 255));

  // Bucket by alpha so the canvas switches fill style 16 times, not 20,000.
  const buckets: number[][] = Array.from({ length: 16 }, () => []);
  for (let i = 0; i < data.count; i++) {
    const lum = data.lum[i] / 255;
    const tone = theme.additive ? lum : 1 - lum;
    const a = 0.1 + 0.9 * tone;
    buckets[Math.min(15, Math.floor(a * 16))].push(i);
  }

  buckets.forEach((list, bucket) => {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(((bucket + 0.5) / 16) * (theme.additive ? 0.85 : 0.95)).toFixed(3)})`;
    ctx.beginPath();
    for (const i of list) {
      const x = cx + (data.positions[i * 3] / 32767) * pxPerUnit;
      const y = cy - (data.positions[i * 3 + 1] / 32767) * pxPerUnit;
      const z = data.positions[i * 3 + 2] / 32767;
      const s = size * (0.85 + 0.3 * (z * 0.5 + 0.5));
      ctx.moveTo(x + s / 2, y);
      ctx.arc(x, y, s / 2, 0, Math.PI * 2);
    }
    ctx.fill();
  });
}
