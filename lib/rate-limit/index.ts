// In-memory sliding-window limiter (per-instance). Swap with Upstash Redis
// in production multi-instance deployments — same interface.
type Bucket = { hits: number[] };
const store = new Map<string, Bucket>();

const LIMITS = {
  guest: Number(process.env.RATE_LIMIT_GUEST_PER_HOUR ?? 20),
  user: Number(process.env.RATE_LIMIT_USER_PER_HOUR ?? 200),
  admin: Number(process.env.RATE_LIMIT_ADMIN_PER_HOUR ?? 2000),
};

export function rateLimit(key: string, tier: keyof typeof LIMITS = "guest"): { ok: boolean; remaining: number; resetMs: number } {
  const limit = LIMITS[tier];
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const b = store.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) {
    const resetMs = windowMs - (now - b.hits[0]);
    store.set(key, b);
    return { ok: false, remaining: 0, resetMs };
  }
  b.hits.push(now);
  store.set(key, b);
  return { ok: true, remaining: limit - b.hits.length, resetMs: windowMs };
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
