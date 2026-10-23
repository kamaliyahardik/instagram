import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, LayoutGrid } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { Reveal, SpotlightCard } from "@/components/platform/islands";
import { PLATFORM_META } from "@/lib/resolver/detector";
import { PLATFORM_SLUGS, brandColor } from "@/lib/platform-pages";
import { GUIDES } from "@/lib/guides";
import type { Platform } from "@/types/media";

import { SITE_URL } from "@/lib/site";

const APP_URL = SITE_URL;

export const metadata: Metadata = {
  title: "All Downloaders — Every Supported Platform in One Place",
  description:
    "Every FetchMedia downloader on one page: Instagram (reels, photos), Facebook videos, Pinterest (pins, videos, photos), Vimeo and YouTube. Free, no signup, original quality.",
  keywords: [
    "all video downloaders", "instagram downloader", "facebook downloader", "pinterest downloader",
    "vimeo downloader", "youtube downloader", "media downloader online",
  ],
  alternates: { canonical: "/all-platforms" },
  openGraph: {
    title: "All Platform Downloaders · FetchMedia",
    description: "Every supported platform on one page — pick your platform and save public media in seconds.",
    url: "/all-platforms",
    type: "website",
    siteName: "FetchMedia",
  },
  twitter: { card: "summary_large_image", title: "All Platform Downloaders · FetchMedia" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All FetchMedia Downloaders",
  description: "Every supported platform downloader in one hub.",
  url: `${APP_URL}/all-platforms`,
};

// primary slugs only (one card per platform), variants listed inside
const PLATFORM_PAGES: { slug: string; platform: Platform }[] = (
  ["instagram", "youtube", "facebook", "pinterest", "vimeo"] as Platform[]
).map((platform) => ({ slug: `${platform}-downloader`, platform }));

const VARIANTS: Record<string, string[]> = {
  instagram: ["instagram-reels-downloader", "instagram-photo-downloader"],
  youtube: [],
  facebook: ["facebook-video-downloader"],
  pinterest: ["pinterest-video-downloader", "pinterest-photo-downloader"],
  vimeo: ["vimeo-video-downloader"],
};

export default function AllPlatformsPage() {
  const guidesByPlatform = new Map(GUIDES.map((g) => [g.platform, g]));

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

      <div className="relative mx-auto max-w-6xl px-5 pt-32 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge><LayoutGrid size={12} /> All platforms</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-balance mt-5 text-[clamp(2.8rem,7vw,5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              One paste.
              <br />
              <span className="text-[rgb(var(--muted))]">Every platform, every format.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[rgb(var(--muted))]">
              Grab the downloader for your platform — or dive straight into a step-by-step guide for
              it. Everything is free, signup-free and original-quality.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_PAGES.map(({ slug, platform }, i) => {
            const meta = PLATFORM_META[platform];
            const brand = brandColor(platform);
            const guide = guidesByPlatform.get(platform);
            return (
              <Reveal key={slug} delay={(i % 3) * 0.08}>
                <SpotlightCard color={brand} className="h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center" style={{ color: brand }}>
                      <PlatformLogo platform={platform} size={30} />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                      {meta.supports.slice(0, 2).join(" · ")}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight">
                    <Link href={`/${slug}`} className="transition-colors hover:text-[rgb(var(--accent))]">
                      {meta.label} downloader
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                    {meta.supports.join(", ")} — detected automatically, previewed before saving.
                  </p>

                  {VARIANTS[platform].length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {VARIANTS[platform].map((v) => (
                        <Link
                          key={v}
                          href={`/${v}`}
                          className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--surface))] px-2.5 py-1 text-[11px] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                        >
                          <Check size={10} style={{ color: brand }} />
                          {v.replace("-downloader", "").replace(new RegExp(`${platform}-`), "")}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-4">
                    <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium transition group">
                      Open downloader
                      <ArrowUpRight size={14} style={{ color: brand }} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    {guide && (
                      <Link href={`/guides/${guide.slug}`} className="text-[13px] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]">
                        Read guide →
                      </Link>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <Card className="mt-12 p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Not sure where to start?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[rgb(var(--muted))]">
              Paste any public link on the home page — the platform, content type and available
              formats are detected automatically. No chooser needed.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-7 py-3 text-[15px] font-semibold text-[rgb(var(--bg))] transition hover:scale-[1.03]"
            >
              Open the universal downloader <ArrowUpRight size={16} />
            </Link>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
