"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type DocWithTransition = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> };
};

/**
 * Resolves once the URL is `href` and React has had a moment to commit the new page. Polls with
 * timers, not requestAnimationFrame: rendering is paused while a view transition captures the
 * old page, so animation frames would not fire until it gave up.
 */
function waitForPath(href: string, timeout = 1800) {
  const target = new URL(href, window.location.href).pathname;
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const check = () => {
      if (window.location.pathname === target || performance.now() - start > timeout) {
        window.setTimeout(resolve, 60);
      } else {
        window.setTimeout(check, 16);
      }
    };
    check();
  });
}

// A Next Link that runs the navigation inside a native view transition, so an element with the
// same `view-transition-name` on both pages (a work card's image and the case study's hero)
// morphs from one to the other. Without support, with modifier keys or under reduced motion it
// is an ordinary Link.
export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const doc = document as DocWithTransition;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!doc.startViewTransition || reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        doc.startViewTransition(async () => {
          router.push(href, { scroll: true });
          await waitForPath(href);
        });
      }}
    />
  );
}
