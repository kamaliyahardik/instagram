import type { Platform } from "@/types/media";

export const PLATFORM_META: Record<
  Platform,
  { label: string; hosts: string[]; color: string; supports: string[] }
> = {
  instagram: {
    label: "Instagram",
    hosts: ["instagram.com", "instagr.am"],
    color: "#E1306C",
    supports: ["Reels", "Posts", "Images", "Carousels"],
  },
  youtube: {
    label: "YouTube",
    hosts: ["youtube.com", "youtu.be", "music.youtube.com"],
    color: "#FF0000",
    supports: ["Videos", "Shorts", "Audio"],
  },
  facebook: {
    label: "Facebook",
    hosts: ["facebook.com", "fb.watch", "fb.com"],
    color: "#0866FF",
    supports: ["Public videos", "Watch", "Posts"],
  },
  pinterest: {
    label: "Pinterest",
    hosts: ["pinterest.com", "pin.it"],
    color: "#BD081C",
    supports: ["Pins", "Videos", "Images"],
  },
  vimeo: {
    label: "Vimeo",
    hosts: ["vimeo.com"],
    color: "#1AB7EA",
    supports: ["Videos", "Clips"],
  },
};

export function detectPlatform(raw: string): Platform | null {
  let host = "";
  try {
    host = new URL(raw.trim()).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  for (const [key, meta] of Object.entries(PLATFORM_META) as [
    Platform,
    (typeof PLATFORM_META)[Platform],
  ][]) {
    if (meta.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return key;
  }
  return null;
}
