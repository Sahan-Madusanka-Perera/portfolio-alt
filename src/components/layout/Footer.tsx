import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { LocalTime } from "@/components/layout/LocalTime";
import { site } from "@/data/site";

const links = [
  { label: "GitHub", href: site.githubUrl, external: true },
  { label: "LinkedIn", href: site.linkedinUrl, external: true },
  { label: "Email", href: `mailto:${site.email}`, external: false },
  { label: "CV", href: site.cvUrl, external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <p className="text-[1rem] font-normal">
            {site.name}{" "}
            <span lang="si" className="font-sinhala text-fg-2">
              {site.nameSinhala}
            </span>
          </p>
          <p className="text-[0.875rem] text-fg-2">
            {site.city}. <LocalTime />
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[0.875rem]">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="link-line inline-flex items-center gap-1 pb-0.5 text-fg-2 transition-colors hover:text-fg"
              >
                {link.label}
                {link.external && <ArrowUpRightIcon aria-hidden size={12} />}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="container-x flex flex-wrap justify-between gap-3 border-t border-line py-6 font-mono text-[0.8125rem] text-fg-2">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>Next.js, Three.js and GSAP. Press ⌘K to get around.</span>
      </div>
    </footer>
  );
}
