import { Hero } from "@/components/sections/hero/Hero";
import { WorkSection } from "@/components/sections/work/WorkSection";
import { ResearchSection } from "@/components/sections/research/ResearchSection";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { ContactSection } from "@/components/sections/contact/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <WorkSection />
      <ResearchSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
