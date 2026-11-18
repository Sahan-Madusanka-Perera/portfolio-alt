// Screenshots for every milestone: 1440x900 and 390x844, each in dark, light and reduced motion.
// Also collects console errors and failed requests, and fails (exit 1) if there are any.
//
//   node scripts/screenshots.mjs --label m1 [--base http://localhost:3100] [--paths /,/work/dbops-lab] [--full]
//
// Expects a running server (next start). Images land in docs/screenshots/<label>/.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, all) => {
    if (arg.startsWith("--")) acc.push([arg.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]);
    return acc;
  }, []),
);

const base = args.base ?? "http://localhost:3100";
const label = args.label ?? "latest";
const paths = (args.paths ?? "/").split(",");
const fullPage = Boolean(args.full);
const outDir = path.join("docs", "screenshots", label);

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
const modes = [
  { name: "dark", theme: "dark", reducedMotion: "no-preference" },
  { name: "light", theme: "light", reducedMotion: "no-preference" },
  { name: "reduced", theme: "dark", reducedMotion: "reduce" },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const vp of viewports) {
  for (const mode of modes) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor ?? 1,
      isMobile: vp.isMobile ?? false,
      hasTouch: vp.hasTouch ?? false,
      reducedMotion: mode.reducedMotion,
      colorScheme: mode.theme,
    });
    await context.addInitScript((theme) => {
      try {
        localStorage.setItem("theme", theme);
      } catch {}
    }, mode.theme);
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") problems.push(`[${vp.name}/${mode.name}] console: ${msg.text()}`);
    });
    page.on("pageerror", (err) => problems.push(`[${vp.name}/${mode.name}] pageerror: ${err.message}`));
    page.on("requestfailed", (req) => {
      const failure = req.failure()?.errorText ?? "";
      if (!failure.includes("ERR_ABORTED")) problems.push(`[${vp.name}/${mode.name}] requestfailed: ${req.url()} ${failure}`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400 && res.url().startsWith(base)) problems.push(`[${vp.name}/${mode.name}] HTTP ${res.status()}: ${res.url()}`);
    });

    for (const p of paths) {
      await page.goto(base + p, { waitUntil: "networkidle" });
      // Let the loader leave and the first reveals play.
      await page.waitForTimeout(mode.reducedMotion === "reduce" ? 400 : 2600);
      const slug = p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_");
      const file = path.join(outDir, `${slug}-${vp.name}-${mode.name}.png`);
      if (fullPage) {
        // Scroll through so every scroll reveal fires before the full-page capture.
        await page.evaluate(async () => {
          const step = window.innerHeight * 0.6;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 140));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(800);
      }
      await page.screenshot({ path: file, fullPage });
      console.log("saved", file);
    }
    await context.close();
  }
}

await browser.close();
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + [...new Set(problems)].join("\n"));
  process.exitCode = 1;
} else {
  console.log("\nNo console errors or failed requests.");
}
