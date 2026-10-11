export type Project = {
  slug: string;
  title: string;
  hook: string;
  problem: string;
  architecture: string;
  stack: string[];
  /** the red pen's margin note on the project page (a fact from the write-up, never a grade) */
  penNote: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
};

// GitHub URLs are the real repos on github.com/Sahan-Madusanka-Perera.
// liveUrl uses "#" as the sentinel for "no public deployment yet" — those
// render as a non-interactive "soon" pill (see ProjectActions).
export const projects: Project[] = [
  {
    slug: "holodraw",
    title: "HoloDraw / HoloPaint",
    hook: "Draw in the air — hand gestures become brush strokes.",
    problem:
      "Real-time hand-gesture drawing app. Trained a U-Net from scratch on BSDS500 for edge detection to translate hand landmarks into precise, low-latency strokes.",
    architecture:
      "MediaPipe hand-landmark detection feeds a custom U-Net, trained from scratch on BSDS500, for real-time edge extraction, with an OpenCV pass smoothing strokes before they're rendered to canvas.",
    stack: ["Python", "PyTorch", "U-Net", "OpenCV", "MediaPipe"],
    penNote: "U-Net trained from scratch",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/HoloDraw",
    featured: true,
  },
  {
    slug: "gym-leveling",
    title: "Gym Leveling",
    hook: "Gamified gym management — admins run it, members level up.",
    problem:
      "Next.js/Supabase admin app paired with a React Native member app. A Gemini-powered chatbot and an XP/leveling system keep members engaged.",
    architecture:
      "A Next.js admin dashboard and a React Native member app share the same Supabase backend (Postgres, Auth, Realtime); a Gemini-backed endpoint powers the chatbot, with XP events written back to Supabase to drive leveling.",
    stack: ["Next.js", "Supabase", "React Native", "Gemini API"],
    penNote: "two apps, one Supabase backend",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/gym-leveling-desktop",
  },
  {
    slug: "boxoffice-predictor",
    title: "Movie Box-Office Predictor",
    hook: "Predicting opening-weekend revenue before the trailers finish.",
    problem:
      "Ensemble of Random Forest, XGBoost, and LightGBM reaching 88.4% accuracy, wrapped in a Streamlit dashboard for exploring predictions.",
    architecture:
      "Random Forest, XGBoost, and LightGBM are trained on historical box-office and metadata features and blended into a single ensemble prediction, served through a Streamlit dashboard for interactive exploration.",
    stack: ["Python", "scikit-learn", "XGBoost", "LightGBM", "Streamlit"],
    penNote: "88.4% accuracy",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/tmdb_analyzer",
  },
  {
    slug: "geofenced-qr-attendance",
    title: "Geofenced QR Attendance",
    hook: "Attendance that can't be faked from across campus.",
    problem:
      "Rotating QR codes, PostGIS geofencing, and device fingerprinting to stop proxy check-ins, with live updates over SSE.",
    architecture:
      "An Express/Node API rotates QR tokens on a timer and validates scans against PostGIS geofences and a device fingerprint; the React/Vite frontend authenticates via JWT and gets live updates over Server-Sent Events.",
    stack: ["React", "Vite", "Node.js", "Express", "PostGIS", "JWT", "SSE"],
    penNote: "proxy check-ins blocked",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/geofenced_qr_attendance_system",
  },
  {
    slug: "sri-lanka-shortest-path",
    title: "Sri Lanka Shortest-Path",
    hook: "Dijkstra's algorithm, but it's every road in Sri Lanka.",
    problem:
      "Shortest-path routing over real Sri Lankan city and road network data, visualized interactively with Streamlit.",
    architecture:
      "Road-network data is modeled as a weighted graph, with Dijkstra's algorithm computing shortest paths on demand and results rendered on an interactive map through a Streamlit front end.",
    stack: ["Python", "Dijkstra", "NetworkX", "Streamlit"],
    penNote: "real Sri Lankan road data",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/adsa",
  },
  {
    slug: "emotion-music-recommender",
    title: "Emotion-Based Music Recommender",
    hook: "Music that matches how you actually feel right now.",
    problem: "ML system that detects emotion and activity context, then recommends music suited to the moment.",
    architecture:
      "A computer-vision model classifies emotion and activity context from input signals, feeding a recommendation layer that maps the detected state to a matching music selection.",
    stack: ["Python", "Machine Learning", "Computer Vision"],
    penNote: "reads emotion and activity",
    liveUrl: "#",
    githubUrl: "https://github.com/Sahan-Madusanka-Perera/Music_Recommendation_System",
  },
];
