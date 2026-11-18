import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { alsoUsed, skillGroups } from "@/data/skills";
import { cn } from "@/lib/cn";
import { StackMarquee } from "./StackMarquee";

const nameSize = {
  3: "text-[clamp(1.75rem,2.6vw,2.5rem)]",
  2: "text-[clamp(1.125rem,1.5vw,1.375rem)]",
  1: "text-[1rem]",
} as const;

// Weighted by the code, not by a wish list: type size follows how often each group shows up in
// the repositories, and every group carries the evidence for its weight.
export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading
          id="skills-title"
          title="What I reach for"
          intro="Sized by how much code in my repositories uses it. Every group lists where that count comes from."
        />
      </div>
      <div className="mt-16">
        <StackMarquee />
      </div>
      <div className="container-x">
        <ul className="divide-y divide-line border-b border-line">
          {skillGroups.map((group) => (
            <Reveal as="li" key={group.name} className="grid gap-4 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div className="space-y-3">
                <h3 className={cn("font-light leading-[1.15] tracking-[-0.02em]", nameSize[group.weight])}>{group.name}</h3>
                <p className="max-w-[52ch] text-[0.875rem] leading-[1.5] text-fg-2">{group.evidence}</p>
              </div>
              <ul className="flex flex-wrap content-start gap-2" aria-label={`${group.name} skills`}>
                {group.skills.map((skill) => (
                  <li key={skill} className="rounded-full px-3.5 py-1.5 text-[0.875rem] ring-1 ring-inset ring-line-2">
                    {skill}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-[0.875rem] text-fg-2">Also used: {alsoUsed.join(", ")}.</p>
      </div>
    </section>
  );
}
