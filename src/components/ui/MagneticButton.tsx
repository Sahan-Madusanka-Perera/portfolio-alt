"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "accent";

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  /** How far the button follows the pointer, 0 to 1. */
  strength?: number;
  size?: "md" | "lg";
};

type AsLink = BaseProps & { href: string; download?: boolean | string; external?: boolean; onClick?: () => void };
type AsButton = BaseProps & { href?: undefined; onClick?: () => void; type?: "button" | "submit"; ariaLabel?: string };

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-fg/90",
  ghost: "text-fg ring-1 ring-inset ring-line-2 hover:ring-fg/40 hover:bg-fg/[0.04]",
  accent: "bg-accent text-accent-ink hover:brightness-110",
};

const iconWrap: Record<Variant, string> = {
  primary: "bg-bg/10",
  ghost: "bg-fg/[0.07]",
  accent: "bg-accent-ink/10",
};

// A pill that leans towards the pointer on spring physics and presses in on click. The trailing
// icon sits in its own circle and nudges diagonally on hover. Still under reduced motion.
export function MagneticButton(props: AsLink | AsButton) {
  const { children, variant = "primary", icon, className, strength = 0.28, size = "md" } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, raf: 0, last: 0 });

  useEffect(() => {
    const s = spring.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  // A small damped spring (stiffness 220, damping 18, mass 0.6), stepped per frame until it rests.
  function step(now: number) {
    const s = spring.current;
    const dt = Math.min((now - (s.last || now)) / 1000, 1 / 30) || 1 / 60;
    s.last = now;
    s.vx += ((220 * (s.tx - s.x) - 18 * s.vx) / 0.6) * dt;
    s.vy += ((220 * (s.ty - s.y) - 18 * s.vy) / 0.6) * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const resting = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.vx) + Math.abs(s.vy) < 0.05;
    if (resting) Object.assign(s, { x: s.tx, y: s.ty, vx: 0, vy: 0, raf: 0, last: 0 });
    if (ref.current) ref.current.style.transform = s.x || s.y ? `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)` : "";
    if (!resting) s.raf = requestAnimationFrame(step);
  }
  function aim(tx: number, ty: number) {
    const s = spring.current;
    s.tx = tx;
    s.ty = ty;
    if (!s.raf) s.raf = requestAnimationFrame(step);
  }

  function onMove(event: MouseEvent) {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    aim((event.clientX - (rect.left + rect.width / 2)) * strength, (event.clientY - (rect.top + rect.height / 2)) * strength);
  }
  function onLeave() {
    aim(0, 0);
  }

  const classes = cn(
    "group relative inline-flex select-none items-center gap-3 rounded-full font-normal tracking-[-0.01em] whitespace-nowrap",
    "transition-[background-color,box-shadow,filter,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
    size === "lg" ? "h-14 pl-7 text-[1rem]" : "h-12 pl-6 text-[0.9375rem]",
    icon ? (size === "lg" ? "pr-2" : "pr-1.5") : size === "lg" ? "pr-7" : "pr-6",
    variants[variant],
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      {icon && (
        <span
          aria-hidden
          className={cn(
            "grid place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
            size === "lg" ? "h-10 w-10" : "h-9 w-9",
            iconWrap[variant],
          )}
        >
          {icon}
        </span>
      )}
    </>
  );

  const body =
    "href" in props && props.href !== undefined ? (
      props.external || props.download ? (
        <a
          href={props.href}
          className={classes}
          download={props.download}
          target={props.external ? "_blank" : undefined}
          rel={props.external ? "noopener noreferrer" : undefined}
          onClick={props.onClick}
          data-cursor="link"
        >
          {inner}
        </a>
      ) : (
        <Link href={props.href} className={classes} onClick={props.onClick} data-cursor="link">
          {inner}
        </Link>
      )
    ) : (
      <button
        type={(props as AsButton).type ?? "button"}
        className={classes}
        onClick={props.onClick}
        aria-label={(props as AsButton).ariaLabel}
        data-cursor="link"
      >
        {inner}
      </button>
    );

  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-flex">
      {body}
    </span>
  );
}
