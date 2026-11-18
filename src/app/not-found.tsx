import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { flagships } from "@/data/projects";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// A 404 with a little football in it: the shot sails over the bar.
export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="container-x flex min-h-[100svh] flex-col justify-center gap-12 pb-20 pt-32">
      <svg viewBox="0 0 480 220" className="h-auto w-full max-w-[480px]" aria-hidden>
        {/* the goal */}
        <path d="M150 210 V110 H390 V210" fill="none" className="stroke-line-2" strokeWidth={3} strokeLinecap="round" />
        <path d="M150 110 L170 128 H370 L390 110 M170 128 V210 M370 128 V210" fill="none" className="stroke-line" strokeWidth={1.5} />
        {/* the shot, over the bar */}
        <path
          d="M40 206 Q 250 -40 460 60"
          pathLength={1}
          fill="none"
          className="nf-shot stroke-accent"
          strokeWidth={2}
          strokeDasharray="0.02 0.03"
          strokeLinecap="round"
        />
        <circle r={9} className="nf-ball fill-accent" cx={0} cy={0} />
        <circle cx={40} cy={206} r={4} className="fill-fg/30" />
      </svg>

      <div className="space-y-6">
        <p className="font-mono text-[0.8125rem] text-fg-2">404</p>
        <h1 id="nf-title" className="max-w-[16ch] text-[clamp(2.5rem,5.4vw,5.5rem)] font-light leading-[1.02] tracking-[-0.042em]">
          That one went over the <em className="font-serif italic">bar</em>
        </h1>
        <p className="max-w-[46ch] text-[clamp(1.125rem,1.5vw,1.375rem)] leading-[1.45] text-fg-2">
          The page you were after is not here. The link may be old, or I moved something. Here is the way back.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MagneticButton href="/" size="lg" icon={<ArrowLeftIcon aria-hidden size={16} />}>
          Back to the start
        </MagneticButton>
        <MagneticButton href="/#work" variant="ghost" size="lg">
          See the work
        </MagneticButton>
      </div>

      <nav aria-label="Case studies" className="border-t border-line pt-6">
        <p className="text-[0.875rem] text-fg-2">Or go straight to a case study:</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {flagships.map((project) => (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="text-[0.9375rem] text-fg transition-colors hover:text-accent">
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
