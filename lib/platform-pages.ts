import type { Platform } from "@/types/media";

// Company brand colors — shared by server pages (glow, text) and the
// client <PlatformTheme/> (CSS vars). Keep in one place.
export const BRAND_HEX: Record<Platform, string> = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  facebook: "#0866FF",
  pinterest: "#BD081C",
  vimeo: "#1AB7EA",
};

export function brandColor(platform: string): string {
  return (BRAND_HEX as Record<string, string>)[platform] ?? "#E7E9EA";
}

export type PlatformPageContent = {
  tagline: string;
  about: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  sample: string;
};

export const PLATFORM_SLUGS: Record<string, Platform> = {
  "instagram-downloader": "instagram",
  "instagram-reels-downloader": "instagram",
  "instagram-photo-downloader": "instagram",
  "youtube-downloader": "youtube",
  "facebook-downloader": "facebook",
  "facebook-video-downloader": "facebook",
  "pinterest-downloader": "pinterest",
  "pinterest-video-downloader": "pinterest",
  "pinterest-photo-downloader": "pinterest",
  "vimeo-downloader": "vimeo",
  "vimeo-video-downloader": "vimeo",
};

// Exact-match SEO titles per slug (long-tail keyword pages all share the
// per-platform content, these override the <title> / og:title / h1 lead-in).
export const SLUG_TITLES: Record<string, string> = {
  "instagram-downloader": "Instagram Downloader — Save Reels, Posts & Photos",
  "instagram-reels-downloader": "Instagram Reels Downloader — Save Reels as MP4",
  "instagram-photo-downloader": "Instagram Photo Downloader — Save IG Photos & Carousels",
  "youtube-downloader": "YouTube Downloader — Videos & Shorts",
  "facebook-downloader": "Facebook Video Downloader — Watch Clips & Posts",
  "facebook-video-downloader": "Facebook Video Downloader — Save FB Videos",
  "pinterest-downloader": "Pinterest Downloader — Save Pins, Photos & Videos",
  "pinterest-video-downloader": "Pinterest Video Downloader — Save Pin Videos",
  "pinterest-photo-downloader": "Pinterest Photo Downloader — Save Pin Images",
  "vimeo-downloader": "Vimeo Downloader — Save Videos in Original Quality",
  "vimeo-video-downloader": "Vimeo Video Downloader — Save Vimeo Clips",
};

export function slugTitle(slug: string, label: string): string {
  return SLUG_TITLES[slug] ?? `${label} Downloader`;
}

// Search terms these pages should surface for.
export function slugKeywords(slug: string, label: string): string[] {
  const k = SLUG_TITLES[slug];
  if (!k) return [`${label.toLowerCase()} downloader`];
  const base = k
    .replace(/[—\u2014]|fetchmedia.*$/gi, "")
    .split(/,\s*/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  return [...base, `${label.toLowerCase()} downloader`, "fetchmedia", "free online media downloader"];
}

export const PLATFORM_CONTENT: Record<Platform, PlatformPageContent> = {
  instagram: {
    tagline: "Reels, posts, carousels & photos — in seconds.",
    about: [
      "Paste any public Instagram link — a reel, a single photo post, or a multi-slide carousel — and FetchMedia detects the content type automatically. You get a clean preview with thumbnail, caption title and author before saving anything.",
      "Carousel posts are expanded into individual downloadable items, so you can save the whole set or just the slides you want. Only publicly visible posts work; private or login-walled content is never accessed.",
    ],
    tips: [
      "Use the share → copy link button inside Instagram for the cleanest URL.",
      "Carousel links (/p/…) may contain up to 10 slides — each appears as its own item.",
      "Reels are vertical video — pick the highest quality your connection allows.",
      "If a post was deleted or made private, the resolver will tell you it is unavailable.",
    ],
    faqs: [
      { q: "Can I download Instagram reels?", a: "Yes — public reels are fully supported with preview, and available video formats are listed after resolving." },
      { q: "Do carousel posts work?", a: "Yes. Every slide in a public carousel is expanded into its own downloadable item." },
      { q: "What about private accounts?", a: "Private or followers-only content is not supported and is never accessed." },
    ],
    sample: "https://www.instagram.com/reel/ABC123/",
  },
  youtube: {
    tagline: "Videos & Shorts — preview first, save fast.",
    about: [
      "Drop in any public YouTube watch link, Shorts link or shortened youtu.be URL. FetchMedia pulls the title, channel name and thumbnail instantly so you always know what you are saving.",
      "Available formats depend on the source video and the connected resolver — the page only ever lists qualities that genuinely exist for that video. Audio-only options appear wherever the integration provides them.",
    ],
    tips: [
      "Shorts links (/shorts/…) and youtu.be links resolve exactly like watch links.",
      "Age-restricted, private or deleted videos cannot be resolved.",
      "Only save videos you own, that are licensed to you, or where the creator permits it.",
      "Connect a Cobalt instance via COBALT_API_URL to unlock direct HD file downloads.",
    ],
    faqs: [
      { q: "Are YouTube Shorts supported?", a: "Yes — /shorts/ links, youtu.be links and full watch URLs all resolve the same way." },
      { q: "Which qualities will I see?", a: "Only qualities the resolver actually returns for that video. Nothing is invented or upscaled." },
      { q: "Can I get audio only?", a: "Where the integration exposes an audio stream, it appears as a separate download option." },
    ],
    sample: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  facebook: {
    tagline: "Public videos, Watch clips & posts.",
    about: [
      "Paste a public Facebook video, Watch or fb.watch link and FetchMedia resolves whatever the public page exposes — with a preview before you commit to a download.",
      "Group-only, friends-only or otherwise restricted posts cannot be accessed. If the content is not publicly visible in a logged-out browser, the resolver reports it as unavailable.",
    ],
    tips: [
      "fb.watch short links work the same as full facebook.com links.",
      "Live videos must finish streaming before they can be resolved.",
      "If the post audience is friends-only, it will correctly show as unavailable.",
      "Public Page videos resolve most reliably.",
    ],
    faqs: [
      { q: "Do fb.watch links work?", a: "Yes — short fb.watch links resolve exactly like full facebook.com URLs." },
      { q: "Why does my link show as unavailable?", a: "The post is almost certainly not public — friends-only, group-only or deleted content cannot be accessed." },
      { q: "Are live streams supported?", a: "Only after the stream ends and Facebook publishes the replay." },
    ],
    sample: "https://fb.watch/abc123/",
  },
  pinterest: {
    tagline: "Pins, videos & idea pins.",
    about: [
      "Paste a public pin or pin.it short link to preview the pin's image or video with its title before downloading.",
      "Secret boards and login-walled content are out of scope — public pins only.",
    ],
    tips: [
      "pin.it short links resolve like full pinterest.com links.",
      "Video pins expose the video file where the integration provides it.",
      "Secret-board pins will show as unavailable.",
      "Save the highest resolution the pin exposes — quality varies by upload.",
    ],
    faqs: [
      { q: "Do pin.it links work?", a: "Yes — short pin.it links resolve exactly like full pin URLs." },
      { q: "Are video pins supported?", a: "Where the pin exposes a video file, it appears as a download option." },
      { q: "What about secret boards?", a: "Login-walled and secret content is never accessed." },
    ],
    sample: "https://www.pinterest.com/pin/123456789/",
  },
  vimeo: {
    tagline: "Vimeo videos & clips in original quality.",
    about: [
      "Vimeo links resolve through Vimeo's public oEmbed plus the connected resolver, giving you title, author, thumbnail and downloadable files.",
      "Password-protected, private or domain-restricted videos cannot be accessed.",
    ],
    tips: [
      "Public and unlisted (link-only) videos both resolve.",
      "Vimeo often hosts the highest-quality source of the bunch — pick top quality.",
      "Password or domain-locked videos show as unavailable.",
      "Staff picks and public showcases work out of the box.",
    ],
    faqs: [
      { q: "Do unlisted Vimeo links work?", a: "Yes — link-only videos resolve like public ones." },
      { q: "What quality can I get?", a: "Whatever the source and resolver expose — Vimeo sources are often very high quality." },
      { q: "What about private videos?", a: "Password, private or domain-restricted videos are never accessed." },
    ],
    sample: "https://vimeo.com/123456789/",
  },
};
