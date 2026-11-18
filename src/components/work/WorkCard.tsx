"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { Flagship } from "@/data/projects";
import { getCardDistortion } from "./distortion";

type WorkCardProps = { project: Flagship; index: number; total: number; priority?: boolean };

export function WorkCard({ project, index, total, priority }: WorkCardProps) {
  const { visual } = project;
  const isSvg = visual.src.endsWith(".svg");
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="work-card group relative flex w-full flex-col gap-6 lg:motion-safe:w-[min(58vw,880px,calc((100svh-330px)*1.6))] lg:motion-safe:shrink-0">
      <TransitionLink
        href={`/work/${project.slug}`}
        aria-label={`${project.title}: read the case study`}
        data-cursor-label="View"
        className="block rounded-[20px]"
      >
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-bg-2 ring-1 ring-inset ring-line"
          style={{ viewTransitionName: `work-${project.slug}` }}
          onPointerEnter={(e) => getCardDistortion()?.enter(e.currentTarget, visual.src, 20, e.clientX, e.clientY)}
          onPointerMove={(e) => getCardDistortion()?.move(e.clientX, e.clientY)}
          onPointerLeave={() => getCardDistortion()?.leave()}
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
            unoptimized={isSvg}
            priority={priority}
          />
        </div>
      </TransitionLink>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-6">
        <p className="font-mono text-[0.8125rem] text-fg-2 tabular">
          {number}
          <span className="text-fg-3"> / {String(total).padStart(2, "0")}</span>
        </p>
        <div className="min-w-0">
          <h3 className="text-[clamp(1.75rem,2.6vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em]">
            <TransitionLink href={`/work/${project.slug}`} className="link-line pb-1" tabIndex={-1}>
              {project.title}
            </TransitionLink>
          </h3>
          <p className="mt-2 text-[0.9375rem] text-fg-2">
            {project.kind}, {project.year}
          </p>
        </div>
        <p className="flex items-center gap-2 text-[0.9375rem] text-fg sm:max-w-[22ch] sm:justify-self-end sm:text-right">
          {project.result}
          <ArrowUpRightIcon aria-hidden size={14} className="shrink-0 text-accent transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
      </div>
    </article>
  );
}
