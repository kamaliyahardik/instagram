// Canonical public URL of the site. Used by sitemap, robots, metadata and
// JSON-LD so nothing ever falls back to a localhost URL in production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://fetchmedia.hardikkamaliya.online";
