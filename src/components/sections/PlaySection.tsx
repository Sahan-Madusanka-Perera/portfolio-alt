"use client";

import { XIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useKonamiCode } from "@/components/play/useKonamiCode";
import { SectionHeading } from "@/components/ui/SectionHeading";

const placeholder = () => (
  <div className="arena grid aspect-[16/10] max-h-[520px] w-full place-items-center rounded-[20px] bg-[#0b3d1f]">
    <span className="font-mono text-[0.8125rem] text-white/70">Loading the pitch</span>
  </div>
);

// The arena and the reflex game are their own chunks. The arena loads when the section comes
// near the viewport (its 3D modes load only when a mode is picked); the reflex game loads only
// after the Konami code.
const FootballGame = dynamic(() => import("@/components/play/FootballGame").then((m) => m.FootballGame), { ssr: false, loading: placeholder });
const EasterEggGame = dynamic(() => import("@/components/play/EasterEggGame").then((m) => m.EasterEggGame), { ssr: false });

export function PlaySection() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [near, setNear] = useState(false);
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [secret, setSecret] = useState(false);

  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  const unlock = useCallback(() => setSecret(true), []);
  useKonamiCode(unlock);

  useEffect(() => {
    if (secret && dialog && !dialog.open) dialog.showModal();
  }, [secret, dialog]);

  return (
    <section ref={setEl} id="play" aria-labelledby="play-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading
          id="play-title"
          title="Take a penalty"
          intro="Football is my favourite thing that is not code, so I built a small floodlit pitch. Two modes, and one more for anyone who knows the old cheat code."
        />
        <div className="mt-14">{near ? <FootballGame /> : placeholder()}</div>
        <p className="mt-4 text-[0.875rem] text-fg-2">Penalties work by tap or click. The match needs a keyboard.</p>
      </div>

      <dialog
        ref={setDialog}
        onClose={() => setSecret(false)}
        aria-labelledby="secret-title"
        className="palette m-auto w-[min(560px,calc(100vw-32px))] rounded-[20px] bg-bg-2 p-0 text-fg ring-1 ring-line-2 backdrop:bg-bg/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="secret-title" className="text-[1rem]">
            You found it. How fast are you?
          </h2>
          <button
            type="button"
            onClick={() => dialog?.close()}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-fg-2 transition-colors hover:bg-fg/[0.06] hover:text-fg"
          >
            <XIcon aria-hidden size={16} />
          </button>
        </div>
        <div className="p-5">{secret && <EasterEggGame />}</div>
      </dialog>
    </section>
  );
}
