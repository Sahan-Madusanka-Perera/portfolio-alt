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

const entries: Flagship[] = [
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
        { id: "page", label: "Demo page", sub: "hand tracking on device", x: 130, y: 280, tone: "accent" },
        { id: "api", label: "HTTP API", sub: "5 req/s, api Lambda", x: 400, y: 90 },
        { id: "ddb", label: "DynamoDB", sub: "job status, 1-day TTL", x: 660, y: 90 },
        { id: "s3", label: "S3", sub: "photos and outlines", x: 400, y: 470 },
        { id: "sqs", label: "SQS", sub: "jobs", x: 660, y: 280 },
        { id: "dlq", label: "Dead-letter queue", sub: "after 3 failures", x: 660, y: 470, tone: "muted" },
        { id: "worker", label: "Worker Lambda", sub: "arm64, ONNX INT8", x: 880, y: 280, tone: "accent" },
        { id: "cw", label: "CloudWatch", sub: "dashboard, 5 alarms", x: 880, y: 470, tone: "muted" },
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
        { id: "replica", label: "MariaDB replica", sub: "read_only", x: 800, y: 210 },
        { id: "mongo", label: "MongoDB rs0", sub: "3 members", x: 470, y: 340 },
        { id: "pg", label: "PostgreSQL 17", sub: "pg_stat_statements", x: 470, y: 470 },
        { id: "verdict", label: "Exit code", sub: "0 OK, 1 WARN, 2 CRIT", x: 140, y: 470, tone: "accent" },
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
        { id: "core", label: "ZenovaCore", sub: "library, queue, lyrics timing", x: 560, y: 110 },
        { id: "store", label: "user-state.json", sub: "favourites, playlists, history", x: 560, y: 450 },
        { id: "online", label: "Audius, LRCLIB, MusicBrainz", sub: "off by default", x: 840, y: 280, tone: "muted" },
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
        { id: "ui", label: "React views", sub: "Briefing, Accuracy, Explorer", x: 866, y: 280 },
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
  {
    slug: "d-store",
    title: "D-Store SL",
    kind: "E-commerce, client work",
    year: "2025 to 2026",
    result: "Closed four critical holes before launch",
    summary:
      "An online shop for manga, anime figures and graphic tees in Sri Lanka, built in Next.js and Supabase for a client. Before launch I reviewed it like an attacker would, and closed four critical access-control holes and a list of smaller ones.",
    honesty:
      "D-Store is a client project that has not launched yet: dstorelk.com shows its opening-soon page for now, and the source is private. The screenshot is that page.",
    problem: [
      "A shop that takes bank transfers and cash on delivery in rupees, ships to all nine provinces and works well on a phone, which is where its customers shop.",
      "It worked. The question before launch was whether it was safe: whether a customer could do anything in the browser that only the shop should be able to do.",
    ],
    built: [
      "The storefront, cart, checkout and an admin panel for products, orders, discounts and the home-page carousel, on Next.js, Supabase (Postgres, auth, storage) and a Zustand cart.",
      "Bank-slip upload for transfer payments, newsletter email through Resend, and a character-info feature on product pages powered by Gemini 2.5 Flash.",
      "Server-side pricing: every figure on an order is recomputed from the product table and the discount rules. The browser says only which products and how many.",
      "Row-level security on every table, stock reserved in the same transaction that writes the order, rate limits on every endpoint that costs money to call, and security headers.",
    ],
    hardPart: {
      title: "The review before launch",
      body: [
        "Four holes were critical. A customer could promote their own account to administrator, because the profile policy let you update your own row and the role was a column on it. Order totals were whatever the browser sent, so a basket could be filed for Rs 1. The discounts table was writable by anyone, and every customer could read every other customer's bank slip.",
        "All four are closed, along with the smaller findings: overselling the last unit, missing rate limits, and product ratings that had been made up and labelled as Amazon's. Those now come only from a real source, or not at all.",
        "After the database migration I replayed nine attacks by hand, from self-promotion to a 100%-off discount, and every one failed while everything the admin legitimately does still worked. 71 automated tests cover the code where a bug costs money or leaks data; the order-pricing tests are written from the attacker's side.",
      ],
    },
    metrics: [
      { value: "4", label: "critical access-control holes closed" },
      { value: "9", label: "attacks replayed by hand, all blocked" },
      { value: "71", label: "automated tests on pricing, limits and search" },
      { value: "57", label: "commits, all mine" },
    ],
    stack: ["Next.js 16", "TypeScript", "Supabase", "PostgreSQL RLS", "Zustand", "Tailwind CSS v4", "Resend", "Gemini 2.5 Flash", "Vitest"],
    links: [{ label: "dstorelk.com", href: "https://dstorelk.com" }],
    sourceNote: "Launching soon. Source private (client project).",
    visual: {
      src: "/work/d-store.webp",
      alt: "D-Store's opening-soon page: the shop's logo, the words Opening soon and a sign-up field for launch news",
      source: "Screenshot of dstorelk.com before launch, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "The browser names products, the server sets prices",
      nodes: [
        { id: "shop", label: "Storefront", sub: "Next.js, Zustand cart", x: 130, y: 280, tone: "accent" },
        { id: "orders", label: "Orders API", sub: "prices recomputed on server", x: 450, y: 120 },
        { id: "rpc", label: "create_order()", sub: "stock reserved in one step", x: 450, y: 440 },
        { id: "db", label: "Supabase Postgres", sub: "row-level security everywhere", x: 820, y: 280, tone: "accent" },
        { id: "ext", label: "Resend, Gemini", sub: "rate-limited", x: 130, y: 470, tone: "muted" },
      ],
      edges: [
        { from: "shop", to: "orders" },
        { from: "orders", to: "rpc" },
        { from: "rpc", to: "db" },
        { from: "shop", to: "ext", dashed: true },
      ],
    },
  },
  {
    slug: "ol-ict-practice",
    title: "O/L ICT Practice",
    kind: "Exam practice platform",
    year: "2026",
    result: "Two right answers read as 67%, not 100%",
    summary:
      "A practice platform for the G.C.E. O/L ICT paper, where every answer changes what the platform knows about a student and therefore what it asks next. It will not publish an answer nobody has checked, and it will not flatter.",
    honesty:
      "Not deployed yet. The source is public, and the screens here are from a local run with the seeded demo student, so the numbers in them are demo data.",
    problem: [
      "Most practice apps count a score. A student needs to know which topics are solid, which are not, and what to do next, and a confident number after three questions is a lie.",
      "The question bank is built from fifteen real past papers, but official marking schemes exist for only ten of them, and some answer sheets in circulation are unofficial. A wrong key taught to a student is worse than no question.",
    ],
    built: [
      "The syllabus as data: 15 units, 60 topics and 236 subtopics from the NIE documents, plus 146 model questions with explanations and the misconception behind each wrong option.",
      "573 of the 600 past-paper questions transcribed. The six born-digital papers are read from their text layer, which kept subscripts like `65₁₀` that OCR had turned into `6510`.",
      "Practice sets built from weak topics, due reviews and recent mistakes, a mistake log, timed exams and a progress page, with Postgres, Drizzle and Server Actions that each start with an authorization guard.",
      "A design built for a mid-range Android on mobile data: skeletons shaped like each page, 17 px question text, and right or wrong always shown with an icon and a word as well as colour.",
    ],
    hardPart: {
      title: "A platform that refuses to flatter",
      body: [
        "Mastery is a Beta posterior with a `Beta(2,2)` prior, weighted by difficulty, with a 30-day half-life. Two right answers read as 67% with no confidence, and below a real sample size the meter shows no percentage at all.",
        "Publishing has the same discipline. A database CHECK constraint stops any question going live while its answer is unverified, and an unkeyed question needs one reviewer to set the key and a second, independent reviewer to approve it. Seven questions where the examiners accepted more than one option have no option marked correct, because there is no single answer to record.",
        "And answers never reach the browser before grading: students and graders read questions through two different functions, and a test walks the whole student payload looking for anything answer-shaped.",
      ],
    },
    metrics: [
      { value: "706", label: "questions in the seeded bank" },
      { value: "60", label: "syllabus topics covered" },
      { value: "15", label: "past papers, 10 with official schemes" },
      { value: "292", label: "tests: domain logic, auth, content, database" },
    ],
    stack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Drizzle", "Radix", "Zod", "Vitest"],
    links: [{ label: "Source on GitHub", href: gh("OL_ICT_Learning_Platform") }],
    visual: {
      src: "/work/ol-ict-landing.webp",
      alt: "The O/L ICT Practice landing page: Find out what you actually know, beside a worked example of three mastery meters",
      source: "Screenshot of a local run with the seeded data",
      width: 1600,
      height: 1000,
    },
    gallery: [
      {
        src: "/work/ol-ict-dashboard.webp",
        alt: "The student dashboard: a recommended set built from weak topics, due reviews and mistakes",
        source: "Local run, demo student",
        width: 1600,
        height: 1000,
      },
      {
        src: "/work/ol-ict-practice.webp",
        alt: "Practice modes: recommended set, quick practice, weak areas, mistake review and challenge",
        source: "Local run, demo student",
        width: 1600,
        height: 1000,
      },
      {
        src: "/work/ol-ict-progress.webp",
        alt: "Progress: overall mastery weighted by difficulty, with no number until there is enough evidence",
        source: "Local run, demo student",
        width: 1600,
        height: 1000,
      },
    ],
    diagram: {
      title: "Pure learning logic, guarded at every edge",
      nodes: [
        { id: "student", label: "Student", sub: "mid-range Android", x: 130, y: 140 },
        { id: "actions", label: "Server Actions", sub: "each one starts with a guard", x: 460, y: 140, tone: "accent" },
        { id: "domain", label: "lib/domain", sub: "mastery, scheduling, scoring", x: 460, y: 420 },
        { id: "db", label: "Postgres", sub: "CHECK on unverified keys", x: 820, y: 140, tone: "accent" },
        { id: "review", label: "Review queue", sub: "two independent reviewers", x: 820, y: 420, tone: "muted" },
      ],
      edges: [
        { from: "student", to: "actions" },
        { from: "actions", to: "domain" },
        { from: "actions", to: "db" },
        { from: "review", to: "db", label: "publish" },
      ],
    },
  },
  {
    slug: "qr-attend",
    title: "QR Attend",
    kind: "Full-stack, geospatial",
    year: "2026",
    result: "Four checks before a student is marked",
    summary:
      "Classroom attendance that a screenshot, a cafeteria or a friend's phone cannot fake: a rotating encrypted QR code, a device bound on first use and a PostGIS geofence the phone never sees.",
    problem: [
      "Paper sheets get passed down a row, and static QR codes get screenshotted and sent to friends. Each obvious fix is easy to beat on its own.",
      "The point was to require all three defences at once, and to keep the location test in the database, where the client cannot influence it.",
    ],
    built: [
      "A token encrypted with AES-256-CBC, a fresh IV and an 8-byte nonce. It dies 15 seconds after it is minted and the projector shows a new one every 10, so a student scanning as the code turns still gets in.",
      "The position check as `ST_Contains` against a GIST-indexed classroom polygon in PostGIS. Rooms do not have to be circles, and the boundary never leaves the server.",
      "One device per student: a FingerprintJS id bound on first check-in. A second device is refused, and releasing a device is a deliberate step in the runbook, not self-service.",
      "Student and lecturer views in React 19 with Leaflet maps, QR rotation over Server-Sent Events, and analytics that turn the 80% attendance rule into the number students want: how many more classes they can miss.",
    ],
    hardPart: {
      title: "A refusal that tells you what passed",
      body: [
        "The check-in route runs four gates in order, token, enrolment, device and position, and stops at the first refusal. The phone shows the ladder as it resolves, with the value each gate saw: the coordinates and their accuracy, the start of the bound device id, the seconds the token had left.",
        "So a refusal at Position also proves the token and the device were fine, and the screen says so instead of turning everything red.",
        "The trade-offs are written down too. `EventSource` cannot send an Authorization header, so the QR stream takes its JWT in the query string, which puts it in server logs; that route is lecturer-only and carries nothing but images. The README also lists what it does not do, from password reset to the fact that a determined student can defeat the open-source fingerprint.",
      ],
    },
    metrics: [
      { value: "15 s", label: "token life, rotated every 10 s" },
      { value: "4", label: "gates on every check-in" },
      { value: "23", label: "tests on Node's built-in runner" },
      { value: "4", label: "CI jobs, migrations run twice" },
    ],
    stack: ["React 19", "Vite", "Leaflet", "Node.js", "Express", "PostgreSQL", "PostGIS", "JWT", "FingerprintJS", "Docker", "GitHub Actions"],
    links: [{ label: "Source on GitHub", href: gh("geofenced_qr_attendance_system") }],
    visual: {
      src: "/work/qr-attend.svg",
      alt: "The four gates a check-in must clear, in order: token, enrolment, device and position",
      source: "Drawn for this site from the project's README",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "Three defences, all at once",
      nodes: [
        { id: "screen", label: "Lecturer screen", sub: "new QR every 10 s", x: 140, y: 140 },
        { id: "phone", label: "Student phone", sub: "scan, GPS, FingerprintJS", x: 140, y: 420 },
        { id: "api", label: "Express API", sub: "four gates, first refusal", x: 490, y: 280, tone: "accent" },
        { id: "pg", label: "PostGIS", sub: "ST_Contains, GIST index", x: 840, y: 140, tone: "accent" },
        { id: "stats", label: "Analytics", sub: "the 80% line", x: 840, y: 420, tone: "muted" },
      ],
      edges: [
        { from: "api", to: "screen", label: "SSE" },
        { from: "phone", to: "api" },
        { from: "api", to: "pg" },
        { from: "api", to: "stats", dashed: true },
      ],
    },
  },
  {
    slug: "python-al",
    title: "Python for A/L ICT",
    kind: "Interactive course",
    year: "2026",
    result: "Real Python in the tab, offline",
    summary:
      "The whole Python competency of the A/L ICT syllabus, with real CPython running in the browser: no install, no account, and it keeps working without a signal once opened.",
    problem: [
      "A student with only a phone has to be able to do everything: read the lessons, run the code, get their work marked and revise, on patchy mobile data.",
      "Exam questions ask for hand traces and structure charts, so the course needed tools for the artefacts students draw on paper, not only a code box.",
    ],
    built: [
      "CPython 3.14 through Pyodide in a Web Worker, self-hosted (about 13 MB) so there is no CDN dependency, with a service worker that keeps opened lessons and the runtime available offline.",
      "44 lessons across all 13 competency levels, 45 auto-graded labs checked against visible and hidden tests, about 100 questions, 6 structured questions with mark schemes and 60 revision cards on a Leitner schedule.",
      "18 interactive tools: a flow-chart and structure-chart builder, a step-through tracer, a bitwise lab, sorting and search animators, an SQL console and a virtual file system.",
      "About 25 common errors translated into a plain cause and a list of things to check, with the raw traceback one tap away. Progress stays in IndexedDB.",
    ],
    hardPart: {
      title: "Making `input()` actually wait",
      body: [
        "In a browser, Python runs in a worker that cannot simply stop and wait for the keyboard. Here the program genuinely pauses: the worker blocks on a `SharedArrayBuffer` with `Atomics.wait` until the student types.",
        "That needs cross-origin isolation, so the app sends COOP and COEP headers and self-hosts every asset, fonts included. Where isolation is not available it falls back to asking for the inputs up front instead of breaking, and a runaway loop restarts the worker.",
        "The tracer uses the same runtime: `sys.settrace` runs the real program line by line and renders the trace table students have to produce on paper.",
      ],
    },
    metrics: [
      { value: "44", label: "lessons across 13 competency levels" },
      { value: "45", label: "auto-graded labs with hidden tests" },
      { value: "18", label: "interactive tools" },
      { value: "0", label: "accounts or installs" },
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Pyodide", "Web Workers", "Service worker", "IndexedDB"],
    links: [
      { label: "Try it live", href: "https://python-al-learning-platform.vercel.app" },
      { label: "Source on GitHub", href: gh("Python_AL_Learning_Platform") },
    ],
    visual: {
      src: "/work/python-al.webp",
      alt: "The course home: Everything in Competency 9, and a real Python to run in it, beside a code sample ready to run",
      source: "Screenshot of the live site, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "A whole Python, inside the tab",
      nodes: [
        { id: "ui", label: "Lessons and editor", sub: "no account, no install", x: 150, y: 140 },
        { id: "sw", label: "Service worker", sub: "offline after first visit", x: 150, y: 420, tone: "muted" },
        { id: "worker", label: "Web Worker", sub: "CPython 3.14 on Pyodide", x: 500, y: 280, tone: "accent" },
        { id: "tracer", label: "sys.settrace", sub: "trace tables", x: 840, y: 140 },
        { id: "stdin", label: "input()", sub: "SharedArrayBuffer wait", x: 840, y: 420 },
      ],
      edges: [
        { from: "ui", to: "worker" },
        { from: "sw", to: "ui", dashed: true },
        { from: "worker", to: "tracer" },
        { from: "worker", to: "stdin" },
      ],
    },
  },
  {
    slug: "japura-astro",
    title: "J'pura Astronomy Club",
    kind: "Club website",
    year: "2025 to 2026",
    result: "Tells members if tonight is worth it",
    summary:
      "The website of the University of Sri Jayewardenepura's astronomy club, where I am Director of Media and Marketing: events, an astrophotography gallery, an e-magazine reader and live observing conditions for the club's own sky.",
    problem: [
      "A club site is usually a noticeboard. Members of an astronomy club want to know something more useful: is tonight dark and clear enough to bother?",
      "The committee also needed to run it without a developer: post events, add photos and publish each magazine issue themselves.",
    ],
    built: [
      "Tonight's conditions over the club's own coordinates: the truly dark window between astronomical twilight times from sunrise-sunset.org, hourly cloud cover across it from Open-Meteo, and the moon's phase from the site's own calculation.",
      "Live feeds for the ISS position, NASA's picture of the day and upcoming launches, each behind one of the site's own API routes.",
      "A magazine reader built on pdf.js, a gallery with a lightbox, pages for the planets and the committee board, and a canvas sky behind the hero.",
      "An admin panel on Supabase for events, gallery uploads and magazine issues, with Zod-validated forms.",
    ],
    hardPart: {
      title: "Dark, not just after sunset",
      body: [
        "Sunset is the wrong answer for observing. The sky is properly dark only between the end of astronomical twilight tonight and its start tomorrow morning, so the forecast is built for that window.",
        "The route asks both free, keyless sources in parallel, samples cloud cover hour by hour across the dark window, and caches the result for half an hour. Times are returned in UTC and shown in Colombo time, and the moon comes from the same code that draws the moon glyphs, so the forecast and the page always agree.",
        "The heavy animation, GSAP, loads only when a page needs it, so the club's phones get the content first.",
      ],
    },
    metrics: [
      { value: "28", label: "commits, all mine" },
      { value: "30 min", label: "cache on the sky forecast" },
      { value: "2", label: "free, keyless weather and sun sources" },
    ],
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase", "GSAP", "Framer Motion", "pdf.js", "Zod"],
    links: [
      { label: "japuraastro.lk", href: "https://japuraastro.lk" },
      { label: "Source on GitHub", href: gh("astro-website") },
    ],
    visual: {
      src: "/work/japura-astro.webp",
      alt: "The club site's hero: J'PURA Astronomy Club over star trails and a telescope silhouette",
      source: "Screenshot of japuraastro.lk, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "Tonight's sky, from two free sources",
      nodes: [
        { id: "site", label: "japuraastro.lk", sub: "Next.js 16, canvas sky", x: 140, y: 280, tone: "accent" },
        { id: "sky", label: "Sky route", sub: "dark window, cloud cover", x: 490, y: 100 },
        { id: "feeds", label: "Feed routes", sub: "ISS, APOD, launches", x: 490, y: 280 },
        { id: "admin", label: "Admin panel", sub: "events, gallery, magazine", x: 490, y: 460 },
        { id: "src", label: "Sun and weather", sub: "sunrise-sunset, Open-Meteo", x: 840, y: 100, tone: "muted" },
        { id: "supa", label: "Supabase", sub: "Postgres and storage", x: 840, y: 460 },
      ],
      edges: [
        { from: "site", to: "sky" },
        { from: "site", to: "feeds" },
        { from: "site", to: "admin" },
        { from: "sky", to: "src", dashed: true },
        { from: "admin", to: "supa" },
      ],
    },
  },
  {
    slug: "web-dev-study-partner",
    title: "Web Dev Study Partner",
    kind: "Interactive course",
    year: "2026",
    result: "Real PHP and SQL, run in the browser",
    summary:
      "The web-development competency of A/L ICT, where every `echo`, `$_POST` and `mysqli_connect` actually runs: a PHP 8 interpreter and an SQL engine compiled to WebAssembly, in the tab, with nothing to install.",
    problem: [
      "The syllabus teaches PHP with MySQL, but most students have no server to run it on, so they learn server code by reading it.",
      "The course had to run the exact code the syllabus teaches, `mysqli` calls included, inside a browser tab that has no MySQL server and no sockets.",
    ],
    built: [
      "PHP 8 compiled to WebAssembly (about 14 MB, fetched once with a progress bar, then cached). One interpreter lives for the whole session, so a table created in one lesson is still there in the next.",
      "Form previews in a real iframe: submitting one builds a genuine `FormData` and hands it to PHP as `$_GET` or `$_POST`, so an unticked checkbox really is absent.",
      "57 lessons over the eight competency levels, 240 questions in six formats, 34 auto-marked coding challenges and 12 structured questions with model answers.",
      "17 explainers, six seeded databases from the resource book's own tables, and end-to-end checks of the runtime.",
    ],
    hardPart: {
      title: "MySQL without a MySQL server",
      body: [
        "The PHP build includes `mysqli`, but `mysqli` can only talk to a server over a socket, and a browser tab has none.",
        "So a shim reimplements the mysqli API on top of PDO and SQLite, which are in the build, and rewrites `new mysqli` and `mysqli_*` calls onto it before the script runs. It translates MySQL's dialect, `AUTO_INCREMENT`, `DESCRIBE`, `ALTER TABLE … MODIFY`, and rephrases SQLite's errors as MySQL's, so a missing table reads the way it would on a real server.",
        "The student writes exactly the code the syllabus teaches and never sees the trick.",
      ],
    },
    metrics: [
      { value: "57", label: "lessons, competency levels 10.1 to 10.8" },
      { value: "240", label: "questions in six formats" },
      { value: "34", label: "auto-marked coding challenges" },
      { value: "0", label: "servers to install" },
    ],
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS v4", "CodeMirror", "PHP 8 (WebAssembly)", "PDO and SQLite", "Zustand", "Puppeteer"],
    links: [
      { label: "Try it live", href: "https://web-dev-study-partner.vercel.app" },
      { label: "Source on GitHub", href: gh("web-dev-study-partner") },
    ],
    visual: {
      src: "/work/web-dev-study-partner.webp",
      alt: "The Study Partner dashboard: Learn web dev by running it, today's study plan and recommended lessons",
      source: "Screenshot of the live site, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "The syllabus's code, run for real",
      nodes: [
        { id: "lab", label: "Lessons and labs", sub: "the code the syllabus uses", x: 150, y: 140 },
        { id: "form", label: "Form preview", sub: "real iframe, real FormData", x: 150, y: 420 },
        { id: "php", label: "PHP 8 in WASM", sub: "one session, cached", x: 500, y: 280, tone: "accent" },
        { id: "shim", label: "mysqli shim", sub: "MySQL dialect to SQLite", x: 840, y: 140, tone: "accent" },
        { id: "sqlite", label: "PDO and SQLite", sub: "six seeded databases", x: 840, y: 420, tone: "muted" },
      ],
      edges: [
        { from: "lab", to: "php" },
        { from: "form", to: "php", label: "$_POST" },
        { from: "php", to: "shim" },
        { from: "shim", to: "sqlite" },
      ],
    },
  },
  {
    slug: "os-learning",
    title: "Operating Systems Course",
    kind: "Interactive course",
    year: "2026",
    result: "Every syllabus Gantt chart, reproduced",
    summary:
      "An interactive course for the operating-systems competency of A/L ICT: 35 lessons, 20 simulations and 141 questions, taking a student from nothing to exam-ready. A static site: free, no sign-up, with progress kept on the device.",
    problem: [
      "Operating systems are hard to see. Scheduling, paging and file allocation are processes, and static diagrams in notes freeze them at one moment.",
      "Students also need to be told the truth: the course corrects the mistakes in the resource book instead of repeating them.",
    ],
    built: [
      "35 lessons in seven modules, each definition in plain English first with the examinable wording behind a disclosure, and an \"I'm confused\" button that escalates from a simpler retelling to the prerequisite lesson.",
      "20 simulations, each lazy-loaded at 2 to 4 kB: a scheduling lab, address translation, a drivable seven-state process diagram, disk allocation, a FAT chain explorer, the boot sequence and more.",
      "141 questions in 9 types, feedback that names what was chosen and why it was wrong, spaced review, and mastery earned from evidence (75%) and engagement (25%), never from visiting a page.",
      "Corrections to the resource book, from relative paths to NTFS, each one checked and stated in the course.",
    ],
    hardPart: {
      title: "A scheduler that matches the syllabus",
      body: [
        "The scheduling lab covers FCFS, SJF, SRTF, both forms of Priority and Round Robin. Students edit arrival times, bursts and priorities, and the Gantt chart redraws with every subtraction shown.",
        "It is pure functions, tested against every worked example in the syllabus: all six algorithms reproduce the published Gantt charts and averages exactly.",
        "Doing that found something the notes gloss over: under non-preemptive SJF the real arrival times do change the averages, so the course now says which arrival times each worked example assumes.",
      ],
    },
    metrics: [
      { value: "35", label: "lessons in 7 modules" },
      { value: "20", label: "interactive simulations" },
      { value: "141", label: "questions in 9 types" },
      { value: "0", label: "backend: a static site" },
    ],
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS v4", "Motion", "Zustand", "oxlint"],
    links: [
      { label: "Try it live", href: "https://oslearningplatform.vercel.app" },
      { label: "Source on GitHub", href: gh("OS_Learning_Platform") },
    ],
    visual: {
      src: "/work/os-learning.webp",
      alt: "The course home: Learn how computers run themselves, beside a Shortest Remaining Time First Gantt chart",
      source: "Screenshot of the live site, captured by scripts/capture-sites.mjs",
      width: 1600,
      height: 1000,
    },
    diagram: {
      title: "Learn it, run it, prove it",
      nodes: [
        { id: "path", label: "Learning path", sub: "35 lessons, 7 modules", x: 150, y: 140 },
        { id: "sims", label: "20 simulations", sub: "lazy-loaded, 2 to 4 kB each", x: 150, y: 420 },
        { id: "sched", label: "scheduling.ts", sub: "pure, syllabus-verified", x: 500, y: 420, tone: "accent" },
        { id: "questions", label: "141 questions", sub: "9 types, spaced review", x: 500, y: 140 },
        { id: "mastery", label: "Mastery", sub: "75% evidence, 25% effort", x: 840, y: 280, tone: "accent" },
      ],
      edges: [
        { from: "path", to: "sims" },
        { from: "sims", to: "sched" },
        { from: "path", to: "questions" },
        { from: "questions", to: "mastery" },
      ],
    },
  },
];

/** The order of the work gallery and the case studies. */
const order = [
  "holopaint-cloud",
  "dbops-lab",
  "d-store",
  "ol-ict-practice",
  "zenova",
  "qr-attend",
  "winddesk",
  "python-al",
  "japura-astro",
  "logic-gates-lab",
  "web-dev-study-partner",
  "singector",
  "os-learning",
  "energy-disassembled",
  "chessos",
];

export const flagships: Flagship[] = order.map((slug) => {
  const project = entries.find((p) => p.slug === slug);
  if (!project) throw new Error(`No flagship named ${slug}`);
  return project;
});

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
    title: "The Bench: Arduino for A/L",
    description: "The A/L ICT unit on IoT and Arduino: 31 lessons, 127 questions and 8 circuit benches that run in the browser.",
    tags: ["React", "TypeScript", "Vite"],
    live: "https://arduinoforal.vercel.app",
    github: gh("Arduino_For_AL"),
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
