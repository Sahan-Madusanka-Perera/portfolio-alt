"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Kit } from "../kit";
import { KIT_MATERIAL, kitGeometry } from "./kitMaterial";

// A rigged, animated footballer: Quaternius' CC0 mannequin wearing a kit.
// The owning scene writes a PlayerDriver each frame; this component blends
// idle / walk / jog / sprint by speed, and layers the kick (which the library
// doesn't include) on top of the leg bones procedurally.

export const FOOTBALLER_URL = "/game/footballer.glb";
const MODEL_HEIGHT = 1.83;
const FADE = 0.22;
const KICK_TIME = 0.42;
// Sign of a forward leg swing / forward bend about the bones' local X axis.
const SWING_SIGN = -1;

export type PlayerMode = "play" | "ready" | "dive" | "celebrate" | "dejected";
export type PlayerDriver = {
  /** ground speed in body-heights per second */
  speed: number;
  /** time of the last kick, on the same clock as `now` */
  kickAt: number;
  now: number;
  mode: PlayerMode;
};

export function makeDriver(mode: PlayerMode = "play"): PlayerDriver {
  return { speed: 0, kickAt: -100, now: 0, mode };
}

type ActionName = "idle" | "walk" | "jog" | "sprint" | "dance" | "jump";
const CLIPS: Record<ActionName, string> = {
  idle: "Idle_Loop",
  walk: "Walk_Loop",
  jog: "Jog_Fwd_Loop",
  sprint: "Sprint_Loop",
  dance: "Dance_Loop",
  jump: "Jump_Loop",
};
// Approximate authored ground speed of each locomotion clip, in body-heights/s.
const STRIDE: Partial<Record<ActionName, number>> = { walk: 0.9, jog: 2.2, sprint: 3.6 };

function pickAction(driver: PlayerDriver): ActionName {
  switch (driver.mode) {
    case "celebrate":
      return "dance";
    case "dive":
      return "jump";
    case "ready":
    case "dejected":
      return "idle";
    default:
      if (driver.speed < 0.25) return "idle";
      if (driver.speed < 1.4) return "walk";
      return driver.speed < 3 ? "jog" : "sprint";
  }
}

type Rig = {
  mixer: THREE.AnimationMixer;
  actions: Record<ActionName, THREE.AnimationAction | null>;
  thigh: THREE.Object3D | null;
  shin: THREE.Object3D | null;
  spine: THREE.Object3D | null;
};

const TURN = new THREE.Quaternion();
const X_AXIS = new THREE.Vector3(1, 0, 0);

export function Footballer({
  kit,
  height,
  drivers,
  index,
  keeper = false,
}: {
  kit: Kit;
  height: number;
  drivers: RefObject<PlayerDriver[]>;
  index: number;
  keeper?: boolean;
}) {
  const { scene, animations } = useGLTF(FOOTBALLER_URL);

  const model = useMemo(() => {
    const root = cloneSkinned(scene);
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      mesh.geometry = kitGeometry(mesh.geometry, kit, { joint: source?.name === "M_Joints", keeper });
      mesh.material = KIT_MATERIAL;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
    });
    return root;
  }, [scene, kit, keeper]);

  const rig = useRef<Rig | null>(null);
  const current = useRef<ActionName | null>(null);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(model);
    const actions = {} as Rig["actions"];
    (Object.keys(CLIPS) as ActionName[]).forEach((name) => {
      const clip = THREE.AnimationClip.findByName(animations, CLIPS[name]);
      actions[name] = clip ? mixer.clipAction(clip) : null;
    });
    // GLTFLoader strips "." from node names ("DEF-thigh.R" → "DEF-thighR").
    rig.current = {
      mixer,
      actions,
      thigh: model.getObjectByName("DEF-thighR") ?? null,
      shin: model.getObjectByName("DEF-shinR") ?? null,
      spine: model.getObjectByName("DEF-spine002") ?? null,
    };
    current.current = null;
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      rig.current = null;
    };
  }, [model, animations]);

  useFrame((_, delta) => {
    const r = rig.current;
    const driver = drivers.current?.[index];
    if (!r || !driver) return;

    const next = pickAction(driver);
    if (next !== current.current) {
      const incoming = r.actions[next];
      const outgoing = current.current ? r.actions[current.current] : null;
      if (incoming) {
        incoming.reset();
        // start each player at a different point in the loop so a squad never moves in lockstep
        incoming.time = Math.random() * incoming.getClip().duration;
        incoming.fadeIn(FADE).play();
      }
      outgoing?.fadeOut(FADE);
      current.current = next;
    }
    const active = r.actions[next];
    const stride = STRIDE[next];
    if (active) active.timeScale = stride ? THREE.MathUtils.clamp(driver.speed / stride, 0.7, 1.5) : 1;

    r.mixer.update(Math.min(delta, 0.05));

    // Kick: wind the right leg back, then drive it through, over the running pose.
    const since = driver.now - driver.kickAt;
    if (since >= 0 && since < KICK_TIME && r.thigh) {
      const t = since / KICK_TIME;
      const back = Math.sin(Math.min(t / 0.3, 1) * Math.PI * 0.5) * (1 - THREE.MathUtils.smoothstep(t, 0.3, 0.5));
      const through = Math.sin(THREE.MathUtils.clamp((t - 0.3) / 0.7, 0, 1) * Math.PI);
      r.thigh.quaternion.multiply(TURN.setFromAxisAngle(X_AXIS, SWING_SIGN * (1.35 * through - 0.75 * back)));
      if (r.shin) r.shin.quaternion.multiply(TURN.setFromAxisAngle(X_AXIS, -SWING_SIGN * 1.2 * back));
    }
    if (driver.mode === "dejected" && r.spine) {
      r.spine.quaternion.multiply(TURN.setFromAxisAngle(X_AXIS, SWING_SIGN * -0.45));
    }
  });

  return (
    <group scale={height / MODEL_HEIGHT}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(FOOTBALLER_URL);
