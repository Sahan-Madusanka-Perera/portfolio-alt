import { site } from "@/data/site";

const TABLES = [7, 8, 9];

// The back cover of the book: maroon cloth, foil print, and the times tables
// every Sri Lankan exercise book carries on the back.
export function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "GitHub", href: site.githubUrl, external: true },
    { label: "LinkedIn", href: site.linkedinUrl, external: true },
    { label: "Email", href: `mailto:${site.email}`, external: false },
    { label: "CV (PDF)", href: site.resumeUrl, external: true },
  ];

  return (
    <footer
      className="cloth relative overflow-hidden text-on-cloth"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div>
          <p className="font-display text-5xl font-bold leading-[0.95] text-foil sm:text-6xl">{site.name}</p>
          <p lang="si" className="mt-2 font-sinhala text-2xl text-foil/80">
            සහන් පෙරේරා
          </p>

          <div className="mt-8 max-w-md rounded-[4px] border-2 border-foil/60 p-4">
            <p className="text-base leading-7 text-on-cloth/90">
              {site.role}
              <br />
              {site.location}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" role="list">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    data-cursor="link"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex min-h-11 items-center font-display text-lg font-semibold text-on-cloth underline decoration-foil/70 decoration-2 underline-offset-4 transition-colors hover:text-foil"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden className="hidden grid-cols-3 gap-6 self-end font-mono text-[0.8rem] leading-6 text-foil/55 tabular-nums md:grid">
          {TABLES.map((n) => (
            <ul key={n} role="list">
              {Array.from({ length: 10 }, (_, i) => (
                <li key={i}>
                  {n} × {String(i + 1).padStart(2, " ")} = {n * (i + 1)}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <p className="border-t border-foil/25 px-6 py-5 text-center text-sm text-on-cloth/70">
        &copy; {year} {site.name}. Built with Next.js, GSAP, and a bit too much canvas math.
      </p>
    </footer>
  );
}
