import { Mail } from "lucide-react";
import type { ComponentType } from "react";
import { site } from "@/data/site";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";

// Accepts both lucide icons (forwardRef components) and the local brand glyphs
// (plain SVG components) — we only ever pass `className` + `aria-hidden`.
type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

// Icon-only social row, reused by the hero and footer. No hooks, so it renders
// fine inside Server Components. The contact section has its own richer layout.
const LINKS: Array<{ label: string; href: string; Icon: IconComponent; external: boolean }> = [
  { label: "GitHub", href: site.githubUrl, Icon: GithubIcon, external: true },
  { label: "LinkedIn", href: site.linkedinUrl, Icon: LinkedinIcon, external: true },
  { label: "Email", href: `mailto:${site.email}`, Icon: Mail, external: false },
];

export function SocialLinks({
  className = "",
  iconClassName = "h-[18px] w-[18px]",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <ul className={`flex items-center gap-2 ${className}`} role="list">
      {LINKS.map(({ label, href, Icon, external }) => (
        <li key={label}>
          <a
            href={href}
            data-cursor="link"
            aria-label={label}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className={iconClassName} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
