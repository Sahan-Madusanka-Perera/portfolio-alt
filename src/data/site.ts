// Single source of truth for identity + contact details, sourced from the CV.
// Kept JSX-free so it can be imported by both Server and Client Components.
export const site = {
  name: "Sahan Perera",
  role: "ML Engineer & Full-Stack Developer",
  location: "Colombo, Sri Lanka",
  email: "sahanpereraperera@gmail.com",
  phone: "+94 76 946 5982",
  phoneHref: "tel:+94769465982",
  whatsappUrl: "https://wa.me/94769465982",
  resumeUrl: "/sahan-perera-cv.pdf",

  githubUrl: "https://github.com/Sahan-Madusanka-Perera",
  githubHandle: "Sahan-Madusanka-Perera",
  linkedinUrl: "https://www.linkedin.com/in/sahan-perera",
  linkedinHandle: "in/sahan-perera",

  university: "University of Sri Jayewardenepura",
  degree: "BSc (Hons) Computer Science",
  gpa: "3.89",

  availability: "Open to internships & freelance",
} as const;
