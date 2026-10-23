import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Download, Image as ImageIcon, MousePointerClick, Eye, FileText, Film, Link2, Music, Save, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Downloader } from "@/components/downloader/downloader";
import { PlatformTheme } from "@/components/platform/theme";
import { Badge, Card } from "@/components/ui/primitives";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { FaqAccordion, Reveal, SpotlightCard } from "@/components/platform/islands";
import { PLATFORM_META } from "@/lib/resolver/detector";
import { PLATFORM_CONTENT, PLATFORM_SLUGS, brandColor, slugKeywords, slugTitle } from "@/lib/platform-pages";

export function generateStaticParams() {
  return Object.keys(PLATFORM_SLUGS).map((slug) => ({ platform: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform: slug } = await params;
  const p = PLATFORM_SLUGS[slug];
  const label = p ? PLATFORM_META[p].label : "Media";
  const tagline = p ? PLATFORM_CONTENT[p].tagline : "";
  const title = slugTitle(slug, label);
  return {
    title,
    description: `${tagline} Paste a public ${label} link, preview the media and download available formats. Free, fast, no account needed.`,
    keywords: slugKeywords(slug, label),
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${title} · FetchMedia`,
      description: `${tagline} Paste a public ${label} link and save it in seconds — free, no signup.`,
      url: `/${slug}`,
      type: "website",
      siteName: "FetchMedia",
    },
    twitter: { card: "summary_large_image", title: `${title} · FetchMedia` },
  };
}

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const STEPS = [
  { icon: Link2, t: "Copy the link", d: "Use the share → copy link button inside the app for the cleanest URL." },
  { icon: MousePointerClick, t: "Paste it above", d: "Platform, content type and formats are detected automatically." },
  { icon: Save, t: "Save what you need", d: "Preview first, then download exactly the formats you want." },
];

const SAVE_FEATURES = [
  { icon: Film, t: "Video in original quality", d: "No invented qualities — only formats that truly exist." },
  { icon: Music, t: "Audio when available", d: "Extract audio as MP3 up to 320 kbps where the source provides it." },
  { icon: ImageIcon, t: "Images & carousels", d: "Photos and multi-slide posts appear as individual items." },
  { icon: FileText, t: "Caption-based filenames", d: "Files are named after the actual caption or title, not gibberish IDs." },
  { icon: Zap, t: "Instant preview", d: "Thumbnail, title and author render before you commit to anything." },
  { icon: ShieldCheck, t: "Public content only", d: "Private, login-walled or deleted media is never accessed." },
];

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: slug } = await params;
  const p = PLATFORM_SLUGS[slug];
  if (!p) notFound();
  const meta = PLATFORM_META[p];
  const content = PLATFORM_CONTENT[p];
  const brand = brandColor(p);
  const related = Object.keys(PLATFORM_SLUGS)
    .filter((s) => PLATFORM_SLUGS[s] !== p && s === `${PLATFORM_SLUGS[s]}-downloader`)
    .map((s) => ({ slug: s, platform: PLATFORM_SLUGS[s] }));
  const title = slugTitle(slug, meta.label);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: title, item: `/${slug}` },
    ],
  };

  return (
    <PlatformTheme platform={p}>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="relative overflow-hidden">
        {/* ── animated brand backdrop ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="grid-pan absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgb(var(--line)) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
              maskImage: "radial-gradient(75% 55% at 50% 8%, black, transparent 78%)",
              WebkitMaskImage: "radial-gradient(75% 55% at 50% 8%, black, transparent 78%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(55% 38% at 50% 0%, ${brand}30, transparent 70%)` }}
          />
          <div className="blob-drift absolute left-[4%] top-[10%] h-72 w-72 rounded-full opacity-[0.12] blur-[110px]" style={{ background: brand }} />
          <div className="blob-drift absolute right-[2%] top-[30%] h-80 w-80 rounded-full opacity-[0.09] blur-[120px]" style={{ background: brand, animationDelay: "-7s" }} />
          {/* giant watermark glyph, gently breathing */}
          <span className="float-y pointer-events-none absolute top-2 left-1/2 hidden -translate-x-1/2 select-none opacity-[0.06] sm:block" style={{ color: brand }}>
            <PlatformLogo platform={p} size={360} />
          </span>
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-20 sm:pt-32">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
            >
              <ArrowLeft size={15} /> All platforms
            </Link>
          </Reveal>

          {/* ── hero ── */}
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <Reveal>
              <Badge>
                <Sparkles size={12} /> {title}
              </Badge>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-balance mt-5 text-[clamp(2.9rem,8vw,5.6rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
                Save from {meta.label}
                <br />
                <span className="text-[rgb(var(--muted))]">in seconds.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[rgb(var(--muted))]">
                {content.tagline} Paste a public {meta.label} link below and save it in seconds — the fastest free{" "}
                {meta.label.toLowerCase()} downloader on the web, no signup needed.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {meta.supports.map((s) => (
                  <span key={s} className="hairline inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--surface))] px-3.5 py-1.5 text-[13px] backdrop-blur">
                    <Check size={13} style={{ color: brand }} strokeWidth={3} /> {s}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── downloader centerpiece ── */}
          <Reveal delay={0.3} y={40}>
            <div id="try" className="relative mx-auto mt-10 max-w-2xl scroll-mt-32">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-5 rounded-[36px] opacity-70 blur-2xl"
                style={{ background: `radial-gradient(60% 60% at 50% 40%, ${brand}55, transparent 70%)` }}
              />
              <div
                aria-hidden
                className="platform-ring pointer-events-none absolute -inset-[2px] rounded-[26px] opacity-40"
                style={{ "--ring-color": brand } as React.CSSProperties}
              />
              <div className="hairline relative rounded-[26px] bg-[rgb(var(--card))] p-2.5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <Downloader
                  placeholder={p === "youtube" ? "YouTube downloads are temporarily unavailable" : `e.g. ${content.sample}`}
                  disabled={p === "youtube"}
                />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-1 text-[13px] text-[rgb(var(--muted))]">
                <span className="inline-flex items-center gap-1.5"><Zap size={14} /> Instant detection</span>
                <span className="inline-flex items-center gap-1.5"><Eye size={14} /> Preview first</span>
                <span className="inline-flex items-center gap-1.5"><Download size={14} /> No watermarks</span>
              </div>
            </div>
          </Reveal>

          {/* youtube service notice */}
          {p === "youtube" && (
            <Reveal>
              <div className="hairline mx-auto mt-8 flex max-w-2xl items-start gap-4 rounded-[20px] bg-[rgb(var(--surface))] p-5 backdrop-blur">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${brand}, ${brand}88)` }}
                >
                  <Save size={17} />
                </span>
                <div>
                  <p className="font-semibold">YouTube downloads are temporarily unavailable</p>
                  <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--muted))]">
                    YouTube&apos;s server-side protection is currently blocking automated stream downloads. We&apos;re
                    working on a reliable fix — this service will be re-enabled in the future. All other platforms
                    remain fully functional.
                  </p>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── how it works ── */}
          <div className="mt-24">
            <Reveal>
              <div className="text-center">
                <Badge>How it works</Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Three steps. Done.
                </h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.t} delay={i * 0.1}>
                  <SpotlightCard color={brand} className="h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-xl text-white transition-transform duration-300 group-hover/spot:scale-110"
                        style={{ background: `linear-gradient(135deg, ${brand}, ${brand}88)` }}
                      >
                        <s.icon size={18} />
                      </span>
                      <span className="font-mono text-3xl font-semibold tracking-tight opacity-15" style={{ color: brand }}>
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">{s.d}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── what you can save ── */}
          <div className="mt-24">
            <Reveal>
              <div className="text-center">
                <Badge>Formats</Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  What you can save
                </h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SAVE_FEATURES.map((f, i) => (
                <Reveal key={f.t} delay={(i % 3) * 0.08}>
                  <SpotlightCard color={brand} className="h-full p-6">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover/spot:scale-110"
                      style={{ background: `${brand}1A`, color: brand }}
                    >
                      <f.icon size={17} />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{f.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--muted))]">{f.d}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── about + tips ── */}
          <div className="mt-24 grid gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgb(var(--muted))]">
                <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--fg))]">
                  About downloading from {meta.label}
                </h2>
                {content.about.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <Card className="h-fit p-6">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">Pro tips</p>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[rgb(var(--muted))]">
                  {content.tips.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: brand }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>

          {/* ── faq ── */}
          <div className="mt-24">
            <Reveal>
              <div className="text-center">
                <Badge>FAQ</Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{meta.label} FAQ</h2>
              </div>
            </Reveal>
            <div className="mx-auto mt-10 max-w-2xl">
              <FaqAccordion items={content.faqs} />
            </div>
          </div>

          {/* ── related ── */}
          <div className="mt-20">
            <Reveal>
              <p className="font-mono text-center text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">Keep exploring</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${r.slug}`}
                    className="hairline group inline-flex items-center gap-2 rounded-full bg-[rgb(var(--surface))] px-4 py-2 text-sm text-[rgb(var(--muted))] transition hover:-translate-y-0.5 hover:text-[rgb(var(--fg))]"
                  >
                    <PlatformLogo platform={r.platform} size={15} className="transition-transform duration-300 group-hover:scale-125" />
                    {PLATFORM_META[r.platform].label} downloader
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="mx-auto mt-14 max-w-2xl text-center font-mono text-xs leading-relaxed text-[rgb(var(--muted))]">
              Independent service — not affiliated with {meta.label}. Only download content you
              own or are permitted to save. Private or login-protected content is not supported.
            </p>
          </Reveal>
        </div>
      </div>
    </PlatformTheme>
  );
}
