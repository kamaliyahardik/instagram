"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Boxes, Check, ChevronDown, Download, Eye, Link2, LockKeyhole, ScanSearch, ShieldCheck } from "lucide-react";
import { PLATFORM_META } from "@/lib/resolver/detector";
import type { Platform } from "@/types/media";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { Badge, Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Live pulse — real numbers from /api/stats ─── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}{suffix}
    </span>
  );
}

export function LiveStats() {
  const [s, setS] = useState<{ total: number; successRate: number; avgMs: number } | null>(null);
  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((j) => {
      if (typeof j.total === "number") setS(j);
    }).catch(() => {});
  }, []);
  if (!s || s.total === 0) return null;
  return (
    <section className="border-b border-[rgb(var(--line))] bg-[rgb(var(--elev))]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 sm:gap-x-12 sm:px-5 py-7 sm:py-8">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live · last 30 days
        </span>
        {[
          { v: <CountUp to={s.total} />, k: "requests resolved" },
          { v: <CountUp to={s.successRate} suffix="%" />, k: "success rate" },
          { v: <CountUp to={s.avgMs} suffix="ms" />, k: "avg response" },
        ].map((x) => (
          <span key={x.k} className="inline-flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight sm:text-3xl">{x.v}</span>
            <span className="text-xs text-[rgb(var(--muted))] sm:text-sm">{x.k}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── 02 · Supported platforms — official logos, rich animated cards ─── */
function PlatformCard({
  k,
  m,
  href,
  i,
}: {
  k: Platform;
  m: (typeof PLATFORM_META)[Platform];
  href: string;
  i: number;
}) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rotX = useSpring(useTransform(my, [0, 100], [7, -7]), { stiffness: 220, damping: 22 });
  const rotY = useSpring(useTransform(mx, [0, 100], [-7, 7]), { stiffness: 220, damping: 22 });

  return (
    <motion.a
      href={href}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top) / r.height) * 100;
        mx.set(px);
        my.set(py);
        e.currentTarget.style.setProperty("--mx", `${px}%`);
        e.currentTarget.style.setProperty("--my", `${py}%`);
      }}
      onMouseLeave={() => {
        mx.set(50);
        my.set(50);
      }}
      initial={{ opacity: 0, y: 44, scale: 0.96, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ delay: (i % 2) * 0.09, duration: 0.75, ease: EASE }}
      whileHover={reduced ? undefined : { y: -8 }}
      className="group relative block"
      style={
        {
          rotateX: reduced ? 0 : rotX,
          rotateY: reduced ? 0 : rotY,
          transformPerspective: 900,
          "--hex": m.color,
        } as CSSProperties
      }
    >
      {/* rotating conic ring — lights up on hover */}
      <span
        aria-hidden
        className="platform-ring pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* soft halo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[34px] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20"
        style={{ background: m.color }}
      />
      <Card className="relative h-full overflow-hidden p-6 sm:p-7">
        {/* cursor spotlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), ${m.color}1F, transparent 65%)`,
          }}
        />
        {/* index */}
        <span aria-hidden className="absolute right-6 top-6 font-mono text-[11px] tracking-[0.25em] text-[rgb(var(--muted))]">
          0{i + 1}
        </span>

        {/* logo + name */}
        <div className="relative flex items-center gap-4">
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotate: -16 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (i % 2) * 0.09, type: "spring", stiffness: 280, damping: 18 }}
            className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[18px] sm:h-[72px] sm:w-[72px]"
            style={{
              background: `linear-gradient(135deg, ${m.color}, ${m.color}C4)`,
              boxShadow: `0 14px 44px -14px ${m.color}80`,
            }}
          >
            {/* sheen sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <PlatformLogo
              platform={k}
              size={34}
              className="text-white transition-transform duration-500 group-hover:scale-110"
            />
          </motion.span>
          <div>
            <h3 className="text-xl font-semibold tracking-tight sm:text-[22px]">{m.label}</h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              adapter · auto-detect
            </p>
          </div>
        </div>

        {/* supported formats */}
        <div className="relative mt-5 flex flex-wrap gap-1.5">
          {m.supports.map((s) => (
            <span
              key={s}
              className="hairline rounded-full bg-[rgb(var(--surface))] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--muted))]"
            >
              {s}
            </span>
          ))}
        </div>

        {/* footer row */}
        <div className="relative mt-7 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            live
          </span>
          <span className="inline-flex items-center gap-2.5 text-sm font-medium text-[rgb(var(--muted))] transition-colors duration-300 group-hover:text-[rgb(var(--fg))]">
            Open guide
            <span className="hairline grid h-8 w-8 place-items-center rounded-full bg-[rgb(var(--surface))] transition-all duration-300 group-hover:border-transparent group-hover:bg-[var(--hex)] group-hover:text-white">
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </span>
        </div>
      </Card>
    </motion.a>
  );
}

export function Platforms() {
  const platforms = Object.entries(PLATFORM_META) as [Platform, (typeof PLATFORM_META)[Platform]][];
  return (
    <section id="platforms" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:py-32">
      {/* ambient brand blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="blob-drift absolute -top-20 left-[6%] h-72 w-72 rounded-full opacity-[0.12] blur-[110px]"
          style={{ background: platforms[0][1].color }}
        />
        <div
          className="blob-drift absolute -bottom-24 right-[4%] h-80 w-80 rounded-full opacity-[0.10] blur-[120px]"
          style={{ background: platforms[3][1].color, animationDelay: "-8s" }}
        />
      </div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Badge>Supported platforms</Badge>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          One paste.
          <br />
          <span className="text-[rgb(var(--muted))]">Every platform that actually works.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          className="mt-4 max-w-md text-[15px] leading-relaxed text-[rgb(var(--muted))]"
        >
          No dead badges. Every adapter here runs through the same isolated
          resolve pipeline — detection, preview, download.
        </motion.p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {platforms.map(([k, m], i) => (
            <PlatformCard key={k} k={k} m={m} href={`/${k}-downloader`} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 03 · Sticky scroll showcase — scroll-driven platform morph ─── */
const ORDER: Platform[] = ["instagram", "youtube", "facebook", "pinterest", "vimeo"];
const MOCK_URLS: Record<Platform, string> = {
  instagram: "instagram.com/reel/C8xYz…",
  youtube: "youtube.com/watch?v=dQw4…",
  facebook: "fb.watch/abc123…",
  pinterest: "pinterest.com/pin/4839…",
  vimeo: "vimeo.com/76979871…",
};

export function StickyShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.min(ORDER.length - 1, Math.max(0, Math.floor(v * ORDER.length))));
  });
  const active = ORDER[idx];
  const meta = PLATFORM_META[active];
  const previewScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.03, 0.96]);

  return (
    <section ref={ref} className="relative hidden md:block" style={{ height: "340vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* ambient wash following the active platform */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{ background: `radial-gradient(55% 48% at 70% 42%, ${meta.color}1A, transparent 70%)` }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 md:grid-cols-[1fr_0.95fr] lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* left: heading + adaptive rail */}
          <div>
            <Badge>Watch it adapt</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Paste anything.
              <br />
              <span className="text-[rgb(var(--muted))]">It just knows.</span>
            </h2>

            <div className="relative mt-10 pl-9">
              {/* progress rail */}
              <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-[rgb(var(--line))]" />
              <span
                aria-hidden
                className="absolute bottom-3 left-0 top-3 w-[3px] origin-top rounded-full transition-all duration-500 ease-out"
                style={{
                  background: meta.color,
                  transform: `scaleY(${(idx + 0.55) / ORDER.length})`,
                  boxShadow: `0 0 18px ${meta.color}66`,
                }}
              />
              <ul className="space-y-2">
                {ORDER.map((p, i) => {
                  const on = i === idx;
                  const m = PLATFORM_META[p];
                  return (
                    <li
                      key={p}
                      className={cn(
                        "relative flex items-center gap-4 rounded-2xl px-3 py-2.5 transition-all duration-500",
                        on ? "bg-[rgb(var(--surface))]" : "opacity-45 hover:opacity-75",
                      )}
                      style={on ? { boxShadow: `0 22px 50px -28px ${m.color}80` } : undefined}
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-all duration-500"
                        style={
                          on
                            ? {
                                background: `linear-gradient(135deg, ${m.color}, ${m.color}B8)`,
                                boxShadow: `0 12px 30px -10px ${m.color}90`,
                              }
                            : { background: "rgb(var(--surface))", boxShadow: "inset 0 0 0 1px rgb(var(--line))" }
                        }
                      >
                        <PlatformLogo
                          platform={p}
                          size={18}
                          className={cn("transition-colors duration-500", on ? "text-white" : "text-[rgb(var(--muted))]")}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-lg font-medium tracking-tight transition-colors duration-500",
                          on ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))]",
                        )}
                      >
                        {m.label}
                      </span>
                      <AnimatePresence>
                        {on && (
                          <motion.span
                            initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                            style={{ background: `${m.color}1E`, color: m.color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                            detected
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* right: floating preview card */}
          <div className="relative" style={{ perspective: 1200 }}>
            <motion.div style={{ scale: reduced ? 1 : previewScale }} className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-12 transition-all duration-700"
                style={{ background: `radial-gradient(55% 55% at 50% 50%, ${meta.color}2B, transparent 72%)` }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 44, scale: 0.94, filter: "blur(10px)", rotateX: 6 }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, scale: 0.96, filter: "blur(8px)", rotateX: -4 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  <Card className="relative overflow-hidden p-2">
                    {/* url bar */}
                    <div className="relative flex items-center gap-3 rounded-2xl bg-[rgb(var(--surface))] px-4 py-3.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${meta.color}1C` }}>
                        <Link2 size={14} style={{ color: meta.color }} />
                      </span>
                      <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-[rgb(var(--muted))]">{MOCK_URLS[active]}</p>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: meta.color }}
                      >
                        <Check size={12} strokeWidth={3} /> detected
                      </motion.span>
                    </div>

                    <div className="p-3">
                      {/* preview */}
                      <div
                        className="relative grid h-40 place-items-center overflow-hidden rounded-2xl"
                        style={{ background: `linear-gradient(120deg, ${meta.color}4D, ${meta.color}12 60%, transparent)` }}
                      >
                        {/* light sweep replaying on each platform change */}
                        <motion.span
                          aria-hidden
                          initial={{ x: "-140%" }}
                          animate={{ x: "170%" }}
                          transition={{ duration: 1.25, delay: 0.3, ease: "easeInOut" }}
                          className="pointer-events-none absolute inset-y-0 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <motion.span
                          initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 240, damping: 15, delay: 0.1 }}
                          className="relative"
                        >
                          <PlatformLogo
                            platform={active}
                            size={64}
                            className="text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
                          />
                        </motion.span>
                        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85">
                          {meta.label} · public media
                        </span>
                      </div>

                      {/* format rows */}
                      <div className="mt-3 space-y-1.5">
                        {meta.supports.slice(0, 2).map((s, j) => (
                          <motion.div
                            key={s}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + j * 0.09, duration: 0.45, ease: EASE }}
                            className="flex items-center gap-3 rounded-xl bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm"
                          >
                            <Download size={14} style={{ color: meta.color }} />
                            <span className="font-medium">{s}</span>
                            <span className="ml-auto font-mono text-[11px] text-emerald-400">ready</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 05 · How it works ─── */
export function HowItWorks() {
  const steps = [
    { n: "01", t: "Copy", d: "Copy a public media link from any supported app. No login, no extensions, no setup." },
    { n: "02", t: "Paste", d: "Drop it into the downloader. The platform, content type and formats are detected for you." },
    { n: "03", t: "Download", d: "Preview the thumbnail, title and author — then save exactly the formats you need." },
  ];
  return (
    <section id="how" className="border-y border-[rgb(var(--line))] bg-[rgb(var(--elev))]">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <Badge>How it works</Badge>
        <h2 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl">
          Three steps. <span className="text-[rgb(var(--muted))]">Ten seconds.</span>
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
              className="relative"
            >
              <p aria-hidden className="text-[64px] font-bold leading-none tracking-tighter text-[rgb(var(--line))] sm:text-[88px]">
                {s.n}
              </p>
              <h3 className="-mt-8 text-xl font-semibold tracking-tight sm:text-2xl">{s.t}</h3>
              <p className="mt-2 leading-relaxed text-[rgb(var(--muted))]">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 06 · Bento features — spotlight cards + cycling detection logos ─── */
const FEATS: {
  icon: typeof ScanSearch;
  color: string;
  t: string;
  d: string;
  span: string;
  demo?: boolean;
}[] = [
  { icon: ScanSearch, color: "#60A5FA", t: "Auto platform detection", d: "No dropdowns, no settings. Instagram, YouTube, Facebook, Pinterest and Vimeo links are recognised the instant you paste.", span: "md:col-span-4", demo: true },
  { icon: Eye, color: "#1AB7EA", t: "True previews", d: "Thumbnails, titles, authors — see it before you save it.", span: "md:col-span-2" },
  { icon: Boxes, color: "#34D399", t: "Isolated adapters", d: "One platform outage never takes the app down.", span: "md:col-span-2" },
  { icon: LockKeyhole, color: "#A78BFA", t: "Private by design", d: "Temporary R2 storage, signed expiring URLs, auto-deletion. No archive.", span: "md:col-span-2" },
  { icon: ShieldCheck, color: "#FB923C", t: "Guarded & fair", d: "SSRF protection, allowlisted hosts, guest + user rate limits, short-TTL cache.", span: "md:col-span-2" },
];

function SpotlightCard({
  color,
  className,
  children,
}: {
  color?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      className={cn("group relative overflow-hidden", className)}
    >
      {color ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), ${color}17, transparent 62%)`,
          }}
        />
      ) : null}
      {children}
    </Card>
  );
}

function CyclingLogos() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % ORDER.length), 1900);
    return () => clearInterval(t);
  }, [reduced]);
  const active = ORDER[i];
  const m = PLATFORM_META[active];
  return (
    <div className="relative mt-6 flex items-center gap-1.5 rounded-2xl bg-[rgb(var(--surface))] p-2">
      {ORDER.map((p, j) => (
        <span
          key={p}
          className="grid h-9 w-9 place-items-center rounded-xl transition-all duration-500"
          style={
            j === i
              ? {
                  background: `linear-gradient(135deg, ${PLATFORM_META[p].color}, ${PLATFORM_META[p].color}B8)`,
                  boxShadow: `0 10px 26px -10px ${PLATFORM_META[p].color}A0`,
                }
              : { background: "rgb(var(--bg))" }
          }
        >
          <PlatformLogo
            platform={p}
            size={16}
            className={cn("transition-colors duration-500", j === i ? "text-white" : "text-[rgb(var(--muted))] opacity-50")}
          />
        </span>
      ))}
      <AnimatePresence mode="wait">
        <motion.span
          key={active}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease: EASE }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: `${m.color}1E`, color: m.color }}
        >
          <Check size={12} strokeWidth={3} /> {m.label} link
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Badge>Why FetchMedia</Badge>
      <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Fast. Minimal. Premium. <span className="text-[rgb(var(--muted))]">Universal.</span>
      </h2>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-6">
        {FEATS.map((f, i) => (
          <motion.div
            key={f.t}
            className={f.span}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.6, ease: EASE }}
          >
            <SpotlightCard color={f.color} className="h-full p-6 hover:-translate-y-1 sm:p-7">
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}1A`, color: f.color }}
                  >
                    <f.icon size={19} />
                  </span>
                  <span aria-hidden className="font-mono text-[10px] tracking-[0.25em] text-[rgb(var(--muted))] opacity-60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[rgb(var(--muted))]">{f.d}</p>
                {f.demo && <CyclingLogos />}
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── 08 · FAQ — split layout, sticky heading, premium accordion ─── */
const FAQ = [
  { q: "Do I need an account?", a: "No. Guests download with fair hourly limits. Signing in unlocks history across devices and higher configurable limits." },
  { q: "Which links work?", a: "Public posts, reels, videos and images from Instagram, YouTube, Facebook, Pinterest and Vimeo. Each has its own guide page linked in the footer." },
  { q: "What about private content?", a: "Private, followers-only or login-walled content is never accessed. Only publicly available media is supported — anything else shows a clear unavailable message." },
  { q: "Is downloading legal?", a: "You are responsible for your rights to each file. Only save content you own, that is licensed to you, or where the owner permits downloading." },
  { q: "Where do my files go?", a: "Where possible you download straight from the source CDN. Temporary processing uses private Cloudflare R2 with signed, expiring URLs that are deleted automatically." },
  { q: "Why do I only see some qualities?", a: "The UI lists only formats the resolver genuinely returns for that media. Qualities are never invented or upscaled." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
      {/* soft accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ background: "radial-gradient(40% 30% at 12% 8%, rgb(var(--glow)), transparent 70%)" }}
      />
      <div className="relative grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
        {/* home FAQ rich-result schema (mirrors the visible accordion) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((it) => ({
                "@type": "Question",
                name: it.q,
                acceptedAnswer: { "@type": "Answer", text: it.a },
              })),
            }),
          }}
        />
        {/* sticky heading column */}
        <div className="md:sticky md:top-28 md:self-start">
          <motion.div
            initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Badge>FAQ</Badge>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Questions,
              <br />
              <span className="text-[rgb(var(--muted))]">answered.</span>
            </h2>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[rgb(var(--muted))]">
              Everything about limits, privacy and legality — short, honest, no fine print games.
            </p>
            <Link
              href="/contact"
              className="hairline group mt-7 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--surface))] px-5 py-2.5 text-sm font-medium transition hover:text-[rgb(var(--fg))]"
            >
              Still stuck? Contact us
              <ArrowUpRight
                size={15}
                className="text-[rgb(var(--muted))] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--accent))]"
              />
            </Link>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))] opacity-60">
              {FAQ.length} answers · 30-second read
            </p>
          </motion.div>
        </div>

        {/* accordion column */}
        <div className="space-y-2.5">
          {FAQ.map((it, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={it.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
              >
                <Card
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "-translate-y-0.5 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.55)]" : "hover:-translate-y-0.5",
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
                      <span className="flex-1">{it.q}</span>
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
                        <div className="relative pb-5 pl-[52px] pr-6">
                          {/* accent bar */}
                          <span
                            aria-hidden
                            className="absolute bottom-4 left-5 top-0 w-[3px] rounded-full"
                            style={{ background: "linear-gradient(rgb(var(--accent)), rgb(var(--accent) / 0.15))" }}
                          />
                          <p className="text-[15px] leading-relaxed text-[rgb(var(--muted))]">{it.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── 09 · Final CTA ─── */
export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28">
      <Card className="relative overflow-hidden px-5 py-14 text-center sm:px-6 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 90% at 50% 0%, rgb(var(--glow)), transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Ready when you are</p>
          <h2 className="text-balance mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Paste. Preview. Download.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[rgb(var(--muted))]">
            The fastest way to save public media you have the right to keep.
          </p>
          <a
            href="#top"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-9 py-4 text-[15px] font-semibold text-[rgb(var(--bg))] shadow-[0_0_50px_rgb(var(--glow))] transition hover:scale-[1.04] active:scale-95"
          >
            <Download size={17} /> Start downloading
          </a>
        </motion.div>
      </Card>
    </section>
  );
}
