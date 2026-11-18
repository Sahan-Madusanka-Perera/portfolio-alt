import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { publications, singectorExplainer } from "@/data/publications";
import { DoNoHarmDots } from "./DoNoHarmDots";

export function ResearchSection() {
  return (
    <section id="research" aria-labelledby="research-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading
          id="research-title"
          title="Teaching a model to do no harm"
          em={["harm"]}
          intro="My final-year research corrects Sinhala grammar, a language with very little labelled data."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal className="space-y-6">
            <h3 className="text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em]">{singectorExplainer.title}</h3>
            {singectorExplainer.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="max-w-[60ch] text-[1.0625rem] leading-[1.65] text-fg-2">
                {p}
              </p>
            ))}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-line ring-1 ring-line">
              <div className="bg-bg p-5">
                <dt className="text-[0.875rem] text-fg-2">F0.5</dt>
                <dd className="mt-2 font-mono text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[-0.03em]">0.538</dd>
              </div>
              <div className="bg-bg p-5">
                <dt className="text-[0.875rem] text-fg-2">Correct sentences left alone</dt>
                <dd className="mt-2 font-mono text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[-0.03em]">98.6%</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.1} className="self-center rounded-[20px] bg-bg-2 p-6 ring-1 ring-inset ring-line sm:p-8">
            <DoNoHarmDots />
          </Reveal>
        </div>

        <div className="mt-24">
          <h3 className="text-[0.875rem] text-fg-2">Publications</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {publications.map((pub) => (
              <Reveal as="li" key={pub.title} className="grid gap-3 py-8 md:grid-cols-[96px_minmax(0,1fr)] md:gap-10">
                <span className="font-mono text-[0.8125rem] text-fg-2">{pub.year}</span>
                <div className="space-y-3">
                  <p className="max-w-[56ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.35] text-fg">{pub.title}</p>
                  <p className="text-[0.875rem] text-fg-2">
                    {pub.authors} · {pub.venue}
                  </p>
                  <p className="max-w-[68ch] text-[1rem] leading-[1.55] text-fg-2">{pub.summary}</p>
                  {pub.href && (
                    <a
                      href={pub.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[0.8125rem] text-fg transition-colors hover:text-accent"
                    >
                      {pub.linkLabel ?? pub.href}
                      <ArrowUpRightIcon aria-hidden size={12} />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
