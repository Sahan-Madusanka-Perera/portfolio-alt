"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

// Paper Shaders load only when a backdrop nears the viewport, never on first paint.
const MeshGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.MeshGradient), { ssr: false });
const GrainGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.GrainGradient), { ssr: false });

type Kind = "mesh" | "grain";

const palettes = {
  dark: {
    mesh: ["#050505", "#0d1024", "#1a2350", "#050505"],
    grainBack: "#050505",
    grain: ["#1b2558", "#3a4fb0", "#0b0b0b"],
  },
  light: {
    mesh: ["#ecebe7", "#dfe3f3", "#c9d1f0", "#ecebe7"],
    grainBack: "#ecebe7",
    grain: ["#c4cdf2", "#8fa0e6", "#e3e2dd"],
  },
};

// A slow shader behind a section. Mounted when within 300px of the viewport, frozen (speed 0)
// while off screen, and absent under reduced motion, where the plain page colour shows instead.
export function ShaderBackdrop({ kind, className }: { kind: Kind; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const p = palettes[theme];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const common = {
    style: { width: "100%", height: "100%" },
    minPixelRatio: 1,
    maxPixelCount: 1600 * 900,
    speed: visible ? (kind === "mesh" ? 0.18 : 0.25) : 0,
  };

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {near && !reduced && (
        <div className="h-full w-full animate-[fade-in_1.2s_var(--ease)]">
          {kind === "mesh" ? (
            <MeshGradient {...common} colors={p.mesh} distortion={0.6} swirl={0.35} grainMixer={0} grainOverlay={0.08} />
          ) : (
            <GrainGradient {...common} colorBack={p.grainBack} colors={p.grain} softness={0.7} intensity={0.35} noise={0.3} shape="blob" />
          )}
        </div>
      )}
    </div>
  );
}
