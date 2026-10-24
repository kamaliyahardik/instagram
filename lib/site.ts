// Canonical public URL of the site. Used by sitemap, robots, metadata and
// JSON-LD so nothing ever falls back to a localhost URL in production.
const FALLBACK = "https://fetchmedia.hardikkamaliya.online";

// Ignore localhost / 127.0.0.1 values — they are a dev leftover (e.g. a stale
// NEXT_PUBLIC_APP_URL on the host) and would poison the sitemap and canonicals.
function publicBaseUrl(raw: string | undefined): string {
  if (raw && /^https?:\/\//i.test(raw) && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  return FALLBACK;
}

export const SITE_URL = publicBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
