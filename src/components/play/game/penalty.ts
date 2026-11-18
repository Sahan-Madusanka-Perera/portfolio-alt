// Shot model shared by the lightweight and stadium (HD) penalty scenes.

export type Zone = "left" | "center" | "right";
export type Phase = "idle" | "resolving" | "result";
export type Shot = { id: number; zone: Zone; keeperZone: Zone; saved: boolean };

export const ZONE_X: Record<Zone, number> = { left: -1.3, center: 0, right: 1.3 };
export const KEEPER_X: Record<Zone, number> = { left: -1.05, center: 0, right: 1.05 };
export const ANIM_MS = 900;
