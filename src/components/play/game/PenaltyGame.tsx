"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Player } from "./Player";
import { Ball } from "./Ball";
import { PenaltyPitch, PitchLighting, PENALTY } from "./Pitch";
import { HOME_KIT, KEEPER_KIT, SKY_COLOR, clamp01, easeOutCubic } from "./kit";

import { StadiumLoading } from "./StadiumLoading";
import { ANIM_MS, KEEPER_X, ZONE_X, type Phase, type Shot, type Zone } from "./penalty";

// Stadium version: its own chunk, fetched only when HD graphics are on.
const PenaltyHdCanvas = lazy(() => import("./hd/PenaltyHd").then((m) => ({ default: m.PenaltyHdCanvas })));
const BEST_KEY = "shootout-best-streak";
const SPOT: [number, number, number] = [0, 0.12, PENALTY.spotZ];
const STRIKER_Z = PENALTY.spotZ + 0.55;

function randomZone(): Zone {
  return (["left", "center", "right"] as Zone[])[Math.floor(Math.random() * 3)];
}

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.75, 2.1);
    camera.lookAt(0, 0.95, PENALTY.goalZ);
  }, [camera]);
  return null;
}

function Scene({ shot, phase, reduced }: { shot: Shot | null; phase: Phase; reduced: boolean }) {
  const keeperRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);
  const kickLegRef = useRef<THREE.Group>(null);
  const startRef = useRef(0);
  const lastId = useRef(-1);

  useFrame((state) => {
    if (shot && shot.id !== lastId.current) {
      lastId.current = shot.id;
      startRef.current = state.clock.elapsedTime;
    }
    const t = state.clock.elapsedTime;
    const active = phase !== "idle" && shot;

    let progress = 0;
    if (active) {
      progress = reduced ? 1 : phase === "result" ? 1 : clamp01((t - startRef.current) / (ANIM_MS / 1000));
    }

    // keeper
    if (keeperRef.current) {
      const targetX = shot ? KEEPER_X[shot.keeperZone] : 0;
      const dived = easeOutCubic(clamp01(progress * 1.4));
      keeperRef.current.position.x = targetX * dived;
      keeperRef.current.position.y = Math.abs(targetX) > 0.1 ? dived * 0.25 : 0;
      keeperRef.current.rotation.z = targetX === 0 ? 0 : (targetX > 0 ? -1 : 1) * dived * 0.9;
      if (!active) {
        // idle sway
        keeperRef.current.position.y = Math.sin(t * 2) * 0.02;
        keeperRef.current.rotation.z = Math.sin(t * 1.3) * 0.04;
      }
    }

    // striker kick
    if (kickLegRef.current) {
      const swing = active && !reduced ? Math.sin(clamp01(progress * 2.2) * Math.PI) : 0;
      kickLegRef.current.rotation.x = -swing * 1.1;
    }

    // ball flight — parabolic arc into the chosen corner
    if (ballRef.current) {
      if (!active) {
        ballRef.current.position.set(SPOT[0], SPOT[1], SPOT[2]);
        ballRef.current.rotation.set(0, 0, 0);
      } else {
        const p = easeOutCubic(progress);
        const endX = ZONE_X[shot!.zone];
        const endZ = PENALTY.goalZ + 0.25;
        const endY = shot!.saved ? 0.45 : 0.75;
        ballRef.current.position.x = THREE.MathUtils.lerp(SPOT[0], endX, p);
        ballRef.current.position.z = THREE.MathUtils.lerp(SPOT[2], endZ, p);
        ballRef.current.position.y = SPOT[1] + Math.sin(p * Math.PI) * 0.5 + (endY - SPOT[1]) * p;
        ballRef.current.rotation.x -= 0.4;
      }
    }
  });

  return (
    <>
      <color attach="background" args={[SKY_COLOR]} />
      <fog attach="fog" args={[SKY_COLOR, 8, 16]} />
      <PitchLighting target={[0, 0, PENALTY.goalZ]} />
      <PenaltyPitch />
      <group ref={keeperRef} position={[0, 0, PENALTY.goalZ + 0.3]}>
        <Player kit={KEEPER_KIT} isKeeper />
      </group>
      <group position={[-0.35, 0, STRIKER_Z]} rotation={[0, Math.PI, 0]}>
        <Player kit={HOME_KIT} kickLegRef={kickLegRef} />
      </group>
      <Ball ref={ballRef} />
    </>
  );
}

export function PenaltyGame({ hd = false }: { hd?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [shot, setShot] = useState<Shot | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0);
  });
  const idRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const shoot = useCallback(
    (zone: Zone) => {
      if (phase === "resolving") return;
      const keeperZone = randomZone();
      const saved = keeperZone === zone;
      idRef.current += 1;
      setShot({ id: idRef.current, zone, keeperZone, saved });
      setPhase("resolving");
      timerRef.current = window.setTimeout(
        () => {
          setPhase("result");
          setStreak((s) => {
            const next = saved ? 0 : s + 1;
            setBest((b) => {
              if (next > b) {
                window.localStorage.setItem(BEST_KEY, String(next));
                return next;
              }
              return b;
            });
            return next;
          });
        },
        reduced ? 0 : ANIM_MS
      );
    },
    [phase, reduced]
  );

  const next = useCallback(() => {
    setShot(null);
    setPhase("idle");
  }, []);

  const scored = phase === "result" && shot && !shot.saved;

  return (
    <div className="absolute inset-0">
      {hd ? (
        <Suspense fallback={<StadiumLoading />}>
          <PenaltyHdCanvas shot={shot} phase={phase} />
        </Suspense>
      ) : (
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ fov: 42, near: 0.1, far: 40 }}
        >
          <CameraRig />
          <Scene shot={shot} phase={phase} reduced={reduced} />
        </Canvas>
      )}

      {/* streak chip */}
      <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
        <span className="rounded-full bg-black/45 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
          Streak <span className="text-[color:var(--color-accent)]">{streak}</span>
        </span>
        <span className="rounded-full bg-black/45 px-3 py-1 font-mono text-xs text-white/80 backdrop-blur-sm">
          Best {best}
        </span>
      </div>

      {/* controls / result */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        {phase === "result" ? (
          <div className="mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-md">
            <span className={`text-lg font-bold ${scored ? "text-[color:var(--color-accent)]" : "text-white"}`}>
              {scored ? "GOAL! ⚽" : "SAVED! 🧤"}
            </span>
            <button
              type="button"
              data-cursor="link"
              onClick={next}
              className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-[color:var(--color-accent-foreground)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Next kick
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
            {(["left", "center", "right"] as Zone[]).map((zone) => (
              <button
                key={zone}
                type="button"
                data-cursor="link"
                disabled={phase === "resolving"}
                onClick={() => shoot(zone)}
                className="rounded-xl bg-black/45 py-3 text-sm font-semibold capitalize text-white backdrop-blur-sm transition-colors hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {zone === "left" ? "◄ " : zone === "right" ? "► " : "▲ "}
                {zone}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
