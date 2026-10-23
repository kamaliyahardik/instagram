import type { MediaResult, PlatformAdapter } from "@/types/media";
import { cobaltResolve } from "@/lib/resolver/cobalt";

async function oembed(
  endpoint: string,
  url: string,
  platform: MediaResult["platform"],
  contentType: MediaResult["contentType"],
): Promise<MediaResult | null> {
  try {
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}&format=json`, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "UMD/1.0 (+https://umd.app)" },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return {
      platform,
      contentType,
      title: j.title ?? undefined,
      thumbnail: j.thumbnail_url ?? undefined,
      author: { name: j.author_name ?? undefined },
      media: j.thumbnail_url
        ? [
            {
              id: `${platform}-preview`,
              type: "image",
              url: j.thumbnail_url,
              thumbnail: j.thumbnail_url,
              width: j.thumbnail_width,
              height: j.thumbnail_height,
            },
          ]
        : [],
    };
  } catch {
    return null;
  }
}

function cobaltFallback(_url: string, platform: MediaResult["platform"]): MediaResult {
  // No direct files available — return metadata shell so the UI can still
  // preview + guide the user. No fake qualities invented.
  return {
    platform,
    contentType: "video",
    title: "Public media",
    media: [],
  };
}

const make =
  (
    platform: MediaResult["platform"],
    match: RegExp,
    contentType: MediaResult["contentType"],
    oembedEndpoint?: string,
  ): PlatformAdapter => ({
    platform,
    canHandle: (u: string) => match.test(u),
    async resolve(url: string): Promise<MediaResult> {
      // Real files first (Cobalt, when configured): video/auto pass plus an
      // audio pass in parallel (mp3), with metadata alongside. Either may
      // be absent — merge whatever exists, never invent.
      const [cobalt, audio, meta] = await Promise.all([
        cobaltResolve(url, platform),
        cobaltResolve(url, platform, "audio"),
        oembedEndpoint ? oembed(oembedEndpoint, url, platform, contentType) : Promise.resolve(null),
      ]);
      const merged: MediaResult["media"] = [
        ...(cobalt?.media ?? []),
        ...(audio?.media ?? []),
      ];
      // Always offer the cover/thumbnail as its own downloadable image when
      // the resolve didn't already return an image (posters, previews).
      const thumb = coverThumb(platform, url, meta?.thumbnail ?? cobalt?.media[0]?.thumbnail ?? audio?.media[0]?.thumbnail);
      if (thumb && !merged.some((m) => m.type === "image" && m.url)) {
        merged.push({
          id: `${platform}-cover`,
          type: "image",
          url: thumb,
          thumbnail: thumb,
          quality: "cover",
          format: "jpg",
        });
      }
      if (merged.length) {
        return {
          platform,
          contentType,
          title: meta?.title ?? cobalt?.title ?? audio?.title ?? "Public media",
          thumbnail: cobalt?.media.length
            ? (meta?.thumbnail ?? cobalt.media[0]?.thumbnail ?? thumb)
            : (meta?.thumbnail ?? audio?.media[0]?.thumbnail ?? thumb),
          author: meta?.author,
          media: merged,
        };
      }
      if (meta && (meta.media.length || meta.title)) return meta;
      return { ...cobaltFallback(url, platform), contentType, thumbnail: thumb };
    },
  });

// Best-effort cover image per platform. YouTube is fully derivable from the
// URL itself (highest-quality maxres from i.ytimg.com); everywhere else we
// use the thumbnail the oEmbed/metadata pass returned, if any.
function coverThumb(
  platform: MediaResult["platform"],
  url: string,
  fallback?: string,
): string | undefined {
  if (platform === "youtube") {
    const id = url.match(/(?:v=|shorts\/|live\/|embed\/|youtu\.be\/)([\w-]{11})/)?.[1];
    if (id) return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  }
  return fallback && /^https?:\/\//.test(fallback) ? fallback : undefined;
}

export const instagramAdapter = make(
  "instagram", /instagram\.com\/(p|reel|reels|tv)\//i, "reel",
);
export const youtubeAdapter = make(
  "youtube", /(youtube\.com\/(watch|shorts|live)|youtu\.be\/)/i, "video",
  "https://www.youtube.com/oembed",
);
export const facebookAdapter = make(
  "facebook", /(facebook\.com|fb\.watch|fb\.com)\//i, "video",
);
export const pinterestAdapter = make("pinterest", /pinterest\.com|pin\.it/i, "image");
export const vimeoAdapter = make(
  "vimeo", /vimeo\.com\//i, "video", "https://vimeo.com/api/oembed.json",
);
