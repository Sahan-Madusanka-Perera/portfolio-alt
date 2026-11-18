"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
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
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  function onMove(event: MouseEvent) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
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
    <motion.span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }} className="inline-flex">
      {body}
    </motion.span>
  );
}
