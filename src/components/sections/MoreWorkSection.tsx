import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { moreProjects } from "@/data/projects";

export function MoreWorkSection() {
  return (
    <section id="more-work" aria-labelledby="more-work-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading id="more-work-title" title="More work" intro="Smaller builds, coursework and models, each with what it does and where to see it." />
        <ul className="mt-16 divide-y divide-line border-y border-line">
          {moreProjects.map((project) => (
            <Reveal
              as="li"
              key={project.title}
              className="grid gap-3 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_150px] md:items-baseline md:gap-10"
            >
              <h3 className="text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.3]">{project.title}</h3>
              <div className="space-y-2">
                <p className="max-w-[60ch] text-[1rem] leading-[1.55] text-fg-2">{project.description}</p>
                <p className="font-mono text-[0.8125rem] text-fg-2">{project.tags.join(" · ")}</p>
                {project.note && <p className="text-[0.875rem] text-fg-2">{project.note}</p>}
              </div>
              <div className="flex gap-4 md:justify-end">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[0.875rem] text-fg transition-colors hover:text-accent"
                  >
                    Live
                    <ArrowUpRightIcon aria-hidden size={12} />
                    <span className="sr-only">: {project.title}</span>
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.875rem] text-fg-2 transition-colors hover:text-fg"
                  >
                    <GithubLogoIcon aria-hidden size={14} />
                    Source
                    <span className="sr-only">: {project.title} on GitHub</span>
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
