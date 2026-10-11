"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { MATCH, MatchPitch } from "../Pitch";
import { Ball } from "../Ball";
import { AWAY_KIT, HOME_KIT } from "../kit";
import { BALL_R, SQUAD_TEAMS, useMatchSim, type Team } from "../matchSim";
import { ChargeBar } from "../ChargeBar";
import { Footballer, makeDriver, type PlayerDriver } from "./Footballer";
import { Stadium, type PitchRect } from "./Stadium";
import { ArenaLoader, HdEffects, HdLighting } from "./HdStage";

const PLAYER_HEIGHT = 0.9;
const BALL_RADIUS = 0.1;
const RECT: PitchRect = { xMin: -MATCH.halfW, xMax: MATCH.halfW, zMin: -MATCH.halfL, zMax: MATCH.halfL };

type Props = { paused: boolean; onGoal: (team: Team) => void; resetToken: number };

function dampAngle(from: number, to: number, k: number) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * k;
}

function Scene({ paused, onGoal, resetToken }: Props) {
  const sim = useMatchSim({ paused, onGoal, resetToken });
  const groups = useRef<Array<THREE.Group | null>>([]);
  const drivers = useRef<PlayerDriver[]>(SQUAD_TEAMS.map(() => makeDriver()));
  const ballRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const cheerAt = useRef(-100);
  const seenGoal = useRef<number | null>(null);
  const look = useRef(new THREE.Vector3(0, 0, -0.6));

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    sim.step(rawDt);
    const game = sim.engine.current!;
    const b = game.ball;
    const goal = game.lastGoal;

    if (goal && goal.at !== seenGoal.current) {
      seenGoal.current = goal.at;
      if (goal.team === "home") cheerAt.current = state.clock.elapsedTime;
    }

    game.players.forEach((p, i) => {
      const g = groups.current[i];
      if (g) {
        g.position.set(p.pos.x, 0, p.pos.z);
        // the simulation already turns smoothly; this only removes frame jitter
        g.rotation.y = dampAngle(g.rotation.y, p.facing, 1 - Math.exp(-dt * 22));
      }
      const driver = drivers.current[i];
      driver.speed = Math.hypot(p.vel.x, p.vel.z) / PLAYER_HEIGHT;
      driver.kickAt = p.kickAt;
      driver.now = game.clock;
      driver.mode = goal ? (goal.team === p.team ? "celebrate" : "dejected") : "play";
    });

    if (ballRef.current) {
      ballRef.current.position.set(b.pos.x, b.y - (BALL_R - BALL_RADIUS), b.pos.z);
      ballRef.current.rotation.x -= (b.vel.z * dt) / BALL_RADIUS;
      ballRef.current.rotation.z += (b.vel.x * dt) / BALL_RADIUS;
    }
    if (ringRef.current) {
      const a = game.players[game.active];
      ringRef.current.position.set(a.pos.x, 0.015, a.pos.z);
    }

    // broadcast camera: high behind the home end, drifting after where the ball is going
    const k = 1 - Math.exp(-dt * 2.6);
    const aheadX = b.pos.x + b.vel.x * 0.22;
    const aheadZ = b.pos.z + b.vel.z * 0.22;
    const camera = state.camera;
    camera.position.x += (aheadX * 0.45 - camera.position.x) * k;
    camera.position.y += (6.6 - camera.position.y) * k;
    camera.position.z += (6.9 + aheadZ * 0.55 - camera.position.z) * k;
    look.current.x += (aheadX * 0.7 - look.current.x) * k;
    look.current.z += (aheadZ * 0.7 - 0.5 - look.current.z) * k;
    camera.lookAt(look.current);
  });

  return (
    <>
      <HdLighting target={[0, 0, 0]} shadowSize={7} />
      <fog attach="fog" args={["#d8c7a8", 30, 95]} />
      <MatchPitch detail boards={false} />
      <Stadium rect={RECT} variant="match" cheerAt={cheerAt} />
      {SQUAD_TEAMS.map((team, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <Footballer kit={team === "home" ? HOME_KIT : AWAY_KIT} height={PLAYER_HEIGHT} drivers={drivers} index={i} />
        </group>
      ))}
      {/* active-player ring, bright enough to bloom */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 48]} />
        <meshBasicMaterial color={[2.4, 1.8, 0.45]} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <ChargeBar engine={sim.engine} glow />
      <Ball ref={ballRef} radius={BALL_RADIUS} />
    </>
  );
}

export function MatchHdCanvas(props: Props) {
  const [degraded, setDegraded] = useState(false);
  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={degraded ? 1 : [1, 1.75]}
        flat
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 38, near: 0.1, far: 160, position: [0, 6.6, 6.9] }}
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
