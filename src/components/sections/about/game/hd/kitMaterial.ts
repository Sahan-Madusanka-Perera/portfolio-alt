import * as THREE from "three";
import type { Kit } from "../kit";
import { GLOVE_COLOR } from "../kit";

// Dresses the untextured CC0 mannequin in any kit. At build time every vertex
// was tagged with a body region (`_REGION`, from its bind-pose position and
// dominant bone); here each region becomes a vertex colour for the kit. One
// shared material, one coloured geometry per kit, no texture downloads.

// keep in sync with REGION in the build-footballer script
export const REGION = { JERSEY: 0, SHORTS: 1, SOCKS: 2, BOOTS: 3, SKIN: 4, HANDS: 5, HAIR: 6, TRIM: 7 } as const;

export const KIT_MATERIAL = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 });

const geometries = new Map<string, THREE.BufferGeometry>();

export function kitGeometry(
  source: THREE.BufferGeometry,
  kit: Kit,
  { joint = false, keeper = false }: { joint?: boolean; keeper?: boolean } = {}
) {
  const key = [source.uuid, kit.jersey, kit.shorts, kit.socks, kit.skin, kit.hair, kit.boots, joint, keeper].join("|");
  const cached = geometries.get(key);
  if (cached) return cached;

  const palette = [
    kit.jersey,
    kit.shorts,
    kit.socks,
    kit.boots,
    kit.skin,
    keeper ? GLOVE_COLOR : kit.skin,
    kit.hair,
    kit.shorts,
  ].map((hex) => new THREE.Color(hex));
  // the mannequin's joint spheres sit a shade darker, so the limbs keep their shape
  const shade = joint ? 0.86 : 1;

  const geometry = source.clone();
  const region = source.getAttribute("_region");
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const color = palette[region ? Math.round(region.getX(i)) : REGION.JERSEY] ?? palette[REGION.JERSEY];
    colors[i * 3] = color.r * shade;
    colors[i * 3 + 1] = color.g * shade;
    colors[i * 3 + 2] = color.b * shade;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  if (region) geometry.deleteAttribute("_region");
  geometries.set(key, geometry);
  return geometry;
}
