import { ExternalLink } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const THEMES = [
  "Corpus scarcity, and generating synthetic errors to make up for it",
  "Transfer learning from GEC models trained on high-resource languages",
  "Evaluation that suits a morphologically rich, low-resource language",
];

function Step({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <li className="relative pl-9">
      <span aria-hidden className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-ink bg-sheet" />
      {!last && <span aria-hidden className="absolute bottom-[-0.5rem] left-[0.9rem] top-6 border-l-2 border-dotted border-ink/40" />}
      <p className="text-[0.9rem] font-medium leading-7 text-muted">{label}</p>
      <div className="pb-5">{children}</div>
    </li>
  );
}

export function ResearchSection() {
  return (
    <section
      id="research"
      aria-labelledby="research-heading"
      className="ruled margin-rule sheet-x relative scroll-mt-16 border-t-2 border-rule pb-[calc(var(--line)*3)] pt-[calc(var(--line)*2)] sm:pb-[calc(var(--line)*4)] sm:pt-[calc(var(--line)*4)]"
    >
      <h2 id="research-heading" className="max-w-[16ch] font-display text-[clamp(3rem,7.5vw,6rem)] font-bold leading-[0.95] text-ink">
        Teaching machines to correct Sinhala
      </h2>

      <div className="mt-[calc(var(--line)*2)] grid gap-x-14 gap-y-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div>
          {/* The paper, pasted into the book like a clipping. */}
          <div className="relative -rotate-1 rounded-[2px] bg-sheet px-6 py-5 shadow-[0_1px_2px_rgb(var(--shadow)/0.18),0_14px_30px_-18px_rgb(var(--shadow)/0.45)] sm:px-8 sm:py-7">
            <p className="font-display text-[clamp(1.6rem,2.8vw,2.3rem)] font-bold leading-[1.08] text-ink">
              Data-Driven Sinhala Grammatical Error Correction: A Review of Corpora, Models, and Low-Resource Strategies
            </p>
            <p className="mt-3 font-hand text-xl text-pen">Review paper, Journal of Computer Science (JCoS), 2026</p>
          </div>

          <p className="mt-[calc(var(--line)*1.5)] max-w-[62ch] text-lg leading-8 text-text">
            The review maps what exists for Sinhala grammatical error correction (GEC): the corpora, the models that have
            been tried, and the low-resource strategies that make correction workable for a language with far less
            annotated data than English.
          </p>

          <h3 className="mt-8 font-display text-2xl font-bold leading-8 text-ink">Why it&apos;s hard</h3>
          <p className="max-w-[62ch] text-lg leading-8 text-text">
            Annotated data is scarce, Sinhala&apos;s rich morphology makes tokenization non-trivial, and most pretrained
            GEC models are English-centric. So synthetic error generation and transfer learning end up doing much of the
            heavy lifting.
          </p>

          <h3 className="mt-8 font-display text-2xl font-bold leading-8 text-ink">What the review covers</h3>
          <ol className="max-w-[62ch] text-lg leading-8 text-text" role="list">
            {THEMES.map((theme, i) => (
              <li key={theme} className="flex gap-3">
                <span className="w-7 shrink-0 font-hand font-bold text-pen">({["i", "ii", "iii"][i]})</span>
                {theme}
              </li>
            ))}
          </ol>
        </div>

        <figure className="self-start rounded-[2px] bg-sheet px-5 py-6 shadow-[0_1px_2px_rgb(var(--shadow)/0.12)] sm:px-8">
          <p className="font-display text-2xl font-bold leading-8 text-ink">Turning clean text into training data</p>
          <ol className="mt-5" role="list">
            <Step label="Start from a correct Sinhala sentence">
              <p lang="si" className="font-sinhala text-2xl font-medium leading-10 text-ink">
                මම පරිගණක විද්‍යාව හදාරමි.
              </p>
              <p className="text-sm text-muted">&ldquo;I study computer science.&rdquo;</p>
            </Step>
            <Step label="Inject a realistic error to make a synthetic pair">
              <p lang="si" className="font-sinhala text-2xl font-medium leading-10 text-ink">
                මම පරිගණක විද්‍යාව{" "}
                <span className="relative inline-block px-1">
                  හදාරයි
                  <Scribble
                    kind="circle"
                    animate={false}
                    strokeWidth={2.25}
                    className="pointer-events-none absolute -inset-x-2 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1rem)] text-pen"
                  />
                </span>
                .
              </p>
              <p className="font-hand text-lg leading-7 text-pen">third-person verb after මම (I)</p>
            </Step>
            <Step label="Train on (error, correct) pairs, often starting from a model pre-trained on high-resource languages">
              <p className="font-hand text-xl leading-8 text-ink">error → model → correction</p>
            </Step>
            <Step label="The model learns to put the red pen back" last>
              <p lang="si" className="flex items-center gap-2 font-sinhala text-2xl font-medium leading-10 text-ink">
                මම පරිගණක විද්‍යාව <span className="text-pen">හදාරමි</span>.
                <Scribble kind="tick" animate={false} strokeWidth={3} className="h-6 w-6 text-pen" />
              </p>
            </Step>
          </ol>
          <figcaption className="text-[0.8rem] leading-5 text-muted">
            <span className="font-semibold text-text">Fig. 7</span> How synthetic error generation turns scarce data
            into training pairs. Illustrative example of one error type (subject–verb agreement).
          </figcaption>
        </figure>
      </div>

      <div className="mt-[calc(var(--line)*3)] max-w-4xl">
        <h3 className="font-display text-2xl font-bold leading-8 text-ink">Publications</h3>
        <ol className="mt-4 space-y-6" role="list">
          <li className="grid gap-x-4 sm:grid-cols-[3rem_1fr]">
            <span className="font-hand text-xl font-bold leading-8 text-pen">[1]</span>
            <div>
              <p className="text-lg font-semibold leading-8 text-text">
                Data-Driven Sinhala Grammatical Error Correction: A Review of Corpora, Models, and Low-Resource Strategies
              </p>
              <p className="leading-8 text-muted">Journal of Computer Science (JCoS), 2026 · Review paper</p>
            </div>
          </li>
          <li className="grid gap-x-4 sm:grid-cols-[3rem_1fr]">
            <span className="font-hand text-xl font-bold leading-8 text-pen">[2]</span>
            <div>
              <p className="text-lg font-semibold leading-8 text-text">
                Cost-Benefit Analysis and Sustainability Considerations in Starting a Restaurant: A Case Study from Sri
                Lanka
              </p>
              <p className="leading-8 text-muted">Economics, Management and Sustainability, 10(1), 165&ndash;178, 2025</p>
              <a
                href="https://doi.org/10.14254/jems.2025.10-1.11"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink underline decoration-2 underline-offset-4 hover:text-pen"
              >
                doi.org/10.14254/jems.2025.10-1.11
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
