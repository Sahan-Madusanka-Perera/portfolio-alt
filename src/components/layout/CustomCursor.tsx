"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

const LINK_SELECTOR = "[data-cursor='link'], a, button";

// A ballpoint tip that follows the pointer. Over anything clickable the red
// pen circles it, like a teacher marking the answer. Disabled on touch
// devices and under prefers-reduced-motion, leaving the native cursor.
export function CustomCursor() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTouchDevice = useIsTouchDevice();
  const enabled = !prefersReducedMotion && !isTouchDevice;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.5 });
  const ringY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    function handlePointerMove(event: PointerEvent) {
      setIsVisible(true);
      x.set(event.clientX);
      y.set(event.clientY);
      const target = (event.target as HTMLElement | null)?.closest(LINK_SELECTOR);
      setIsHovering(Boolean(target));
    }

    function handlePointerLeave() {
      setIsVisible(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: isVisible && isHovering ? 1 : 0, scale: isHovering ? 1 : 0.6 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg viewBox="0 0 64 56" className="h-14 w-16 text-pen" fill="none">
          <motion.path
            d="M14 12C28 2 54 4 60 22C64 38 46 52 28 50C10 48 2 36 4 24C6 14 18 8 34 7"
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: isHovering ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isHovering ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-ink shadow-[0_1px_2px_rgb(var(--shadow)/0.35)]" />
      </motion.div>
    </>
  );
}
