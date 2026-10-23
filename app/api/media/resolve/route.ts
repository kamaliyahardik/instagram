import { NextRequest, NextResponse } from "next/server";
import { resolveMedia, ResolverError } from "@/lib/resolver/manager";
import { validateMediaUrl } from "@/lib/validation/url";
import { cacheGet, cacheSet } from "@/lib/cache";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    return await handleResolve(req);
  } catch (e) {
    // Last-resort guard: client must ALWAYS get JSON, never a plain-text
    // "Internal Server Error" that breaks res.json(). Real cause goes to terminal.
    console.error("[resolve] unhandled:", e);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again.", code: "RESOLVER_FAILED" },
      { status: 500 },
    );
  }
}

async function handleResolve(req: NextRequest) {
  const started = Date.now();
  const ip = clientIp(req.headers);
  const rl = rateLimit(`resolve:${ip}`, "guest");
  if (!rl.ok)
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      { status: 429 },
    );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body.", code: "INVALID_URL" },
      { status: 400 },
    );
  }
  const input = (body as { url?: string })?.url?.trim() ?? "";
  const v = validateMediaUrl(input);
  if (!v.ok) return NextResponse.json({ success: false, ...v }, { status: 400 });
  const url = v.url;

  const cached = cacheGet(url);
  if (cached) return NextResponse.json({ success: true, ...cached });

  try {
    const result = await resolveMedia(url);
    cacheSet(url, result);
    // Fire-and-forget analytics (never blocks response)
    logUsage(ip, result.platform, "resolve", "ok", Date.now() - started).catch(() => {});
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const code = e instanceof ResolverError ? e.code : "RESOLVER_FAILED";
    const status = code === "UNSUPPORTED_PLATFORM" ? 400 : code === "INVALID_URL" ? 400 : 502;
    const message =
      e instanceof Error ? e.message : "Something went wrong. Please try again.";
    logUsage(ip, "unknown", "resolve", "error", Date.now() - started).catch(() => {});
    return NextResponse.json({ success: false, error: message, code }, { status });
  }
}

async function logUsage(
  ip: string, platform: string, requestType: string, status: string, responseTime: number,
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const { supabaseAdmin } = await import("@/lib/supabase/client");
    const db = supabaseAdmin();
    const { createHash } = await import("crypto");
    const ip_hash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
    await db.from("api_usage").insert({
      ip_hash, platform, request_type: requestType, status, response_time: responseTime,
    });
  } catch (e) {
    console.error("[analytics] logUsage failed (non-fatal):", e);
  }
}
