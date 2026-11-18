import { HeroIntro } from "./HeroIntro";
import { Loader } from "./Loader";
import { HeroPortrait } from "./portrait/HeroPortrait";

// First viewport. Desktop: words on the left, the portrait filling the right half.
// Mobile: the portrait sits behind the top of the screen and the words read over its fading lower edge.
export function Hero() {
  return (
    <>
      <Loader />
      <section id="top" aria-label="Introduction" className="relative isolate overflow-hidden">
        <HeroPortrait className="absolute left-0 top-0 -z-10 h-[52svh] w-full [mask-image:linear-gradient(to_bottom,#000_50%,transparent_96%)] lg:left-auto lg:right-0 lg:h-full lg:w-[56%] lg:[mask-image:none]" />
        <div className="container-x flex min-h-[100svh] items-start pb-14 pt-[40svh] lg:items-center lg:pb-16 lg:pt-32">
          <HeroIntro />
        </div>
      </section>
    </>
  );
}
