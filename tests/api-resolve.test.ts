import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/media/resolve/route";

function req(url: string) {
  return new NextRequest("http://localhost:3100/api/media/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

describe("POST /api/media/resolve", () => {
  it("rejects unsupported platforms", async () => {
    const res = await POST(req("https://evil.com/steal"));
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.success).toBe(false);
    expect(j.code).toBe("UNSUPPORTED_PLATFORM");
  });

  it("rejects malformed urls", async () => {
    const res = await POST(req("not a url"));
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.success).toBe(false);
    expect(j.code).toBe("INVALID_URL");
  });

  it("blocks SSRF targets", async () => {
    const res = await POST(req("http://169.254.169.254/latest"));
    expect(res.status).toBe(400);
  });

  it("resolves a supported pinterest link offline (metadata fallback)", async () => {
    const res = await POST(req("https://www.pinterest.com/pin/123456789/"));
    const j = await res.json();
    expect(j.success).toBe(true);
    expect(j.platform).toBe("pinterest");
    expect(Array.isArray(j.media)).toBe(true);
  });
});
