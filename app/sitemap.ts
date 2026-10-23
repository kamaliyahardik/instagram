import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const slugs: Array<[string, number]> = [
    ["", 1],
    ["/all-platforms", 0.9],
    ["/guides", 0.8],
    ["/guides/how-to-download-instagram-reels", 0.7],
    ["/guides/how-to-download-instagram-photos", 0.7],
    ["/guides/how-to-download-facebook-video-hd", 0.7],
    ["/guides/how-to-save-pinterest-videos-and-images", 0.7],
    ["/guides/how-to-download-vimeo-videos", 0.7],
    ["/instagram-downloader", 0.9],
    ["/instagram-reels-downloader", 0.8],
    ["/instagram-photo-downloader", 0.8],
    ["/youtube-downloader", 0.9],
    ["/facebook-downloader", 0.9],
    ["/facebook-video-downloader", 0.8],
    ["/pinterest-downloader", 0.9],
    ["/pinterest-video-downloader", 0.8],
    ["/pinterest-photo-downloader", 0.8],
    ["/vimeo-downloader", 0.9],
    ["/vimeo-video-downloader", 0.8],
    ["/about", 0.5],
    ["/status", 0.4],
    ["/privacy", 0.3],
    ["/terms", 0.3],
    ["/copyright", 0.3],
    ["/contact", 0.3],
  ];
  return slugs.map(([s, priority]) => ({
    url: `${base}${s}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
