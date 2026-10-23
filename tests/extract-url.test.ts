import { describe, expect, it } from "vitest";
import { extractUrl, validateMediaUrl } from "@/lib/validation/url";

describe("extractUrl", () => {
  const cases: [string, string][] = [
    ["https://www.youtube.com/watch?v=x", "https://www.youtube.com/watch?v=x"],
    ['"https://www.youtube.com/watch?v=x"', "https://www.youtube.com/watch?v=x"],
    ["  https://youtu.be/x  ", "https://youtu.be/x"],
    ["youtube.com/watch?v=x", "https://youtube.com/watch?v=x"],
    ["instagram.com/reel/ABC/", "https://instagram.com/reel/ABC/"],
    [
      "Check this out https://vimeo.com/123456 so good",
      "https://vimeo.com/123456",
    ],
    ["(https://fb.watch/abc)", "https://fb.watch/abc"],
    [
      "https://www.youtuhttps://www.youtube.com/watch?v=abc&utm_source=copy&r=1be.com/watch?v=xyz",
      "https://www.youtube.com/watch?v=abc&utm_source=copy&r=1be.com/watch?v=xyz",
    ],
  ];
  for (const [raw, expected] of cases) {
    it(`normalizes ${raw}`, () => {
      expect(extractUrl(raw)).toBe(expected);
    });
  }
});

describe("validateMediaUrl with messy input", () => {
  it("accepts quoted / scheme-less / text-wrapped links", () => {
    expect(validateMediaUrl('"https://youtu.be/x"').ok).toBe(true);
    expect(validateMediaUrl("youtube.com/watch?v=x").ok).toBe(true);
    expect(validateMediaUrl("seen https://vimeo.com/489 wow").ok).toBe(true);
  });
  it("still rejects garbage + blocked hosts", () => {
    expect(validateMediaUrl("hello world").ok).toBe(false);
    expect(validateMediaUrl("http://169.254.169.254/x").ok).toBe(false);
    expect(validateMediaUrl("https://evil.com/x").ok).toBe(false);
  });
});
