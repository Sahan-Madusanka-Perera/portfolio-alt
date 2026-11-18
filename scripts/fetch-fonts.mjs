// Downloads the site's four fonts from Google Fonts into src/app/fonts/, so the build never
// fetches fonts over the network (next/font/google broke on Vercel's adapter; see docs/QUALITY.md).
// Only the subsets and weights the site uses are kept. All four families are under the SIL Open
// Font License 1.1. Run: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(import.meta.dirname, "../src/app/fonts");
const families = [
  { name: "inter-tight", query: "Inter+Tight:wght@300;400;500", subset: "latin" },
  { name: "instrument-serif", query: "Instrument+Serif:ital@1", subset: "latin" },
  { name: "jetbrains-mono", query: "JetBrains+Mono:wght@400;500", subset: "latin" },
  { name: "abhaya-libre", query: "Abhaya+Libre:wght@500;700", subset: "sinhala" },
];
// A current browser user agent, so the CSS API answers with woff2.
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";

await mkdir(out, { recursive: true });
for (const f of families) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&display=swap`, { headers: { "user-agent": ua } })).text();
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)].filter(([, subset]) => subset === f.subset);
  const seen = new Map();
  for (const [, , body] of blocks) {
    const url = body.match(/url\((https:[^)]+)\)/)[1];
    const weight = body.match(/font-weight:\s*([^;]+);/)[1].trim();
    const style = body.match(/font-style:\s*([^;]+);/)[1].trim();
    if (!seen.has(url)) seen.set(url, { weights: [], style });
    seen.get(url).weights.push(weight);
  }
  for (const [url, { weights, style }] of seen) {
    const weight = weights.length > 1 ? `${weights[0]}-${weights.at(-1)}` : weights[0];
    const file = `${f.name}-${f.subset}-${style}-${weight}.woff2`;
    const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(path.join(out, file), bytes);
    console.log(`${file}  ${(bytes.length / 1024).toFixed(1)} KB  weights ${weights.join(", ")}`);
  }
}
