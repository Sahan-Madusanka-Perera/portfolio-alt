import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@/components/ui/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { flagships, getFlagship } from "@/data/projects";
import { site } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return flagships.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getFlagship(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title} · ${site.name}`, description: project.summary, url: `/work/${project.slug}`, type: "article" },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="grid gap-6 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em]">{title}</h2>
      <div className="max-w-[68ch] space-y-5 text-[1.0625rem] leading-[1.65] text-fg-2">{children}</div>
    </Reveal>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getFlagship(slug);
  if (!project) notFound();

  const index = flagships.findIndex((p) => p.slug === project.slug);
  const next = flagships[(index + 1) % flagships.length];
  const isSvg = project.visual.src.endsWith(".svg");

  return (
    <article className="pb-[clamp(96px,14vw,200px)] pt-32">
      <div className="container-x">
        <TransitionLink href="/#work" className="inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-[0.875rem] text-fg-2 ring-1 ring-inset ring-line-2 transition-colors hover:text-fg">
          <ArrowLeftIcon aria-hidden size={14} />
          All work
        </TransitionLink>

        <header className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[0.8125rem] text-fg-2 tabular">
              {String(index + 1).padStart(2, "0")} / {String(flagships.length).padStart(2, "0")}, {project.kind}, {project.year}
            </p>
            <h1 className="mt-5 text-[clamp(3rem,7vw,7rem)] font-light leading-[0.95] tracking-[-0.045em]">{project.title}</h1>
          </div>
          <div className="space-y-6">
            <p className="text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] text-fg">{project.summary}</p>
            <div className="flex flex-wrap items-center gap-3">
              {project.links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    i === 0
                      ? "inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-[0.9375rem] text-bg transition-opacity hover:opacity-90"
                      : "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] text-fg ring-1 ring-inset ring-line-2 transition-colors hover:bg-fg/[0.05]"
                  }
                >
                  {link.label}
                  <ArrowUpRightIcon aria-hidden size={14} />
                </a>
              ))}
              {project.sourceNote && <p className="text-[0.9375rem] text-fg-2">{project.sourceNote}</p>}
            </div>
          </div>
        </header>

        <figure className="mt-14">
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-bg-2 ring-1 ring-inset ring-line"
            style={{ viewTransitionName: `work-${project.slug}` }}
          >
            <Image src={project.visual.src} alt={project.visual.alt} fill priority sizes="(min-width: 1440px) 1300px, 100vw" className="object-cover" unoptimized={isSvg} />
          </div>
          <figcaption className="mt-3 text-[0.875rem] text-fg-2">{project.visual.source}</figcaption>
        </figure>

        {project.honesty && (
          <Reveal as="p" className="mt-10 max-w-[68ch] rounded-[14px] p-5 text-[0.9375rem] leading-[1.6] text-fg ring-1 ring-inset ring-line-2">
            {project.honesty}
          </Reveal>
        )}

        {project.metrics.length > 0 && (
          <Reveal as="section" aria-label="Results" className="mt-16">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-3 xl:grid-cols-4">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-mono text-[clamp(1.75rem,3vw,2.75rem)] font-normal leading-none tracking-[-0.03em] text-fg tabular">{m.value}</dd>
                  <dd className="mt-3 max-w-[24ch] text-[0.875rem] leading-[1.45] text-fg-2">{m.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        <div className="mt-20 space-y-20">
          <Section title="The problem">
            {project.problem.map((p) => (
              <p key={p}>
                <RichText text={p} />
              </p>
            ))}
          </Section>

          <Section title="What I built">
            <ul className="space-y-4">
              {project.built.map((b) => (
                <li key={b} className="grid grid-cols-[14px_1fr] gap-3">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 bg-fg-3" />
                  <span>
                    <RichText text={b} />
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Reveal as="section" className="border-t border-line pt-10">
            <h2 className="text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em]">How it fits together</h2>
            <ArchitectureDiagram diagram={project.diagram} className="mt-10" />
          </Reveal>

          <Section title={project.hardPart.title}>
            {project.hardPart.body.map((p) => (
              <p key={p}>
                <RichText text={p} />
              </p>
            ))}
          </Section>

          {project.gallery && (
            <Reveal as="section" aria-label="More screens" className="border-t border-line pt-10">
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {project.gallery.map((g) => (
                  <figure key={g.src}>
                    <div className="relative overflow-hidden rounded-[20px] bg-bg-2 ring-1 ring-inset ring-line" style={{ aspectRatio: `${g.width} / ${g.height}` }}>
                      <Image src={g.src} alt={g.alt} fill sizes="33vw" className="object-cover" />
                    </div>
                    <figcaption className="mt-3 hidden text-[0.875rem] text-fg-2 sm:block">{g.alt}</figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          <Section title="Stack">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s} className="rounded-full px-3.5 py-1.5 text-[0.875rem] text-fg ring-1 ring-inset ring-line-2">
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <nav aria-label="Next case study" className="mt-28 border-t border-line pt-10">
          <TransitionLink href={`/work/${next.slug}`} className="group flex flex-col gap-3" data-cursor-label="Next">
            <span className="font-mono text-[0.8125rem] text-fg-2">Next case study</span>
            <span className="flex items-center gap-4 text-[clamp(2.5rem,5.4vw,5.5rem)] font-light leading-[1.02] tracking-[-0.042em]">
              {next.title}
              <ArrowRightIcon aria-hidden className="h-[0.6em] w-[0.6em] shrink-0 text-accent transition-transform duration-500 group-hover:translate-x-2" />
            </span>
            <span className="text-[0.9375rem] text-fg-2">{next.result}</span>
          </TransitionLink>
        </nav>
      </div>
    </article>
  );
}
