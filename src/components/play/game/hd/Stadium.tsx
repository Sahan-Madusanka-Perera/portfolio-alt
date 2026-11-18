"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A procedurally built stadium around any pitch rectangle: stepped concrete
// stands with an instanced crowd that bobs (and erupts on a goal), cantilever
// roofs, four floodlight towers whose lamps bloom, and scrolling LED boards.

export type PitchRect = { xMin: number; xMax: number; zMin: number; zMax: number };
type Variant = "match" | "penalty";

const ROWS = 9;
const ROW_DEPTH = 0.42;
const ROW_RISE = 0.27;
const SEAT_PITCH = 0.25;
const MARGIN = 1.1;
const BOARD_H = 0.34;
const SHIRTS = ["#2447b8", "#c81e2d", "#f8fafc", "#e5e7eb", "#1f2937", "#f59e0b", "#2447b8", "#c81e2d", "#7c3aed", "#0f766e"];
const SKINS = ["#f2c9a0", "#e0a878", "#c68642", "#8d5524"];

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Stand = { x: number; z: number; rotY: number; length: number };

function standsFor(rect: PitchRect): Stand[] {
  const w = rect.xMax - rect.xMin;
  const l = rect.zMax - rect.zMin;
  const cx = (rect.xMin + rect.xMax) / 2;
  const cz = (rect.zMin + rect.zMax) / 2;
  // Each stand faces +z in its own space; rows climb away from the pitch.
  // There is deliberately no stand at the near (+z) end: both cameras look in
  // from there, so it would never be seen from the front, and when the match
  // camera follows the ball into your half its roof and back rows would sit
  // between the camera and the play.
  return [
    { x: cx, z: rect.zMin - MARGIN, rotY: 0, length: w + 2 * MARGIN },
    { x: rect.xMin - MARGIN, z: cz, rotY: Math.PI / 2, length: l + 2 * MARGIN },
    { x: rect.xMax + MARGIN, z: cz, rotY: -Math.PI / 2, length: l + 2 * MARGIN },
  ];
}

function standGeometry(length: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  for (let r = 0; r < ROWS; r++) {
    shape.lineTo(r * ROW_DEPTH, (r + 1) * ROW_RISE);
    shape.lineTo((r + 1) * ROW_DEPTH, (r + 1) * ROW_RISE);
  }
  const back = ROWS * ROW_DEPTH;
  shape.lineTo(back + 0.25, ROWS * ROW_RISE + 1.1);
  shape.lineTo(back + 0.25, 0);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  // shape x (distance behind the front edge) → -z, extrusion → x along the front
  geometry.rotateY(Math.PI / 2);
  geometry.translate(-length / 2, 0, 0);
  return geometry;
}

function crowdLayout(stands: Stand[]) {
  const rand = mulberry32(20260914);
  const bodies: THREE.Matrix4[] = [];
  const heads: THREE.Matrix4[] = [];
  const shirts: THREE.Color[] = [];
  const skins: THREE.Color[] = [];
  const standMatrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);

  for (const stand of stands) {
    standMatrix.makeRotationY(stand.rotY).setPosition(stand.x, 0, stand.z);
    rotation.setFromAxisAngle(up, stand.rotY);
    for (let r = 0; r < ROWS; r++) {
      const seatY = (r + 1) * ROW_RISE;
      const z = -(r * ROW_DEPTH + ROW_DEPTH * 0.5);
      for (let x = -stand.length / 2 + 0.3; x <= stand.length / 2 - 0.3; x += SEAT_PITCH) {
        if (rand() < 0.13) continue;
        if (Math.abs(((x + stand.length / 2) % 3.2) - 1.6) < 0.16) continue; // aisles
        const jitter = (rand() - 0.5) * 0.05;
        const scale = 0.9 + rand() * 0.2;
        const body = new THREE.Vector3(x + jitter, seatY + 0.13 * scale, z).applyMatrix4(standMatrix);
        const head = new THREE.Vector3(x + jitter, seatY + 0.32 * scale, z).applyMatrix4(standMatrix);
        bodies.push(new THREE.Matrix4().compose(body, rotation, new THREE.Vector3(1, scale, 1)));
        heads.push(new THREE.Matrix4().compose(head, rotation, new THREE.Vector3(1, 1, 1)));
        shirts.push(new THREE.Color(SHIRTS[Math.floor(rand() * SHIRTS.length)]));
        skins.push(new THREE.Color(SKINS[Math.floor(rand() * SKINS.length)]));
      }
    }
  }
  return { bodies, heads, shirts, skins };
}

function makeAdTexture() {
  const face = getComputedStyle(document.documentElement).getPropertyValue("--font-inter-tight").trim() || "sans-serif";
  const items = ["SAHAN PERERA", "ML ENGINEER", "FULL-STACK DEVELOPER", "OPEN TO INTERNSHIPS & FREELANCE", "COLOMBO · SRI LANKA"];
  const height = 128;
  const gap = 96;
  const font = `700 78px ${face}`;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const width = Math.ceil(items.reduce((sum, item) => sum + measure.measureText(item).width + gap, 0));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#111c3d");
  bg.addColorStop(1, "#060a18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.font = font;
  ctx.textBaseline = "middle";
  let x = gap / 2;
  items.forEach((item, i) => {
    ctx.fillStyle = i % 2 ? "#f7ead6" : "#dcb46a";
    ctx.fillText(item, x, height / 2 + 5);
    x += measure.measureText(item).width;
    ctx.fillStyle = "#ff4d5e";
    ctx.beginPath();
    ctx.arc(x + gap / 2, height / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    x += gap;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return { texture, period: BOARD_H * (width / height) };
}

type Board = { position: [number, number, number]; rotY: number; length: number };

function boardsFor(rect: PitchRect, variant: Variant): Board[] {
  const w = rect.xMax - rect.xMin;
  const l = rect.zMax - rect.zMin;
  const cx = (rect.xMin + rect.xMax) / 2;
  const cz = (rect.zMin + rect.zMax) / 2;
  const y = BOARD_H / 2 + 0.02;
  if (variant === "penalty") {
    return [
      { position: [cx, y, rect.zMin - 0.5], rotY: 0, length: w + 1 },
      { position: [rect.xMin - 0.2, y, cz], rotY: Math.PI / 2, length: l },
      { position: [rect.xMax + 0.2, y, cz], rotY: -Math.PI / 2, length: l },
    ];
  }
  return [
    { position: [rect.xMin - 0.3, y, cz], rotY: Math.PI / 2, length: l + 1.2 },
    { position: [rect.xMax + 0.3, y, cz], rotY: -Math.PI / 2, length: l + 1.2 },
    // behind the goal nets
    { position: [cx, y, rect.zMin - 0.9], rotY: 0, length: w + 0.6 },
    { position: [cx, y, rect.zMax + 0.9], rotY: Math.PI, length: w + 0.6 },
  ];
}

function Floodlight({ position, target }: { position: [number, number, number]; target: [number, number] }) {
  const rotY = Math.atan2(target[0] - position[0], target[1] - position[2]);
  const lamps: Array<[number, number]> = [];
  for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) lamps.push([-0.72 + col * 0.48, 0.24 - row * 0.48]);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.07, 0.13, 10, 10]} />
        <meshStandardMaterial color="#9aa3ad" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0, 10.1, 0.12]} rotation={[0.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.2, 1.2, 0.18]} />
          <meshStandardMaterial color="#2b3240" metalness={0.5} roughness={0.5} />
        </mesh>
        {lamps.map(([x, y]) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.1]}>
            <boxGeometry args={[0.4, 0.4, 0.04]} />
            <meshStandardMaterial color="#fff6df" emissive="#fff3d6" emissiveIntensity={9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Stadium({ rect, variant, cheerAt }: { rect: PitchRect; variant: Variant; cheerAt: RefObject<number> }) {
  const stands = useMemo(() => standsFor(rect), [rect]);
  const standGeometries = useMemo(() => stands.map((stand) => standGeometry(stand.length)), [stands]);
  const crowd = useMemo(() => crowdLayout(stands), [stands]);
  const boards = useMemo(() => boardsFor(rect, variant), [rect, variant]);
  const ad = useMemo(() => makeAdTexture(), []);
  const boardGeometries = useMemo(
    () =>
      boards.map((board) => {
        const geometry = new THREE.PlaneGeometry(board.length, BOARD_H);
        const uv = geometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (board.length / ad.period));
        return geometry;
      }),
    [boards, ad]
  );

  const bodiesRef = useRef<THREE.InstancedMesh>(null);
  const headsRef = useRef<THREE.InstancedMesh>(null);
  const adTexture = useRef<THREE.Texture | null>(null);
  const crowdUniforms = useRef({ uTime: { value: 0 }, uExcite: { value: 0 } });

  const crowdMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = crowdUniforms.current.uTime;
      shader.uniforms.uExcite = crowdUniforms.current.uExcite;
      shader.vertexShader =
        "uniform float uTime;\nuniform float uExcite;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            float kPhase = instanceMatrix[3].x * 2.3 + instanceMatrix[3].z * 1.7;
            float kBob = max(0.0, sin(uTime * (2.5 + uExcite * 8.0) + kPhase));
            transformed.y += kBob * (0.01 + uExcite * 0.1);
          #endif`
        );
    };
    material.customProgramCacheKey = () => "crowd-bob-v1";
    return material;
  }, []);

  useEffect(() => {
    adTexture.current = ad.texture;
  }, [ad]);

  useEffect(() => {
    const bodies = bodiesRef.current;
    const heads = headsRef.current;
    if (!bodies || !heads) return;
    crowd.bodies.forEach((matrix, i) => {
      bodies.setMatrixAt(i, matrix);
      bodies.setColorAt(i, crowd.shirts[i]);
      heads.setMatrixAt(i, crowd.heads[i]);
      heads.setColorAt(i, crowd.skins[i]);
    });
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
    if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
  }, [crowd]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const since = t - cheerAt.current;
    crowdUniforms.current.uTime.value = t;
    crowdUniforms.current.uExcite.value = since >= 0 ? Math.exp(-since / 1.8) : 0;
    if (adTexture.current) adTexture.current.offset.x = (t * 0.045) % 1;
  });

  const w = rect.xMax - rect.xMin;
  const l = rect.zMax - rect.zMin;
  const cx = (rect.xMin + rect.xMax) / 2;
  const cz = (rect.zMin + rect.zMax) / 2;
  const reach = MARGIN + ROWS * ROW_DEPTH + 1.4;
  const towers: Array<[number, number, number]> = [
    [rect.xMin - reach, 0, rect.zMin - reach],
    [rect.xMax + reach, 0, rect.zMin - reach],
    [rect.xMin - reach, 0, rect.zMax + reach],
    [rect.xMax + reach, 0, rect.zMax + reach],
  ];

  return (
    <group>
      {/* surrounds: concrete apron around the pitch, dark grass beyond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.006, cz]} receiveShadow>
        <planeGeometry args={[w + 2 * MARGIN, l + 2 * MARGIN]} />
        <meshStandardMaterial color="#3f4652" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.012, cz]} receiveShadow>
        <planeGeometry args={[w + 60, l + 60]} />
        <meshStandardMaterial color="#1d5a30" roughness={1} />
      </mesh>

      {stands.map((stand, i) => (
        <group key={i} position={[stand.x, 0, stand.z]} rotation={[0, stand.rotY, 0]}>
          <mesh geometry={standGeometries[i]} receiveShadow>
            <meshStandardMaterial color="#565d69" roughness={0.92} />
          </mesh>
          {/* cantilever roof, front edge lifted toward the pitch */}
          <mesh position={[0, ROWS * ROW_RISE + 2.05, -ROWS * ROW_DEPTH * 0.55]} rotation={[-0.12, 0, 0]}>
            <boxGeometry args={[stand.length, 0.08, ROWS * ROW_DEPTH * 1.05]} />
            <meshStandardMaterial color="#2b3240" metalness={0.4} roughness={0.55} />
          </mesh>
          {Array.from({ length: Math.max(2, Math.round(stand.length / 4)) + 1 }, (_, k) => {
            const spans = Math.max(2, Math.round(stand.length / 4));
            const x = -stand.length / 2 + (k * stand.length) / spans;
            return (
              <mesh key={k} position={[x, (ROWS * ROW_RISE + 2.1) / 2, -ROWS * ROW_DEPTH - 0.1]}>
                <cylinderGeometry args={[0.05, 0.05, ROWS * ROW_RISE + 2.1, 8]} />
                <meshStandardMaterial color="#2b3240" metalness={0.4} roughness={0.55} />
              </mesh>
            );
          })}
        </group>
      ))}

      <instancedMesh ref={bodiesRef} args={[undefined, undefined, crowd.bodies.length]} material={crowdMaterial} frustumCulled={false}>
        <boxGeometry args={[0.17, 0.26, 0.12]} />
      </instancedMesh>
      <instancedMesh ref={headsRef} args={[undefined, undefined, crowd.heads.length]} material={crowdMaterial} frustumCulled={false}>
        <sphereGeometry args={[0.058, 10, 8]} />
      </instancedMesh>

      {boards.map((board, i) => (
        <group key={i} position={board.position} rotation={[0, board.rotY, 0]}>
          <mesh position={[0, 0, -0.035]} castShadow receiveShadow>
            <boxGeometry args={[board.length, BOARD_H + 0.04, 0.06]} />
            <meshStandardMaterial color="#0b0f1a" roughness={0.6} />
          </mesh>
          <mesh geometry={boardGeometries[i]}>
            <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveMap={ad.texture} emissiveIntensity={1.7} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {towers.map((position, i) => (
        <Floodlight key={i} position={position} target={[cx, cz]} />
      ))}
    </group>
  );
}
