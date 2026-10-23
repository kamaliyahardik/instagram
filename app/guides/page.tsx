import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Check, Clock, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { Reveal, SpotlightCard } from "@/components/platform/islands";
import { GUIDES } from "@/lib/guides";
import { PLATFORM_META } from "@/lib/resolver/detector";
import { brandColor } from "@/lib/platform-pages";

import { SITE_URL } from "@/lib/site";

const APP_URL = SITE_URL;

export const metadata: Metadata = {
  title: "Download Guides — How to Save Videos & Photos from Every Platform",
  description:
    "Step-by-step guides to download Instagram reels, photos, Facebook videos, Pinterest pins and Vimeo clips in original quality — free, no app, no signup.",
  keywords: [
    "how to download instagram reels", "how to download facebook videos", "how to save pinterest videos",
    "how to download vimeo videos", "how to download instagram photos", "media download guides",
  ],
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Download Guides · FetchMedia",
    description: "Step-by-step guides that show how to save public media from every supported platform — in seconds.",
    url: "/guides",
    type: "website",
    siteName: "FetchMedia",
  },
  twitter: { card: "summary_large_image", title: "Download Guides · FetchMedia" },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "FetchMedia Download Guides",
  description: "Step-by-step guides for downloading public media from Instagram, Facebook, Pinterest and Vimeo.",
  url: `${APP_URL}/guides`,
};

export default function GuidesIndex() {
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
            <Badge><BookOpen size={12} /> Download guides</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-balance mt-5 text-[clamp(2.8rem,7vw,5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              Save anything.
              <br />
              <span className="text-[rgb(var(--muted))]">Step by step.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[rgb(var(--muted))]">
              No app installs, no logins, no tricks. Short, honest guides that show exactly how to
              download from every platform we support — in the original quality.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g, i) => {
            const meta = PLATFORM_META[g.platform];
            const brand = brandColor(g.platform);
            return (
              <Reveal key={g.slug} delay={(i % 3) * 0.08}>
                <SpotlightCard color={brand} className="h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium" style={{ color: brand }}>
                      <PlatformLogo platform={g.platform} size={15} /> {meta.label}
                    </span>
                    <span className="font-mono text-[11px] text-[rgb(var(--muted))]">
                      <Clock size={11} className="mr-1 inline" /> {g.readMinutes} min
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight">
                    <Link href={`/guides/${g.slug}`} className="transition-colors hover:text-[rgb(var(--accent))]">
                      {g.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[rgb(var(--muted))]">{g.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {g.keywords.slice(0, 3).map((k) => (
                      <span key={k} className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--surface))] px-2.5 py-1 font-mono text-[10px] text-[rgb(var(--muted))]">
                        <Check size={10} style={{ color: brand }} /> {k}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition group"
                  >
                    Read the guide
                    <ArrowUpRight size={15} style={{ color: brand }} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </SpotlightCard>
              </Reveal>
            );
          })}

          <Reveal delay={0.2}>
            <Card className="flex h-full flex-col p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--surface))] text-[rgb(var(--muted))]">
                <Sparkles size={17} />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">More guides coming</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[rgb(var(--muted))]">
                New guides ship alongside new platform support. Meanwhile, every downloader page has
                its own caveats, tips and FAQ.
              </p>
              <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                Go to the home downloader <ArrowUpRight size={15} />
              </Link>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
