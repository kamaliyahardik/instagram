import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/stats/route";

describe("GET /api/stats", () => {
  it("returns privacy-safe aggregate shape", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.success).toBe(true);
    expect(typeof j.total).toBe("number");
    expect(typeof j.successRate).toBe("number");
    expect(Array.isArray(j.perPlatform)).toBe(true);
    expect(JSON.stringify(j)).not.toContain("ip_hash");
  });
});
