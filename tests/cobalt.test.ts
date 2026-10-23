import { afterEach, describe, expect, it, vi } from "vitest";
import { cobaltResolve } from "@/lib/resolver/cobalt";

const ENDPOINT = "https://co.example.com/api/getMedia";

function mockFetchOnce(json: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, json: async () => json }) as Response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.COBALT_API_URL;
  delete process.env.COBALT_API_KEY;
});

describe("cobaltResolve", () => {
  it("returns null when unconfigured (metadata fallback preserved)", async () => {
    const r = await cobaltResolve("https://www.pinterest.com/pin/1/", "pinterest");
    expect(r).toBeNull();
  });

  it("parses classic redirect shape", async () => {
    process.env.COBALT_API_URL = ENDPOINT;
    mockFetchOnce({ status: "redirect", url: "https://cdn.example/v.mp4" });
    const r = await cobaltResolve("https://www.pinterest.com/pin/1/", "pinterest");
    expect(r?.media).toHaveLength(1);
    expect(r?.media[0].url).toBe("https://cdn.example/v.mp4");
    expect(r?.media[0].format).toBe("mp4");
  });

  it("parses picker shape with mixed types", async () => {
    process.env.COBALT_API_URL = ENDPOINT;
    mockFetchOnce({
      status: "picker",
      picker: [
        { url: "https://cdn.example/a.mp4", type: "video" },
        { url: "https://cdn.example/b.jpg", type: "photo", thumb: "https://cdn.example/b.jpg" },
      ],
    });
    const r = await cobaltResolve("https://vimeo.com/123456/", "vimeo");
    expect(r?.media).toHaveLength(2);
    expect(r?.media[1].type).toBe("image");
  });

  it("parses local-processing tunnel arrays (youtube-style)", async () => {
    process.env.COBALT_API_URL = ENDPOINT;
    mockFetchOnce({
      status: "local-processing",
      service: "youtube",
      tunnel: ["https://co.example/tunnel?id=aaa", "https://co.example/tunnel?id=bbb"],
      output: { type: "video/mp4", filename: "youtube_dQw4_1080p_h264.mp4" },
    });
    const r = await cobaltResolve("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube");
    expect(r?.media).toHaveLength(2);
    expect(r?.media[0].format).toBe("mp4");
    expect(r?.media[0].quality).toBe("1080p");
  });
  it("returns null on error status / bad http / junk urls", async () => {
    process.env.COBALT_API_URL = ENDPOINT;
    mockFetchOnce({ status: "error", text: "nope" });
    expect(await cobaltResolve("https://vimeo.com/123456/", "vimeo")).toBeNull();

    mockFetchOnce({ status: "redirect", url: "ftp://evil/x" });
    expect(await cobaltResolve("https://vimeo.com/123456/", "vimeo")).toBeNull();

    mockFetchOnce({ nope: true }, false);
    expect(await cobaltResolve("https://vimeo.com/123456/", "vimeo")).toBeNull();
  });

  it("sends Api-Key header when configured", async () => {
    process.env.COBALT_API_URL = ENDPOINT;
    process.env.COBALT_API_KEY = "secret";
    const spy = vi.fn(
      async (_url: string, _init?: { headers?: Record<string, string> }) =>
        ({ ok: false, json: async () => ({}) }) as Response,
    );
    vi.stubGlobal("fetch", spy);
    await cobaltResolve("https://vimeo.com/123456/", "vimeo");
    const sent = spy.mock.calls[0]?.[1];
    expect(sent?.headers?.["Authorization"]).toBe("Api-Key secret");
  });
});
