// Every project fact on the site comes from this file, and every fact in this file comes from
// the project's own README in ../ or from the brief. Nothing here is estimated or invented.

export type Visual = {
  src: string;
  alt: string;
  /** Where the image comes from, shown under it on the case study. */
  source: string;
  width: number;
  height: number;
};

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  /** Centre, in a 1000 × 560 viewBox. */
  x: number;
  y: number;
  tone?: "accent" | "muted";
};

export type DiagramEdge = { from: string; to: string; label?: string; dashed?: boolean };

export type Diagram = { title: string; nodes: DiagramNode[]; edges: DiagramEdge[] };

export type Metric = { value: string; label: string };

export type Link = { label: string; href: string };

export type Flagship = {
  slug: string;
  title: string;
  /** What kind of work it is, in two to four words. */
  kind: string;
  year: string;
  /** The result line on the work card. */
  result: string;
  summary: string;
  /** A sentence about anything a reader could otherwise over-read. */
  honesty?: string;
  problem: string[];
  built: string[];
  hardPart: { title: string; body: string[] };
  metrics: Metric[];
  stack: string[];
  links: Link[];
  /** Shown when there is no public source or live site. */
  sourceNote?: string;
  visual: Visual;
  gallery?: Visual[];
  diagram: Diagram;
};

const gh = (repo: string) => `https://github.com/Sahan-Madusanka-Perera/${repo}`;

export const flagships: Flagship[] = [
  {
    slug: "holopaint-cloud",
    title: "HoloPaint Cloud",
    kind: "Computer vision on AWS",
    year: "2026",
    result: "Rolled back a broken release in 18 s",
    summary:
      "Upload a photo and get back a colouring page, traced by a U-Net I trained from scratch. Then paint it by hand in front of the webcam. Behind it is an event-driven AWS pipeline I built, deployed, load-tested and monitored.",
    problem: [
      "HoloDraw's U-Net turns photos into clean outlines, but it was a 118.5 MB PyTorch model that only ran on my laptop.",
      "The goal: let anyone with a browser use it, keep it cheap when idle, and prove the outlines stay the same after every change.",
    ],
    built: [
      "Compressed the model to ONNX INT8 (static, per-channel): 118.5 MB to 29.7 MB, with a mean outline IoU of 0.9907 against the original and 0.9821 on the worst photo. A CI parity gate fails any build that drops below 0.97.",
      "An event-driven pipeline: presigned upload to S3, the upload event to SQS (dead-letter queue after 3 failures), an arm64 container Lambda, a DynamoDB job table with a one-day TTL and a throttled HTTP API. All of it is Terraform.",
      "CI in GitHub Actions (pytest, web tests, terraform validate, an image scan with Trivy) and CD in CodePipeline: the parity gate runs inside the image about to ship, then deploy, a live smoke test, and an automatic rollback.",
      "Painting by hand in the browser: MediaPipe's hand landmarker runs on the device at about 30 fps, with a One Euro filter and gestures that hold at any hand rotation. No video frame leaves the device.",
    ],
    hardPart: {
      title: "The release every test passed",
      body: [
        "A commit on a throwaway branch slipped the API's upload limit from 5 MB to 5 KB. Every test passed, because the tests read the constant back, so the pipeline shipped it.",
        "The live smoke test caught it: its 20 KB upload was refused by S3 sixteen seconds after the alias moved. At eighteen seconds both Lambda aliases were back on the previous versions, and at twenty-six the second smoke test passed. The broken release served for 18 seconds and the run ended Failed, as it should.",
        "The fix was a test that pins the API, worker and page limits together, so the same slip now fails in CI before it can deploy.",
        "Two more things deploying caught: the image scan found 12 HIGH CVEs in the Lambda base image that a plain `dnf upgrade` could not fix (Amazon Linux 2023 locks repositories to the image's release; `--releasever=latest` took it to 0), and ONNX Runtime sized its thread pool from all 10 host cores inside a 2-CPU container. Pinning it to the quota made inference 3.3× faster.",
      ],
    },
    metrics: [
      { value: "18 s", label: "a broken release served before rollback" },
      { value: "4×", label: "smaller model, 118.5 MB to 29.7 MB" },
      { value: "0.99", label: "outline IoU after compression" },
      { value: "12 → 0", label: "HIGH CVEs in the image" },
      { value: "7.7 s", label: "p95, photo ready, steady load (k6)" },
      { value: "23", label: "photos a minute at capacity" },
      { value: "$0.20", label: "per 1,000 photos" },
    ],
    stack: [
      "PyTorch",
      "ONNX Runtime",
      "OpenCV",
      "AWS Lambda",
      "S3",
      "SQS",
      "DynamoDB",
      "API Gateway",
      "Terraform",
      "GitHub Actions",
      "CodePipeline",
      "CloudWatch",
      "k6",
      "MediaPipe",
    ],
    links: [
      { label: "Try it live", href: "https://sahan-madusanka-perera.github.io/holopaint-cloud/" },
      { label: "Source on GitHub", href: gh("holopaint-cloud") },
    ],
    visual: {
      src: "/work/holopaint-cloud.webp",
      alt: "The HoloPaint Cloud demo page, styled as a printer's proof sheet, ready for a photo",
      source: "Screenshot of the live site, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "From upload to colouring page",
      nodes: [
        { id: "page", label: "Demo page", sub: "hand tracking on device", x: 110, y: 150, tone: "accent" },
        { id: "api", label: "HTTP API", sub: "5 req/s, api Lambda", x: 370, y: 90 },
        { id: "ddb", label: "DynamoDB", sub: "job status, 1-day TTL", x: 640, y: 90 },
        { id: "s3", label: "S3", sub: "photos and outlines", x: 370, y: 300 },
        { id: "sqs", label: "SQS", sub: "jobs", x: 600, y: 300 },
        { id: "dlq", label: "Dead-letter queue", sub: "after 3 failures", x: 600, y: 470, tone: "muted" },
        { id: "worker", label: "Worker Lambda", sub: "arm64, ONNX INT8", x: 870, y: 300, tone: "accent" },
        { id: "cw", label: "CloudWatch", sub: "dashboard, 5 alarms", x: 870, y: 470, tone: "muted" },
      ],
      edges: [
        { from: "page", to: "api", label: "create job" },
        { from: "api", to: "ddb" },
        { from: "page", to: "s3", label: "presigned POST" },
        { from: "s3", to: "sqs", label: "upload event" },
        { from: "sqs", to: "worker" },
        { from: "sqs", to: "dlq", dashed: true },
        { from: "worker", to: "ddb", label: "DONE" },
        { from: "worker", to: "cw", dashed: true },
      ],
    },
  },
  {
    slug: "dbops-lab",
    title: "DBOps Lab",
    kind: "Database operations",
    year: "2026",
    result: "Proved every backup by restoring it",
    summary:
      "Oracle, MariaDB with GTID replication, a MongoDB replica set and PostgreSQL, side by side in Docker, run by a Python CLI that does what a DBA does every day: health checks, restore-tested backups, slow-query hunting and access reviews. Then I broke them on purpose.",
    problem: [
      "Most database projects stop at a schema. Running databases is a different job: knowing they are healthy, knowing a backup will actually restore, finding why a query is slow, and knowing who can log in where.",
      "The lab keeps the application data small on purpose. It is about operating the engines, not the apps that use them.",
    ],
    built: [
      "`dbops health`: one verdict for all seven instances (CPU, memory, storage, connections, long statements, blocked sessions, tablespaces, replication lag) with Nagios exit codes, so it drops into cron, a systemd timer or any monitor.",
      "Backups that only count once restored: Oracle RMAN restored onto an empty container and recovered to the backup's SCN, mariadb-backup from the replica, mongodump from a secondary, pg_dump. Each is compared with its source, table by table.",
      "`dbops slow`: ranks each engine's statements, reads the plan each one used, and suggests indexes in equality, sort, range order. The suggested fixes made the query mix 1.4× to 16× faster.",
      "An 11-rule access review against a policy file, a MariaDB server built from bare Ubuntu by Terraform and Ansible, and four incident drills, each written up as a postmortem.",
    ],
    hardPart: {
      title: "The index that made a query slower",
      body: [
        "After applying the suggested indexes, one MariaDB query got worse: `pending_totals` went from 6.9 ms to 24 ms.",
        "The new `status` index made the optimizer drive the join from `customers`, whose statistics said it had 77 rows. It has 5,000, so it probed `orders` 5,000 times. `dbops slow` reported the stale statistics, and `ANALYZE TABLE customers` brought the query to 5.2 ms.",
        "The lesson went into the tool and the write-up: an index can make a plan worse, so measure after every change.",
        "The drills taught the same humility. A root insert on the replica logged an errant GTID. I predicted a duplicate-key error (1062); GTID strict mode stopped the SQL thread first (1950). That became a new health check that goes CRIT the moment a replica logs a write of its own.",
      ],
    },
    metrics: [
      { value: "4", label: "database engines, 7 instances" },
      { value: "16×", label: "faster MongoDB query mix after the fixes" },
      { value: "71", label: "automated tests" },
      { value: "11", label: "access-review rules" },
      { value: "4", label: "incident drills, each with a postmortem" },
      { value: "0", label: "changes on the second Ansible run" },
    ],
    stack: [
      "Python",
      "Oracle 23ai",
      "RMAN",
      "MariaDB 11.4",
      "MongoDB 8",
      "PostgreSQL 17",
      "Docker Compose",
      "Terraform",
      "Ansible",
      "systemd",
      "pytest",
      "GitHub Actions",
    ],
    links: [{ label: "Source on GitHub", href: gh("dbops-lab") }],
    visual: {
      src: "/work/dbops-lab.svg",
      alt: "Real dbops health output with four faults injected, ending in the verdict CRIT, 44 OK, 4 WARN, 4 CRIT",
      source: "Drawn for this site from results/m2-health-faults.txt in the repository",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "One CLI, four engines, one verdict",
      nodes: [
        { id: "cli", label: "dbops CLI", sub: "health, backup, slow, access", x: 140, y: 280, tone: "accent" },
        { id: "oracle", label: "Oracle 23ai", sub: "RMAN, tablespaces", x: 470, y: 80 },
        { id: "maria", label: "MariaDB primary", sub: "GTID, slow log", x: 470, y: 210 },
        { id: "replica", label: "MariaDB replica", sub: "read_only", x: 760, y: 210 },
        { id: "mongo", label: "MongoDB rs0", sub: "3 members", x: 470, y: 340 },
        { id: "pg", label: "PostgreSQL 17", sub: "pg_stat_statements", x: 470, y: 470 },
        { id: "verdict", label: "Exit code", sub: "0 OK, 1 WARN, 2 CRIT", x: 800, y: 420, tone: "accent" },
      ],
      edges: [
        { from: "cli", to: "oracle" },
        { from: "cli", to: "maria" },
        { from: "maria", to: "replica", label: "replication" },
        { from: "cli", to: "mongo" },
        { from: "cli", to: "pg" },
        { from: "cli", to: "verdict", dashed: true },
      ],
    },
  },
  {
    slug: "zenova",
    title: "ZENOVA",
    kind: "Native apps, Apple and Android",
    year: "2026",
    result: "One SwiftUI app on iPhone, iPad and Mac",
    summary:
      "A local-first music player for iPhone, iPad and Mac in native SwiftUI, with optional Audius streaming, LRCLIB lyrics and MusicBrainz song details, plus a Kotlin and Jetpack Compose version for Android with the same design.",
    honesty:
      "The Apple version is an interface prototype: every screen is real, interactive SwiftUI, running on a fictional preview library or Audius streams. Playing your own music files is planned, not built.",
    problem: [
      "A music player with no account, no ads, no analytics and no network requirement, where your library and listening stay on your device.",
      "Online services had to be genuinely optional: off by default, explained before use, and never sending more than a request needs.",
    ],
    built: [
      "Every screen in the brief: Home, Library, multi-disc albums, artists, playlists, Now Playing with the Aura Canvas, Queue, Search with Quick Jump (⌘K) on the Mac, Lyrics, Replay, Settings and the Listening Room.",
      "Layouts for each platform: on the Mac, a sidebar, a sortable song table, a queue inspector, a persistent player bar and menu shortcuts.",
      "Three online services, all off by default. Discover shows what would be sent before any request; Audius streams play through AVPlayer with lock-screen controls; lyrics are used only when title, artist and length match.",
      "Accessibility built in: VoiceOver labels and actions on custom controls, Dynamic Type, Reduce Motion that stills the aura, and text that meets 4.5:1 on the canvas.",
    ],
    hardPart: {
      title: "Keeping a prototype honest",
      body: [
        "A prototype that looks finished can mislead. Every demonstration in ZENOVA says so where it appears: the fictional preview library, silent playback for preview songs, seeded listening history, generated waveforms.",
        "The README lists what was not verified, too: physical devices (background audio and the lock screen were built but never seen working), actually hearing the audio, a full VoiceOver walkthrough and UI tests on the Mac.",
      ],
    },
    metrics: [
      { value: "66", label: "unit tests in 11 suites" },
      { value: "8", label: "UI tests, live stream included" },
      { value: "3", label: "Apple platforms, one codebase" },
      { value: "0", label: "compiler warnings, clean builds" },
    ],
    stack: ["Swift 6", "SwiftUI", "AVPlayer", "Swift Testing", "XCTest", "Kotlin", "Jetpack Compose", "Media3"],
    links: [],
    sourceNote: "Source not public yet.",
    visual: {
      src: "/work/zenova.webp",
      alt: "ZENOVA's home screen on the Mac: sidebar, recently played albums and the player bar",
      source: "Screenshot from the project's docs/screenshots folder",
      width: 1600,
      height: 1000,
    },
    gallery: [
      {
        src: "/work/zenova-iphone-nowplaying.webp",
        alt: "Now Playing on iPhone, with the aura canvas behind the cover",
        source: "docs/screenshots/iphone-nowplaying.jpg",
        width: 600,
        height: 1304,
      },
      {
        src: "/work/zenova-iphone-lyrics.webp",
        alt: "Timed lyrics on iPhone",
        source: "docs/screenshots/iphone-lyrics.jpg",
        width: 600,
        height: 1304,
      },
      {
        src: "/work/zenova-iphone-album.webp",
        alt: "A two-disc album on iPhone",
        source: "docs/screenshots/iphone-album.jpg",
        width: 600,
        height: 1304,
      },
    ],
    diagram: {
      title: "Local first, online only when asked",
      nodes: [
        { id: "ui", label: "SwiftUI views", sub: "iPhone, iPad, Mac", x: 140, y: 280, tone: "accent" },
        { id: "state", label: "App state", sub: "one source of truth", x: 400, y: 280 },
        { id: "core", label: "ZenovaCore", sub: "library, queue, lyrics timing", x: 660, y: 160 },
        { id: "store", label: "user-state.json", sub: "favourites, playlists, history", x: 660, y: 400 },
        { id: "online", label: "Audius, LRCLIB, MusicBrainz", sub: "off by default", x: 880, y: 280, tone: "muted" },
      ],
      edges: [
        { from: "ui", to: "state" },
        { from: "state", to: "core" },
        { from: "state", to: "store" },
        { from: "core", to: "online", label: "only after consent", dashed: true },
      ],
    },
  },
  {
    slug: "winddesk",
    title: "WindDesk",
    kind: "Data product, energy trading",
    year: "2026",
    result: "Cut day-ahead forecast error by 39%",
    summary:
      "A decision tool for a UK utility's day-ahead wind trading desk. It rebuilds exactly the forecast that was public at each auction's gate closure, measures how wrong it was, and adds a calibrated forecast with an 80% range.",
    problem: [
      "Before every GB day-ahead auction the desk needs two answers: what was the latest national wind forecast available when it had to decide, and how far can that forecast be trusted, in MW?",
      "The pilot covers every purchase decision in January 2026: 31 delivery days and 744 hourly products, with gate closure at 09:50 UK on the day before delivery.",
    ],
    built: [
      "Reconstruction of the forecast that was public at gate closure for every product, from Elexon's WINDFOR forecasts and FUELHH wind outturn.",
      "A hindsight-free calibrated forecast, refitted every day on the 14 most recent settled days, with an 80% range.",
      "Four views for the desk: a morning Briefing, an Accuracy report, an Explorer for any range of days and a plain-language Methodology page. Every chart has a table view and the whole UI works from the keyboard.",
      "One Docker image serving the API and the React app, plus CI that runs formatting, linting, strict typing and both test suites.",
    ],
    hardPart: {
      title: "A forecast that was wrong in a pattern",
      body: [
        "The raw forecast over-forecast metered wind by 1.7 GW on average: 15% more energy than arrived. Taken at face value, it would leave the desk short.",
        "The gap grows with the wind. When 18 to 21 GW was forecast, outturn came in 3.4 GW lower on average, against 0.6 GW when 3 to 6 GW was forecast. That pattern is consistent with high-wind curtailment, so the calibration scales the forecast instead of shifting it.",
        "A transparent two-parameter calibration cut mean absolute error by 39%, and its 80% range held the outturn 80.0% of the time, so the range means what it says.",
      ],
    },
    metrics: [
      { value: "−39%", label: "mean absolute error, 1,991 to 1,221 MW" },
      { value: "80.0%", label: "of hours inside the 80% range" },
      { value: "95", label: "backend tests at 99% coverage" },
      { value: "744", label: "hourly products in the pilot" },
    ],
    stack: ["React 19", "TypeScript", "Vite", "Recharts", "Python 3.12", "FastAPI", "pytest", "mypy", "Docker", "GitHub Actions"],
    links: [{ label: "Source on GitHub", href: gh("wind-desk") }],
    visual: {
      src: "/work/winddesk.webp",
      alt: "The WindDesk briefing for one delivery day: quote line, forecast against outturn and the calibrated range",
      source: "Screenshot from the project's docs/images folder",
      width: 1440,
      height: 900,
    },
    diagram: {
      title: "From public data to a trading decision",
      nodes: [
        { id: "elexon", label: "Elexon BMRS", sub: "WINDFOR, FUELHH", x: 130, y: 280, tone: "muted" },
        { id: "gate", label: "Gate-closure rebuild", sub: "what was public at 09:50", x: 400, y: 150 },
        { id: "calib", label: "Calibration", sub: "14-day refit, 80% range", x: 400, y: 410 },
        { id: "api", label: "FastAPI", sub: "metrics, OpenAPI", x: 650, y: 280, tone: "accent" },
        { id: "ui", label: "React views", sub: "Briefing, Accuracy, Explorer", x: 880, y: 280 },
      ],
      edges: [
        { from: "elexon", to: "gate" },
        { from: "elexon", to: "calib" },
        { from: "gate", to: "api" },
        { from: "calib", to: "api" },
        { from: "api", to: "ui" },
      ],
    },
  },
  {
    slug: "logic-gates-lab",
    title: "Logic Gates Learning Lab",
    kind: "Interactive course",
    year: "2026",
    result: "656 unit tests and 136 browser runs",
    summary:
      "A free, interactive study aid for the logic gates unit of Sri Lanka's G.C.E. A/L ICT: 14 lessons, a circuit lab and 147 original practice questions. No account, no ads, no tracking, and it works offline.",
    problem: [
      "Students meet logic gates in static notes and past papers. They need to build circuits, see truth tables change and get feedback on their own mistakes.",
      "It had to follow the notation of the teacher notes, run on phones and keep working offline after the first visit.",
    ],
    built: [
      "14 lessons from 0s and 1s to adders, latches and ICs, each ending with a confidence check and a five-question mastery check.",
      "A circuit lab: an explorer with step-by-step evaluation, a builder with eight challenges such as OR from NAND, an expression lab that checks each simplification step's law, and a K-map lab with rule-by-rule grouping feedback.",
      "147 original questions at six levels, a diagnostic quiz, timed practice papers and a progress page that explains every recommendation.",
      "A service worker for offline use, and progress kept only in the learner's browser.",
    ],
    hardPart: {
      title: "Logic you can read without colour",
      body: [
        "Most gate simulators show 1 as green and 0 as red, which fails anyone who cannot tell those apart.",
        "Here a 1 is a thick solid line and a 0 is a dashed line, and the value is always written as a number. The app was checked with axe-core on 19 pages, and its 68 Playwright tests run on desktop and on a Pixel 7 profile.",
      ],
    },
    metrics: [
      { value: "656", label: "Vitest unit and integration tests" },
      { value: "136", label: "Playwright runs, desktop and Pixel 7" },
      { value: "19", label: "pages checked with axe-core" },
      { value: "147", label: "original practice questions" },
    ],
    stack: ["React", "TypeScript", "Vite", "Vitest", "Playwright", "axe-core", "Service worker"],
    links: [{ label: "Source on GitHub", href: gh("Logic-Gates-Platform") }],
    visual: {
      src: "/work/logic-gates-lab.svg",
      alt: "An OR gate built from three NAND gates, one of the lab's build challenges, with 1 drawn as a solid line and 0 as a dashed line",
      source: "Drawn for this site after the lab's own notation",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "One engine behind every lab",
      nodes: [
        { id: "lessons", label: "14 lessons", sub: "mastery checks", x: 140, y: 140 },
        { id: "labs", label: "Circuit Lab", sub: "explorer, builder, K-maps", x: 140, y: 420 },
        { id: "engine", label: "Logic engine", sub: "evaluate, simplify, compare", x: 480, y: 280, tone: "accent" },
        { id: "practice", label: "Practice", sub: "147 questions, papers", x: 820, y: 140 },
        { id: "store", label: "localStorage", sub: "progress stays on device", x: 820, y: 420, tone: "muted" },
      ],
      edges: [
        { from: "lessons", to: "engine" },
        { from: "labs", to: "engine" },
        { from: "engine", to: "practice" },
        { from: "practice", to: "store", dashed: true },
      ],
    },
  },
  {
    slug: "singector",
    title: "SinGECToR",
    kind: "NLP research",
    year: "2026",
    result: "Leaves 98.6% of correct sentences alone",
    summary:
      "Grammatical error correction for Sinhala with XLM-R and mBART-50, reaching an F0.5 of 0.538, judged by an evaluation I built from scratch that includes a do-no-harm rate of 98.6%. The review behind it is published in JCoS, 2026.",
    problem: [
      "Sinhala has little annotated data for grammar correction, so models are easy to train badly and hard to judge fairly.",
      "A corrector that rewrites sentences that were already right does harm, even if its headline score looks good.",
    ],
    built: [
      "Correction models built on two multilingual families: XLM-R and mBART-50.",
      "An evaluation written from scratch, scored with F0.5, which weights precision over recall because a wrong correction costs more than a missed one.",
      "A do-no-harm measure: how often the model leaves an already-correct sentence as it is.",
    ],
    hardPart: {
      title: "Measuring the harm, not just the help",
      body: [
        "Standard scores reward a model for the errors it fixes. They say little about the correct sentences it breaks along the way.",
        "So the evaluation reports both: F0.5 for corrections (0.538) and a do-no-harm rate for sentences that needed nothing (98.6%).",
      ],
    },
    metrics: [
      { value: "0.538", label: "F0.5" },
      { value: "98.6%", label: "do-no-harm rate" },
      { value: "2", label: "model families: XLM-R and mBART-50" },
    ],
    stack: ["XLM-R", "mBART-50", "F0.5 evaluation"],
    links: [],
    sourceNote: "Review paper: JCoS, 2026.",
    visual: {
      src: "/work/singector.svg",
      alt: "Two measures side by side: F0.5 of 0.538 for corrections and a do-no-harm rate of 98.6%",
      source: "Drawn for this site from the project's reported numbers",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "Correct, then check the harm",
      nodes: [
        { id: "in", label: "Sinhala sentence", sub: "with or without errors", x: 130, y: 280, tone: "muted" },
        { id: "xlmr", label: "XLM-R", sub: "multilingual encoder", x: 420, y: 160 },
        { id: "mbart", label: "mBART-50", sub: "sequence to sequence", x: 420, y: 400 },
        { id: "f05", label: "F0.5", sub: "0.538 on corrections", x: 760, y: 160, tone: "accent" },
        { id: "harm", label: "Do no harm", sub: "98.6% left alone", x: 760, y: 400, tone: "accent" },
      ],
      edges: [
        { from: "in", to: "xlmr" },
        { from: "in", to: "mbart" },
        { from: "xlmr", to: "f05" },
        { from: "mbart", to: "f05" },
        { from: "xlmr", to: "harm", dashed: true },
        { from: "mbart", to: "harm", dashed: true },
      ],
    },
  },
  {
    slug: "energy-disassembled",
    title: "Energy Disassembled",
    kind: "AI agent pipeline",
    year: "2026",
    result: "Every number on screen cites a source",
    summary:
      "A pipeline in which Claude Code researches and scripts explainer videos from real sources, a validator checks every citation, and Remotion renders and uploads a private draft for a person to approve.",
    problem: [
      "An agent that writes videos can write confident nonsense. The pipeline had to make that hard and keep a person in charge.",
    ],
    built: [
      "One shot list drives everything: a local voice, a machine figure drawn in code, Remotion for camera, labels and captions, and a private YouTube draft.",
      "A validator that checks the schema, that every part exists in the figure, that every cited source exists in the research file, that no [CHECK] marker is left and that the script matches the shot list.",
      "Two gates only a person can open: the script approval and the cut review. Voice and render refuse until the script is approved.",
      "A vertical Short from the same shots and narration, reframed to 1080 × 1920.",
    ],
    hardPart: {
      title: "Keeping a human in the loop for real",
      body: [
        "Gates that an agent can set are not gates. Only the person sets the approval flags, and nothing is ever published by a script: uploads always go up as private.",
        "If anything that affects the picture or sound changes after the cut review, the review is invalidated: the preview will not re-render and the upload refuses until someone watches it again.",
      ],
    },
    metrics: [
      { value: "2", label: "human gates no script can open" },
      { value: "0", label: "videos published by a script" },
      { value: "6", label: "commands per episode" },
    ],
    stack: ["TypeScript", "Remotion", "React", "Zod", "Claude Code", "YouTube Data API"],
    links: [],
    sourceNote: "Source not public yet.",
    visual: {
      src: "/work/energy-disassembled.webp",
      alt: "A frame rendered by the pipeline: an exploded view of a cell stack with the caption Switch on the current",
      source: "A frame rendered by the pipeline, from out/episode-check",
      width: 1600,
      height: 900,
    },
    diagram: {
      title: "Research to draft, with two human gates",
      nodes: [
        { id: "research", label: "Research and script", sub: "Claude Code, real sources", x: 130, y: 150 },
        { id: "validate", label: "Validator", sub: "citations, [CHECK], schema", x: 400, y: 150, tone: "accent" },
        { id: "gate1", label: "Gate 1", sub: "you approve the script", x: 660, y: 150, tone: "muted" },
        { id: "render", label: "Voice and Remotion", sub: "figure, captions, preview", x: 660, y: 410 },
        { id: "gate2", label: "Gate 2", sub: "you watch the cut", x: 400, y: 410, tone: "muted" },
        { id: "upload", label: "YouTube", sub: "private draft only", x: 130, y: 410 },
      ],
      edges: [
        { from: "research", to: "validate" },
        { from: "validate", to: "gate1" },
        { from: "gate1", to: "render" },
        { from: "render", to: "gate2" },
        { from: "gate2", to: "upload" },
      ],
    },
  },
  {
    slug: "chessos",
    title: "ChessOS",
    kind: "Web and mobile app",
    year: "2026",
    result: "Stockfish offline on web and phone",
    summary:
      "A chess-learning app for the web (a React PWA) and for phones (Expo and React Native) on one shared TypeScript core. Lessons, puzzles, games against Stockfish with an optional coach, and game review in plain language. Everything runs on the device.",
    problem: [
      "Good chess training usually comes with ads, paywalls or an account. This one has none, and the engine runs on the device instead of a server.",
    ],
    built: [
      "A shared core: rules (chessops), PGN and FEN, a game tree, a UCI engine client, move classification and explanations, bots, clocks, a coach, and puzzles with Glicko-2 ratings and spaced review.",
      "The web app runs Stockfish 19 lite (WebAssembly) in a Web Worker and stores data in IndexedDB.",
      "The mobile app runs the same Stockfish build in a hidden WebView and shares the core, so both apps play and explain the same way.",
      "30 lessons, rated and themed puzzles, 10 bot levels and a full game review with inaccuracy, mistake and blunder labels.",
    ],
    hardPart: {
      title: "One engine, two runtimes",
      body: [
        "On the web, Stockfish runs as WebAssembly in a Web Worker. React Native has no such worker, so the mobile app runs the same build in a hidden WebView and talks to it over the same UCI client.",
        "On the iPhone simulator, live analysis ran at depth 18 and found the mate in one. A puzzle's alternative move counts as solved only when Stockfish confirms it, and every explanation says whether it comes from the engine or from a pattern check.",
      ],
    },
    metrics: [
      { value: "238", label: "unit tests" },
      { value: "30", label: "lessons" },
      { value: "10", label: "bot levels" },
      { value: "0", label: "accounts, ads or trackers" },
    ],
    stack: ["TypeScript", "React", "Vite", "PWA", "Expo", "React Native", "Stockfish (WASM)", "chessops", "Zustand", "Vitest", "Playwright"],
    links: [{ label: "Source on GitHub", href: gh("ChessOS") }],
    visual: {
      src: "/work/chessos.webp",
      alt: "ChessOS game review in dark mode: the board with an arrow, Stockfish lines and a blunder explained",
      source: "Screenshot from the project's design review",
      width: 1360,
      height: 1000,
    },
    diagram: {
      title: "One core, two apps",
      nodes: [
        { id: "core", label: "packages/core", sub: "rules, engine client, coach", x: 500, y: 140, tone: "accent" },
        { id: "content", label: "packages/content", sub: "lessons, puzzles (CC0)", x: 160, y: 140, tone: "muted" },
        { id: "web", label: "Web PWA", sub: "Stockfish in a Web Worker", x: 300, y: 420 },
        { id: "mobile", label: "Expo app", sub: "Stockfish in a WebView", x: 700, y: 420 },
        { id: "tokens", label: "packages/tokens", sub: "shared design tokens", x: 840, y: 140, tone: "muted" },
      ],
      edges: [
        { from: "content", to: "core" },
        { from: "core", to: "web" },
        { from: "core", to: "mobile" },
        { from: "tokens", to: "mobile", dashed: true },
        { from: "tokens", to: "web", dashed: true },
      ],
    },
  },
];

export function getFlagship(slug: string) {
  return flagships.find((project) => project.slug === slug);
}

export type MoreProject = {
  title: string;
  description: string;
  tags: string[];
  live?: string;
  github?: string;
  note?: string;
};

export const moreProjects: MoreProject[] = [
  {
    title: "PascalPath",
    description: "A Pascal interpreter written from scratch, with a 331-test suite verified against Free Pascal.",
    tags: ["TypeScript", "Interpreter"],
    live: "https://pascal-path.vercel.app",
    github: gh("pascal-path"),
  },
  {
    title: "SignalLab",
    description: "An interactive networking course: subnetting, DHCP, DNS, NAT, the OSI model and a firewall tester.",
    tags: ["React", "Vite"],
    live: "https://signal-lab-net.vercel.app",
    github: gh("signal-lab"),
  },
  {
    title: "A/L ICT learning platforms",
    description: "Python, operating systems, web development and Arduino: four study platforms with 179 lessons in total.",
    tags: ["React", "TypeScript"],
    live: "https://python-al-learning-platform.vercel.app",
    note: "Also: oslearningplatform.vercel.app, web-dev-study-partner.vercel.app, arduinoforal.vercel.app",
  },
  {
    title: "Geofenced QR Attendance",
    description: "Rotating QR codes checked against PostGIS geofences, JWT auth, a runbook and 23 integration tests.",
    tags: ["Node.js", "Express", "PostGIS"],
    github: gh("geofenced_qr_attendance_system"),
  },
  {
    title: "LogTriage",
    description: "A Java command-line log triager with alerting exit codes and 49 JUnit tests.",
    tags: ["Java", "JUnit"],
    note: "Source not public yet",
  },
  {
    title: "Ape Ammage Thunapaha",
    description: "A bilingual Sinhala and English spice shop.",
    tags: ["Next.js 16", "Prisma"],
    github: gh("ape-ammage-thunapaha-e-com"),
  },
  {
    title: "HoloDraw",
    description: "Gesture-controlled drawing at 25 to 30 FPS, driven by a 31M-parameter U-Net trained from scratch.",
    tags: ["PyTorch", "MediaPipe", "OpenCV"],
    github: gh("HoloDraw"),
  },
  {
    title: "Box-office revenue prediction",
    description: "An ensemble model with R² of 0.884 on held-out data.",
    tags: ["scikit-learn", "XGBoost", "LightGBM"],
    github: gh("tmdb_analyzer"),
  },
  {
    title: "Facial emotion recognition",
    description: "Five CNNs compared: 71.4% accuracy and a weighted F1 of 0.710.",
    tags: ["TensorFlow", "Keras"],
  },
  {
    title: "Psoriasis severity classification",
    description: "An ensemble classifier with 91.7% validation accuracy.",
    tags: ["TensorFlow", "scikit-learn"],
  },
  {
    title: "Virtual Memory Simulator",
    description: "FIFO, LRU, LFU, Optimal and Clock page replacement with a TLB. A team of four; I wrote most of the commits.",
    tags: ["Python"],
    github: gh("OS_Assignment"),
  },
  {
    title: "AceICT",
    description: "A G.C.E. A/L ICT tutoring site with courses and past papers.",
    tags: ["Next.js 16", "Tailwind v4", "Framer Motion"],
  },
  {
    title: "Vehicle-financing advisor",
    description: "An EMI and total-cost calculator, loan and leasing rates from eight Sri Lankan banks compared, and analysis dashboards, on the web and in an Expo app.",
    tags: ["Next.js", "Expo", "Recharts"],
  },
  {
    title: "Recruitment system",
    description: "Jobs, applications, interviews, clients and inquiries for a recruitment agency, with a dashboard and reports.",
    tags: ["Spring Boot", "JPA", "Spring Security", "Thymeleaf"],
    github: gh("recruitsystem"),
  },
  {
    title: "Big-data analytics and shortest paths",
    description: "Plotly Dash dashboards served with Gunicorn, and shortest-path analysis across Sri Lankan cities.",
    tags: ["Python", "Dash", "Graph algorithms"],
    github: gh("adsa"),
  },
  {
    title: "Gym Leveling",
    description: "A team project: a gym management desktop app with an XP system and payments.",
    tags: ["Next.js", "Supabase", "Stripe"],
    github: gh("gym-leveling-desktop"),
  },
];
