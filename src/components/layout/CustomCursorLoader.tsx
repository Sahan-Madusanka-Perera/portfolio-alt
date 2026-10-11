"use client";

import dynamic from "next/dynamic";

// `ssr: false` requires a Client Component boundary, so this thin wrapper
// exists to keep layout.tsx a Server Component (needed for metadata/viewport).
const CustomCursor = dynamic(() => import("./CustomCursor").then((mod) => mod.CustomCursor), {
  ssr: false,
});

export function CustomCursorLoader() {
  return <CustomCursor />;
}
