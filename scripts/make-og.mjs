// Renders the 1200x630 Open Graph image from an HTML template with the site's own fonts and the
// particle-portrait poster, then writes src/app/opengraph-image.png. Run: node scripts/make-og.mjs
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const poster = (await readFile("public/me/portrait-poster-dark.webp")).toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400&family=Instrument+Serif:ital@1&family=JetBrains+Mono&display=block" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#050505;color:#ece9e2;font-family:"Inter Tight";overflow:hidden;position:relative}
  .p{position:absolute;right:-40px;top:-10px;height:660px;width:auto;-webkit-mask-image:linear-gradient(to left,#000 55%,transparent 95%)}
  .c{position:absolute;left:72px;top:72px;bottom:72px;display:flex;flex-direction:column;justify-content:space-between;width:640px}
  .pill{display:inline-flex;align-items:center;gap:12px;font-size:20px;color:rgb(236 233 226/.66);border:1px solid rgb(236 233 226/.18);border-radius:999px;padding:10px 20px;width:max-content}
  .dot{width:10px;height:10px;border-radius:50%;background:#8aa2ff}
  h1{font-weight:300;font-size:112px;line-height:.92;letter-spacing:-.045em}
  p.l{font-weight:300;font-size:38px;line-height:1.15;letter-spacing:-.03em;margin-top:28px;max-width:20ch}
  em{font-family:"Instrument Serif";font-weight:400}
  .m{font-family:"JetBrains Mono";font-size:18px;color:rgb(236 233 226/.66)}
</style></head><body>
<img class="p" src="data:image/webp;base64,${poster}">
<div class="c">
  <div class="pill"><span class="dot"></span>Open to internships, Nov 2026 to May 2027</div>
  <div><h1>Sahan Perera</h1><p class="l">I build systems that <em>see,</em> and the software that keeps them running.</p></div>
  <div class="m">Computer Science · University of Sri Jayewardenepura</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await writeFile("src/app/opengraph-image.png", await page.screenshot({ type: "png" }));
await browser.close();
console.log("wrote src/app/opengraph-image.png");
