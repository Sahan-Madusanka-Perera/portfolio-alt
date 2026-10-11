"use client";

import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { GithubIcon } from "@/components/layout/BrandIcons";
import { PenUnderline } from "@/components/ui/Scribble";

// "#" is the sentinel for "not deployed yet" in the project data. Status reads
// as a plot marker, not a colour: filled = available now, hollow = coming.
const isLive = (url?: string) => !!url && url !== "#";

function Marker({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" aria-hidden>
      <circle cx="6" cy="6" r="4.5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ProjectActions({ project, className = "" }: { project: Project; className?: string }) {
  const live = isLive(project.liveUrl);
  const repo = isLive(project.githubUrl);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {repo && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className="btn-pen !text-lg">
            <GithubIcon className="h-4 w-4" aria-hidden /> Read the code
            <PenUnderline />
          </a>
        )}
        {live && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className="btn-pen !text-lg">
            Live app <ArrowUpRight className="h-4 w-4" aria-hidden />
            <PenUnderline />
          </a>
        )}
      </div>

      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-muted" aria-label="Availability" role="list">
        <li className={`inline-flex items-center gap-1.5 ${repo ? "text-ink" : ""}`}>
          <Marker filled={repo} /> {repo ? "Repo public" : "Repo private"}
        </li>
        <li className={`inline-flex items-center gap-1.5 ${live ? "text-ink" : ""}`}>
          <Marker filled={live} /> {live ? "Live now" : "Live demo coming"}
        </li>
      </ul>
    </div>
  );
}
