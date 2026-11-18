"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

// Copies a value and says so, in words and to screen readers (aria-live), for two seconds.
export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard blocked: select-and-copy fallback.
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-cursor="link"
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.875rem] font-normal ring-1 ring-inset ring-line-2 transition-[box-shadow,background-color] duration-300 hover:bg-fg/[0.05] hover:ring-fg/40",
        className,
      )}
    >
      {copied ? <CheckIcon aria-hidden size={16} className="text-accent" /> : <CopyIcon aria-hidden size={16} />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
