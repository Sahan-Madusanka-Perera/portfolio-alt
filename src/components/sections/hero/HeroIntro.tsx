"use client";

import { ArrowDownRightIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitText } from "@/components/ui/SplitText";
import { site } from "@/data/site";

// The words of the first viewport. The name is plain server-rendered text (it is the LCP
// element and must paint at once); the positioning line rises in after the loader.
export function HeroIntro() {
  const { scrollTo } = useSmoothScroll();

  return (
    <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
      <p className="inline-flex w-fit items-center gap-2.5 rounded-full bg-bg/70 px-3.5 py-1.5 text-[0.875rem] text-fg-2 ring-1 ring-inset ring-line-2 backdrop-blur-md">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
          <span className="relative h-2 w-2 rounded-full bg-accent" />
        </span>
        {site.availability}
      </p>

      <h1 className="text-[clamp(3.25rem,9vw,9rem)] font-light leading-[0.92] tracking-[-0.045em]">
        Sahan
        <br />
        Perera
        <span lang="si" className="mt-3 block lg:mt-4 font-sinhala text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium tracking-normal text-fg-2">
          {site.nameSinhala}
        </span>
      </h1>

      <SplitText
        as="p"
        when="loaded"
        delay={150}
        text="I build systems that see, and the software that keeps them running."
        em={["see"]}
        className="max-w-[22ch] text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em]"
      />

      <div className="flex flex-wrap items-center gap-3">
        <MagneticButton
          href="/#work"
          onClick={() => scrollTo("#work")}
          icon={<ArrowDownRightIcon size={16} />}
          size="lg"
        >
          See the work
        </MagneticButton>
        <MagneticButton href={site.cvUrl} external variant="ghost" icon={<DownloadSimpleIcon size={16} />} size="lg">
          Download CV
        </MagneticButton>
      </div>

      <dl className="grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6 text-[0.875rem]">
        <div>
          <dt className="text-fg-2">GPA</dt>
          <dd className="mt-1 whitespace-nowrap font-mono text-[1rem] text-fg tabular">
            {site.gpa}
            <span className="text-fg-2"> / 4</span>
          </dd>
        </div>
        <div>
          <dt className="text-fg-2">University</dt>
          <dd className="mt-1 text-fg">Sri Jayewardenepura</dd>
        </div>
        <div>
          <dt className="text-fg-2">Graduating</dt>
          <dd className="mt-1 text-fg">{site.graduation}</dd>
        </div>
      </dl>
    </div>
  );
}
