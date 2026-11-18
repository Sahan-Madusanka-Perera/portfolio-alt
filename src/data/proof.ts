// The proof strip: only numbers that appear in a project's README or the brief.
// `to` is the count-up target; `display` renders the final value exactly as written.

export type ProofStat = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  href: string;
  project: string;
};

export const proofStats: ProofStat[] = [
  { to: 1400, suffix: "+", label: "automated tests across my projects", href: "#skills", project: "Testing and quality" },
  { to: 18, suffix: " s", label: "for a broken release to be rolled back", href: "/work/holopaint-cloud", project: "HoloPaint Cloud" },
  { to: 39, suffix: "%", label: "less day-ahead forecast error", href: "/work/winddesk", project: "WindDesk" },
  { to: 0.99, decimals: 2, label: "outline IoU after compressing a model 4×", href: "/work/holopaint-cloud", project: "HoloPaint Cloud" },
  { to: 16, suffix: "×", label: "faster MongoDB query mix after one round of fixes", href: "/work/dbops-lab", project: "DBOps Lab" },
  { to: 179, label: "lessons across four A/L ICT platforms", href: "#more-work", project: "A/L ICT platforms" },
  { to: 2, label: "published papers", href: "#research", project: "Research" },
];
