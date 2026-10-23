"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Downloader } from "@/components/downloader/downloader";
import {
  Platforms, StickyShowcase, HowItWorks, Features, Faq, FinalCta, LiveStats,
} from "@/components/landing/sections";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { Badge } from "@/components/ui/primitives";
import { PLATFORM_META } from "@/lib/resolver/detector";
import type { Platform } from "@/types/media";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const NAMES = Object.entries(PLATFORM_META).map(([k, m]) => ({ k: k as Platform, ...m }));

function Word({ children, i }: { children: string; i: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 60, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.09 }}
    >
      {children}
    </motion.span>
  );
}

// Sticky platform bar — sits under the navbar, always centered. Squared
// pills (no radius). Compacts on scroll so it stays out of the way.
function PlatformBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 96);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-16 z-40 bg-[rgb(var(--elev))] shadow-[0_10px_36px_-20px_rgba(0,0,0,0.35)] transition-[padding] duration-300",
        scrolled ? "py-1.5" : "py-3.5",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4">
        {NAMES.map((m) => (
          <a
            key={m.k}
            href={`/${m.k}-downloader`}
            className={cn(
              "hairline inline-flex items-center gap-2 bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-all duration-300 hover:text-[rgb(var(--fg))]",
              scrolled ? "px-3.5 py-1 text-[12px]" : "px-5 py-2 text-sm",
            )}
          >
            <PlatformLogo
              platform={m.k}
              size={scrolled ? 13 : 15}
              className="transition-all duration-300"
              style={{ color: m.color }}
            />
            {m.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}

const LOGO_ROW = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.85 } } };const LOGO_POP = {
  hidden: { opacity: 0, y: 18, scale: 0.9, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
};

function HomeInner() {
  const q = useSearchParams().get("url") ?? "";

  return (    <div id="top">
      {/* ── 01 · HERO ── */}
      <section className="relative flex min-h-svh flex-col overflow-hidden pt-40 sm:pt-44">
        {/* ── animated backdrop ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* star-dust dot grid, slowly panning */}
          <div
            className="grid-pan absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgb(var(--line)) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(75% 60% at 50% 22%, black, transparent 78%)",
              WebkitMaskImage: "radial-gradient(75% 60% at 50% 22%, black, transparent 78%)",
            }}
          />
          {/* warm glow from the top */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(60% 40% at 50% 0%, rgb(var(--glow)), transparent 70%)" }}
          />
          {/* one huge conic spotlight, sweeping like a lighthouse */}
          <div
            className="beam-spin absolute left-1/2 top-[-45%] h-[140vh] w-[140vh] rounded-full opacity-40"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, rgb(var(--glow)) 50deg, transparent 110deg)",
              maskImage: "radial-gradient(closest-side, black 0%, transparent 74%)",
              WebkitMaskImage: "radial-gradient(closest-side, black 0%, transparent 74%)",
            }}
          />
          {/* aurora field — brand brand-colored drifting glow */}
          <div className="aurora-a absolute left-[4%] top-[16%] h-[26rem] w-[26rem] rounded-full bg-[#E1306C] opacity-[0.10] blur-[110px]" />
          <div className="aurora-b absolute right-[2%] top-[4%] h-[30rem] w-[30rem] rounded-full bg-[#FF0000] opacity-[0.08] blur-[120px]" />
          <div className="aurora-c absolute bottom-[28%] left-[14%] h-[24rem] w-[24rem] rounded-full bg-[#0866FF] opacity-[0.08] blur-[110px]" />
          <div className="aurora-b absolute bottom-[12%] right-[16%] h-[20rem] w-[20rem] rounded-full bg-[#1AB7EA] opacity-[0.07] blur-[100px]" style={{ animationDelay: "-9s" }} />
          {/* falling light shafts */}
          <div
            className="beam-sweep absolute left-[16%] top-0 h-full w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--fg)), transparent)", opacity: 0.18 }}
          />
          <div
            className="beam-sweep absolute right-[14%] top-0 h-full w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--fg)), transparent)", opacity: 0.14, animationDelay: "-6.5s" }}
          />
          {/* floating brand glyphs drifting at ambient depth */}
          <div className="float-y absolute left-[6%] top-[34%] opacity-[0.16] sm:opacity-[0.22]" style={{ animationDuration: "9s" }}>
            <PlatformLogo platform="instagram" size={40} />
          </div>
          <div className="float-y absolute right-[7%] top-[26%] opacity-[0.16] sm:opacity-[0.22]" style={{ animationDuration: "10.5s", animationDelay: "-3s" }}>
            <PlatformLogo platform="youtube" size={46} />
          </div>
          <div className="float-y absolute bottom-[30%] left-[12%] hidden opacity-[0.2] sm:block" style={{ animationDuration: "11s", animationDelay: "-5s" }}>
            <PlatformLogo platform="facebook" size={34} />
          </div>
          <div className="float-y absolute bottom-[36%] right-[13%] hidden opacity-[0.2] sm:block" style={{ animationDuration: "8.5s", animationDelay: "-1.5s" }}>
            <PlatformLogo platform="pinterest" size={34} />
          </div>
          <div className="float-y absolute left-[24%] top-[10%] hidden opacity-[0.18] md:block" style={{ animationDuration: "12s", animationDelay: "-7s" }}>
            <PlatformLogo platform="vimeo" size={30} />
          </div>
        </div>

        <motion.div className="relative mx-auto w-full max-w-6xl flex-1 px-5 pt-6 sm:pt-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
              <Badge><Sparkles size={12} /> Universal media downloader</Badge>
            </motion.div>

            <h1 className="text-balance mt-8 text-[clamp(3.6rem,11vw,8.2rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
              <Word i={0}>Paste</Word> <Word i={1}>a</Word> <Word i={2}>link.</Word>
              <br />
              <Word i={3}>Save</Word> <Word i={4}>anything.</Word>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[rgb(var(--muted))] sm:text-xl"
            >
              Instagram, YouTube, Facebook, Pinterest or Vimeo — one clean
              downloader that previews first and saves in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#try"
                className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-8 py-3.5 text-[15px] font-semibold text-[rgb(var(--bg))] shadow-[0_0_50px_rgb(var(--glow))] transition hover:scale-[1.04] active:scale-95"
              >
                Start downloading <ArrowDown size={16} />
              </a>
              <a
                href="#platforms"
                className="hairline inline-flex items-center gap-2 rounded-full bg-[rgb(var(--surface))] px-8 py-3.5 text-[15px] font-medium transition hover:text-[rgb(var(--fg))]"
              >
                Browse platforms
              </a>
            </motion.div>
          </div>

          {/* downloader centerpiece */}
          <motion.div
            id="try"
            initial={{ opacity: 0, y: 46, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.72 }}
            className="relative mx-auto mt-8 max-w-2xl scroll-mt-28"
          >
            {/* soft halo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-5 rounded-[36px] opacity-70 blur-2xl"
              style={{ background: "radial-gradient(60% 60% at 50% 40%, rgb(var(--glow)), transparent 70%)" }}
            />
            {/* rotating accent ring */}
            <div
              aria-hidden
              className="platform-ring pointer-events-none absolute -inset-[2px] rounded-[26px] opacity-40"
              style={{ "--ring-color": "rgb(var(--accent))" } as React.CSSProperties}
            />
            <div className="hairline relative rounded-[26px] bg-[rgb(var(--card))] p-2.5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl">
              <Downloader initialUrl={q} placeholder="Paste any public link — Instagram, YouTube…" />
            </div>

            {/* trust chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-1 text-[13px] text-[rgb(var(--muted))]">
              <span className="inline-flex items-center gap-1.5"><Zap size={14} /> Instant detection</span>
              <span className="inline-flex items-center gap-1.5"><Layers size={14} /> No account needed</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Public links only</span>
            </div>
          </motion.div>

          {/* official platform logos */}
          <motion.div
            variants={LOGO_ROW}
            initial="hidden"
            animate="show"
            className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-2.5 pb-2"
          >
            <motion.p variants={LOGO_POP} className="mr-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--muted))]">
              works with
            </motion.p>
            {NAMES.map((m) => (
              <motion.a
                key={m.k}
                variants={LOGO_POP}
                href={`/${m.k}-downloader`}
                className="hairline group inline-flex items-center gap-2.5 rounded-full bg-[rgb(var(--surface))] px-4 py-2 text-sm text-[rgb(var(--muted))] backdrop-blur transition-colors hover:text-[rgb(var(--fg))]"
              >
                <PlatformLogo
                  platform={m.k}
                  size={15}
                  className="transition-transform duration-300 group-hover:scale-125"
                  style={{ color: m.color }}
                />
                {m.label}
              </motion.a>
            ))}
          </motion.div>

          {/* stats strip */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pb-16 pt-6"
          >
            {[
              ["5", "platforms"],
              ["7", "themes"],
              ["3", "display modes"],
              ["0", "signups needed"],
            ].map(([v, k], i) => (
              <div key={k} className="flex items-baseline gap-2.5">
                {i > 0 && <span aria-hidden className="mr-8 hidden h-4 w-px translate-y-1 bg-[rgb(var(--line))] sm:block" />}
                <dt className="sr-only">{k}</dt>
                <dd className="text-3xl font-semibold tracking-tight">{v}</dd>
                <dd className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">{k}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

      </section>

      <PlatformBar />
      <LiveStats />
      <Platforms />
      <StickyShowcase />

      {/* ── 04 · Live demo ── */}
      <section className="mx-auto max-w-2xl px-5 py-24">
        <div className="text-center">
          <Badge>Live demo</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Try it with <span className="text-[rgb(var(--muted))]">your own link.</span>
          </h2>
        </div>
        <div className="mt-8"><Downloader compact /></div>
      </section>

      <HowItWorks />
      <Features />
      <Faq />
      <FinalCta />
    </div>
  );
}
