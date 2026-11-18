export type TimelineEntry = {
  period: string;
  title: string;
  org: string;
  detail: string;
  links?: { label: string; href: string }[];
};

export const experience: TimelineEntry[] = [
  {
    period: "2025 to now",
    title: "Freelance developer",
    org: "Independent",
    detail:
      "Zeus Power International: a production company website, from design to deployment and DNS. D-Store SL (pre-launch): a Next.js and Supabase e-commerce platform with a Google Gemini feature, and a pre-launch security review that closed four critical access-control holes (71 tests). Biz Guide: an Astro site that scores 100 in all four Lighthouse categories on slow 4G.",
    links: [{ label: "zeuspower.lk", href: "https://zeuspower.lk" }],
  },
  {
    period: "2025 to now",
    title: "Founder",
    org: "Seqlith",
    detail:
      "My one-person product studio. I designed and built its site: React, Three.js, a custom loader and liquid-glass effects.",
    links: [{ label: "seqlith.com", href: "https://www.seqlith.com" }],
  },
  {
    period: "Nov 2025 to now",
    title: "Director, Media and Marketing",
    org: "J'pura Astronomy Club, USJ",
    detail:
      "Built the club's website: events, an astrophotography gallery, an e-magazine reader and live sky conditions, in Next.js, TypeScript, Tailwind, Supabase, GSAP, Framer Motion and pdf.js. 28 commits, all mine.",
    links: [
      { label: "japuraastro.lk", href: "https://japuraastro.lk" },
      { label: "Source", href: "https://github.com/Sahan-Madusanka-Perera/astro-website" },
    ],
  },
  {
    period: "2023 to now",
    title: "Private ICT tutor",
    org: "G.C.E. A/L and O/L",
    detail: "Teaching ICT to G.C.E. A/L and O/L students since 2023.",
  },
  {
    period: "2025",
    title: "Quiz Master",
    org: "J'pura Xtreme 2.0, IEEE Student Branch, USJ",
    detail: "Ran the quiz for the IEEE Student Branch's J'pura Xtreme 2.0.",
  },
  {
    period: "2024",
    title: "Academic Panel",
    org: "Association of Computing Students",
    detail: "Served on the association's academic panel.",
  },
];

export const education: TimelineEntry[] = [
  {
    period: "Jun 2023 to Jun 2027",
    title: "Bachelor of Computing (Honours) in Computer Science",
    org: "University of Sri Jayewardenepura",
    detail: "GPA 3.90 of 4.00. Graduating June 2027.",
  },
  {
    period: "2018 to 2022",
    title: "G.C.E. Advanced Level, Physical Science",
    org: "Ananda College, Colombo",
    detail: "English medium. Z-score 1.6.",
  },
  {
    period: "2019",
    title: "Diploma in Information Technology",
    org: "ESOFT Metro Campus",
    detail: "Best Performer.",
  },
];

export const certifications = [
  "Google AI Professional Certificate (Coursera)",
  "IBM Introduction to DevOps",
  "Meta Front-End Development and Programming with JavaScript (2024)",
  "TryHackMe Intro to Cyber Security",
  "Java Programming, SLIIT (2019)",
];
