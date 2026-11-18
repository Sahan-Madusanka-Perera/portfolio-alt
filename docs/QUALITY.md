# Quality report

Measured on 18 November 2026 against the production build (`npm run build && npx next start`)
on an Apple Silicon Mac, with Lighthouse 13.6.0 driving Playwright's Chrome for Testing 159 in
headless mode. Lighthouse's default mobile profile is a Moto G Power on slow 4G with 4x CPU
slowdown; desktop uses `--preset=desktop`.

## Lighthouse

| Page | Profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 99 | 100 | 100 | 100 | 0.9 s | 60 ms | 0 |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 ms | 0 |
| `/work/dbops-lab` | mobile | 91 | 100 | 100 | 100 | 3.5 s | 30 ms | 0 |
| `/work/dbops-lab` | desktop | 100 | 100 | 100 | 100 | 0.7 s | 0 ms | 0 |
| `/work/holopaint-cloud` | mobile | 91 | 100 | 100 | 100 | 3.5 s | 10 ms | 0 |
| `/work/zenova` | mobile | 90 | 100 | 100 | 100 | 3.7 s | 10 ms | 0 |

Every page clears 90 in all four categories, and CLS is 0 everywhere.

### The case-study LCP, honestly

The brief asks for LCP under 2.5 s. The home page meets it (0.9 s). The case-study pages do not
in Lighthouse's default *simulated* throttling, which estimates 3.5 to 3.7 s. That figure is a
model, not a measurement: the hero image actually paints 129 ms after navigation, but because
it paints after the page's scripts have been requested, the simulation charges the whole
script download to it. Blocking all JavaScript only brings the estimate down to 2.6 s.

With *applied* throttling (`--throttling-method=devtools`, the same slow 4G and 4x CPU, really
applied to the browser), the numbers are:

| Page | Performance | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: |
| `/` | 94 | 1.6 s | 50 ms | 0 |
| `/work/dbops-lab` | 98 | 1.5 s | 20 ms | 0 |
| `/work/holopaint-cloud` | 99 | 1.7 s | 20 ms | 0 |

PageSpeed Insights uses the simulated model, so expect it to show the higher case-study LCP.
The next lever would be less JavaScript before first paint on those pages (see bundle sizes).

### What changed to get here

- **Software WebGL detection.** Headless Chrome renders WebGL on the CPU (SwiftShader), where
  compiling the portrait shader and drawing 20k points was a 1.4 s main-thread task (TBT
  1,820 ms, Performance 71). The site now treats a software renderer (SwiftShader, llvmpipe,
  Microsoft Basic Render) as a low-power device and shows the still portrait, as the brief asks
  for weak devices. Lighthouse therefore measures that still path; on a real GPU the live
  portrait runs at 60 fps (checked on this Mac).
- **Motion out of the first load.** The magnetic buttons used Motion's springs; they now use a
  20-line requestAnimationFrame spring, so Motion (about 43 KB gzipped) loads only with the
  football arena.
- **Image loading.** `priority` is deprecated in Next 16; the case-study hero uses
  `loading="eager"` and `fetchPriority="high"`.
- **Contrast.** The `/ 08` counters on work cards used the decorative `fg-3` on small text,
  which failed AA. They use `fg-2` now.
- **Layout shift.** The operations terminal's status bar changed height while the replay ran,
  shifting the rest of the page by 59 px on mobile. Both states now share one grid cell.

## Bundle sizes

Gzipped, from `.next/static` after `npm run build`.

| What | Size | When it loads |
| --- | ---: | --- |
| First-load JS, `/` | 241.8 KB (13 files) | page load; React and Next are about 110 KB of it |
| First-load JS, `/work/[slug]` | 221.5 KB (13 files) | page load |
| CSS | 14.8 KB | page load |
| HTML, `/` | 41.7 KB | page load |
| Particle portrait (raw WebGL2) | 3.1 KB | after first paint |
| Portrait points (`portrait-20k.bin` / `portrait-48k.bin`) | 137 KB / 328 KB | mobile / desktop, after first paint |
| Lenis | 5.2 KB | after first paint, not under reduced motion |
| GSAP + ScrollTrigger | about 44 KB | after first paint |
| anime.js (diagram drawing) | 7.4 KB | case studies, when a diagram nears view |
| Paper Shaders | 69.7 KB | when the proof or contact section nears view |
| Football arena (three.js, R3F, drei, postprocessing) | 237 KB + 208 KB | only when a game mode is picked |
| Motion | in the arena chunks | only with the arena |
| Hand tracker | 18.7 KB | after "Use your hand" is clicked |
| MediaPipe Tasks Vision JS | 44.1 KB | after "Use your hand" is clicked |
| MediaPipe WASM and hand model | about 10 MB, from jsDelivr and Google | after the camera is allowed |

## Other checks

- **Links.** All 16 pages crawled, 78 unique links checked (M7). None is broken. LinkedIn answers
  automated requests with status 999 (its bot wall); the profile URL is correct. Canonical
  links point at `localhost:3000` in a local build and at the production URL on Vercel (see
  the README).
- **Console.** The screenshot runner records console errors, page errors, failed requests and
  HTTP errors on every capture. The M4 to M7 runs have none except the intended 404 on
  `/nope`. Hand mode logs MediaPipe's own GPU warnings (not errors) while it runs.
- **Reduced motion.** Every capture set includes a `reduced` variant: no loader, no reveals, no
  marquee, still portrait, terminal shown whole, no smooth scroll, no hand mode.
- **Hand mode.** Tested with Chromium's fake camera: the model is ready in about 3 s, the status
  reaches "Raise one hand", and Esc stops it and releases the camera (`srcObject` cleared).
- **Lint and types.** `npm run lint` and `tsc --noEmit` are clean.
- **Diagrams.** `python3 scripts/check-diagrams.py` checks every architecture diagram for boxes
  out of bounds, overlaps and labels over boxes: "diagrams ok".

## Screenshots

`docs/screenshots/m1` to `m7`, each at 1440x900 and 390x844 in dark, light and reduced motion.
M4 has one set per home-page section; M6 has the home page, two case studies and the 404; M7
has the fifteen-card gallery and the seven new case studies.

Re-measured at M7 with fifteen case studies (mobile, simulated throttling): `/` 99/100/100/100
(LCP 1.1 s, CLS 0), `/work/ol-ict-practice` 90/100/100/100 and `/work/d-store` 91/100/100/100
(LCP 3.6 s for the reason above, CLS 0).
