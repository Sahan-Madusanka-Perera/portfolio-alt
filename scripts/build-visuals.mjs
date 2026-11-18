#!/usr/bin/env node
// Builds the work-card visuals in public/work/ from real material in ../:
//  * real screenshots and render frames from each project's own repository, resized to WebP
//  * code-drawn SVGs (DBOps terminal, Logic Gates circuit, SinGECToR measures) from real numbers
// The HoloPaint Cloud screenshot comes from scripts/capture-sites.mjs instead (live site).
//
// Usage: node scripts/build-visuals.mjs [path-to-projects]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const projects = resolve(process.argv[2] ?? "..");
const out = resolve("public/work");
mkdirSync(out, { recursive: true });

// The real dbops runs, as copied by scripts/build-terminal.mjs.
const terminalSource = readFileSync(resolve("src/data/terminal.ts"), "utf8");
const terminalRuns = JSON.parse(terminalSource.slice(terminalSource.indexOf("= [") + 2, terminalSource.lastIndexOf("];") + 1));

const rasters = [
  { from: "Zenova/docs/screenshots/mac-home.jpg", to: "zenova.webp", width: 1600, height: 1000, position: "top" },
  { from: "Zenova/docs/screenshots/iphone-nowplaying.jpg", to: "zenova-iphone-nowplaying.webp", width: 600 },
  { from: "Zenova/docs/screenshots/iphone-lyrics.jpg", to: "zenova-iphone-lyrics.webp", width: 600 },
  { from: "Zenova/docs/screenshots/iphone-album.jpg", to: "zenova-iphone-album.webp", width: 600 },
  { from: "Reint_Assignment/docs/images/briefing.webp", to: "winddesk.webp", width: 1440, height: 900, position: "top" },
  { from: "Chess_Project/.impeccable/review/desktop-dark-analysis-review.png", to: "chessos.webp", width: 1360, height: 1000, position: "top" },
  { from: "YT channel/out/episode-check/f1109.png", to: "energy-disassembled.webp", width: 1600, height: 900 },
];

for (const r of rasters) {
  const pipeline = sharp(join(projects, r.from)).resize({
    width: r.width,
    height: r.height,
    fit: r.height ? "cover" : "inside",
    position: r.position ?? "centre",
    withoutEnlargement: false,
  });
  const info = await pipeline.webp({ quality: 80, effort: 6 }).toFile(join(out, r.to));
  console.log(`${r.to}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB`);
}

const BG = "#0b0b0b";
const FG = "#ece9e2";
const FG2 = "rgba(236,233,226,0.62)";
const FG3 = "rgba(236,233,226,0.34)";
const LINE = "rgba(236,233,226,0.12)";
const ACCENT = "#8aa2ff";
const WARN = "#e8c27a";
const CRIT = "#ff8f7d";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const SANS = "'Inter Tight', ui-sans-serif, system-ui, sans-serif";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function frame(inner, { w = 1600, h = 1000 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect width="${w}" height="${h}" fill="${BG}"/>
${inner}
</svg>`;
}

// 1. DBOps: the real faulted health run, as a terminal.
{
  const run = terminalRuns.find((r) => r.id === "faults");
  const pick = run.lines.slice(0, -1).filter((line) => line.trim() && (/^\S/.test(line) || /WARN|CRIT/.test(line)));
  const shown = pick.slice(0, 19);
  const rows = [`<text x="96" y="150" fill="${FG3}" font-family="${MONO}" font-size="26">$ dbops health</text>`];
  shown.forEach((line, i) => {
    const y = 210 + i * 37;
    const status = line.trim().split(/\s+/)[0];
    const color = status === "CRIT" ? CRIT : status === "WARN" ? WARN : /^\S/.test(line) ? FG : FG2;
    const text = line.length > 86 ? `${line.slice(0, 85)}…` : line;
    rows.push(`<text x="96" y="${y}" fill="${color}" font-family="${MONO}" font-size="24" xml:space="preserve">${esc(text)}</text>`);
  });
  rows.push(`<rect x="96" y="${210 + shown.length * 37 + 10}" width="1408" height="1" fill="${LINE}"/>`);
  rows.push(
    `<text x="96" y="${210 + shown.length * 37 + 64}" fill="${CRIT}" font-family="${MONO}" font-size="30" font-weight="600">${esc(run.verdictLine)}</text>`,
  );
  const chrome = `<circle cx="104" cy="80" r="9" fill="${LINE}"/><circle cx="136" cy="80" r="9" fill="${LINE}"/><circle cx="168" cy="80" r="9" fill="${LINE}"/>
<text x="1504" y="88" text-anchor="end" fill="${FG3}" font-family="${MONO}" font-size="22">results/m2-health-faults.txt</text>`;
  writeFileSync(join(out, "dbops-lab.svg"), frame(chrome + rows.join("\n")));
  console.log("dbops-lab.svg");
}

// 2. Logic Gates: OR built from three NAND gates (A = 1, B = 0). 1 is solid and thick, 0 is dashed.
{
  const one = `stroke="${FG}" stroke-width="7" fill="none" stroke-linecap="round"`;
  const zero = `stroke="${FG2}" stroke-width="4" stroke-dasharray="14 12" fill="none" stroke-linecap="round"`;
  const nand = (x, y) =>
    `<path d="M${x} ${y - 70} h70 a70 70 0 0 1 0 140 h-70 z" stroke="${FG}" stroke-width="4" fill="${BG}"/><circle cx="${x + 154}" cy="${y}" r="13" stroke="${FG}" stroke-width="4" fill="${BG}"/>`;
  const label = (x, y, t, c = FG2, s = 30) =>
    `<text x="${x}" y="${y}" fill="${c}" font-family="${MONO}" font-size="${s}">${t}</text>`;
  const inner = [
    label(150, 318, "A = 1", FG),
    label(150, 718, "B = 0", FG2),
    `<path d="M300 308 H380 M380 308 V250 H560 M380 308 V366 H560" ${one}/>`,
    `<path d="M300 708 H380 M380 708 V650 H560 M380 708 V766 H560" ${zero}/>`,
    nand(560, 308),
    nand(560, 708),
    `<path d="M727 308 H860 V450 H1000" ${zero}/>`,
    `<path d="M727 708 H860 V566 H1000" ${one}/>`,
    label(760, 290, "0", FG2, 28),
    label(760, 690, "1", FG, 28),
    nand(1000, 508),
    `<path d="M1167 508 H1420" ${one}/>`,
    label(1300, 488, "A OR B = 1", ACCENT, 30),
    `<text x="150" y="160" fill="${FG}" font-family="${SANS}" font-size="44" font-weight="300">OR from NAND</text>`,
    `<text x="150" y="208" fill="${FG3}" font-family="${SANS}" font-size="26">One of the lab's eight build challenges. A 1 is a solid line, a 0 is dashed.</text>`,
  ].join("\n");
  writeFileSync(join(out, "logic-gates-lab.svg"), frame(inner));
  console.log("logic-gates-lab.svg");
}

// 3. SinGECToR: F0.5 and the do-no-harm rate. 1,000 dots: 986 kept, 14 harmed.
{
  const cols = 50;
  const dots = [];
  const harmed = new Set([37, 141, 236, 309, 388, 455, 521, 602, 677, 731, 808, 864, 925, 979]);
  for (let i = 0; i < 1000; i++) {
    const x = 840 + (i % cols) * 13.6;
    const y = 260 + Math.floor(i / cols) * 25;
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y}" r="4.2" fill="${harmed.has(i) ? CRIT : FG2}"/>`);
  }
  const inner = [
    `<text x="110" y="420" fill="${FG}" font-family="${SANS}" font-size="190" font-weight="200" letter-spacing="-8">0.538</text>`,
    `<text x="116" y="480" fill="${FG2}" font-family="${MONO}" font-size="28">F0.5 on corrections</text>`,
    `<text x="110" y="760" fill="${ACCENT}" font-family="${SANS}" font-size="190" font-weight="200" letter-spacing="-8">98.6%</text>`,
    `<text x="116" y="820" fill="${FG2}" font-family="${MONO}" font-size="28">of correct sentences left alone</text>`,
    dots.join(""),
    `<text x="840" y="790" fill="${FG3}" font-family="${MONO}" font-size="22">The rate as 1,000 dots: 986 left alone, 14 changed</text>`,
  ].join("\n");
  writeFileSync(join(out, "singector.svg"), frame(inner));
  console.log("singector.svg");
}
