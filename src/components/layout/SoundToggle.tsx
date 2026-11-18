"use client";

import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import { soundStore } from "@/lib/sound";

export function SoundToggle() {
  const on = useSyncExternalStore(soundStore.subscribe, soundStore.get, soundStore.getServer);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Sound on. Turn interface sounds off" : "Sound off. Turn interface sounds on"}
      title={on ? "Sound on" : "Sound off"}
      onClick={() => soundStore.set(!on)}
      className="grid h-10 w-10 place-items-center rounded-full text-fg-2 transition-colors duration-300 hover:bg-fg/[0.07] hover:text-fg"
    >
      {on ? <SpeakerHighIcon aria-hidden size={16} /> : <SpeakerSlashIcon aria-hidden size={16} />}
    </button>
  );
}
