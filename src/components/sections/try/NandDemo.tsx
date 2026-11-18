"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { tick } from "@/lib/sound";

const nand = (a: boolean, b: boolean) => !(a && b);

function Toggle({
  label,
  value,
  set,
}: {
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => {
        tick();
        set(!value);
      }}
      className={cn(
        "flex h-11 items-center gap-3 rounded-full pl-2 pr-4 text-[0.9375rem] ring-1 ring-inset transition-colors",
        value
          ? "bg-accent/10 text-fg ring-accent"
          : "text-fg-2 ring-line-2 hover:text-fg",
      )}
    >
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-full font-mono text-[0.8125rem]",
          value ? "bg-accent text-accent-ink" : "bg-fg/[0.08]",
        )}
      >
        {value ? 1 : 0}
      </span>
      Input {label}
    </button>
  );
}

function Gate({
  x,
  y,
  on,
  label,
}: {
  x: number;
  y: number;
  on: boolean;
  label: string;
}) {
  return (
    <g>
      <path
        d={`M${x},${y - 26} h26 a26,26 0 0 1 0,52 h-26 z`}
        className={cn(
          "fill-bg transition-[stroke] duration-300",
          on ? "stroke-accent" : "stroke-line-2",
        )}
        strokeWidth={1.5}
      />
      <circle
        cx={x + 58}
        cy={y}
        r={5}
        className={cn(
          "fill-bg transition-[stroke] duration-300",
          on ? "stroke-accent" : "stroke-line-2",
        )}
        strokeWidth={1.5}
      />
      <text
        x={x + 22}
        y={y + 5}
        textAnchor="middle"
        className="fill-fg-2 font-mono text-[13px]"
      >
        {label}
      </text>
    </g>
  );
}

// An OR gate built only from NAND gates, as Logic Gates Lab teaches it. Toggle A and B and watch
// each wire carry its value; the matching truth-table row lights up.
export function NandDemo() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const n1 = nand(a, a);
  const n2 = nand(b, b);
  const out = nand(n1, n2);
  const wire = (on: boolean) =>
    cn(
      "transition-[stroke] duration-300",
      on ? "stroke-accent" : "stroke-line-2",
    );

  return (
    <div className="flex h-full flex-col gap-6 rounded-[20px] bg-bg-2 p-6 ring-1 ring-inset ring-line sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[clamp(1.375rem,2vw,1.75rem)] font-light leading-[1.15] tracking-[-0.02em]">
          OR, from three NANDs
        </h3>
        <a
          href="https://github.com/Sahan-Madusanka-Perera/Logic-Gates-Platform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] text-fg-2 transition-colors hover:text-fg"
        >
          Logic Gates Lab
          <ArrowUpRightIcon aria-hidden size={12} />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <Toggle label="A" value={a} set={setA} />
        <Toggle label="B" value={b} set={setB} />
      </div>

      <svg
        viewBox="0 0 420 200"
        className="h-auto w-full"
        role="img"
        aria-label={`A is ${+a}, B is ${+b}. The first NAND outputs ${+n1}, the second ${+n2}, so A OR B is ${+out}.`}
      >
        <g fill="none" strokeWidth={2} strokeLinecap="round">
          {/* A into both inputs of NAND 1 */}
          <path
            d="M14,52 H70 M70,40 V64 M70,40 H96 M70,64 H96"
            className={wire(a)}
          />
          <path
            d="M14,148 H70 M70,136 V160 M70,136 H96 M70,160 H96"
            className={wire(b)}
          />
          <path d="M154,52 H210 V88 H252" className={wire(n1)} />
          <path d="M154,148 H210 V112 H252" className={wire(n2)} />
          <path d="M310,100 H392" className={wire(out)} />
        </g>
        <circle cx={70} cy={52} r={3.5} className={a ? "fill-accent" : "fill-line-2"} />
        <circle cx={70} cy={148} r={3.5} className={b ? "fill-accent" : "fill-line-2"} />
        <text x={8} y={40} className="fill-fg-2 font-mono text-[13px]">
          A
        </text>
        <text x={8} y={136} className="fill-fg-2 font-mono text-[13px]">
          B
        </text>
        <Gate x={96} y={52} on={n1} label="NAND" />
        <Gate x={96} y={148} on={n2} label="NAND" />
        <Gate x={252} y={100} on={out} label="NAND" />
        <circle
          cx={400}
          cy={100}
          r={9}
          className={cn(
            "transition-[fill,stroke] duration-300",
            out ? "fill-accent stroke-accent" : "fill-bg stroke-line-2",
          )}
          strokeWidth={1.5}
        />
      </svg>

      <table className="w-full text-left font-mono text-[0.8125rem]">
        <caption className="sr-only">Truth table for A OR B</caption>
        <thead>
          <tr className="text-fg-2">
            <th scope="col" className="pb-2 font-normal">
              A
            </th>
            <th scope="col" className="pb-2 font-normal">
              B
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              A OR B
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            [false, false],
            [false, true],
            [true, false],
            [true, true],
          ].map(([ra, rb]) => {
            const current = ra === a && rb === b;
            return (
              <tr
                key={`${ra}${rb}`}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "border-t border-line transition-colors",
                  current ? "text-fg" : "text-fg-2",
                )}
              >
                <td className="py-1.5">{+ra}</td>
                <td className="py-1.5">{+rb}</td>
                <td
                  className={cn("py-1.5 text-right", current && "text-accent")}
                >
                  {+(ra || rb)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
