import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop";
import { proofStats } from "@/data/proof";

// Numbers that came out of the work, each linked to where it was measured.
export function ProofSection() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="relative isolate py-[clamp(96px,14vw,200px)]">
      <ShaderBackdrop kind="mesh" className="opacity-70 [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_80%,transparent)]" />
      <div className="container-x">
        <SectionHeading
          id="proof-title"
          title="Proof, in numbers"
          intro="Every figure here was measured in the project it links to. No estimates, no rounding up."
        />
        <ul className="mt-16 grid gap-px overflow-hidden rounded-[20px] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {proofStats.map((stat, i) => (
            <Reveal as="li" key={stat.label} delay={(i % 4) * 0.06} className="bg-bg/85 backdrop-blur-sm">
              <Link href={stat.href} className="group flex h-full flex-col justify-between gap-10 p-6 transition-colors hover:bg-fg/[0.03] sm:p-8">
                <span className="font-mono text-[clamp(2.5rem,4.4vw,4rem)] font-normal leading-none tracking-[-0.04em] text-fg">
                  <CountUp to={stat.to} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
                </span>
                <span className="space-y-2">
                  <span className="block text-[0.9375rem] leading-[1.45] text-fg">{stat.label}</span>
                  <span className="flex items-center gap-1.5 text-[0.875rem] text-fg-2 transition-colors group-hover:text-fg">
                    {stat.project}
                    <ArrowUpRightIcon aria-hidden size={12} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
          <li className="hidden bg-bg/85 p-8 backdrop-blur-sm lg:flex lg:items-end">
            <p className="text-[0.875rem] leading-[1.5] text-fg-2">
              Sources: project READMEs, test runners and load-test reports in each repository.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
