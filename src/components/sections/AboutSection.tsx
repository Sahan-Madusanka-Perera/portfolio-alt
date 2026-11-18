import Image from "next/image";
import { LocalTime } from "@/components/layout/LocalTime";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading id="about-title" title="About, and now" em={["now"]} />
        <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal className="relative self-start overflow-hidden rounded-[20px] bg-bg-2 ring-1 ring-inset ring-line">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_38%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)]" />
            <Image
              src="/me/portrait-cutout.webp"
              alt="Sahan Perera"
              width={900}
              height={1200}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="relative h-auto w-full"
            />
          </Reveal>
          <div className="space-y-12">
            <Reveal as="p" className="max-w-[40ch] text-[clamp(1.375rem,2.2vw,2rem)] font-light leading-[1.3] tracking-[-0.02em] text-fg">
              {site.summary}
            </Reveal>
            <dl className="divide-y divide-line border-y border-line">
              <Reveal className="grid gap-2 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[0.875rem] text-fg-2">Now</dt>
                <dd className="text-[1.0625rem] leading-[1.6]">{site.now}</dd>
              </Reveal>
              <Reveal className="grid gap-2 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[0.875rem] text-fg-2">Studying</dt>
                <dd className="text-[1.0625rem] leading-[1.6]">
                  {site.degree}, {site.university}. GPA {site.gpa}, graduating {site.graduation}.
                </dd>
              </Reveal>
              <Reveal className="grid gap-2 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[0.875rem] text-fg-2">Available</dt>
                <dd className="text-[1.0625rem] leading-[1.6]">{site.availabilityDetail}</dd>
              </Reveal>
              <Reveal className="grid gap-2 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[0.875rem] text-fg-2">Based in</dt>
                <dd className="text-[1.0625rem] leading-[1.6]">
                  {site.city}. <LocalTime />
                </dd>
              </Reveal>
              <Reveal className="grid gap-2 py-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                <dt className="text-[0.875rem] text-fg-2">Away from code</dt>
                <dd>
                  <ul className="flex flex-wrap gap-2">
                    {site.interests.map((interest) => (
                      <li key={interest} className="rounded-full px-3.5 py-1.5 text-[0.875rem] capitalize ring-1 ring-inset ring-line-2">
                        {interest}
                      </li>
                    ))}
                  </ul>
                </dd>
              </Reveal>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
