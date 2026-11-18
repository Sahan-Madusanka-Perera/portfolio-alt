"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 30_000);
  return () => window.clearInterval(id);
}

// Sahan's local time in Colombo, updated twice a minute. Empty on the server, so no mismatch.
export function LocalTime() {
  const time = useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => "",
  );
  if (!time) return null;
  return (
    <span className="tabular">
      <span className="sr-only">Local time </span>
      {time} there now.
    </span>
  );
}
