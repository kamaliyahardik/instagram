"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Accent = "ink" | "snow" | "blush" | "honey" | "moss" | "azure" | "maroon";

const AccentCtx = createContext<{ accent: Accent; setAccent: (a: Accent) => void }>({
  accent: "ink",
  setAccent: () => {},
});

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "ink", label: "Ink · Black", swatch: "#171717" },
  { id: "snow", label: "Snow · White", swatch: "#f5f5f4" },
  { id: "blush", label: "Blush · Pink", swatch: "#f472b6" },
  { id: "honey", label: "Honey · Yellow", swatch: "#facc15" },
  { id: "moss", label: "Moss · Green", swatch: "#34d399" },
  { id: "azure", label: "Azure · Blue", swatch: "#60a5fa" },
  { id: "maroon", label: "Maroon", swatch: "#991b1b" },
];

function AccentApplier({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useState<Accent>("ink");
  useEffect(() => {
    const saved = localStorage.getItem("umd-accent") as Accent | null;
    if (saved) setAccent(saved);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem("umd-accent", accent);
  }, [accent]);
  const set = useCallback((a: Accent) => setAccent(a), []);
  return <AccentCtx.Provider value={{ accent, setAccent: set }}>{children}</AccentCtx.Provider>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <AccentApplier>{children}</AccentApplier>
    </NextThemesProvider>
  );
}

export function useAccent() {
  return useContext(AccentCtx);
}

export function useMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return { theme, setTheme, resolvedTheme };
}
