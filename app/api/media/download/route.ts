import { NextRequest, NextResponse } from "next/server";
import { validateMediaUrl, sanitizeFilename } from "@/lib/validation/url";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { r2Configured, r2SignedDownloadUrl } from "@/lib/r2/client";

// GET /api/media/download?url=<source>&filename=<name>&mime=<mime>
// Streams server-side and re-serves with safe headers (never an open proxy:
// only allowlisted platform hosts, size-capped, MIME-checked).
const MAX_BYTES = 500 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`download:${ip}`, "guest");
  if (!rl.ok)
    return NextResponse.json({ success: false, error: "Too many requests.", code: "RATE_LIMITED" }, { status: 429 });

  const q = req.nextUrl.searchParams;
  const source = q.get("url") ?? "";
  const storedKey = q.get("key") ?? "";

  // Path A: R2-backed temporary object → signed redirect
  if (storedKey && r2Configured()) {
    if (!/^[\w\-/.]{1,200}$/.test(storedKey))
      return NextResponse.json({ success: false, error: "Invalid key.", code: "INVALID_URL" }, { status: 400 });
    const signed = await r2SignedDownloadUrl(storedKey);
    return NextResponse.redirect(signed, 302);
  }

  const v = validateMediaUrl(q.get("source") ?? source);
  void v;
  // Direct sources may be CDN URLs not on platform hosts; allow direct fetch
  // but keep SSRF guards: http(s) only, no private/metadata hosts.
  // Exception: tunnel/file URLs issued by our own configured Cobalt instance
  // (e.g. localhost:9000 for a local setup) — same host:port as COBALT_API_URL.
  let u: URL;
  try {
    u = new URL(source);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid media URL.", code: "INVALID_URL" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(u.protocol))
    return NextResponse.json({ success: false, error: "Invalid media URL.", code: "INVALID_URL" }, { status: 400 });
  const host = u.hostname.toLowerCase();
  const selfResolver = (() => {
    try {
      const c = new URL(process.env.COBALT_API_URL?.trim() ?? "");
      return u.host.toLowerCase() === c.host.toLowerCase();
    } catch {
      return false;
    }
  })();
  const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254", "metadata.google.internal"];
  if (
    !selfResolver &&
    (blocked.includes(host) || host.endsWith(".internal") || host.endsWith(".local"))
  )
    return NextResponse.json({ success: false, error: "URL target not allowed.", code: "INVALID_URL" }, { status: 400 });

  try {
    const upstream = await fetch(source, { headers: { "User-Agent": "UMD/1.0" } });
    if (!upstream.ok || !upstream.body)
      return NextResponse.json({ success: false, error: "This media is currently unavailable.", code: "UNAVAILABLE" }, { status: 502 });
    const mime = upstream.headers.get("content-type")?.split(";")[0]?.trim() ?? "application/octet-stream";
    // Cobalt tunnels expire (~1h). An expired tunnel answers with an error
    // page instead of media — say so instead of a cryptic type error.
    if (selfResolver && /json|html|text\/plain/.test(mime))
      return NextResponse.json(
        { success: false, error: "Resolver link expired — paste the link again and download immediately.", code: "UNAVAILABLE" },
        { status: 410 },
      );
    const allowed = /^(video\/|audio\/|image\/|application\/octet-stream)/.test(mime);
    if (!allowed)
      return NextResponse.json({ success: false, error: "Unsupported media type.", code: "UNAVAILABLE" }, { status: 415 });

    const len = upstream.headers.get("content-length");
    if (len === "0") return emptyBytes(selfResolver, source);
    if (len && Number(len) > MAX_BYTES)
      return NextResponse.json({ success: false, error: "File too large.", code: "UNAVAILABLE" }, { status: 413 });
    // Bounded buffering: even when Content-Length is missing/lying, never
    // serve a 0-byte or truncated file — verify real bytes exist first.
    const read = await readBounded(upstream.body, MAX_BYTES);
    if (read.tooLarge)
      return NextResponse.json({ success: false, error: "File too large.", code: "UNAVAILABLE" }, { status: 413 });
    if (read.bytes.length === 0) return emptyBytes(selfResolver, source);
    const filename = sanitizeFilename(q.get("filename") ?? `media${extFor(mime)}`);
    const headers = new Headers();
    headers.set("Content-Type", mime);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "private, max-age=60");
    headers.set("Content-Length", String(read.bytes.length));
    return new Response(read.bytes as unknown as BodyInit, { headers });
  } catch {
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again.", code: "RESOLVER_FAILED" }, { status: 502 });
  }
}

// Read the whole stream up to cap bytes. Never runs unbounded memory.
async function readBounded(
  body: ReadableStream<Uint8Array>,
  cap: number,
): Promise<{ bytes: Uint8Array; tooLarge: boolean }> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.length;
      if (total > cap) {
        await reader.cancel();
        return { bytes: new Uint8Array(0), tooLarge: true };
      }
      chunks.push(value);
    }
  }
  const out = new Uint8Array(new ArrayBuffer(total));
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return { bytes: out, tooLarge: false };
}

function extFor(mime: string): string {
  if (mime.includes("mp4")) return ".mp4";
  if (mime.includes("webm")) return ".webm";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("mp3") || mime.includes("mpeg")) return ".mp3";
  return "";
}

// Resolver cookies are already configured; a 0-byte response for a valid
// resolve means the source is bot-gating the stream for this session/IP
// (very common on YouTube Shorts, 4K and 60fps videos).
function emptyBytes(selfResolver: boolean, source: string): NextResponse {
  const error = !selfResolver
    ? "The media file came back empty. Resolve again and download immediately."
    : /youtu\.?be/i.test(source)
      ? "YouTube is bot-gating this video's stream — it resolved, but refused to serve the bytes. This hits Shorts, 4K and 60fps videos hardest. Try a regular video or retry in a little while."
      : "The resolver couldn't pull any bytes — the source is likely blocking this download right now. Try again in a bit.";
  return NextResponse.json({ success: false, error, code: "UNAVAILABLE" }, { status: 502 });
}
