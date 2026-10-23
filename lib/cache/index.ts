import type { MediaResult } from "@/types/media";

// Tiny in-process TTL cache for resolver metadata. Short TTLs only —
// source media URLs expire quickly. Use Redis/Upstash for shared cache.
const cache = new Map<string, { at: number; data: MediaResult }>();
const TTL_MS = 5 * 60 * 1000;

export function cacheGet(url: string): (MediaResult & { cached: true }) | null {
  const hit = cache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(url);
    return null;
  }
  return { ...hit.data, cached: true };
}

export function cacheSet(url: string, data: MediaResult): void {
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  cache.set(url, { at: Date.now(), data });
}
