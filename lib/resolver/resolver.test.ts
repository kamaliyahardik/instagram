import { describe, expect, it } from "vitest";
import { detectPlatform } from "@/lib/resolver/detector";
import { validateMediaUrl } from "@/lib/validation/url";
import { getAdapter } from "@/lib/resolver/manager";

describe("platform detection", () => {
  const cases: [string, string | null][] = [
    ["https://www.instagram.com/reel/ABC123/", "instagram"],
    ["https://instagram.com/p/xyz/", "instagram"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube"],
    ["https://youtu.be/dQw4w9WgXcQ", "youtube"],
    ["https://youtube.com/shorts/abc", "youtube"],
    ["https://www.facebook.com/watch/?v=123", "facebook"],
    ["https://fb.watch/abc/", "facebook"],
    ["https://www.pinterest.com/pin/123/", "pinterest"],
    ["https://vimeo.com/123456/", "vimeo"],
    ["https://evil.com/steal", null],
    ["not a url", null],
  ];
  for (const [url, expected] of cases) {
    it(`detects ${url} → ${expected}`, () => {
      expect(detectPlatform(url)).toBe(expected);
    });
  }
});

describe("url validation + SSRF guards", () => {
  it("rejects metadata + private hosts", () => {
    expect(validateMediaUrl("http://169.254.169.254/latest").ok).toBe(false);
    expect(validateMediaUrl("http://localhost:3000/x").ok).toBe(false);
    expect(validateMediaUrl("ftp://x.com/a").ok).toBe(false);
  });
  it("accepts supported public links", () => {
    expect(validateMediaUrl("https://www.instagram.com/reel/ABC/").ok).toBe(true);
  });
  it("rejects unsupported hosts", () => {
    const r = validateMediaUrl("https://evil.com/steal");
    expect(r.ok).toBe(false);
  });
});

describe("adapter isolation", () => {
  it("returns an adapter per tier-1 platform", () => {
    for (const u of [
      "https://www.instagram.com/reel/A/",
      "https://www.youtube.com/watch?v=x",
      "https://fb.watch/x",
      "https://www.pinterest.com/pin/1/",
      "https://vimeo.com/123456/",
    ]) {
      expect(getAdapter(u)).not.toBeNull();
    }
  });
  it("returns null for unknown hosts", () => {
    expect(getAdapter("https://evil.com/x")).toBeNull();
  });
});
