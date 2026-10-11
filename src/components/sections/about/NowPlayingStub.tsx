// TODO: wire up the Spotify API for a real "now playing" strip.
export function NowPlayingStub() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted">
      <span className="h-2 w-2 rounded-full bg-muted" aria-hidden />
      Not playing anything right now &mdash; TODO: Spotify integration.
    </div>
  );
}
