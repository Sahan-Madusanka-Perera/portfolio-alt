import { ArrowUpRightIcon, DownloadSimpleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { CopyButton } from "@/components/ui/CopyButton";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop";
import { SplitText } from "@/components/ui/SplitText";
import { site } from "@/data/site";

const elsewhere = [
  { label: "LinkedIn", href: site.linkedinUrl },
  { label: "GitHub", href: site.githubUrl },
  { label: "WhatsApp", href: site.whatsappUrl },
];

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden py-[clamp(120px,18vw,260px)]">
      <ShaderBackdrop kind="grain" className="opacity-80 [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]" />
      <div className="container-x">
        <Reveal as="p" className="text-[0.875rem] text-fg-2">
          {site.availability}
        </Reveal>
        <SplitText
          as="h2"
          id="contact-title"
          text="Let's build something that works"
          em={["works"]}
          className="mt-6 max-w-[14ch] text-[clamp(3.25rem,9vw,9rem)] font-light leading-[0.92] tracking-[-0.045em]"
        />
        <Reveal className="mt-14 flex flex-wrap items-center gap-3">
          <MagneticButton href={`mailto:${site.email}`} size="lg" icon={<EnvelopeSimpleIcon aria-hidden size={18} />}>
            {site.email}
          </MagneticButton>
          <CopyButton value={site.email} label="Copy email" className="h-14 px-5 text-[0.9375rem]" />
          <MagneticButton href={site.cvUrl} variant="ghost" size="lg" download icon={<DownloadSimpleIcon aria-hidden size={18} />}>
            Download CV
          </MagneticButton>
        </Reveal>
        <Reveal as="ul" className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-8">
          {elsewhere.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[clamp(1.125rem,1.5vw,1.375rem)] text-fg transition-colors hover:text-accent"
              >
                {link.label}
                <ArrowUpRightIcon aria-hidden size={16} />
              </a>
            </li>
          ))}
          <li className="text-[clamp(1.125rem,1.5vw,1.375rem)] text-fg-2">
            <a href={site.phoneHref} className="transition-colors hover:text-fg">
              {site.phone}
            </a>
          </li>
        </Reveal>
      </div>
    </section>
  );
}
