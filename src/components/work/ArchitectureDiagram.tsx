"use client";

import { useEffect, useId, useRef } from "react";
import type { Diagram, DiagramNode } from "@/data/projects";
import { cn } from "@/lib/cn";

const W = 1000;
const H = 560;
const NODE_H = 66;

/** Box width from its text: 16px Inter Tight label, 13px mono sub (about 7.85px a character). */
function nodeWidth(n: DiagramNode) {
  return Math.round(Math.min(270, Math.max(176, n.label.length * 8.4 + 36, (n.sub?.length ?? 0) * 7.85 + 32)));
}

/** Where the segment from a's centre to b's centre leaves a's box. */
function exitPoint(a: DiagramNode, b: DiagramNode, pad = 6) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const hw = nodeWidth(a) / 2 + pad;
  const hh = NODE_H / 2 + pad;
  const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return { x: a.x + dx * t, y: a.y + dy * t };
}

// An architecture diagram that draws itself when it scrolls into view: boxes rise in one after
// another, then each connection is traced from source to target (anime.js v4 drawables) and its
// arrowhead lands. Static and complete under reduced motion and without JavaScript. Screen
// readers get the same graph as a list.
export function ArchitectureDiagram({ diagram, className }: { diagram: Diagram; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.classList.add("is-drawn");
      return;
    }
    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    import("animejs").then(({ animate, createDrawable, stagger }) => {
      if (cancelled) return;
      const lines = createDrawable(svg.querySelectorAll<SVGPathElement>(".dg-line"));
      animate(lines, { draw: "0 0", duration: 0 });
      svg.classList.add("is-ready");

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          const nodes = svg.querySelectorAll(".dg-node");
          const heads = svg.querySelectorAll(".dg-head, .dg-label");
          const nodeTime = nodes.length * 55 + 450;
          animate(nodes, { opacity: [0, 1], translateY: [14, 0], duration: 600, delay: stagger(55), ease: "out(4)" });
          animate(lines, { draw: ["0 0", "0 1"], duration: 650, delay: stagger(70, { start: nodeTime * 0.5 }), ease: "inOut(3)" });
          animate(heads, {
            opacity: [0, 1],
            duration: 400,
            delay: stagger(70, { start: nodeTime * 0.5 + 520 }),
            ease: "out(3)",
            onComplete: () => svg.classList.add("is-drawn"),
          });
        },
        { threshold: 0.35 },
      );
      observer.observe(svg);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return (
    <figure className={cn("diagram", className)}>
      <div
        className="dg-scroll -mx-[var(--gutter)] overflow-x-auto overscroll-x-contain px-[var(--gutter)] sm:mx-0 sm:overflow-visible sm:px-0"
        tabIndex={0}
        aria-label={`${diagram.title}, diagram`}
        onScroll={(e) => {
          const el = e.currentTarget;
          el.dataset.end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 ? "1" : "0";
        }}
      >
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} className="dg h-auto w-full min-w-[720px] sm:min-w-0">
          <title id={titleId}>{diagram.title}</title>
          <g fill="none" strokeLinecap="round">
            {diagram.edges.map((edge, i) => {
              const a = byId.get(edge.from);
              const b = byId.get(edge.to);
              if (!a || !b) return null;
              const p1 = exitPoint(a, b);
              const p2 = exitPoint(b, a, 10);
              const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
              const head = 9;
              const hx1 = p2.x - head * Math.cos(angle - 0.45);
              const hy1 = p2.y - head * Math.sin(angle - 0.45);
              const hx2 = p2.x - head * Math.cos(angle + 0.45);
              const hy2 = p2.y - head * Math.sin(angle + 0.45);
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              return (
                <g key={i} className={edge.dashed ? "text-fg-3" : "text-fg-2"}>
                  <path className="dg-line" d={`M${p1.x},${p1.y} L${p2.x},${p2.y}`} stroke="currentColor" strokeWidth={1.4} strokeDasharray={edge.dashed ? "5 6" : undefined} />
                  <path className="dg-head" d={`M${hx1},${hy1} L${p2.x},${p2.y} L${hx2},${hy2}`} stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
                  {edge.label && (
                    <g className="dg-label">
                      <rect x={mx - edge.label.length * 3.95 - 10} y={my - 12} width={edge.label.length * 7.9 + 20} height={24} rx={12} className="fill-bg" />
                      <text x={mx} y={my + 4.5} textAnchor="middle" className="fill-fg-2 font-mono text-[13px]">
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
          {diagram.nodes.map((node) => (
            <g key={node.id} className="dg-node">
              <rect
                x={node.x - nodeWidth(node) / 2}
                y={node.y - NODE_H / 2}
                width={nodeWidth(node)}
                height={NODE_H}
                rx={14}
                className={cn(
                  "stroke-[1.2]",
                  node.tone === "accent" ? "fill-accent/[0.08] stroke-accent" : node.tone === "muted" ? "fill-bg-2 stroke-line-2 [stroke-dasharray:4_5]" : "fill-bg-2 stroke-line-2",
                )}
              />
              <text x={node.x} y={node.sub ? node.y - 4 : node.y + 6} textAnchor="middle" className="fill-fg text-[16px] font-normal">
                {node.label}
              </text>
              {node.sub && (
                <text x={node.x} y={node.y + 17} textAnchor="middle" className="fill-fg-2 font-mono text-[13px]">
                  {node.sub}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-4 text-[0.875rem] text-fg-2">
        {diagram.title}
        <span className="sr-only">
          . Connections:{" "}
          {diagram.edges
            .map((e) => `${byId.get(e.from)?.label} to ${byId.get(e.to)?.label}${e.label ? ` (${e.label})` : ""}`)
            .join("; ")}
          .
        </span>
      </figcaption>
    </figure>
  );
}
