"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { PENALTY, PenaltyPitch } from "../Pitch";
import { Ball } from "../Ball";
import { HOME_KIT, KEEPER_KIT, clamp01, easeOutCubic } from "../kit";
import { ANIM_MS, KEEPER_X, ZONE_X, type Phase, type Shot } from "../penalty";
import { Footballer, makeDriver, type PlayerDriver } from "./Footballer";
import { Stadium, type PitchRect } from "./Stadium";
import { ArenaLoader, HdEffects, HdLighting } from "./HdStage";

const PLAYER_HEIGHT = 1.35;
const BALL_RADIUS = 0.09;
const SPOT: [number, number, number] = [0, BALL_RADIUS, PENALTY.spotZ];
const STRIKER: [number, number, number] = [-0.2, 0, PENALTY.spotZ + 0.34];
// the ball leaves the spot when the swinging foot arrives, not when the swing starts
const CONTACT_DELAY = 0.13;
const RECT: PitchRect = { xMin: -4, xMax: 4, zMin: -4.2, zMax: 2.6 };

type Props = { shot: Shot | null; phase: Phase };

function Scene({ shot, phase }: Props) {
  const keeperRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);
  const drivers = useRef<PlayerDriver[]>([makeDriver("ready"), makeDriver("ready")]);
  const startRef = useRef(0);
  const lastId = useRef(-1);
  const cheeredId = useRef(-1);
  const cheerAt = useRef(-100);

  useFrame((state, rawDt) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(rawDt, 0.05);
    const [striker, keeper] = drivers.current;
    striker.now = t;
    keeper.now = t;

    if (shot && shot.id !== lastId.current) {
      lastId.current = shot.id;
      startRef.current = t;
      striker.kickAt = t;
    }
    const active = phase !== "idle" && shot;
    const flight = active
      ? phase === "result"
        ? 1
        : clamp01((t - startRef.current - CONTACT_DELAY) / (ANIM_MS / 1000 - CONTACT_DELAY))
      : 0;

    const scored = phase === "result" && shot && !shot.saved;
    if (scored && shot.id !== cheeredId.current) {
      cheeredId.current = shot.id;
      cheerAt.current = t;
    }

    striker.mode = phase === "result" && shot ? (shot.saved ? "dejected" : "celebrate") : "ready";

    // keeper: springs toward the chosen side, then gets back up on the result
    if (keeperRef.current) {
      const g = keeperRef.current;
      const targetX = shot && active ? KEEPER_X[shot.keeperZone] * 1.05 : 0;
      const diving = Boolean(active) && phase === "resolving" && Math.abs(targetX) > 0.1;
      const dived = easeOutCubic(clamp01(flight * 1.5));
      const goalX = active ? targetX * (phase === "result" ? 1 : dived) : 0;
      const goalY = diving ? Math.sin(dived * Math.PI * 0.9) * 0.35 : 0;
      const goalTilt = diving ? (targetX > 0 ? -1 : 1) * dived * 1.15 : 0;
      const k = diving ? 1 : 1 - Math.exp(-dt * 6);
      g.position.x += (goalX - g.position.x) * k;
      g.position.y += (goalY - g.position.y) * k;
      g.rotation.z += (goalTilt - g.rotation.z) * k;
      keeper.mode = diving ? "dive" : phase === "result" && shot ? (shot.saved ? "celebrate" : "dejected") : "ready";
    }

    // ball flight: parabolic arc into the chosen corner
    if (ballRef.current) {
      if (!active) {
        ballRef.current.position.set(SPOT[0], SPOT[1], SPOT[2]);
        ballRef.current.rotation.set(0, 0, 0);
      } else {
        const p = easeOutCubic(flight);
        const endX = ZONE_X[shot.zone];
        const endZ = PENALTY.goalZ + 0.25;
        const endY = shot.saved ? 0.45 : 0.75;
        ballRef.current.position.x = THREE.MathUtils.lerp(SPOT[0], endX, p);
        ballRef.current.position.z = THREE.MathUtils.lerp(SPOT[2], endZ, p);
        ballRef.current.position.y = SPOT[1] + Math.sin(p * Math.PI) * 0.5 + (endY - SPOT[1]) * p;
        if (flight > 0 && flight < 1) ballRef.current.rotation.x -= 0.4;
      }
    }

    // a slow handheld drift keeps the frame alive between kicks
    state.camera.position.x = Math.sin(t * 0.25) * 0.07;
    state.camera.position.y = 1.55 + Math.sin(t * 0.33) * 0.02;
    state.camera.lookAt(0, 0.85, PENALTY.goalZ);
  });

  return (
    <>
      <HdLighting target={[0, 0, PENALTY.goalZ]} shadowSize={6} />
      <fog attach="fog" args={["#d8c7a8", 18, 70]} />
      <PenaltyPitch detail />
      <Stadium rect={RECT} variant="penalty" cheerAt={cheerAt} />
      <group ref={keeperRef} position={[0, 0, PENALTY.goalZ + 0.3]}>
        <Footballer kit={KEEPER_KIT} keeper height={PLAYER_HEIGHT} drivers={drivers} index={1} />
      </group>
      <group position={STRIKER} rotation={[0, Math.PI, 0]}>
        <Footballer kit={HOME_KIT} height={PLAYER_HEIGHT} drivers={drivers} index={0} />
      </group>
      <Ball ref={ballRef} radius={BALL_RADIUS} />
    </>
  );
}

export function PenaltyHdCanvas(props: Props) {
  const [degraded, setDegraded] = useState(false);
  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={degraded ? 1 : [1, 1.75]}
        flat
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.1, far: 160, position: [0, 1.55, 2.3] }}
      >
        <PerformanceMonitor onDecline={() => setDegraded(true)} />
        <Suspense fallback={null}>
          <Scene {...props} />
          <HdEffects ambientOcclusion={!degraded} />
        </Suspense>
      </Canvas>
      <ArenaLoader />
    </>
  );
}
