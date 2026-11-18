import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Hero } from "@/components/sections/hero/Hero";
import { MoreWorkSection } from "@/components/sections/MoreWorkSection";
import { OperationsSection } from "@/components/sections/OperationsSection";
import { PlaySection } from "@/components/sections/PlaySection";
import { ProofSection } from "@/components/sections/ProofSection";
import { ResearchSection } from "@/components/sections/research/ResearchSection";
import { SkillsSection } from "@/components/sections/skills/SkillsSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { TrySection } from "@/components/sections/try/TrySection";
import { WorkSection } from "@/components/work/WorkSection";

export default function Home() {
  return (
    <>
      <Hero />
      <WorkSection />
      <ProofSection />
      <OperationsSection />
      <TrySection />
      <ResearchSection />
      <AboutSection />
      <SkillsSection />
      <TimelineSection />
      <MoreWorkSection />
      <PlaySection />
      <ContactSection />
    </>
  );
}
