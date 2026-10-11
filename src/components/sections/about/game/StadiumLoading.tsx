// Shown while the stadium chunk (model, HDRI, post-processing) is fetched.
export function StadiumLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#0b3d1f]">
      <span className="animate-pulse font-mono text-sm text-white/70">Switching on the floodlights…</span>
    </div>
  );
}
