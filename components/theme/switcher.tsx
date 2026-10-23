"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { ACCENTS, useAccent, useMode } from "@/components/theme/provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { accent, setAccent } = useAccent();
  const { theme, setTheme } = useMode();

  // next-themes resolves the stored/system theme only on the client; rendering
  // the real value during hydration trips a mismatch. Keep the first render
  // neutral, then flip to the live value after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = mounted ? theme : null;
  const a = mounted ? accent : null;

  return (
    <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      {/* mode: light / dark / system */}
      <div className="hairline flex items-center rounded-full bg-[rgb(var(--surface))] p-1">
        {[
          { id: "light", icon: Sun, label: "Day · Light" },
          { id: "dark", icon: Moon, label: "Night · Dark" },
          { id: "system", icon: Monitor, label: "System" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            aria-label={label}
            aria-pressed={t === id}
            onClick={() => setTheme(id)}
            className={cn(
              "rounded-full p-2 transition-all duration-300",
              t === id
                ? "bg-[rgb(var(--accent))] text-[rgb(var(--bg))]"
                : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]",
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      {/* accent colors */}
      <div className="hairline hidden items-center gap-1.5 rounded-full bg-[rgb(var(--surface))] px-2.5 py-2 sm:flex">
        {ACCENTS.map((ac) => (
          <button
            key={ac.id}
            title={ac.label}
            aria-label={ac.label}
            aria-pressed={a === ac.id}
            onClick={() => setAccent(ac.id)}
            className={cn(
              "relative h-5 w-5 rounded-full transition-transform duration-300 hover:scale-125 active:scale-95",
              a === ac.id && "scale-110 ring-2 ring-[rgb(var(--accent))] ring-offset-2 ring-offset-[rgb(var(--bg))]",
            )}
            style={{ background: ac.swatch }}
          >
            {a === ac.id && (
              <Check size={12} className="absolute inset-0 m-auto text-black/70" strokeWidth={3} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
