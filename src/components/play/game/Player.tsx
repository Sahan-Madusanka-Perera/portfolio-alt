"use client";

import { forwardRef } from "react";
import type { Group } from "three";
import type { Kit } from "./kit";
import { GLOVE_COLOR } from "./kit";

// A stylized-but-proportioned footballer built from primitives. Low-poly on
// purpose (fast, no asset licensing), but the proportions, full kit coloring
// (jersey / shorts / socks / boots / skin / hair) and shadow casting are what
// make it read as "a game" rather than a blob. Local space: feet at y≈0,
// head near y≈1.5, facing +Z.

type LegProps = { kit: Kit; side: -1 | 1 };

function Leg({ kit, side }: LegProps) {
  return (
    <group position={[0.09 * side, 0, 0]}>
      {/* thigh */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
        <meshStandardMaterial color={kit.skin} roughness={0.85} />
      </mesh>
      {/* shin (sock) */}
      <mesh position={[0, 0.2, 0.01]} castShadow>
        <capsuleGeometry args={[0.062, 0.22, 6, 12]} />
        <meshStandardMaterial color={kit.socks} roughness={0.9} />
      </mesh>
      {/* boot */}
      <mesh position={[0, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial color={kit.boots} roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}

type ArmProps = { kit: Kit; side: -1 | 1; isKeeper: boolean };

function Arm({ kit, side, isKeeper }: ArmProps) {
  // Keeper holds arms out and ready; outfield arms rest closer to the body.
  const outward = isKeeper ? 0.9 : 0.32;
  const forward = isKeeper ? 0.25 : 0;
  return (
    <group position={[0.2 * side, 1.24, 0]} rotation={[forward, 0, outward * side]}>
      {/* upper arm (sleeve) */}
      <mesh position={[0, -0.14, 0]} castShadow>
        <capsuleGeometry args={[0.052, 0.18, 6, 12]} />
        <meshStandardMaterial color={kit.jersey} roughness={0.8} />
      </mesh>
      {/* forearm (skin) */}
      <mesh position={[0, -0.36, 0]} castShadow>
        <capsuleGeometry args={[0.046, 0.18, 6, 12]} />
        <meshStandardMaterial color={kit.skin} roughness={0.85} />
      </mesh>
      {/* hand / glove */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={isKeeper ? GLOVE_COLOR : kit.skin} roughness={0.7} />
      </mesh>
    </group>
  );
}

type PlayerProps = {
  kit: Kit;
  isKeeper?: boolean;
  /** ref on the right-leg pivot so a parent can animate a kick */
  kickLegRef?: React.Ref<Group>;
};

export const Player = forwardRef<Group, PlayerProps>(function Player({ kit, isKeeper = false, kickLegRef }, ref) {
  return (
    <group ref={ref}>
      {/* left leg — static */}
      <Leg kit={kit} side={-1} />
      {/* right leg — pivots at the hip for a kick when a ref is attached */}
      <group ref={kickLegRef} position={[0, 0.66, 0]}>
        <group position={[0, -0.66, 0]}>
          <Leg kit={kit} side={1} />
        </group>
      </group>

      {/* shorts */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.135, 0.12, 6, 14]} />
        <meshStandardMaterial color={kit.shorts} roughness={0.85} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.34, 8, 16]} />
        <meshStandardMaterial color={kit.jersey} roughness={0.75} />
      </mesh>

      <Arm kit={kit} side={-1} isKeeper={isKeeper} />
      <Arm kit={kit} side={1} isKeeper={isKeeper} />

      {/* neck */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.07, 12]} />
        <meshStandardMaterial color={kit.skin} roughness={0.85} />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.44, 0]} castShadow>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color={kit.skin} roughness={0.8} />
      </mesh>
      {/* hair cap — pushed back and up so the face stays clear */}
      <mesh position={[0, 1.48, -0.02]} castShadow>
        <sphereGeometry args={[0.125, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color={kit.hair} roughness={0.9} />
      </mesh>
    </group>
  );
});

// A lighter figure for the match's pulled-back / top-down camera, where the
// full-detail Player would be wasted geometry across 8 figures. Reads clearly
// from above: team-colored body, head, and a small nose marking heading.
export const MiniPlayer = forwardRef<Group, { kit: Kit }>(function MiniPlayer({ kit }, ref) {
  return (
    <group ref={ref}>
      {/* body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.4, 8, 16]} />
        <meshStandardMaterial color={kit.jersey} roughness={0.75} />
      </mesh>
      {/* shorts band */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.165, 0.15, 0.16, 16]} />
        <meshStandardMaterial color={kit.shorts} roughness={0.85} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial color={kit.skin} roughness={0.8} />
      </mesh>
      {/* hair */}
      <mesh position={[0, 0.85, -0.015]} castShadow>
        <sphereGeometry args={[0.135, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={kit.hair} roughness={0.9} />
      </mesh>
      {/* nose — heading indicator */}
      <mesh position={[0, 0.8, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.03, 0.06, 8]} />
        <meshStandardMaterial color={kit.skin} roughness={0.8} />
      </mesh>
    </group>
  );
});
