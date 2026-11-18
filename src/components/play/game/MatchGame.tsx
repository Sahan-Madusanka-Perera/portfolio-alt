"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MiniPlayer } from "./Player";
import { Ball } from "./Ball";
import { MatchPitch, PitchLighting } from "./Pitch";
import { AWAY_KIT, HOME_KIT, SKY_COLOR } from "./kit";
import { BALL_R, SQUAD_TEAMS, WIN_SCORE, useMatchSim, type Team } from "./matchSim";
import { ChargeBar } from "./ChargeBar";
import { StadiumLoading } from "./StadiumLoading";

// The stadium version pulls in the character model, HDRI and post-processing,
// so it is its own chunk, fetched only when HD graphics are on.
const MatchHdCanvas = lazy(() => import("./hd/MatchHd").then((m) => ({ default: m.MatchHdCanvas })));

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 8.8, 8.2);
    camera.lookAt(0, 0, -0.4);
  }, [camera]);
  return null;
}

type SceneProps = {
  paused: boolean;
  reduced: boolean;
  onGoal: (team: Team) => void;
  resetToken: number;
};

function Scene({ paused, reduced, onGoal, resetToken }: SceneProps) {
  const sim = useMatchSim({ paused, onGoal, resetToken });
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const ballRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.033);
    sim.step(rawDt);
    const game = sim.engine.current!;
    const b = game.ball;

    game.players.forEach((p, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      g.position.set(p.pos.x, 0, p.pos.z);
      g.rotation.y = p.facing;
    });
    if (ballRef.current) {
      ballRef.current.position.set(b.pos.x, b.y, b.pos.z);
      if (!reduced) {
        ballRef.current.rotation.x -= (b.vel.z * dt) / BALL_R;
        ballRef.current.rotation.z += (b.vel.x * dt) / BALL_R;
      }
    }
    if (ringRef.current) {
      const a = game.players[game.active];
      ringRef.current.position.set(a.pos.x, 0.02, a.pos.z);
    }
  });

  return (
    <>
      <color attach="background" args={[SKY_COLOR]} />
      <fog attach="fog" args={[SKY_COLOR, 12, 24]} />
      <PitchLighting target={[0, 0, 0]} />
      <MatchPitch />
      {SQUAD_TEAMS.map((team, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <MiniPlayer kit={team === "home" ? HOME_KIT : AWAY_KIT} />
        </group>
      ))}
      {/* active-player highlight ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.34, 24]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} />
      </mesh>
      <ChargeBar engine={sim.engine} />
      <Ball ref={ballRef} radius={BALL_R} />
    </>
  );
}

export function MatchGame({ hd = false }: { hd?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<"playing" | "over">("playing");
  const [resetToken, setResetToken] = useState(0);
  const goalLock = useRef(false);

  const handleGoal = useCallback(
    (team: Team) => {
      if (goalLock.current) return;
      goalLock.current = true;
      setScore((s) => {
        const nextScore = { ...s, [team]: s[team] + 1 };
        const won = nextScore[team] >= WIN_SCORE;
        setMessage(won ? (team === "home" ? "You win! 🏆" : "You lost 😔") : team === "home" ? "GOAL! ⚽" : "Conceded 😩");
        window.setTimeout(
          () => {
            if (won) {
              setPhase("over");
            } else {
              setMessage(null);
              setResetToken((t) => t + 1);
            }
            goalLock.current = false;
          },
          // the stadium version lets the celebration play a little longer
          won ? 400 : hd ? 1900 : 1200
        );
        return nextScore;
      });
    },
    [hd]
  );

  const rematch = () => {
    setScore({ home: 0, away: 0 });
    setMessage(null);
    setPhase("playing");
    setResetToken((t) => t + 1);
  };

  return (
    <div className="absolute inset-0">
      {hd ? (
        <Suspense fallback={<StadiumLoading />}>
          <MatchHdCanvas paused={phase === "over"} onGoal={handleGoal} resetToken={resetToken} />
        </Suspense>
      ) : (
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ fov: 40, near: 0.1, far: 60 }}
        >
          <CameraRig />
          <Scene paused={phase === "over"} reduced={reduced} onGoal={handleGoal} resetToken={resetToken} />
        </Canvas>
      )}

      {/* scoreboard */}
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full bg-black/55 px-4 py-1.5 font-mono text-sm text-white backdrop-blur-md">
          <span className="text-[#8fb0ff]">YOU</span>
          <span className="text-lg font-bold tabular-nums">
            {score.home} : {score.away}
          </span>
          <span className="text-[#ff9d8c]">CPU</span>
        </div>
      </div>

      {/* controls hint */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-lg bg-black/45 px-3 py-1.5 text-left text-[11px] leading-tight text-white/80 backdrop-blur-sm sm:block">
        <div>
          <kbd className="font-mono">WASD</kbd> move · <kbd className="font-mono">Shift</kbd> sprint
        </div>
        <div>
          Hold <kbd className="font-mono">Space</kbd> to shoot · <kbd className="font-mono">E</kbd> pass
        </div>
        <div>
          <kbd className="font-mono">Q</kbd> switch player · first to {WIN_SCORE}
        </div>
      </div>

      {/* center message */}
      {message && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-2xl bg-black/60 px-6 py-3 text-2xl font-extrabold text-white backdrop-blur-md">
            {message}
          </span>
        </div>
      )}

      {/* game over */}
      {phase === "over" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-3xl font-extrabold text-white">
              {score.home > score.away ? "You win! 🏆" : "CPU wins"}
            </p>
            <p className="font-mono text-lg text-white/80">
              {score.home} : {score.away}
            </p>
            <button
              type="button"
              data-cursor="link"
              onClick={rematch}
              className="rounded-full bg-[color:var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-[color:var(--color-accent-foreground)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Rematch
            </button>
          </div>
        </div>
      )}

      {/* touch fallback note */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-white/60 sm:hidden">
        Best played on desktop with a keyboard
      </div>
    </div>
  );
}
