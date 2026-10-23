import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Eye, Gauge, HeartHandshake, Lock, ShieldCheck, Zap } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { Reveal, SpotlightCard } from "@/components/platform/islands";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "About FetchMedia — Fast, Honest, Privacy-First Media Saving",
  description:
    "Who builds FetchMedia and why: one paste, no logins, no stored media, no dark patterns. How the resolver pipeline works and what we deliberately never do.",
  keywords: ["about fetchmedia", "media downloader about", "privacy first downloader", "no login downloader"],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About FetchMedia",
    description: "One paste. Save anything. Honest tool, privacy-first, no stored media, no dark patterns.",
    url: "/about",
    type: "website",
    siteName: "FetchMedia",
  },
  twitter: { card: "summary_large_image", title: "About FetchMedia" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About FetchMedia",
  url: `${APP_URL}/about`,
};

const PRINCIPLES = [
  { icon: Zap, t: "Speed is a feature", d: "Detection is instant and previews render before you commit. No splash ads, no interstitials, no waiting rooms." },
  { icon: Lock, t: "We don't want your data", d: "No accounts needed to download. IPs are stored as truncated hashes only for rate limits — nothing you paste is retained as history for guests." },
  { icon: ShieldCheck, t: "Honest about limits", d: "Private walls are private. We never invent qualities that don't exist and we tell you plainly when a source is blocked or gone." },
  { icon: Eye, t: "Preview before everything", d: "Thumbnail, title, author — you always confirm you're saving the right file before a single byte is committed." },
  { icon: Gauge, t: "Straight to the source", d: "Where possible files stream directly from the origin CDN through the local resolver — we don't want to be a middleman for your media." },
  { icon: HeartHandshake, t: "Respect for creators", d: "Only public content is supported, by design. Download what you own or are permitted to save — the rest stays where it is." },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-svh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="grid-pan absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgb(var(--line)) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage: "radial-gradient(70% 50% at 50% 0%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 50% at 50% 0%, black, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 35% at 50% 0%, rgb(var(--glow)), transparent 70%)" }}
        />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <div className="relative mx-auto max-w-4xl px-5 pt-32 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Badge>Who we are</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-balance mt-5 text-[clamp(2.6rem,6.5vw,4.6rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              A downloader that
              <br />
              <span className="text-[rgb(var(--muted))]">respects its users.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[rgb(var(--muted))]">
              FetchMedia started with a simple annoyance: saving a video you can already see
              shouldn&apos;t take installs, accounts or redirect chains. So we built the tool we
              wanted to use — fast, honest and boring in all the right ways.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <Card className="mt-12 p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">How it works — no magic</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[rgb(var(--muted))]">
              <p>
                When you paste a public link, the app identifies the platform, shows you the media
                (title, cover, author) exactly as the source exposes it, and then asks a resolver
                for the formats that genuinely exist. Nothing is upscaled, nothing is invented.
              </p>
              <p>
                The resolver runs on our own infrastructure, is isolated from the rest of the app,
                and streams your file straight through — we don&apos;t keep a media library, we
                don&apos;t know what you watched, and as a guest we don&apos;t even keep what you
                downloaded beyond aggregate, anonymous counters.
              </p>
            </div>
          </Card>
        </Reveal>

        <div className="mt-12">
          <Reveal>
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">What we stand for</h2>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.t} delay={(i % 3) * 0.08}>
                <SpotlightCard color="rgb(var(--accent))" className="h-full p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">
                    <p.icon size={17} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{p.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--muted))]">{p.d}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <Card className="mt-12 p-6 text-center">
            <p className="text-[15px] text-[rgb(var(--muted))]">
              Questions, feedback or a takedown? We answer every message.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-6 py-2.5 text-sm font-semibold text-[rgb(var(--bg))] transition hover:brightness-110">
                Contact us <ArrowUpRight size={15} />
              </Link>
              <Link href="/guides" className="hairline inline-flex items-center gap-2 rounded-full bg-[rgb(var(--surface))] px-6 py-2.5 text-sm transition hover:text-[rgb(var(--fg))]">
                Browse guides
              </Link>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
