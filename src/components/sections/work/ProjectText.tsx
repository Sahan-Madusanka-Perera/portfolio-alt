import type { Project } from "@/data/projects";
import { Scribble } from "@/components/ui/Scribble";
import { ProjectActions } from "./ProjectActions";

// The written half of a spread: title, hook in ballpoint, the problem and how
// it's built, then the red pen's margin note. In the book, the build paragraph
// only shows when the page is tall enough to hold it.
export function ProjectText({ project, index, total, variant }: { project: Project; index: number; total: number; variant: "book" | "flat" }) {
  const inBook = variant === "book";

  return (
    <article aria-labelledby={`project-${project.slug}-${variant}`} className="flex h-full flex-col">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <p className="font-hand text-base leading-8 text-muted">
          page {index + 1} of {total}
        </p>
        {project.featured && <p className="stamp -rotate-3 text-sm text-pen">Featured</p>}
      </div>

      <h3
        id={`project-${project.slug}-${variant}`}
        className="text-balance font-display text-[clamp(2.1rem,3.2vw,3rem)] font-bold leading-[2.4rem] text-ink sm:leading-[3rem]"
      >
        {project.title}
      </h3>
      <p className="font-hand text-xl leading-8 text-ink">{project.hook}</p>
      <p className="mt-3 max-w-[62ch] text-base leading-8 text-text">{project.problem}</p>
      <p
        className={`max-w-[62ch] text-base leading-8 text-text ${inBook ? "hidden [@media(min-height:860px)]:block" : ""}`}
      >
        <span className="font-semibold text-ink">How it&apos;s built: </span>
        {project.architecture}
      </p>
      <p className="text-sm font-semibold leading-8 text-text">Built with</p>
      <ul className="grid max-w-[30rem] grid-cols-2 gap-x-6" role="list">
        {project.stack.map((tech) => (
          <li key={tech} className="flex items-center gap-2 font-hand text-lg leading-8 text-ink">
            <Scribble kind="tick" animate={false} strokeWidth={2.5} className="h-3.5 w-4 shrink-0 text-pen" />
            {tech}
          </li>
        ))}
      </ul>

      <p className="relative mt-3 -rotate-2 self-start pb-1 font-hand text-xl font-bold leading-8 text-pen">
        {project.penNote}
        <Scribble kind="underline" animate={false} strokeWidth={2.25} className="absolute -left-1 bottom-0 h-2.5 w-[calc(100%+0.5rem)]" />
      </p>

      <ProjectActions project={project} className="mt-4" />
    </article>
  );
}
