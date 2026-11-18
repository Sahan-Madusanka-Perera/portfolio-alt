#!/usr/bin/env node
// Captures screenshots of the live project sites listed in the brief, for the work cards.
// Only real, public URLs go in here: a project without a live site gets a code-drawn visual
// (scripts/build-visuals.mjs) instead.
//
// Usage: node scripts/capture-sites.mjs
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const sites = [
  { url: "https://sahan-madusanka-perera.github.io/holopaint-cloud/", file: "holopaint-cloud.webp" },
];

const out = resolve("public/work");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: "dark" });
for (const site of sites) {
  const page = await context.newPage();
  await page.goto(site.url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  const png = await page.screenshot({ type: "png" });
  const info = await sharp(png).resize({ width: 1600, height: 1000, fit: "cover", position: "top" }).webp({ quality: 82 }).toFile(resolve(out, site.file));
  console.log(`${site.file}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB from ${site.url}`);
  await page.close();
}
await browser.close();
