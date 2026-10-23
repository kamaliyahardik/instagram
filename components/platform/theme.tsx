"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { BRAND_HEX } from "@/lib/platform-pages";

type Brand = { dark: string; light?: string; strong: string };

// Every platform page re-themes itself to its company color.
// Only --accent / --accent-strong / --glow are overridden — Day/Night
// surfaces stay intact, so light + dark both keep working.
const BRAND: Record<string, Brand> = {
  instagram: { dark: BRAND_HEX.instagram, strong: "#FB7185" },
  youtube: { dark: BRAND_HEX.youtube, strong: "#FF7070" },
  facebook: { dark: BRAND_HEX.facebook, strong: "#8ABBFA" },
  pinterest: { dark: BRAND_HEX.pinterest, strong: "#FF5C73" },
  vimeo: { dark: BRAND_HEX.vimeo, strong: "#7FD8F5" },
};

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function PlatformTheme({
  platform,
  children,
}: {
  platform: string;
  children: ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const style = useMemo(() => {
    const b = BRAND[platform] ?? BRAND.instagram;
    const base = resolvedTheme === "light" && b.light ? b.light : b.dark;
    const rgb = hexToRgb(base);
    const vars: Record<string, string> = {
      "--accent": rgb,
      "--accent-strong": hexToRgb(b.strong),
      "--glow": `${rgb} / 0.34`,
    };
    return vars as CSSProperties;
  }, [platform, resolvedTheme]);
  return <div style={style}>{children}</div>;
}
