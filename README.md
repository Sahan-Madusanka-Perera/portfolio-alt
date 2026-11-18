# Sahan Perera, portfolio v2

The personal site of Sahan Perera: Computer Science undergraduate at the University of Sri
Jayewardenepura and product engineer. The idea is "the site that sees you": a particle portrait
that reacts to the cursor, to scrolling and, if you allow it, to your hand through the webcam,
around a quiet editorial site that gets a recruiter to the work fast.

Every number and claim on the site comes from the projects' own repositories and READMEs. A
project without a live URL links to its source, never to a made-up demo.

## What is on it

- **Hero.** A WebGL2 particle portrait built from a real photo with a depth model (Depth
  Anything V2, run offline). It assembles on load, breathes, parts around the pointer and
  dissolves as you scroll. Weak devices, software WebGL and reduced motion get a still version.
- **Hand mode** (desktop, opt-in). MediaPipe hand tracking steers the portrait with your index
  finger; a pinch paints a light trail. The camera starts only after you click, and frames never
  leave the browser.
- **Selected work.** A pinned horizontal gallery with a WebGL lens on hover and a shared-element
  view transition into each case study.
- **Case studies** (`/work/[slug]`): the problem, what was built, a self-drawing architecture
  diagram, the hard part, metrics, gallery and stack.
- **Proof, operations and demos.** Measured numbers, a replay of real `dbops health` output from
  DBOps Lab, a subnet calculator and an OR gate made of NANDs.
- **Research, about, skills, timeline, more work, play, contact.** Skills are sized by how much
  code uses them, with the evidence beside each group. The play section has a penalty shootout
  and a 3v3 match (three.js, lazy-loaded), and the Konami code unlocks a reflex game.
- **Around the site.** A custom cursor, magnetic buttons, split-text headings, a
  velocity-skewed marquee, a ⌘K command palette, light and dark themes with a circular reveal,
  optional interface sounds (off by default), and a 404 page where the shot goes over the bar.

## Stack

Next.js 16 (App Router, static output), React 19, TypeScript, Tailwind CSS v4, GSAP with
ScrollTrigger, Lenis, anime.js v4, Paper Shaders, raw WebGL2 and GLSL for the portrait and the card
lens, React Three Fiber, drei and postprocessing for the football arena, Motion inside the arena,
MediaPipe Tasks Vision for hand mode, and Phosphor icons.

Everything heavy is a lazy chunk loaded after first paint or on demand. Sizes and Lighthouse
scores are in [docs/QUALITY.md](docs/QUALITY.md): 90 or more in every category on the home page
and every case study measured, on mobile and desktop, with CLS 0.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Production build, as measured:

```bash
npm run build && npm start
```

```bash
npm run lint
```

## Deploy

The site is built for Vercel and needs no environment variables there: canonical URLs, the
sitemap, robots and Open Graph tags use `VERCEL_PROJECT_PRODUCTION_URL`. Once a custom domain is
attached, set `NEXT_PUBLIC_SITE_URL` (for example `https://sahanperera.com`) so canonical links use
it. On any other host, set `NEXT_PUBLIC_SITE_URL`, or canonical links fall back to
`http://localhost:3000`.

`/cv` redirects to `/sahan-perera-cv.pdf`.

## Where things live

```
src/app/                   routes, metadata, sitemap, robots, OG image, 404
src/components/sections/   home-page sections (hero, portrait, hand mode, proof, ...)
src/components/work/       work gallery, card lens, architecture diagrams
src/components/play/       football arena and the reflex game
src/components/layout/     nav, command palette, cursor, theme and sound toggles, footer
src/data/                  all content: site, projects, proof, skills, experience, publications
PLAN.md                    information architecture and build plan
docs/QUALITY.md            Lighthouse, bundle sizes and other checks
docs/screenshots/          screenshots per milestone, 1440x900 and 390x844, dark, light, reduced motion
```

## Scripts

These scripts regenerate the assets in `public/` and the content in `src/data/` from the real
projects in `../`:

| Script | What it does |
| --- | --- |
| `scripts/make-portrait.py` | Photo to particle point sets (`portrait-20k.bin`, `portrait-48k.bin`) and posters, using a cached depth map. Needs a venv with torch, transformers, pillow and numpy only when recomputing depth. |
| `scripts/make-cutout.py` | Cuts the About photo out of its white background (pillow and numpy). |
| `scripts/make-og.mjs` | Renders the 1200x630 Open Graph image with Playwright. |
| `scripts/fetch-fonts.mjs` | Downloads the four fonts (OFL) from Google Fonts into `src/app/fonts/`, which `next/font/local` serves. |
| `scripts/build-terminal.mjs` | Copies real `dbops health` runs from `../dbops-lab/results/` into `src/data/terminal.ts`. |
| `scripts/build-visuals.mjs` | Builds work-card visuals from each project's real screenshots and numbers. |
| `scripts/capture-sites.mjs` | Screenshots the live project sites for the work cards. |
| `scripts/scan-skills.py` | Counts languages and libraries across `../` for the skills evidence. |
| `scripts/check-diagrams.py` | Checks every architecture diagram for overlaps and out-of-bounds boxes. |
| `scripts/screenshots.mjs` | Captures milestone screenshots and reports console errors and failed requests. |

## Content rules

All copy lives in `src/data/`. Each figure on the site comes from the project it describes.
Sluice, AppSMS and the media-download parts of ZENOVA are deliberately left out. A skill is
listed only if there is code behind it.
