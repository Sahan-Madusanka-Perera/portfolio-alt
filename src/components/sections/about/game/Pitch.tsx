"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GRASS_DARK, GRASS_LIGHT, LINE_COLOR } from "./kit";
import { MATCH } from "./matchEngine";

// ---- shared texture helpers -------------------------------------------------

// A semi-transparent net: white grid lines on a transparent field, so light
// passes through and it reads as netting rather than a solid wall.
function makeNetTexture(repeat = 8) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3;
  const step = size / 4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, size);
    ctx.moveTo(0, i * step);
    ctx.lineTo(size, i * step);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat * 0.5);
  return tex;
}

// Builds a world→canvas mapping and a canvas so pitch markings can be drawn in
// world coordinates and baked once into a single ground texture (cheaper and
// crisper than stacking thin line meshes on the grass).
function makeGround(bounds: { xMin: number; xMax: number; zFar: number; zNear: number }, pxPerUnit = 120) {
  const wUnits = bounds.xMax - bounds.xMin;
  const hUnits = bounds.zNear - bounds.zFar;
  const W = Math.round(wUnits * pxPerUnit);
  const H = Math.round(hUnits * pxPerUnit);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const toPx = (x: number, z: number): [number, number] => [
    ((x - bounds.xMin) / wUnits) * W,
    ((z - bounds.zFar) / hUnits) * H,
  ];
  return { ctx, canvas, W, H, toPx, unit: pxPerUnit, wUnits, hUnits };
}

function stripes(ctx: CanvasRenderingContext2D, W: number, H: number, count: number) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = i % 2 === 0 ? GRASS_LIGHT : GRASS_DARK;
    ctx.fillRect(0, (H / count) * i, W, H / count + 1);
  }
}

function toTexture(canvas: HTMLCanvasElement, anisotropy = 4) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

// A tiling micro-normal map of short grass blades from seeded noise (no asset
// download). Used only by the stadium (HD) scenes.
let grassNormalBase: THREE.CanvasTexture | null = null;
function grassNormal(repeat: [number, number]) {
  if (!grassNormalBase) {
    const size = 256;
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const noise = new Float32Array(size * size);
    for (let i = 0; i < noise.length; i++) noise[i] = rand();
    // smear along a slanted direction so the bumps read as blades, not sand
    const blades = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let sum = 0;
        for (let k = -2; k <= 2; k++) sum += noise[((y + k * 2 + size) % size) * size + ((x + k + size) % size)];
        blades[y * size + x] = sum / 5;
      }
    }
    const at = (x: number, y: number) => blades[((y + size) % size) * size + ((x + size) % size)];
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (at(x - 1, y) - at(x + 1, y)) * 2.4;
        const dy = (at(x, y - 1) - at(x, y + 1)) * 2.4;
        const l = Math.hypot(dx, dy, 1);
        const i = (y * size + x) * 4;
        img.data[i] = ((dx / l) * 0.5 + 0.5) * 255;
        img.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
        img.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    grassNormalBase = new THREE.CanvasTexture(canvas);
  }
  const tex = grassNormalBase.clone();
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.needsUpdate = true;
  return tex;
}

// ---- goal + net -------------------------------------------------------------

// A goal facing +Z (opening toward the field). `depth` is how far the net box
// extends behind the goal line; flip the group's rotation.y by π to face -Z.
export function Goal({ halfWidth, height, depth = 0.9 }: { halfWidth: number; height: number; depth?: number }) {
  const netMaterial = useMemo(() => {
    const map = makeNetTexture(Math.round(halfWidth * 4));
    return new THREE.MeshStandardMaterial({
      map,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [halfWidth]);
  const post = 0.06;
  return (
    <group>
      {/* posts + crossbar */}
      <mesh position={[-halfWidth, height / 2, 0]} castShadow>
        <boxGeometry args={[post, height, post]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[halfWidth, height / 2, 0]} castShadow>
        <boxGeometry args={[post, height, post]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[0, height, 0]} castShadow>
        <boxGeometry args={[halfWidth * 2 + post, post, post]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* net: back, roof, two sides — shared material */}
      <mesh position={[0, height / 2, -depth]} material={netMaterial}>
        <planeGeometry args={[halfWidth * 2, height]} />
      </mesh>
      <mesh position={[0, height, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} material={netMaterial}>
        <planeGeometry args={[halfWidth * 2, depth]} />
      </mesh>
      <mesh position={[-halfWidth, height / 2, -depth / 2]} rotation={[0, Math.PI / 2, 0]} material={netMaterial}>
        <planeGeometry args={[depth, height]} />
      </mesh>
      <mesh position={[halfWidth, height / 2, -depth / 2]} rotation={[0, Math.PI / 2, 0]} material={netMaterial}>
        <planeGeometry args={[depth, height]} />
      </mesh>
    </group>
  );
}

// ---- penalty pitch ----------------------------------------------------------

export const PENALTY = {
  goalZ: -3.4,
  goalHalfWidth: 1.9,
  goalHeight: 1.75,
  spotZ: -0.4,
};

export function PenaltyPitch({ detail = false }: { detail?: boolean }) {
  const normal = useMemo(() => (detail ? grassNormal([14, 12]) : null), [detail]);
  const texture = useMemo(() => {
    const g = makeGround({ xMin: -4, xMax: 4, zFar: -4.2, zNear: 2.6 }, detail ? 180 : 120);
    const { ctx, canvas, toPx, unit } = g;
    stripes(ctx, g.W, g.H, 8);

    ctx.strokeStyle = LINE_COLOR;
    ctx.fillStyle = LINE_COLOR;
    ctx.lineWidth = 0.07 * unit;
    const rect = (x1: number, z1: number, x2: number, z2: number) => {
      const [px1, py1] = toPx(x1, z1);
      const [px2, py2] = toPx(x2, z2);
      ctx.strokeRect(Math.min(px1, px2), Math.min(py1, py2), Math.abs(px2 - px1), Math.abs(py2 - py1));
    };
    const { goalZ } = PENALTY;
    // goal line, penalty box, six-yard box
    const [gx1, gy] = toPx(-4, goalZ);
    const [gx2] = toPx(4, goalZ);
    ctx.beginPath();
    ctx.moveTo(gx1, gy);
    ctx.lineTo(gx2, gy);
    ctx.stroke();
    rect(-2.8, goalZ, 2.8, 0.0);
    rect(-1.4, goalZ, 1.4, -2.4);
    // penalty spot
    const [sx, sy] = toPx(0, PENALTY.spotZ);
    ctx.beginPath();
    ctx.arc(sx, sy, 0.06 * unit, 0, Math.PI * 2);
    ctx.fill();
    // penalty arc (the "D"), only the part in front of the box
    ctx.beginPath();
    ctx.arc(sx, sy, 0.95 * unit, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    return toTexture(canvas, detail ? 16 : 4);
  }, [detail]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.8]} receiveShadow>
        <planeGeometry args={[8, 6.8]} />
        <meshStandardMaterial
          map={texture}
          roughness={detail ? 1 : 0.95}
          normalMap={normal ?? undefined}
          normalScale={detail ? new THREE.Vector2(0.45, 0.45) : undefined}
        />
      </mesh>
      <group position={[0, 0, PENALTY.goalZ]}>
        <Goal halfWidth={PENALTY.goalHalfWidth} height={PENALTY.goalHeight} depth={0.9} />
      </group>
    </>
  );
}

// ---- match pitch ------------------------------------------------------------

// match dimensions live with the simulation (matchEngine.ts); re-exported for the scenes
export { MATCH };

export function MatchPitch({ detail = false, boards = true }: { detail?: boolean; boards?: boolean }) {
  const normal = useMemo(() => (detail ? grassNormal([12, 19]) : null), [detail]);
  const texture = useMemo(() => {
    const g = makeGround(
      { xMin: -MATCH.halfW, xMax: MATCH.halfW, zFar: -MATCH.halfL, zNear: MATCH.halfL },
      detail ? 160 : 100
    );
    const { ctx, canvas, toPx, unit } = g;
    stripes(ctx, g.W, g.H, 10);

    ctx.strokeStyle = LINE_COLOR;
    ctx.fillStyle = LINE_COLOR;
    ctx.lineWidth = 0.06 * unit;
    // boundary
    const [bx1, by1] = toPx(-MATCH.halfW + 0.05, -MATCH.halfL + 0.05);
    const [bx2, by2] = toPx(MATCH.halfW - 0.05, MATCH.halfL - 0.05);
    ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1);
    // halfway line
    const [hx1, hy] = toPx(-MATCH.halfW, 0);
    const [hx2] = toPx(MATCH.halfW, 0);
    ctx.beginPath();
    ctx.moveTo(hx1, hy);
    ctx.lineTo(hx2, hy);
    ctx.stroke();
    // center circle + spot
    const [cx, cy] = toPx(0, 0);
    ctx.beginPath();
    ctx.arc(cx, cy, 0.9 * unit, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 0.08 * unit, 0, Math.PI * 2);
    ctx.fill();
    // goal areas
    for (const sign of [-1, 1] as const) {
      const [ax1, ay1] = toPx(-1.5, sign * (MATCH.halfL - 0.05));
      const [ax2, ay2] = toPx(1.5, sign * (MATCH.halfL - 1.3));
      ctx.strokeRect(Math.min(ax1, ax2), Math.min(ay1, ay2), Math.abs(ax2 - ax1), Math.abs(ay2 - ay1));
    }
    return toTexture(canvas, detail ? 16 : 4);
  }, [detail]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MATCH.halfW * 2, MATCH.halfL * 2]} />
        <meshStandardMaterial
          map={texture}
          roughness={detail ? 1 : 0.95}
          normalMap={normal ?? undefined}
          normalScale={detail ? new THREE.Vector2(0.45, 0.45) : undefined}
        />
      </mesh>
      {/* low perimeter boards keep the ball in play and frame the field */}
      {boards && <Boards />}
      {/* far goal faces -Z (toward field), near goal faces +Z */}
      <group position={[0, 0, -MATCH.halfL]}>
        <Goal halfWidth={MATCH.goalHalfWidth} height={MATCH.goalHeight} depth={0.6} />
      </group>
      <group position={[0, 0, MATCH.halfL]} rotation={[0, Math.PI, 0]}>
        <Goal halfWidth={MATCH.goalHalfWidth} height={MATCH.goalHeight} depth={0.6} />
      </group>
    </>
  );
}

function Boards() {
  const { halfW, halfL, wallHeight } = MATCH;
  const t = 0.12;
  const mat = <meshStandardMaterial color="#0f172a" roughness={0.6} />;
  return (
    <group>
      <mesh position={[-halfW, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, wallHeight, halfL * 2]} />
        {mat}
      </mesh>
      <mesh position={[halfW, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, wallHeight, halfL * 2]} />
        {mat}
      </mesh>
      {/* end boards, split to leave the goal mouths open */}
      {[-1, 1].map((sign) =>
        [-1, 1].map((sideX) => (
          <mesh
            key={`${sign}-${sideX}`}
            position={[sideX * (halfW / 2 + MATCH.goalHalfWidth / 2), wallHeight / 2, sign * halfL]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[halfW - MATCH.goalHalfWidth * 2, wallHeight, t]} />
            {mat}
          </mesh>
        ))
      )}
    </group>
  );
}

// ---- lighting ---------------------------------------------------------------

// Stadium-ish key light with soft shadows, a cool sky/warm-ground hemisphere
// fill, and a gentle ambient floor so nothing crushes to black.
export function PitchLighting({ target = [0, 0, 0] as [number, number, number] }) {
  return (
    <>
      <hemisphereLight args={["#bfe3ff", "#1c5a2e", 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        target-position={target}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.3} color="#a5f3fc" />
    </>
  );
}
