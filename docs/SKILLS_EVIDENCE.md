# Skills evidence

Generated from a scan of the 71 folders in `../` on 18 November 2026 with
`scripts/scan-skills.py` (raw output: `docs/skills-scan.json`). For every project folder the
script counts non-blank lines by language (skipping `node_modules`, build output, virtualenvs,
Pods and vendored code), reads every `package.json`, `requirements*.txt`, `pyproject.toml`,
`pom.xml`, `build.gradle(.kts)`, `pubspec.yaml` and `Package.swift`, notes Dockerfiles, Compose,
Terraform, Ansible and GitHub Actions files, and splits `git log` commits into mine and other
people's.

**Excluded:** `GymLeveling` and `Emotion_detector` (no commits of mine), `Sluice_UniversalDownloader`
and `AppSMS` (left out by request), `backup` (copies of other folders).
Team projects that are kept, with their share of commits: `Final Project Version` (65 of 122
mine), `Music_Recommendation_System` (60 of 91), `projects-team-5` / Virtual Memory Simulator
(38 of 66), `gym-leveling-desktop` (14 of 17, team project), `workthis` (1 of 3, not used as
evidence).

## Lines of code (all kept projects)

| Language | Lines | Where most of it is |
|---|---:|---|
| TypeScript | 340,778 | 27 projects over 500 lines: the A/L ICT platforms, Logic Gates, PascalPath, SignalLab, ChessOS, D-Store, astro club site, Energy Disassembled, Seqlith, this site |
| Python | 52,170 | dbops-lab (9.6k), vm_simulator (5.3k), projects-team-5 (5.1k), HoloDraw (4.8k), DA_Assignment (4.1k), Big Data Analytics (3.1k), WindDesk (3.0k), holopaint-cloud (1.7k) |
| Jupyter (code cells) | 41,864 | DA_Assignment, Music_Recommendation_System, tsptest, Final Project Version, Emotion_v2 |
| CSS | 25,498 | spread across the web projects |
| JavaScript | 19,963 | QR attendance (4.4k), Energy Disassembled (3.9k), holopaint-cloud web (2.3k) |
| Swift | 12,909 | ZENOVA |
| Kotlin | 11,760 | ZENOVA Android |
| PHP | 4,749 | LibraryManagementSystem, an older project |
| Astro | 3,471 | Biz Guide |
| Java | 3,233 | JobRec (1.7k), LogTriage (1.1k) |
| SQL | 3,039 | D-Store (1.5k), OL platform, QR attendance |
| Terraform | 1,660 | holopaint-cloud (1.5k), dbops-lab |
| Shell | 1,631 | dbops-lab (1.1k) |
| Pascal | 373 | PascalPath test programs |
| Dart | 304 | AR_Draw (one Flutter app) |
| C / C++ | 3,358 / 6,164 | **generated code only**: Flutter desktop runners in AR_Draw and Expo native scaffolding in `Case Study 4`. Not a skill. |

No C#, R, Go or Rust code exists in `../`.

## Skills, by group

Projects counted are folders whose manifests declare the package. "In code" notes where I
checked that a declared package is actually used.

### Core: front end and product

| Skill | Projects | Evidence |
|---|---:|---|
| TypeScript | 27 | 340k lines (table above) |
| React 19 | 27 | every web project since 2024; React 19 in ChessOS, WindDesk, Logic Gates, this site |
| Next.js (App Router) | 15 | D-Store, astro club site, Ape Ammage Thunapaha, ITMentor, OL platform, Python A/L platform, Zeus Power sites, vehicle-financing app, this site |
| Vite | 10 | Logic Gates, ChessOS web, PascalPath, SignalLab, OS platform, Arduino platform, Web Dev platform, WindDesk, QR attendance, Seqlith |
| Tailwind CSS v4 | 22 | `@tailwindcss/postcss` or `@tailwindcss/vite` in 22 manifests |
| Radix UI / shadcn-style (class-variance-authority, tailwind-merge) | 8 / 8 / 13 | D-Store, astro club site, ITMentor, OL platform, QR attendance, vehicle-financing, gym-leveling-desktop, bytelearn |
| Zustand | 7 | ChessOS, D-Store, Arduino, OS, Python and Web Dev platforms, portfolio3d |
| Zod | 5 | astro club site, Ape Ammage, OL platform, Energy Disassembled, gym-leveling-desktop |
| React Hook Form | 2 | astro club site, gym-leveling-desktop (the brief listed it with Zod as one item; it is lighter than Zod) |
| Recharts | 3 | WindDesk, vehicle-financing app, gym-leveling-desktop |
| PWA / offline (service worker) | 2 | Logic Gates (works offline), ChessOS (`vite-plugin-pwa`) |

### Core: motion and 3D

| Skill | Projects | Evidence |
|---|---:|---|
| Framer Motion / Motion | 6 + 3 | `framer-motion`: astro club site, D-Store, ITMentor, game-dev assignment, Seqlith, this site; `motion`: SignalLab, OS platform, Python A/L platform |
| GSAP | 4 | astro club site, bytelearn, Zeus Power corporate, this site |
| Three.js | 4 | this site (football arena), Seqlith (glass logo), bytelearn, portfolio3d |
| React Three Fiber + drei | 3 | this site, Seqlith, portfolio3d |
| Lenis | 2 | this site, Seqlith (the brief said more; corrected) |

### Testing and quality

| Skill | Projects | Evidence |
|---|---:|---|
| Vitest | 6 | Logic Gates (656 tests), ChessOS (238), PascalPath (331-test interpreter suite), WindDesk frontend (36), D-Store (71), OL platform |
| Playwright | 4 | Logic Gates (68 tests on desktop and Pixel 7, 136 runs), ChessOS e2e, SignalLab, OS platform |
| axe-core | 1 | Logic Gates (19 pages) |
| Testing Library | 2 | ChessOS, WindDesk |
| pytest | 3 | WindDesk (95 tests, 99% coverage), holopaint-cloud (47 worker and API tests, moto), dbops-lab (71 tests) |
| JUnit | 1 | LogTriage (49 tests) |
| XCTest / Swift Testing | 1 | ZENOVA (66 unit tests, 8 UI tests) |
| node:test | 1 | holopaint-cloud web (24 gesture, zoom and fill tests) |
| Lighthouse budgets | 1 | Biz Guide (100 in all four categories on slow 4G) |

### Machine learning and data

| Skill | Projects | Evidence |
|---|---:|---|
| Python | 25 | 52k lines + 42k in notebooks |
| PyTorch | 4 | HoloDraw (U-Net from scratch, 31M parameters), holopaint-cloud (export and quantisation), Music_Recommendation_System, Final Project Version |
| TensorFlow / Keras | 4 | Psoriasis ML, Hand Gesture Recognition, Music_Recommendation_System, Final Project Version |
| scikit-learn | 5 | DA_Assignment (box office), Psoriasis ML, Hand Gesture Recognition, Music_Recommendation_System, Final Project Version |
| XGBoost, LightGBM | 1 | DA_Assignment (box-office ensemble) |
| OpenCV | 5 | HoloDraw, holopaint-cloud worker, Hand Gesture Recognition, Psoriasis ML, Music_Recommendation_System |
| MediaPipe | 3 | HoloDraw (Python), Hand Gesture Recognition, holopaint-cloud (Tasks Vision in the browser) |
| ONNX Runtime | 1 | holopaint-cloud (INT8 static quantisation, 118.5 MB to 29.7 MB) |
| pandas, NumPy | 9, 12 | data and ML projects |
| Matplotlib, Seaborn | 11, 8 | data and ML projects |
| Plotly / Dash | 6 / 3 | Big Data Analytics (two), iMovie marketing analysis |
| Streamlit | 3 | DA_Assignment, Music_Recommendation_System, Asp_c_A |
| NetworkX / graph algorithms | 1 | tsptest (shortest paths across Sri Lankan cities) |
| Jupyter | 9 | notebooks with 42k lines of code cells |

### Native and cross-platform mobile

| Skill | Projects | Evidence |
|---|---:|---|
| SwiftUI (iOS, iPadOS, macOS) | 1 | ZENOVA: 12.9k lines of Swift, `ZenovaCore` Swift package |
| Kotlin + Jetpack Compose | 1 | ZENOVA Android: 11.8k lines, Compose, Media3 |
| Expo / React Native | 3 | ChessOS mobile, vehicle-financing mobile, UniProject |
| Flutter | 1 | AR_Draw (304 lines of Dart: a light skill) |

### Back end and databases

| Skill | Projects | Evidence |
|---|---:|---|
| Node.js / Express | 1 | QR attendance (Express, PostGIS, JWT, SSE, 23 integration tests) |
| FastAPI | 1 | WindDesk |
| Spring Boot (JPA, Security, Thymeleaf) | 1 | JobRec (`workthis` has 1 of my 3 commits, not counted) |
| Supabase (Postgres, auth, row-level security) | 3 | D-Store, astro club site, gym-leveling-desktop (the brief said 4; corrected) |
| Prisma | 1 | Ape Ammage Thunapaha |
| PostgreSQL / PostGIS | 3 | QR attendance (PostGIS), Ape Ammage, dbops-lab |
| MariaDB / MySQL, Oracle (RMAN), MongoDB | 1 | dbops-lab: all four engines through the `dbops` CLI's own drivers |
| DynamoDB, S3, SQS, Lambda | 1 | holopaint-cloud (`boto3`, moto tests) |
| SQL | 6 | D-Store migrations, OL platform, QR attendance, dbops-lab |

### Cloud and operations

| Skill | Projects | Evidence |
|---|---:|---|
| AWS (S3, SQS + DLQ, Lambda, DynamoDB, API Gateway, ECR, CodePipeline, CloudWatch) | 1 | holopaint-cloud |
| Terraform | 2 | holopaint-cloud (28 `.tf` files, 1.5k lines), dbops-lab (`db-vm1`) |
| Ansible | 1 | dbops-lab (three roles, idempotent second run) |
| Docker / Compose | 5 | dbops-lab, holopaint-cloud (arm64 Lambda image), WindDesk, QR attendance, Music_Recommendation_System |
| GitHub Actions | 7 | holopaint-cloud, dbops-lab, WindDesk, QR attendance, LogTriage, JobRec, OL platform |
| Vercel | 7 | the A/L platforms, SignalLab, PascalPath, WindDesk |
| k6 | 1 | holopaint-cloud (`loadtest/flow.js`) |
| Bash | 2 | dbops-lab (1.1k lines), holopaint-cloud scripts |

### AI engineering

| Skill | Projects | Evidence |
|---|---:|---|
| Claude Code (skills, CLAUDE.md specs) | 6+ | `.claude/skills` in OL platform, PascalPath and others; Energy Disassembled's `CLAUDE.md` is the pipeline's full spec |
| Google Gemini API | 2 | D-Store (`api/character-info`, rate-limited), gym-leveling-desktop (`api/geminiChat`, team project) |
| Remotion pipeline | 1 | Energy Disassembled: research, script, validator, voice, render, private upload |
| Vercel AI SDK | 0 in code | `ai` and `@ai-sdk/*` are installed in ITMentor and the vehicle-financing app, but no source file calls them and `api/chat` is empty. **Not listed as a skill.** |

### Also used (small)

JavaScript, HTML/CSS, Java, PHP (older projects), Astro (Biz Guide), Dart (one app), SQL,
Pascal (the PascalPath interpreter is TypeScript; Pascal is what it runs).

## Corrections to the brief's table

- **Vercel AI SDK removed**: installed, never called (see above). The vehicle-financing app's
  "Gemini-powered assistant" is not in its source either, so the site describes that app by what
  it does: an EMI and total-cost calculator, a bank-rate comparison and Recharts dashboards.
- **Supabase**: 3 projects, not 4. **Lenis**: 2, not more. **React Hook Form**: 2.
- **Added**: XGBoost and LightGBM (box office), XCTest (ZENOVA), node:test, PWA/offline,
  Testing Library, Media3 (ZENOVA Android).
- **C/C++**: lines exist but are generated Flutter and Expo scaffolding; still not listed.
- **AI SDK on the AceICT / ITMentor project**: the site does not mention an AI assistant there.

## Repositories: public or not (checked 18 November 2026)

Public: adsa, ape-ammage-thunapaha-e-com, Arduino_For_AL, ChessOS, tmdb_analyzer, HoloDraw,
recruitsystem, Logic-Gates-Platform, Music_Recommendation_System, signal-lab,
OL_ICT_Learning_Platform, pascal-path, geofenced_qr_attendance_system, wind-desk,
web-dev-study-partner, dbops-lab, gym-leveling-desktop, holopaint-cloud, OS_Assignment,
tsptest, astro-website.

Not public yet, so the site links no source: ZENOVA, Energy Disassembled (no remote),
LogTriage (no remote), seqlith-web, projects-team-5. Live check: dstorelk.com answered 502
(pre-launch), so it is shown as pre-launch with no link.
