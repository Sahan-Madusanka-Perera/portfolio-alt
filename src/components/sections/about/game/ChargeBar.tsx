"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MatchEngine } from "./matchEngine";

const WIDTH = 0.62;
const FLAT = [new THREE.Color("#fbbf24"), new THREE.Color("#ef4444")] as const;
// HDR values so the stadium's bloom pass makes the bar glow
const GLOW = [new THREE.Color(2.4, 1.8, 0.45), new THREE.Color(2.6, 0.45, 0.3)] as const;

// Shot power: fills amber to red while Space is held, on the grass just in
// front of (camera-side of) the player you control.
export function ChargeBar({ engine, glow = false }: { engine: RefObject<MatchEngine | null>; glow?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const fill = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const game = engine.current;
    const g = group.current;
    const f = fill.current;
    if (!game || !g || !f) return;
    const charge = game.charge;
    g.visible = charge > 0;
    if (charge <= 0) return;
    const p = game.players[game.active];
    g.position.set(p.pos.x, 0.03, p.pos.z + 0.42);
    f.scale.x = Math.max(0.001, charge);
    f.position.x = (-WIDTH / 2) * (1 - charge);
    const [low, high] = glow ? GLOW : FLAT;
    (f.material as THREE.MeshBasicMaterial).color.lerpColors(low, high, charge);
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WIDTH + 0.05, 0.11]} />
        <meshBasicMaterial color="#0b0f1a" transparent opacity={0.65} toneMapped={!glow} />
      </mesh>
      <mesh ref={fill} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[WIDTH, 0.065]} />
        <meshBasicMaterial toneMapped={!glow} />
      </mesh>
    </group>
  );
}
