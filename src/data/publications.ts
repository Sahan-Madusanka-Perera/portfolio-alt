export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: string;
  summary: string;
  href?: string;
  linkLabel?: string;
};

export const publications: Publication[] = [
  {
    title: "Data-Driven Sinhala Grammatical Error Correction: A Review of Corpora, Models, and Low-Resource Strategies",
    authors: "Review paper",
    venue: "JCoS",
    year: "2026",
    summary:
      "A review of what exists for correcting Sinhala grammar automatically: the corpora, the models and the strategies that work when labelled data is scarce. It is part of the SinGECToR research.",
  },
  {
    title: "Cost-Benefit Analysis and Sustainability Considerations in Starting a Restaurant: A Case Study from Sri Lanka",
    authors: "Perera, S., et al.",
    venue: "Economics, Management and Sustainability, 10(1), 165 to 178",
    year: "2025",
    summary: "A peer-reviewed case study of the costs, benefits and sustainability questions in opening a restaurant in Sri Lanka.",
    href: "https://doi.org/10.14254/jems.2025.10-1.11",
    linkLabel: "doi.org/10.14254/jems.2025.10-1.11",
  },
];

/** The plain-language SinGECToR explainer in the research section. */
export const singectorExplainer = {
  title: "SinGECToR, in plain language",
  paragraphs: [
    "Sinhala has little labelled data for teaching a computer to correct its grammar. SinGECToR corrects Sinhala sentences with two multilingual model families, XLM-R and mBART-50, and reaches an F0.5 of 0.538.",
    "The key idea is do no harm. A corrector that fixes one error but breaks three correct sentences is worse than none, so the evaluation, written from scratch, also measures how often the model leaves an already-correct sentence alone: 98.6% of the time.",
  ],
};
