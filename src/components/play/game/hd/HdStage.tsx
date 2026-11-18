"use client";

import { Environment, useProgress } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

// Shared light, sky and camera finish for both stadium scenes.

export const HDRI_URL = "/game/stadium_01_1k.hdr";

export function HdLighting({ target, shadowSize }: { target: [number, number, number]; shadowSize: number }) {
  return (
    <>
      {/* CC0 stadium HDRI: image-based light and reflections, plus a softened sky behind the stands */}
      <Environment
        files={HDRI_URL}
        background
        backgroundBlurriness={0.35}
        backgroundIntensity={0.85}
        environmentIntensity={0.7}
      />
      {/* warm key from the floodlights' side, the only shadow caster */}
      <directionalLight
        position={[6, 12, 8]}
        intensity={2.6}
        color="#ffe9cf"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        target-position={target}
      />
      <directionalLight position={[-8, 9, -6]} intensity={0.55} color="#d6e6ff" />
    </>
  );
}

// Ambient occlusion grounds the players, bloom lets the floodlights and LED
// boards glow, AgX keeps the HDR sky from clipping, SMAA cleans the edges.
// On slow machines (PerformanceMonitor decline) the AO pass is dropped first.
export function HdEffects({ ambientOcclusion }: { ambientOcclusion: boolean }) {
  if (!ambientOcclusion) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.8} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette offset={0.28} darkness={0.55} />
        <SMAA />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0}>
      <N8AO halfRes aoRadius={0.5} distanceFalloff={0.5} intensity={2} />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.8} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.28} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}

export function ArenaLoader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#0b3d1f]">
      <span className="font-mono text-sm text-white/75">Switching on the floodlights… {Math.round(progress)}%</span>
    </div>
  );
}
