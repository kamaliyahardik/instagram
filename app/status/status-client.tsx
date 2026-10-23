"use client";

import { useEffect, useState } from "react";
import { ActivitySquare, Check, CircleAlert, Clock } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { Reveal } from "@/components/platform/islands";
import { PLATFORM_META } from "@/lib/resolver/detector";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types/media";

type Stats = {
  success?: boolean;
  total?: number;
  successRate?: number;
  avgMs?: number;
  perPlatform?: { platform: string; count: number }[];
};

const PLATFORMS: Platform[] = ["instagram", "youtube", "facebook", "pinterest", "vimeo"];

export default function StatusClient() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({}));
  }, []);

  const perPlatform = new Map((stats?.perPlatform ?? []).map((p) => [p.platform, p.count]));
  const degraded = stats?.success === false;

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 35% at 50% 0%, rgb(var(--glow)), transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-24">
        <div className="text-center">
          <Reveal>
            <Badge><ActivitySquare size={12} /> Service status</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 text-[clamp(2.6rem,6.5vw,4.2rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              {degraded ? (
                <span className="text-red-400">Something&apos;s off.</span>
              ) : (
                <>All systems <span className="text-emerald-400">operational.</span></>
              )}
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="mt-12 space-y-2.5">
            {PLATFORMS.map((p) => {
              const ok = !degraded;
              const count = perPlatform.get(p) ?? 0;
              return (
                <div key={p} className="hairline flex items-center gap-4 rounded-2xl bg-[rgb(var(--card))] p-4">
                  <PlatformLogo platform={p} size={18} style={{ color: PLATFORM_META[p].color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{PLATFORM_META[p].label}</p>
                    <p className="font-mono text-[11px] text-[rgb(var(--muted))]">
                      {count > 0 ? `${count} downloads · last 30 days` : "no recent activity"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
                      ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {ok ? <Check size={11} strokeWidth={3} /> : <CircleAlert size={11} />} {ok ? "live" : "degraded"}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <Card className="mt-8 grid gap-6 p-6 text-center sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Resolve attempts · 30d</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{stats?.total ?? "—"}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Success rate</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {stats?.successRate != null ? `${stats.successRate}%` : "—"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Avg response</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {stats?.avgMs != null ? (
                  <span className="inline-flex items-baseline gap-1">
                    {stats.avgMs}
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[rgb(var(--muted))]">ms</span>
                  </span>
                ) : "—"}
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.28}>
          <p className="mt-8 text-center font-mono text-[11px] leading-relaxed text-[rgb(var(--muted))]">
            <Clock size={11} className="mr-1 inline" /> Aggregated, privacy-safe counters — cached for 60 seconds.
            No URLs or IPs are ever shown here.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
