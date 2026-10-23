import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/media/download/route";

function req(query: string) {
  return new NextRequest(`http://localhost:3100/api/media/download${query}`);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/media/download", () => {
  it("rejects garbage urls", async () => {
    const res = await GET(req("?url=not-a-url"));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("INVALID_URL");
  });

  it("blocks SSRF targets", async () => {
    const res = await GET(req("?url=http://169.254.169.254/x"));
    expect(res.status).toBe(400);
  });

  it("blocks localhost unless it is our own cobalt resolver", async () => {
    const res = await GET(req("?url=http://localhost:9000/tunnel?id=x"));
    expect(res.status).toBe(400);
  });

  it("allows tunnel urls from our own cobalt resolver", async () => {
    process.env.COBALT_API_URL = "http://localhost:9000";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("bytes", {
            status: 200,
            headers: { "content-type": "video/mp4", "content-length": "5" },
          }),
      ),
    );
    try {
      const res = await GET(req("?url=http://localhost:9000/tunnel?id=x&filename=a.mp4"));
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("video/mp4");
    } finally {
      delete process.env.COBALT_API_URL;
    }
  });

  it("streams media with safe attachment headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("bytes", {
            status: 200,
            headers: { "content-type": "image/jpeg", "content-length": "5" },
          }),
      ),
    );
    const res = await GET(req("?url=https://cdn.example/a.jpg&filename=pic"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("content-disposition")).toContain('filename="pic"');
  });

  it("rejects non-media mime types", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("<html></html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
      ),
    );
    const res = await GET(req("?url=https://cdn.example/a"));
    expect(res.status).toBe(415);
  });

  it("rejects empty upstream files instead of saving 0-byte garbage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("", {
            status: 200,
            headers: { "content-type": "video/mp4", "content-length": "0" },
          }),
      ),
    );
    const res = await GET(req("?url=https://cdn.example/a.mp4"));
    expect(res.status).toBe(502);
    expect((await res.json()).code).toBe("UNAVAILABLE");
  });
  it("maps upstream failure to 502 JSON (client shows text, not garbage file)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 404 })),
    );
    const res = await GET(req("?url=https://cdn.example/a.mp4"));
    expect(res.status).toBe(502);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
