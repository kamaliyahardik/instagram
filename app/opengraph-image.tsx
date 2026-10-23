import { ImageResponse } from "next/og";

// Branded OpenGraph card generated at the root segment — every route
// (home, /instagram-downloader, …) inherits it for link previews.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FetchMedia — one link. Save anything.";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0c10 0%, #14161c 60%, #1a0f1a 100%)",
          color: "#f2f3f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              background: "linear-gradient(135deg, #ff5f6d, #e1306c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
            }}
          >
            ↓
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>FetchMedia</div>
        </div>
        <div style={{ marginTop: 34, fontSize: 42, color: "#a2a7b3" }}>
          One link. Save anything.
        </div>
        <div style={{ marginTop: 46, display: "flex", gap: 16 }}>
          {["Instagram", "YouTube", "Facebook", "Pinterest", "Vimeo"].map((p) => (
            <div
              key={p}
              style={{
                padding: "12px 30px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 28,
                color: "#d5d8de",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
