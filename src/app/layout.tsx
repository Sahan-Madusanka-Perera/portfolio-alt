import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { CursorFollower } from "@/components/layout/CursorFollower";
import { Footer } from "@/components/layout/Footer";
import { SiteNav } from "@/components/layout/SiteNav";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/site-url";

// Self-hosted (scripts/fetch-fonts.mjs), so the build never fetches fonts: next/font/google
// failed on Vercel's build adapter. Same files, subsets and weights Google Fonts serves.
const interTight = localFont({
  src: "./fonts/inter-tight-latin-normal-300-500.woff2",
  variable: "--font-inter-tight",
  weight: "300 500",
  display: "swap",
});
const instrumentSerif = localFont({
  src: "./fonts/instrument-serif-latin-italic-400.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-normal-400-500.woff2",
  variable: "--font-jetbrains-mono",
  weight: "400 500",
  display: "swap",
  preload: false,
});
// Abhaya Libre is by Mooniak, a type foundry in Colombo, and carries Sinhala and Latin.
const abhaya = localFont({
  src: [
    { path: "./fonts/abhaya-libre-sinhala-normal-500.woff2", weight: "500" },
    { path: "./fonts/abhaya-libre-sinhala-normal-700.woff2", weight: "700" },
  ],
  variable: "--font-abhaya",
  display: "swap",
  preload: false,
});

const title = `${site.name}, software engineer in Colombo`;
const description =
  "Final-year Computer Science undergraduate at the University of Sri Jayewardenepura. Tested web and mobile products in TypeScript, vision models in Python, Sinhala grammatical error correction research, and the cloud plumbing that keeps them running.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${site.name}` },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.githubUrl }],
  creator: site.name,
  keywords: [
    site.name,
    "software engineer",
    "computer vision",
    "Sinhala NLP",
    "grammatical error correction",
    "Next.js",
    "TypeScript",
    "Python",
    "Sri Lanka",
    "internship",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
    { media: "(prefers-color-scheme: light)", color: "#ecebe7" },
  ],
  colorScheme: "dark light",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.nameSinhala,
  url: siteUrl,
  email: `mailto:${site.email}`,
  jobTitle: "Software engineer",
  description: site.summary,
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
  alumniOf: { "@type": "CollegeOrUniversity", name: site.university },
  knowsAbout: ["Computer vision", "Natural language processing", "Web development", "Mobile development", "Cloud infrastructure"],
  sameAs: [site.githubUrl, site.linkedinUrl],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${abhaya.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
            <SmoothScrollProvider>
              <SiteNav />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
              <CommandPalette />
              <CursorFollower />
            </SmoothScrollProvider>
        </ThemeProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
