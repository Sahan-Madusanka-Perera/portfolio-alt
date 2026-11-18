// Identity and contact details: the one source of truth for who, where and how to reach.
// JSX-free so Server and Client Components can both import it.
export const site = {
  name: "Sahan Perera",
  nameSinhala: "සහන් පෙරේරා",
  role: "Computer Science undergraduate and product engineer",
  positioning: "I build systems that see, and the software that keeps them running.",
  summary:
    "Final-year Computer Science undergraduate. I build polished, well-tested web and mobile products in TypeScript, train vision models from scratch in Python, and run them reliably in the cloud.",
  location: "Piliyandala, Colombo, Sri Lanka",
  city: "Colombo, Sri Lanka",
  availability: "Open to internships, Nov 2026 to May 2027",
  availabilityDetail: "Internships or full-time, November 2026 to May 2027. Graduating June 2027.",

  email: "sahanpereraperera@gmail.com",
  phone: "+94 76 946 5982",
  phoneHref: "tel:+94769465982",
  whatsappUrl: "https://wa.me/94769465982",
  cvUrl: "/sahan-perera-cv.pdf",

  githubUrl: "https://github.com/Sahan-Madusanka-Perera",
  githubHandle: "Sahan-Madusanka-Perera",
  linkedinUrl: "https://www.linkedin.com/in/sahan-perera-64183b204/",
  linkedinHandle: "sahan-perera",

  university: "University of Sri Jayewardenepura",
  degree: "Bachelor of Computing (Honours) in Computer Science",
  gpa: "3.90",
  graduation: "June 2027",

  interests: ["football", "music", "games", "astronomy", "teaching"],
  now: "Applying for internships, and building DBOps Lab and Seqlith.",
} as const;

export const navSections = [
  { id: "work", label: "Work" },
  { id: "proof", label: "Proof" },
  { id: "research", label: "Research" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

/** Every section on the home page, in order: used by the command palette. */
export const allSections = [
  { id: "top", label: "Top" },
  { id: "work", label: "Selected work" },
  { id: "proof", label: "Proof in numbers" },
  { id: "operations", label: "Operations terminal" },
  { id: "try", label: "Try it: mini demos" },
  { id: "research", label: "Research" },
  { id: "about", label: "About and now" },
  { id: "skills", label: "Skills" },
  { id: "timeline", label: "Experience and education" },
  { id: "more-work", label: "More projects" },
  { id: "play", label: "Play: football arena" },
  { id: "contact", label: "Contact" },
] as const;
