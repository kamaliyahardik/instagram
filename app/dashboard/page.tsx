"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Trash2, Activity } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { clearActivity, getActivity, type ActivityEntry } from "@/lib/activity";
import { PLATFORM_META } from "@/lib/resolver/detector";

type Stats = {
  total: number;
  successful: number;
  successRate: number;
  avgMs: number;
  perPlatform: { platform: string; count: number }[];
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Dashboard() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const refresh = useCallback(() => setActivity(getActivity()), []);
  useEffect(() => {
    refresh();
    window.addEventListener("umd-activity", refresh);
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (typeof j.total === "number") setStats(j);
      })
      .catch(() => {});
    return () => window.removeEventListener("umd-activity", refresh);
  }, [refresh]);

  const downloads = activity.filter((a) => a.kind === "download");
  const resolves = activity.filter((a) => a.kind === "resolve");
  const platforms = new Set(activity.map((a) => a.platform)).size;
  const month = activity.filter(
    (a) => new Date(a.date).getMonth() === new Date().getMonth(),
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-24">
      <Badge>Dashboard</Badge>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Overview<span className="text-[rgb(var(--accent))]">.</span>
        </h1>
        {activity.length > 0 && (
          <button
            onClick={() => {
              clearActivity();
              refresh();
            }}
            className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
          >
            <Trash2 size={14} /> Clear local history
          </button>
        )}
      </div>

      {/* live counters — grow with every resolve + download */}
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          { k: "Downloads", v: String(downloads.length) },
          { k: "Resolves", v: String(resolves.length) },
          { k: "This month", v: String(month) },
          { k: "Platforms", v: String(platforms || "—") },
        ].map((s) => (
          <Card key={s.k} className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">{s.k}</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{s.v}</p>
          </Card>
        ))}
      </div>

      {/* global pulse from server stats */}
      <Card className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">
          <Activity size={14} /> Global · 30d
        </span>
        {stats ? (
          <>
            <span className="text-sm"><b className="tabular-nums">{stats.total}</b> <span className="text-[rgb(var(--muted))]">requests</span></span>
            <span className="text-sm"><b className="tabular-nums">{stats.successRate}%</b> <span className="text-[rgb(var(--muted))]">success</span></span>
            <span className="text-sm"><b className="tabular-nums">{stats.avgMs}ms</b> <span className="text-[rgb(var(--muted))]">avg</span></span>
            <span className="flex gap-1.5">
              {stats.perPlatform.slice(0, 5).map((p) => (
                <span
                  key={p.platform}
                  title={`${p.platform}: ${p.count}`}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PLATFORM_META[p.platform as keyof typeof PLATFORM_META]?.color ?? "rgb(var(--accent))" }}
                />
              ))}
            </span>
          </>
        ) : (
          <span className="text-sm text-[rgb(var(--muted))]">Connecting…</span>
        )}
      </Card>

      {/* history — every entry re-resolvable */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">History</h2>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]">
          New download <ArrowUpRight size={15} />
        </Link>
      </div>
      <Card className="mt-4 overflow-hidden">
        {activity.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">Nothing here yet.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-[rgb(var(--muted))]">
              Paste a link on the homepage — every resolve and download is counted
              here automatically. No account needed; sign in later to sync.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent))] px-6 py-2.5 text-sm font-semibold text-[rgb(var(--bg))] transition hover:scale-[1.03] active:scale-95"
            >
              <Download size={15} /> Start downloading
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[rgb(var(--line))]">
            {activity.map((h) => (
              <li key={h.id} className="flex items-center gap-3 p-4">
                <Badge>{h.kind === "download" ? "↓ saved" : h.platform}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.title || h.platform}</p>
                  <p className="truncate font-mono text-[11px] text-[rgb(var(--muted))]">{h.url}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-[11px] text-[rgb(var(--muted))] sm:block">
                  {timeAgo(h.date)}
                </span>
                <Link
                  href={`/?url=${encodeURIComponent(h.url)}`}
                  className="shrink-0 rounded-full bg-[rgb(var(--surface))] px-3.5 py-1.5 text-[13px] font-medium transition hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--bg))]"
                >
                  Again
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="mt-4 font-mono text-[11px] leading-relaxed text-[rgb(var(--muted))]">
        Stored only in this browser. Expired source links can&apos;t always be re-downloaded.
      </p>
    </div>
  );
}
