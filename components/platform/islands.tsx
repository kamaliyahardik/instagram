"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Scroll-reveal wrapper for server-rendered content.
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Counts up when scrolled into view.
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  if (inView && n === 0) {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  return <span ref={ref}>{n}{suffix}</span>;
}

// Platform FAQ accordion (rich content already carries matching FAQ schema).
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2.5">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={f.q}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
            className={cn(
              "hairline overflow-hidden rounded-2xl bg-[rgb(var(--card))] transition-all duration-300",
              isOpen ? "shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]" : "hover:-translate-y-0.5",
            )}
          >
            <h3 className="text-[15px] font-medium">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span
                  className={cn(
                    "font-mono text-[11px] tracking-[0.2em] transition-colors duration-300",
                    isOpen ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))] opacity-60",
                  )}
                >
                  0{i + 1}
                </span>
                <span className="flex-1">{f.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "shrink-0 text-[rgb(var(--muted))] transition-transform duration-300",
                    isOpen && "rotate-180 text-[rgb(var(--accent))]",
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="relative pb-5 pr-6 pl-[52px]">
                    <span
                      aria-hidden
                      className="absolute top-0 bottom-4 left-5 w-[3px] rounded-full"
                      style={{ background: "linear-gradient(rgb(var(--accent)), rgb(var(--accent) / 0.15))" }}
                    />
                    <p className="text-[15px] leading-relaxed text-[rgb(var(--muted))]">{f.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// Spotlight-follow hover card (mouse-tracked radial highlight).
export function SpotlightCard({
  color,
  className,
  children,
}: {
  color: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
      className={cn("hairline group/spot relative overflow-hidden rounded-2xl bg-[rgb(var(--card))]", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(240px circle at ${pos.x}% ${pos.y}%, ${color}22, transparent 70%)` }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
