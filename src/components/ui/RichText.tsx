import { Fragment } from "react";

// Renders `backticked` spans of project copy as inline code. Nothing else is parsed.
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded-[6px] bg-fg/[0.06] px-1.5 py-0.5 font-mono text-[0.86em] text-fg">
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
