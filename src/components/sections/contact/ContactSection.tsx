"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useInView } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/layout/BrandIcons";
import { site } from "@/data/site";
import { PenUnderline, Scribble } from "@/components/ui/Scribble";

function subscribeNever() {
  return () => {};
}
function longDate() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Channel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="grid items-center gap-x-6 border-b border-rule py-2 sm:grid-cols-[7rem_1fr]">
      <span className="font-display text-base font-semibold uppercase tracking-[0.06em] text-muted">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-x-5">{children}</div>
    </li>
  );
}

const linkClass =
  "inline-flex min-h-11 min-w-0 items-center gap-2 break-all text-lg font-medium text-ink underline decoration-rule decoration-2 underline-offset-4 transition-colors hover:text-pen hover:decoration-pen";

// Contact, written the way every Sri Lankan student learns to write a formal
// letter: address top right, date, salutation, body, and a signature.
export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const today = useSyncExternalStore(subscribeNever, longDate, () => "");
  const signatureRef = useRef<HTMLParagraphElement>(null);
  const signed = useInView(signatureRef, { once: true, amount: 0.8 });

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context): the mailto link still works.
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-16 border-t-2 border-rule bg-paper-2 px-3 py-[calc(var(--line)*3)] sm:px-8"
    >
      <div className="ruled margin-rule sheet-x relative mx-auto max-w-5xl rotate-[-0.3deg] bg-sheet pb-[calc(var(--line)*2)] pt-[calc(var(--line)*2)] shadow-[0_1px_2px_rgb(var(--shadow)/0.15),0_40px_70px_-40px_rgb(var(--shadow)/0.55)] [--gutter:clamp(2rem,6vw,5rem)] [--rule-shift:-0.4rem]">
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="stamp -rotate-6 self-start text-base text-pen">{site.availability}</p>
          <address className="text-right font-hand text-xl not-italic leading-8 text-ink">
            {site.name}
            <br />
            {site.location}
            <br />
            <span className="text-lg text-muted">{today}</span>
          </address>
        </div>

        <h2
          id="contact-heading"
          className="mt-[var(--line)] font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-bold leading-[0.98] text-ink"
        >
          Let&apos;s work together
        </h2>

        <div className="mt-[var(--line)] max-w-[60ch] text-lg leading-8 text-text">
          <p className="font-hand text-2xl text-ink">Dear reader,</p>
          <p>
            I&apos;m open to internships, freelance work, and interesting ML problems. If you have a role, a product
            that needs building, or a problem that needs a model, I&apos;d like to hear about it. Email is the fastest
            way to reach me.
          </p>
        </div>

        <div className="mt-[var(--line)] flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href={`mailto:${site.email}`} data-cursor="link" className="btn-ink">
            <Mail className="h-5 w-5" aria-hidden /> Email me
          </a>
          <button type="button" onClick={copyEmail} data-cursor="link" className="btn-pen" aria-live="polite">
            {copied ? <Check className="h-4 w-4 text-pen" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? "Copied to clipboard" : "Copy my email"}
            <PenUnderline />
          </button>
        </div>

        <ul className="mt-[calc(var(--line)*1.5)] max-w-3xl border-t border-rule" role="list">
          <Channel label="Email">
            <a href={`mailto:${site.email}`} data-cursor="link" className={linkClass}>
              {site.email}
            </a>
          </Channel>
          <Channel label="Phone">
            <a href={site.phoneHref} data-cursor="link" className={linkClass}>
              {site.phone}
            </a>
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className={linkClass}>
              <WhatsappIcon className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          </Channel>
          <Channel label="LinkedIn">
            <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className={linkClass}>
              <LinkedinIcon className="h-4 w-4" aria-hidden /> {site.linkedinHandle}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </Channel>
          <Channel label="GitHub">
            <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" data-cursor="link" className={linkClass}>
              <GithubIcon className="h-4 w-4" aria-hidden /> {site.githubHandle}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </Channel>
          <Channel label="CV">
            <a href={site.resumeUrl} target="_blank" rel="noopener noreferrer" download data-cursor="link" className={linkClass}>
              <Download className="h-4 w-4" aria-hidden /> Download my CV (PDF)
            </a>
          </Channel>
        </ul>

        <div className="mt-[calc(var(--line)*1.5)]">
          <p className="text-lg leading-8 text-text">Yours faithfully,</p>
          <p ref={signatureRef} className="relative inline-block pb-2 pr-6 font-hand text-5xl font-bold leading-[4rem] text-ink">
            <span className={signed ? "write-on inline-block" : "inline-block opacity-0"} style={{ ["--dur" as string]: "1.2s" }}>
              {site.name}
            </span>
            {signed && (
              <Scribble
                kind="underline"
                delay={1.1}
                duration={0.5}
                strokeWidth={2.5}
                className="absolute -left-1 bottom-1 h-3 w-full text-pen"
              />
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
