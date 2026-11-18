import { HeroIntro } from "@/components/sections/hero/HeroIntro";

export default function Home() {
  return (
    <>
      <section id="top" aria-label="Introduction" className="container-x relative flex min-h-[100dvh] items-center pb-16 pt-32">
        <HeroIntro />
      </section>
    </>
  );
}
