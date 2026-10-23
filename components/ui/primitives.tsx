import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--accent))] px-6 py-3 text-sm font-semibold text-[rgb(var(--bg))] transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_40px_rgb(var(--glow))]",
        className,
      )}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "hairline rounded-3xl bg-[rgb(var(--card))] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)]",
        className,
      )}
    />
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="hairline inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--surface))] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">
      {children}
    </span>
  );
}
