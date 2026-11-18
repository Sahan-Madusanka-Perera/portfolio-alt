import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certifications, education, experience, type TimelineEntry } from "@/data/experience";

function Entries({ heading, entries }: { heading: string; entries: TimelineEntry[] }) {
  return (
    <div>
      <h3 className="text-[0.875rem] text-fg-2">{heading}</h3>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {entries.map((entry) => (
          <Reveal as="li" key={`${entry.title}-${entry.org}`} className="grid gap-3 py-7 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
            <span className="font-mono text-[0.8125rem] text-fg-2">{entry.period}</span>
            <div className="space-y-2">
              <p className="text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.3]">
                {entry.title} <span className="text-fg-2">· {entry.org}</span>
              </p>
              <p className="max-w-[68ch] text-[1rem] leading-[1.55] text-fg-2">{entry.detail}</p>
              {entry.links && (
                <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
                  {entry.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.875rem] text-fg transition-colors hover:text-accent"
                    >
                      {link.label}
                      <ArrowUpRightIcon aria-hidden size={12} />
                    </a>
                  ))}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export function TimelineSection() {
  return (
    <section id="timeline" aria-labelledby="timeline-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading id="timeline-title" title="Where I have been" />
        <div className="mt-16 space-y-20">
          <Entries heading="Experience" entries={experience} />
          <Entries heading="Education" entries={education} />
          <div>
            <h3 className="text-[0.875rem] text-fg-2">Certifications</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <li key={cert} className="rounded-full px-4 py-2 text-[0.875rem] ring-1 ring-inset ring-line-2">
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
