import { NextResponse } from "next/server";

// Public, privacy-safe aggregates for the dashboard + landing pulse band.
// No IPs, no URLs, no user ids — counts only. Cached 60s in-process.
type Stats = {
  success: true;
  total: number;
  successful: number;
  successRate: number;
  avgMs: number;
  perPlatform: { platform: string; count: number }[];
};

const EMPTY: Stats = {
  success: true,
  total: 0,
  successful: 0,
  successRate: 0,
  avgMs: 0,
  perPlatform: [],
};

let cache: { at: number; data: Stats } | null = null;
const TTL = 60_000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL)
    return NextResponse.json(cache.data);
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      cache = { at: Date.now(), data: EMPTY };
      return NextResponse.json(EMPTY);
    }
    const { supabaseAdmin } = await import("@/lib/supabase/client");
    const db = supabaseAdmin();
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const { data, error } = await db
      .from("api_usage")
      .select("platform,status,response_time")
      .gte("created_at", since)
      .limit(5000);
    if (error || !data) throw error ?? new Error("stats query failed");
    const total = data.length;
    const successful = data.filter((r) => r.status === "ok").length;
    const times = data.map((r) => r.response_time ?? 0).filter((n) => n > 0);
    const per = new Map<string, number>();
    for (const r of data) per.set(r.platform ?? "other", (per.get(r.platform ?? "other") ?? 0) + 1);
    const stats: Stats = {
      success: true,
      total,
      successful,
      successRate: total ? Math.round((successful / total) * 100) : 0,
      avgMs: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      perPlatform: [...per.entries()]
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    };
    cache = { at: Date.now(), data: stats };
    return NextResponse.json(stats);
  } catch (e) {
    console.error("[stats] failed (non-fatal):", e);
    return NextResponse.json(EMPTY);
  }
}
