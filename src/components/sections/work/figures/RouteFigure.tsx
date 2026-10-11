"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Town = { id: string; name: string; lat: number; lon: number };

const TOWNS: Town[] = [
  { id: "jaffna", name: "Jaffna", lat: 9.66, lon: 80.02 },
  { id: "vavuniya", name: "Vavuniya", lat: 8.75, lon: 80.5 },
  { id: "trincomalee", name: "Trincomalee", lat: 8.59, lon: 81.21 },
  { id: "anuradhapura", name: "Anuradhapura", lat: 8.31, lon: 80.4 },
  { id: "puttalam", name: "Puttalam", lat: 8.03, lon: 79.83 },
  { id: "polonnaruwa", name: "Polonnaruwa", lat: 7.94, lon: 81.0 },
  { id: "dambulla", name: "Dambulla", lat: 7.86, lon: 80.65 },
  { id: "batticaloa", name: "Batticaloa", lat: 7.73, lon: 81.69 },
  { id: "kurunegala", name: "Kurunegala", lat: 7.49, lon: 80.36 },
  { id: "kandy", name: "Kandy", lat: 7.29, lon: 80.63 },
  { id: "negombo", name: "Negombo", lat: 7.21, lon: 79.84 },
  { id: "badulla", name: "Badulla", lat: 6.99, lon: 81.06 },
  { id: "nuwara-eliya", name: "Nuwara Eliya", lat: 6.97, lon: 80.78 },
  { id: "colombo", name: "Colombo", lat: 6.93, lon: 79.86 },
  { id: "ratnapura", name: "Ratnapura", lat: 6.68, lon: 80.4 },
  { id: "hambantota", name: "Hambantota", lat: 6.12, lon: 81.12 },
  { id: "galle", name: "Galle", lat: 6.05, lon: 80.22 },
  { id: "matara", name: "Matara", lat: 5.95, lon: 80.55 },
];

const ROADS: [string, string][] = [
  ["colombo", "negombo"], ["negombo", "puttalam"], ["puttalam", "anuradhapura"], ["negombo", "kurunegala"],
  ["colombo", "kandy"], ["kurunegala", "kandy"], ["colombo", "ratnapura"], ["colombo", "galle"],
  ["galle", "matara"], ["matara", "hambantota"], ["hambantota", "badulla"], ["ratnapura", "badulla"],
  ["kandy", "nuwara-eliya"], ["nuwara-eliya", "badulla"], ["kandy", "dambulla"], ["kurunegala", "dambulla"],
  ["kurunegala", "anuradhapura"], ["dambulla", "anuradhapura"], ["dambulla", "polonnaruwa"], ["dambulla", "trincomalee"],
  ["anuradhapura", "vavuniya"], ["vavuniya", "jaffna"], ["anuradhapura", "trincomalee"], ["polonnaruwa", "batticaloa"],
  ["trincomalee", "batticaloa"], ["batticaloa", "badulla"], ["ratnapura", "nuwara-eliya"],
];

const SOURCE = "colombo";
const project = (t: Town) => ({ x: 22 + ((t.lon - 79.7) / 2.1) * 196, y: 18 + ((9.8 - t.lat) / 3.95) * 292 });
const byId = Object.fromEntries(TOWNS.map((t) => [t.id, t]));

// Label placement: try eight spots around each town and keep the one that
// crosses the fewest roads, towns and already-placed labels.
type Anchor = "start" | "middle" | "end";
type Box = { x0: number; y0: number; x1: number; y1: number };
const VIEW = { w: 240, h: 330 };
const SPOTS: { dx: number; dy: number; anchor: Anchor }[] = [
  { dx: 6.5, dy: 3, anchor: "start" },
  { dx: -6.5, dy: 3, anchor: "end" },
  { dx: 4.5, dy: -5.5, anchor: "start" },
  { dx: -4.5, dy: -5.5, anchor: "end" },
  { dx: 4.5, dy: 11.5, anchor: "start" },
  { dx: -4.5, dy: 11.5, anchor: "end" },
  { dx: 0, dy: -7.5, anchor: "middle" },
  { dx: 0, dy: 13, anchor: "middle" },
];

function segmentHitsBox(ax: number, ay: number, bx: number, by: number, b: Box) {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  const p = [-dx, dx, -dy, dy];
  const q = [ax - b.x0, b.x1 - ax, ay - b.y0, b.y1 - ay];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return false;
        t0 = Math.max(t0, r);
      } else {
        if (r < t0) return false;
        t1 = Math.min(t1, r);
      }
    }
  }
  return true;
}

const LABELS: Record<string, { dx: number; dy: number; anchor: Anchor }> = (() => {
  const placed: Box[] = [];
  const out: Record<string, { dx: number; dy: number; anchor: Anchor }> = {};
  const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  for (const town of TOWNS) {
    const p = project(town);
    const width = town.name.length * 4.6 + 2;
    let best = { spot: SPOTS[0], box: { x0: 0, y0: 0, x1: 0, y1: 0 }, score: Infinity };
    SPOTS.forEach((spot, order) => {
      const x = p.x + spot.dx;
      const baseline = p.y + spot.dy;
      const x0 = spot.anchor === "start" ? x : spot.anchor === "end" ? x - width : x - width / 2;
      const box = { x0: x0 - 1, x1: x0 + width + 1, y0: baseline - 7.5, y1: baseline + 2 };
      let score = order * 0.2;
      for (const [a, b] of ROADS) {
        const pa = project(byId[a]);
        const pb = project(byId[b]);
        if (segmentHitsBox(pa.x, pa.y, pb.x, pb.y, box)) score += 10;
      }
      for (const other of TOWNS) {
        const q = project(other);
        if (q.x > box.x0 - 3 && q.x < box.x1 + 3 && q.y > box.y0 - 3 && q.y < box.y1 + 3) score += 8;
      }
      for (const other of placed) if (overlaps(box, other)) score += 12;
      if (box.x0 < 2 || box.x1 > VIEW.w - 2 || box.y0 < 2 || box.y1 > VIEW.h - 2) score += 40;
      if (score < best.score) best = { spot, box, score };
    });
    placed.push(best.box);
    out[town.id] = best.spot;
  }
  return out;
})();

function km(a: Town, b: Town) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function dijkstra(target: string) {
  const adj: Record<string, { to: string; w: number }[]> = {};
  for (const [a, b] of ROADS) {
    const w = km(byId[a], byId[b]);
    (adj[a] ??= []).push({ to: b, w });
    (adj[b] ??= []).push({ to: a, w });
  }
  const dist: Record<string, number> = { [SOURCE]: 0 };
  const prev: Record<string, string> = {};
  const settled = new Set<string>();
  const order: string[] = [];
  while (true) {
    let current: string | null = null;
    for (const id of Object.keys(dist)) {
      if (!settled.has(id) && (current === null || dist[id] < dist[current])) current = id;
    }
    if (current === null) break;
    settled.add(current);
    order.push(current);
    if (current === target) break;
    for (const { to, w } of adj[current] ?? []) {
      const next = dist[current] + w;
      if (dist[to] === undefined || next < dist[to]) {
        dist[to] = next;
        prev[to] = current;
      }
    }
  }
  const path = [target];
  while (path[0] !== SOURCE && prev[path[0]]) path.unshift(prev[path[0]]);
  return { order, path, total: dist[target] ?? 0 };
}

// Fig: Dijkstra from Colombo over an illustrative road graph. The search
// settles towns one by one in ink, then the red pen draws the shortest route.
export function RouteFigure({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [target, setTarget] = useState("jaffna");
  const [progress, setProgress] = useState(0);
  const result = useMemo(() => dijkstra(target), [target]);
  const step = reduced ? result.order.length : progress;
  const done = step >= result.order.length;

  useEffect(() => {
    if (!active || reduced) return;
    const id = window.setInterval(() => {
      setProgress((s) => (s >= result.order.length ? s : s + 1));
    }, 120);
    return () => window.clearInterval(id);
  }, [active, reduced, result]);

  const settled = new Set(result.order.slice(0, step));
  const onPath = new Set(done ? result.path : []);
  const pathD = result.path
    .map((id, i) => {
      const p = project(byId[id]);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");

  function choose(id: string) {
    if (id === SOURCE || id === target) return;
    setProgress(0);
    setTarget(id);
  }

  return (
    <figure className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 240 330" className="h-full max-h-[34rem] w-full" role="group" aria-label="Road graph of Sri Lankan towns">
          {ROADS.map(([a, b]) => {
            const p = project(byId[a]);
            const q = project(byId[b]);
            const lit = settled.has(a) && settled.has(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="currentColor"
                strokeWidth={lit ? 1.1 : 0.8}
                strokeDasharray={lit ? undefined : "2 2.5"}
                className={lit ? "text-ink/60" : "text-muted/45"}
              />
            );
          })}

          {done && (
            <path
              key={target}
              d={pathD}
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="draw-on text-pen"
              style={{ ["--dur" as string]: "0.9s" }}
            />
          )}

          {TOWNS.map((town) => {
            const p = project(town);
            const isSource = town.id === SOURCE;
            const isTarget = town.id === target;
            const label = LABELS[town.id];
            const labelX = p.x + label.dx;
            const labelY = p.y + label.dy;
            const anchor = label.anchor;
            return (
              <g
                key={town.id}
                role={isSource ? undefined : "button"}
                tabIndex={isSource ? undefined : 0}
                aria-label={isSource ? undefined : `Route from Colombo to ${town.name}`}
                aria-pressed={isSource ? undefined : isTarget}
                data-cursor={isSource ? undefined : "link"}
                onClick={() => choose(town.id)}
                onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose(town.id);
                  }
                }}
                className={isSource ? undefined : "cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-pen"}
              >
                <circle cx={p.x} cy={p.y} r={10} fill="transparent" stroke="transparent" strokeWidth={1.5} strokeDasharray="2 2" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSource || isTarget ? 4.2 : 3}
                  stroke="currentColor"
                  strokeWidth={1.3}
                  className={
                    onPath.has(town.id)
                      ? "fill-pen text-pen"
                      : settled.has(town.id)
                        ? "fill-ink text-ink"
                        : "fill-sheet text-muted"
                  }
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={anchor}
                  className={`font-sans text-[8.5px] ${isSource || isTarget ? "fill-text font-semibold" : "fill-muted"}`}
                  style={{ stroke: "var(--sheet)", strokeWidth: 3, strokeLinejoin: "round", paintOrder: "stroke" }}
                >
                  {town.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 font-hand text-lg leading-snug text-ink" aria-live="polite">
        {done ? (
          <>
            Colombo → {byId[target].name}: <span className="font-bold text-pen">≈ {Math.round(result.total)} km</span>,
            after settling {result.order.length} of {TOWNS.length} towns.
          </>
        ) : (
          <>Settling towns… {step}</>
        )}
      </p>
      <figcaption className="mt-1 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 5</span>{" "}Tap any town to re-route. An illustrative graph of
        major towns with straight-line leg distances, not the project&apos;s real road dataset.
      </figcaption>
    </figure>
  );
}
