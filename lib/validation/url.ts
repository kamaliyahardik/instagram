import { z } from "zod";
import { detectPlatform } from "@/lib/resolver/detector";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // cloud metadata — SSRF
  "metadata.google.internal",
]);

export const resolveSchema = z.object({
  url: z.string().trim().min(8).max(2048).url(),
});

// Users paste messy clipboard text: surrounding quotes, chat text around
// the link, a missing https:// scheme — or even two links glued together.
// Normalize: collect every URL-ish candidate, prefer the first one whose
// host is a supported platform.
export function extractUrl(raw: string): string {
  const clean = (s: string) =>
    s
      .trim()
      .replace(/^["'“”‘’<({\[]+|["'“”‘’>)}\]\s.,;:!?]+$/g, "")
      .trim()
      .replace(/[.,;:!?)\]]+$/, "");

  const withScheme = (s: string) =>
    /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(s) && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)
      ? "https://" + s
      : s;

  const candidates: string[] = [];
  const push = (s: string) => {
    const c = withScheme(clean(s));
    if (c && !candidates.includes(c)) candidates.push(c);
  };

  push(raw);
  // Split on every embedded scheme — catches "https://ahttps://b/…" glue.
  for (const part of raw.split(/(?=https?:\/\/)/i)) {
    push(part.split(/\s+/)[0] ?? "");
  }
  // Last resort: first http(s) token inside surrounding chat text.
  const m = raw.match(/https?:\/\/[^\s"'“”‘’<>()[\]{}]+/i);
  if (m) push(m[0]);

  for (const c of candidates) {
    if (detectPlatform(c)) return c;
  }
  return candidates[0] ?? raw.trim();
}

export function validateMediaUrl(
  raw: string,
): { ok: true; platform: string; url: string } | { ok: false; error: string; code: string } {
  const normalized = extractUrl(raw);
  const parsed = resolveSchema.safeParse({ url: normalized });
  if (!parsed.success) return { ok: false, error: "That doesn't look like a supported media link.", code: "INVALID_URL" };
  let u: URL;
  try {
    u = new URL(parsed.data.url);
  } catch {
    return { ok: false, error: "That doesn't look like a supported media link.", code: "INVALID_URL" };
  }
  if (!["http:", "https:"].includes(u.protocol))
    return { ok: false, error: "Only public http(s) links are supported.", code: "INVALID_URL" };
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".internal") || host.endsWith(".local"))
    return { ok: false, error: "That URL target is not allowed.", code: "INVALID_URL" };
  // Private IPs (basic check)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host))
    return { ok: false, error: "That URL target is not allowed.", code: "INVALID_URL" };
  const platform = detectPlatform(parsed.data.url);
  if (!platform) return { ok: false, error: "We don't support this platform yet.", code: "UNSUPPORTED_PLATFORM" };
  return { ok: true, platform, url: parsed.data.url };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "media";
}
