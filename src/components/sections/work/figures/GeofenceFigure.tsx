"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

const SIZE = 21;
const ROTATE_MS = 3200;

function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function finder(x: number, y: number) {
  const inBox = (ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null;
    return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
  };
  return inBox(0, 0) ?? inBox(SIZE - 7, 0) ?? inBox(0, SIZE - 7);
}

const SCANS = [
  { inside: true, who: "Phone in the lecture hall" },
  { inside: false, who: "Phone in the canteen, 400 m away" },
  { inside: true, who: "Phone in the back row" },
];

// Fig: rotating tokens + a geofence stop proxy check-ins; results stream live.
export function GeofenceFigure({ active }: { active: boolean }) {
  const [token, setToken] = useState(1);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setToken((t) => t + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const cells = useMemo(() => {
    const rand = seeded(token);
    return Array.from({ length: SIZE * SIZE }, (_, i) => {
      const x = i % SIZE;
      const y = Math.floor(i / SIZE);
      const f = finder(x, y);
      if (f !== null) return f;
      if ((x === 7 && y < 8) || (y === 7 && x < 8) || (x === SIZE - 8 && y < 8) || (y === 7 && x > SIZE - 9) || (x === 7 && y > SIZE - 9) || (y === SIZE - 8 && x < 8)) return false;
      return rand() > 0.52;
    });
  }, [token]);

  const log = Array.from({ length: Math.min(token - 1, 3) }, (_, i) => {
    const n = token - 1 - i;
    return { n, ...SCANS[n % SCANS.length] };
  });
  const scan = SCANS[(token - 1) % SCANS.length];

  return (
    <figure className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-2 items-start gap-5">
        <div>
          <svg viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`} className="w-full" aria-hidden shapeRendering="crispEdges">
            <rect x={-1} y={-1} width={SIZE + 2} height={SIZE + 2} className="fill-sheet" />
            {cells.map((on, i) =>
              on ? <rect key={i} x={i % SIZE} y={Math.floor(i / SIZE)} width={1} height={1} className="fill-ink" /> : null
            )}
          </svg>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-2">
            <motion.div
              key={token}
              className="h-full bg-pen"
              initial={{ width: "100%" }}
              animate={{ width: active ? "0%" : "100%" }}
              transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
            />
          </div>
          <p className="mt-1 text-xs text-muted tabular-nums">Token #{String(token).padStart(4, "0")} expires soon</p>
        </div>

        <div>
          <svg viewBox="0 0 120 120" className="w-full" aria-hidden>
            <circle cx="52" cy="58" r="40" className="fill-pen/5 stroke-pen" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="36" y="44" width="32" height="26" rx="2" className="fill-none stroke-ink/60" strokeWidth="1.2" />
            <text x="52" y="60" textAnchor="middle" className="fill-muted font-sans text-[6px]">
              hall
            </text>
            <AnimatePresence mode="wait">
              <motion.g
                key={token}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: scan.inside ? "58px 52px" : "106px 104px" }}
              >
                <circle cx={scan.inside ? 58 : 106} cy={scan.inside ? 52 : 104} r="5" className={scan.inside ? "fill-ink" : "fill-pen"} />
              </motion.g>
            </AnimatePresence>
          </svg>
          <p className="text-center font-hand text-base text-pen">geofence</p>
        </div>
      </div>

      <ul className="mt-4 space-y-0" aria-live="polite" role="list">
        <AnimatePresence initial={false}>
          {log.map((entry) => (
            <motion.li
              key={entry.n}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 border-b border-rule py-1.5 text-sm text-text"
            >
              {entry.inside ? (
                <Check className="h-4 w-4 shrink-0 text-ink" strokeWidth={3} aria-hidden />
              ) : (
                <X className="h-4 w-4 shrink-0 text-pen" strokeWidth={3} aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate">{entry.who}</span>
              <span className={`font-hand text-base font-bold ${entry.inside ? "text-ink" : "text-pen"}`}>
                {entry.inside ? "checked in" : "rejected"}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {log.length === 0 && <li className="py-1.5 text-sm text-muted">Waiting for the first scan…</li>}
      </ul>
      <figcaption className="mt-3 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 4</span>{" "}The code rotates, the scan must come from inside the
        fence, and results stream to the lecturer over SSE. Illustrative, not a scannable code.
      </figcaption>
    </figure>
  );
}
