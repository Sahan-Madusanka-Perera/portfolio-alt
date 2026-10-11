"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const MODELS = ["Random Forest", "XGBoost", "LightGBM"];

function draw() {
  return MODELS.map(() => 0.35 + Math.random() * 0.55);
}

// Fig: three models each estimate a film's opening; the ensemble blends them.
export function EnsembleFigure({ active }: { active: boolean }) {
  const [estimates, setEstimates] = useState([0.62, 0.81, 0.7]);
  const [round, setRound] = useState(0);
  const mean = estimates.reduce((a, b) => a + b, 0) / estimates.length;
  const grow = active ? 1 : 0;

  return (
    <figure className="flex h-full flex-col">
      <div className="relative flex-1">
        <p className="font-hand text-xl leading-8 text-ink">
          Each model predicts a film&apos;s opening weekend; the ensemble blends them.
        </p>

        <div className="relative mt-4 space-y-4">
          {MODELS.map((model, i) => (
            <div key={model}>
              <p className="text-sm font-medium text-text">{model}</p>
              <div className="mt-1 h-7 rounded-[2px] border border-rule">
                <motion.div
                  className="h-full text-ink"
                  style={{ backgroundImage: "repeating-linear-gradient(-55deg, currentColor 0 1.5px, transparent 1.5px 5px)" }}
                  initial={false}
                  animate={{ width: `${estimates[i] * 100 * grow}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}

          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 -top-2 border-l-2 border-dashed border-pen"
            initial={false}
            animate={{ left: `${mean * 100}%`, opacity: grow }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="mt-8 border-t-2 border-ink/80 pt-3">
          <p className="text-sm font-semibold text-text">Ensemble (blended)</p>
          <div className="mt-1 h-9 rounded-[2px] border-2 border-pen/80 p-[3px]">
            <motion.div
              className="h-full bg-pen/85"
              initial={false}
              animate={{ width: `${mean * 100 * grow}%` }}
              transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            data-cursor="link"
            onClick={() => {
              setEstimates(draw());
              setRound((r) => r + 1);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-ink hover:text-pen"
          >
            <Shuffle className="h-4 w-4" aria-hidden /> Try another film
          </button>
          <p className="relative mr-3 px-3 py-1 font-hand text-2xl font-bold text-pen">
            88.4% accuracy
            {active && (
              <Scribble
                key={round}
                kind="circle"
                delay={round === 0 ? 1.5 : 0.9}
                duration={0.6}
                strokeWidth={2.5}
                className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)]"
              />
            )}
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.8rem] leading-5 text-muted">
        <span className="font-semibold text-text">Fig. 3</span>{" "}Three models blended into one prediction. Bar lengths
        are illustrative; 88.4% is the ensemble&apos;s measured accuracy.
      </figcaption>
    </figure>
  );
}
