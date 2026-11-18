import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";
import { SplitText } from "./SplitText";

type SectionHeadingProps = {
  id: string;
  title: string;
  /** Words of the title set in the serif italic (one at most, by the design rules). */
  em?: string[];
  intro?: string;
  className?: string;
};

// The one heading pattern for home-page sections: a large light title that rises in word by word,
// and an optional lead paragraph beside it on wide screens.
export function SectionHeading({ id, title, em, intro, className }: SectionHeadingProps) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16", className)}>
      <SplitText
        as="h2"
        id={id}
        text={title}
        em={em}
        className="text-[clamp(2.5rem,5.4vw,5.5rem)] font-light leading-[1.02] tracking-[-0.042em]"
      />
      {intro && (
        <Reveal as="p" className="max-w-[44ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] text-fg-2">
          {intro}
        </Reveal>
      )}
    </div>
  );
}
