"use client";

import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { marqueeStack } from "@/data/skills";

// The stack as a slow CSS marquee that leans with scroll speed: Lenis velocity sets a skew,
// eased back to zero. Only ticks while on screen. Under reduced motion it stands still (CSS).
export function StackMarquee() {
  const { velocity } = useSmoothScroll();
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let skew = 0;
    let visible = false;
    const tick = () => {
      const target = Math.max(-8, Math.min(8, velocity() * -0.35));
      skew += (target - skew) * 0.12;
      el.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [el, velocity]);

  const items = [...marqueeStack, ...marqueeStack];

  return (
    <div className="overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <p className="sr-only">Stack: {marqueeStack.join(", ")}.</p>
      <div ref={setEl} aria-hidden className="will-change-transform">
        <div className="marquee-track">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-8 pr-8 text-[clamp(1.75rem,2.6vw,2.5rem)] font-light tracking-[-0.03em] text-fg-2">
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-fg/25" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
