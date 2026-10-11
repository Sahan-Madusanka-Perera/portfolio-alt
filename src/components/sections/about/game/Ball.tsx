"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";

// Classic panel look approximated: white sphere with scattered dark pentagons.
// Flat-mapped onto the sphere so it distorts a little, which reads fine at
// this size and sells "football" better than a plain white ball.
function makeBallTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#0f172a";
  const pentagon = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };
  const spots = [
    [0.5, 0.5],
    [0.15, 0.2],
    [0.85, 0.2],
    [0.15, 0.8],
    [0.85, 0.8],
    [0.5, 0.05],
    [0.5, 0.95],
  ];
  for (const [u, v] of spots) pentagon(u * size, v * size, size * 0.09);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Ball = forwardRef<THREE.Mesh, { radius?: number }>(function Ball({ radius = 0.12 }, ref) {
  const texture = useMemo(() => makeBallTexture(), []);
  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial map={texture} roughness={0.45} metalness={0.02} />
    </mesh>
  );
});
