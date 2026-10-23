import type { MediaResult } from "@/types/media";

// Optional Cobalt-compatible resolver (self-hosted).
// Set COBALT_API_URL to the FULL endpoint of your instance, e.g.
//   classic: https://co.example.com/api/getMedia
//   new:     https://co.example.com/api
// and optionally COBALT_API_KEY. Response shapes from both generations
// are parsed tolerantly — anything unexpected returns null so the
// adapter falls back to metadata instead of crashing.
const TIMEOUT_MS = 25000;

type CobaltResponse = {
  status?: string;
  url?: string;
  filename?: string;
  type?: string;
  text?: string;
  error?: unknown;
  picker?: { url?: string; type?: string; thumb?: string }[];
  tunnel?: string[];
  output?: { type?: string; filename?: string };
};

export function cobaltConfigured(): boolean {
  return Boolean(process.env.COBALT_API_URL?.trim());
}

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];
const AUDIO_EXTS = ["mp3", "m4a", "opus", "ogg", "wav", "weba"];

export async function cobaltResolve(
  sourceUrl: string,
  platform: MediaResult["platform"],
  mode: "auto" | "audio" = "auto",
): Promise<MediaResult | null> {
  const endpoint = process.env.COBALT_API_URL?.trim();
  if (!endpoint) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.COBALT_API_KEY
          ? { Authorization: `Api-Key ${process.env.COBALT_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(
        mode === "audio"
          ? { url: sourceUrl, downloadMode: "audio", audioFormat: "mp3", audioBitrate: "320", filenameStyle: "basic" }
          : { url: sourceUrl, downloadMode: "auto", filenameStyle: "basic" },
      ),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as CobaltResponse;
    if (!j || j.status === "error" || j.error) return null;

    const media: MediaResult["media"] = [];
    const push = (
      u: string | undefined,
      type: string | undefined,
      i: number,
      thumb?: string,
      filename?: string,
    ) => {
      if (!u || !/^https?:\/\//.test(u)) return;
      const ext = extFrom(filename ?? u);
      // Prefer explicit mime; fall back to extension when cobalt's tunnels
      // (which carry no mime in the response) are classified correctly.
      let kind: MediaResult["media"][number]["type"] = "video";
      if (type === "photo" || type === "image" || mimeKind(type) === "image") kind = "image";
      else if (ext && IMAGE_EXTS.includes(ext)) kind = "image";
      else if (ext && AUDIO_EXTS.includes(ext)) kind = "audio";
      if (mode === "audio") {
        // Cobalt ignored downloadMode and returned a non-audio file — drop it
        // instead of mislabeling an image/stream as audio.
        if (!ext || !AUDIO_EXTS.includes(ext)) return;
        kind = "audio";
      }
      media.push({
        id: mode === "audio" ? `${platform}-audio-${i}` : `${platform}-cobalt-${i}`,
        type: kind,
        url: u,
        thumbnail: thumb,
        format: ext,
        quality: mode === "audio" ? "320kbps" : qualityFrom(filename),
      });
    };

    if (j.status === "picker" && Array.isArray(j.picker)) {
      j.picker.forEach((p, i) => push(p?.url, p?.type, i, p?.thumb));
    } else if (j.status === "local-processing" && Array.isArray(j.tunnel)) {
      // YouTube etc.: cobalt proxies/remuxes — tunnel URLs ARE the files.
      j.tunnel.forEach((u, i) => push(u, j.output?.type, i, undefined, j.output?.filename));
    } else if (j.url) {
      push(j.url, j.type, 0, undefined, j.filename);
    }
    if (!media.length) return null;
    return { platform, contentType: "video", title: j.filename, media };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extFrom(u: string): string | undefined {
  const m = u.match(/\.(mp4|webm|mkv|mov|m4a|mp3|ogg|opus|wav|jpg|jpeg|png|webp|gif)(\?|#|$)/i);
  return m?.[1]?.toLowerCase();
}

function mimeKind(t: string | undefined): string | undefined {
  if (!t) return undefined;
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/") || t.startsWith("audio/")) return "video";
  return t;
}

function qualityFrom(filename: string | undefined): string | undefined {
  const m = filename?.match(/(2160p|1440p|1080p|720p|480p|360p|max)/i);
  return m?.[1]?.toLowerCase();
}
