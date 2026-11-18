// Weighted by the code in ../ (docs/SKILLS_EVIDENCE.md), not by an old CV.
// `weight` sets the type size: 3 = daily, 2 = regular, 1 = used in one or two projects.

export type SkillGroup = {
  name: string;
  weight: 1 | 2 | 3;
  skills: string[];
  evidence: string;
};

export const skillGroups: SkillGroup[] = [
  {
    name: "Front end and product",
    weight: 3,
    skills: ["TypeScript", "React 19", "Next.js App Router", "Vite", "Tailwind CSS v4", "Radix and shadcn-style UI", "Zustand", "Zod", "Recharts"],
    evidence: "340k lines of TypeScript across 27 projects. React in 27, Tailwind in 22, Next.js in 15, Vite in 10.",
  },
  {
    name: "Motion and 3D",
    weight: 3,
    skills: ["Motion (Framer Motion)", "GSAP", "Three.js", "React Three Fiber", "drei", "Lenis", "WebGL shaders"],
    evidence: "Motion in 9 projects, GSAP in 4, Three.js in 4, including this site and Seqlith.",
  },
  {
    name: "Testing and quality",
    weight: 3,
    skills: ["Vitest", "Playwright", "axe-core", "pytest", "JUnit", "XCTest", "Lighthouse budgets"],
    evidence: "656 Vitest tests and 136 Playwright runs (Logic Gates), 331 (PascalPath), 238 (ChessOS), 95 at 99% coverage (WindDesk), 71 (DBOps Lab), 49 JUnit (LogTriage).",
  },
  {
    name: "Machine learning and data",
    weight: 2,
    skills: ["Python", "PyTorch", "TensorFlow and Keras", "scikit-learn", "XGBoost", "OpenCV", "MediaPipe", "ONNX Runtime", "pandas", "NumPy", "Plotly Dash", "Streamlit", "Jupyter"],
    evidence: "52k lines of Python and 42k in notebooks across 25 projects. PyTorch and TensorFlow in 4 each, OpenCV and scikit-learn in 5.",
  },
  {
    name: "Cloud and operations",
    weight: 2,
    skills: ["AWS (S3, SQS, Lambda, DynamoDB)", "Terraform", "Ansible", "Docker and Compose", "GitHub Actions", "Vercel", "k6", "Bash"],
    evidence: "1.7k lines of Terraform, Docker in 5 projects, GitHub Actions in 7.",
  },
  {
    name: "Back end and databases",
    weight: 2,
    skills: ["Node.js and Express", "FastAPI", "Spring Boot", "Supabase", "Prisma", "PostgreSQL and PostGIS", "MariaDB", "Oracle (RMAN)", "MongoDB", "DynamoDB", "SQL"],
    evidence: "Four database engines operated in DBOps Lab, Supabase in 3 projects, FastAPI in WindDesk, Express and PostGIS in QR Attendance.",
  },
  {
    name: "Native and cross-platform mobile",
    weight: 2,
    skills: ["SwiftUI", "Kotlin and Jetpack Compose", "Expo and React Native"],
    evidence: "12.9k lines of Swift and 11.8k of Kotlin in ZENOVA, Expo in ChessOS and two more apps.",
  },
  {
    name: "AI engineering",
    weight: 1,
    skills: ["Claude Code (skills, CLAUDE.md specs)", "Google Gemini API", "Remotion pipelines"],
    evidence: "The Energy Disassembled agent pipeline, Gemini in D-Store and Gym Leveling.",
  },
];

export const alsoUsed = ["JavaScript", "HTML and CSS", "Java", "PHP", "Astro", "Flutter (Dart)", "Pascal"];

/** The stack marquee: the first three groups plus the strongest of the rest. */
export const marqueeStack = [
  "TypeScript",
  "React 19",
  "Next.js",
  "Vite",
  "Tailwind CSS",
  "Radix UI",
  "Zustand",
  "Zod",
  "Motion",
  "GSAP",
  "Three.js",
  "React Three Fiber",
  "Lenis",
  "Vitest",
  "Playwright",
  "axe-core",
  "pytest",
  "Python",
  "PyTorch",
  "SwiftUI",
  "Kotlin",
  "AWS",
  "Terraform",
  "Docker",
];
