import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NandDemo } from "./NandDemo";
import { SubnetDemo } from "./SubnetDemo";

export function TrySection() {
  return (
    <section id="try" aria-labelledby="try-title" className="py-[clamp(96px,14vw,200px)]">
      <div className="container-x">
        <SectionHeading
          id="try-title"
          title="Try it here"
          intro="Two small pieces of the teaching platforms I build, working right on this page."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <SubnetDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.08}>
            <NandDemo />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
