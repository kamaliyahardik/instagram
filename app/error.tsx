"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 pt-40 pb-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Please try again.</h1>
      <p className="mt-3 text-[rgb(var(--muted))]">
        {error.digest ? `Reference: ${error.digest}` : "A temporary hiccup — your link is safe."}
      </p>
      <button
        onClick={reset}
        className="mt-7 rounded-full bg-[rgb(var(--accent))] px-7 py-3 text-sm font-semibold text-[rgb(var(--bg))] transition hover:scale-[1.03] active:scale-95"
      >
        Retry
      </button>
    </div>
  );
}
