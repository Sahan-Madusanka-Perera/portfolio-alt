// Hand-rolled to avoid pulling in an icon library for two glyphs.
export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-full w-full">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5a.75.75 0 0 0-.9-1 10 10 0 1 0 13.1 13.1.75.75 0 0 0-1-.9Z" />
    </svg>
  );
}
