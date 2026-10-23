"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-40 pb-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Page not found.</h1>
      <Link
        href="/"
        className="mt-7 inline-block rounded-full bg-[rgb(var(--accent))] px-7 py-3 text-sm font-semibold text-[rgb(var(--bg))] transition hover:scale-[1.03] active:scale-95"
      >
        Back home
      </Link>
    </div>
  );
}
