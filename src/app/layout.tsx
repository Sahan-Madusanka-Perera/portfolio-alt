import type { Metadata, Viewport } from "next";
import { Abhaya_Libre, Gemunu_Libre, Geist, Geist_Mono, Kalam } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/providers/ThemeScript";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SiteNav } from "@/components/layout/SiteNav";
import { CustomCursorLoader } from "@/components/layout/CustomCursorLoader";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/data/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Gemunu Libre + Abhaya Libre are by Mooniak, a type foundry in Colombo; both
// carry Sinhala and Latin, so the two scripts share one voice.
const gemunu = Gemunu_Libre({ variable: "--font-gemunu", subsets: ["latin", "sinhala"] });
const abhaya = Abhaya_Libre({ variable: "--font-abhaya", subsets: ["sinhala"], weight: ["500", "700"] });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["400", "700"] });

const DIRECTION_CONTRACT = `<!--
THESIS: The portfolio is a Sri Lankan school exercise book in which a red pen (the model) corrects the writing live. Refuses the dark, neon-accent, card-grid developer portfolio.
OWN-WORLD: Cool ruled paper, double red margin rule, ballpoint-blue ink, red-pen strikes, carets and ticks, inked stamps, maroon cloth CR-book cover with foil. Dark theme is the classroom blackboard in chalk. Gemunu Libre display, Kalam hand, Abhaya Libre Sinhala.
STORY: The visitor watches machine-corrected writing (the research), flips a 3D book of built work whose pages run live figures, then answers a school-style letter.
FIRST VIEWPORT: One ruled page. Huge ink "Sahan Perera" with සහන් පෙරේරා, two answer lines that correct themselves in red, GPA circled in the margin, an ink-stamp "See the work" action and CV link directly beneath.
FORM: Red-Pen Exercise Book, grounded candidate 1 (user's pick). Seed 02f71400.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  title: "Sahan Perera — ML Engineer & Full-Stack Developer",
  description:
    "Sahan Perera builds machines that see and read: computer vision, Sinhala grammatical error correction research, and full-stack apps shipped from Colombo.",
  authors: [{ name: site.name, url: site.githubUrl }],
  creator: site.name,
  keywords: [
    "Sahan Perera",
    "Machine Learning",
    "Computer Vision",
    "Sinhala NLP",
    "Grammatical Error Correction",
    "Full-Stack Developer",
    "Next.js",
    "PyTorch",
    "Sri Lanka",
  ],
  openGraph: {
    title: "Sahan Perera — ML Engineer & Full-Stack Developer",
    description:
      "An exercise book corrected by a red pen: computer vision, Sinhala GEC research, and full-stack work — plus a football arena.",
    type: "website",
    locale: "en_US",
    siteName: "Sahan Perera",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16201b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${gemunu.variable} ${abhaya.variable} ${kalam.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-paper text-text">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <ThemeProvider>
          <MotionProvider>
            <SmoothScrollProvider>
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
              <CustomCursorLoader />
              <SiteNav />
              <main id="main-content">{children}</main>
              <Footer />
            </SmoothScrollProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
