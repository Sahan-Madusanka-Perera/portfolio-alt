# Portfolio v2 plan

The site that sees you. A dark-first, editorial instrument: a particle portrait that notices
the cursor (and, if the visitor allows it, their hand), then a recruiter-fast path to work, CV
and contact.

## Design read

- **Audience:** recruiters (under a minute, laptop or phone from LinkedIn) and freelance
  clients. The first viewport must hold the name, the positioning line, availability, **View
  work** and **Download CV**.
- **Dials:** design variance 6, motion intensity 7, visual density 3.
- **Direction:** Seqlith's tokens, refined. `#050505` background, `#ece9e2` text with 62% and
  38% tints, hairlines at 10 and 18%, easing `cubic-bezier(0.22, 1, 0.36, 1)`, gutters with
  `clamp()`. One accent, a cool electric blue (`#8aa2ff` on dark, `#2b46c9` on light), used for
  focus, live state and one word per view at most.
- **Type:** Inter Tight (light weights) for UI and body, Instrument Serif italic for one
  expressive word per headline, JetBrains Mono for numbers, code and the terminal, Abhaya Libre
  for සහන් පෙරේරා.
- **Light theme:** designed, not inverted: cool paper `#ecebe7`, ink `#141413`, the same accent
  darkened to pass AA, particles drawn with normal blending in ink instead of additive light.

### Where the brief overrides the design skills

The skills ban Instrument Serif, Inter-family fonts and custom cursors as *defaults*. The brief
names them, so they stay, with limits: the serif is only ever one italic word; the cursor is a
follower ring that **adds to** the native pointer (never hides it), on fine pointers only and off
under reduced motion. Skill rules kept in full: no em or en dashes in visible copy, at most one
eyebrow per three sections, no scroll cue, no decorative status dots, no fake screenshots, one
accent, one radius scale (pills for controls, 20px for media, 0 for rules).

The `motion-graphics` skill is a HyperFrames video workflow; it does not apply to a website and
was read but not used.

## Information architecture

`/` in order:

1. **Hero**: particle portrait, name, positioning line, Sinhala name, availability, View work,
   Download CV, Use your hand.
2. **Selected work**: pinned horizontal gallery of the fifteen flagships (vertical stack on phones
   and under reduced motion).
3. **Proof**: animated counters from real numbers, each linked to its project.
4. **Operations**: a replay of real `dbops health` output from `../dbops-lab/results/`.
5. **Try it**: two lazy mini-demos (subnet calculator from SignalLab, logic gates from the Logic
   Gates Lab) with links to the full sites or source.
6. **Research**: the two papers; SinGECToR in plain language.
7. **About / Now**: the person, plus a "currently" line.
8. **Skills**: weighted groups from `docs/SKILLS_EVIDENCE.md` and the stack marquee.
9. **Experience and education**: a timeline.
10. **More work**: the rest of the projects as a compact index.
11. **Play**: the football arena and the hidden Konami reflex game, lazy.
12. **Contact**: copy email, WhatsApp, LinkedIn, GitHub, CV, magnetic button, final shader.

Also: `/work/[slug]` (fifteen case studies), `/cv` (redirects to the PDF), a 404 with the
particles scattered, `sitemap.xml`, `robots.txt`, a designed 1200×630 Open Graph image.

Content lives only in `src/data/`: `site.ts`, `projects.ts` (flagships + more),
`experience.ts`, `publications.ts`, `skills.ts`, `proof.ts`, `terminal.ts` (generated from the
real result files by `scripts/build-terminal.mjs`).

## Motion system

- One easing token (`--ease`), three durations (fast 0.24 s, base 0.6 s, slow 1.2 s).
- **Lenis** smooth scroll, ticked by GSAP's ticker and synced to **ScrollTrigger**; off under
  reduced motion and on touch devices (native scroll).
- **GSAP ScrollTrigger**: the pinned work gallery, the terminal's start, section colour shifts.
- **Motion (`motion/react`)**: the football arena only (`AnimatePresence`, menu entrances),
  migrated from `framer-motion`. As built, reveals and split text are CSS transitions, the
  magnetic buttons use a small requestAnimationFrame spring, and the palette is a native
  `<dialog>`, which keeps Motion (about 43 KB gzipped) out of the first load. See
  docs/QUALITY.md.
- **anime.js v4**: the architecture diagrams draw their lines on scroll, and the terminal's
  typed lines.
- **View Transitions API**: the work card's visual morphs into the case-study hero
  (`view-transition-name` per slug, started on click). Browsers without it navigate normally.
- **Reduced motion**: every effect resolves to its end state instantly. The hero shows the still
  poster of the same particle portrait, no pin, no scroll-jacking, no loader, no marquee motion,
  counters show final values, the terminal shows its full text.

## 3D and shader plan

- **Particle portrait** (raw WebGL2, one `gl.POINTS` draw call, all motion in the vertex shader).
  Built: `scripts/make-portrait.py` runs Depth Anything V2 Small on `public/me/portrait.jpg`,
  cuts out the white background, applies local contrast so the eyes and mouth survive the
  front light, samples points weighted towards detail and the face, and dissolves the body
  towards the bottom. It writes `public/me/portrait-48k.bin` and `portrait-20k.bin` (int16 x/y/z
  + uint8 brightness, shuffled) and `portrait-poster-{dark,light}.webp` (used for no-JS only).
  *Change from the first plan:* R3F would put three.js (about 150 KB gzip) on the first
  viewport's main thread, which is the biggest risk to the mobile Lighthouse score. The portrait
  is a 5 KB module instead. R3F, drei and postprocessing still power the football arena, which is
  lazy-loaded. The still fallback is drawn on a 2D canvas from the same points, so it is never an
  LCP candidate and costs no extra download.
  The shader assembles the points from dust on load, breathes, tilts a few degrees towards the
  cursor and parts like sand around the pointer (and the visitor's fingertip in hand mode).
- **Gaussian splat**: there is no `me.spz` / `.ply` / `.splat` yet, so the "See me in 3D" toggle
  is not built. It needs a scan first; see "Needs from Sahan".
- **Hand mode**: MediaPipe Tasks Vision hand landmarker (WASM, GPU delegate when available),
  imported only after the visitor presses Use your hand and grants the camera. Mirrored preview
  with landmarks; index fingertip pushes and swirls; pinch paints a light trail. Desktop only
  (fine pointer and at least 1024px wide).
- **Paper Shaders**: one grain-gradient behind the contact section, one low-intensity mesh
  gradient behind the proof strip; both paused when off screen, absent under reduced motion.
- **Card distortion**: a single fixed WebGL overlay (raw WebGL, no three.js) that draws the
  hovered card's image with a pointer ripple, so every card shares one context.
- **Postprocessing**: only in the football arena (its existing pipeline). The portrait gets its
  glow from additive blending in the dark theme, so it needs no bloom pass.

## Performance budget

| Item | Budget |
|---|---|
| Initial JS (first load, `/`) | under 200 KB gzip |
| LCP (mobile, Lighthouse) | under 2.5 s; the LCP element is the SSR headline or loader text |
| CLS | 0: the canvas sits in a fixed-size box behind the poster |
| Portrait module | about 5 KB, loaded after hydration; three.js only for the arena, on demand |
| Portrait points | 48k desktop (about 0.4 MB), 20k phones |
| WebGL | DPR capped at 2 (1.5 on phones); paused off screen and when the tab is hidden |
| Fallback | no WebGL2, `saveData`, under 4 cores, or reduced motion: the static poster |
| Lighthouse mobile | 90+ in all four categories |

## Milestones

1. **Foundation**: dependencies, tokens and theme, fonts, layout shell (nav, footer, grain,
   cursor, Lenis + ScrollTrigger), typed content in `src/data/`, command palette.
2. **Hero**: portrait script and assets, particle scene, poster fallback, loader.
3. **Work**: screenshot script, pinned gallery, card distortion, case-study pages with
   self-drawing diagrams, view transitions.
4. **Sections**: proof strip, terminal replay, mini-demos, research, about/now, skills and
   marquee, timeline, more work, play, contact.
5. **Hand mode**: MediaPipe, preview, gestures into the particle field.
6. **Ship**: SEO (metadata, OG image, JSON-LD, sitemap, robots, `/cv`, 404), screenshot
   matrix, Lighthouse, `docs/QUALITY.md`, README.
7. **More flagships**: D-Store SL, O/L ICT Practice, QR Attend, the Python, web development and
   operating-systems courses, and the J'pura Astronomy Club site join the gallery as full case
   studies (fifteen in all). Cards narrow to two per view on desktop so the pinned scroll stays
   short.

After each milestone: run the site, Playwright screenshots at 1440×900 and 390×844 in dark,
light and reduced motion, fix, commit.

## Needs from Sahan

- A Gaussian-splat scan (`public/me/me.spz`) if the "See me in 3D" toggle is wanted.
- Push ZENOVA, Energy Disassembled and LogTriage to public GitHub repos, then add the URLs to
  `src/data/projects.ts` (`githubUrl`).
- A voice note or intro video for About, if wanted.
