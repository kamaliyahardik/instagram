import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Download } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PlatformLogo } from "@/components/icons/platform-icons";
import { FaqAccordion, Reveal, SpotlightCard } from "@/components/platform/islands";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { PLATFORM_META } from "@/lib/resolver/detector";
import { PLATFORM_SLUGS, brandColor } from "@/lib/platform-pages";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ guide: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ guide: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guide: slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.description,
      url: `/guides/${g.slug}`,
      type: "article",
      siteName: "FetchMedia",
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default async function GuidePage({ params }: Props) {
  const { guide: slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const meta = PLATFORM_META[guide.platform];
  const brand = brandColor(guide.platform);
  const downloaderHref = `/${guide.platform}-downloader`;
  const platformSlug = PLATFORM_SLUGS[downloaderHref] ? downloaderHref : null;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Guides", item: "/guides" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `/guides/${guide.slug}` },
    ],
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    author: { "@type": "Organization", name: "FetchMedia" },
    publisher: { "@type": "Organization", name: "FetchMedia" },
    mainEntityOfPage: `${APP_URL}/guides/${guide.slug}`,
  };

  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="grid-pan absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgb(var(--line)) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage: "radial-gradient(70% 45% at 50% 0%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(70% 45% at 50% 0%, black, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(55% 35% at 50% 0%, ${brand}2A, transparent 70%)` }}
        />
        <div className="blob-drift absolute right-[6%] top-[12%] h-72 w-72 rounded-full opacity-[0.10] blur-[110px]" style={{ background: brand }} />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="relative mx-auto max-w-3xl px-5 pt-32 pb-24">
        <Reveal>
          <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]">
            <ArrowLeft size={15} /> All guides
          </Link>
        </Reveal>

        <header className="mt-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>
                <PlatformLogo platform={guide.platform} size={12} /> {meta.label} guide
              </Badge>
              <span className="font-mono text-[11px] text-[rgb(var(--muted))]">
                <Clock size={11} className="mr-1 inline" /> {guide.readMinutes} min read · updated {guide.updated}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
              {guide.title}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-lg leading-relaxed text-[rgb(var(--muted))]">{guide.intro}</p>
          </Reveal>
        </header>

        {/* steps — the HowTo core */}
        <section className="mt-12">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">How to do it, step by step</h2>
          </Reveal>
          <ol className="mt-6 space-y-4">
            {guide.steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <li>
                  <SpotlightCard color={brand} className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-mono text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${brand}, ${brand}88)` }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold tracking-tight">{s.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--muted))]">{s.body}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <Reveal>
          <Card className="mt-10 flex flex-col items-start gap-4 border-2 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${brand}55` }}>
            <div>
              <p className="font-semibold">Ready to try it?</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                {ctaText(guide)} — free, no signup, original quality.
              </p>
            </div>
            {platformSlug && (
              <Link
                href={platformSlug}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold text-white transition hover:brightness-110"
                style={{ background: brand }}
              >
                <Download size={16} /> {guide.ctaLabel}
              </Link>
            )}
          </Card>
        </Reveal>

        {/* tips */}
        <section className="mt-12">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Tips that save you time</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-5 space-y-3">
              {guide.tips.map((t) => (
                <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[rgb(var(--muted))]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: brand }} />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* faq */}
        <section className="mt-12">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          </Reveal>
          <div className="mt-6">
            <FaqAccordion items={guide.faq} />
          </div>
        </section>

        {/* related guides */}
        <section className="mt-14">
          <Reveal>
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">Keep reading</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {others.map((g2) => (
                <Link
                  key={g2.slug}
                  href={`/guides/${g2.slug}`}
                  className="hairline group rounded-2xl bg-[rgb(var(--surface))] p-5 transition hover:-translate-y-0.5"
                >
                  <span className="inline-flex items-center gap-2 text-[12px] font-medium" style={{ color: brandColor(g2.platform) }}>
                    <PlatformLogo platform={g2.platform} size={13} /> {PLATFORM_META[g2.platform].label}
                  </span>
                  <p className="mt-2 text-sm font-medium leading-snug">{g2.title}</p>
                  <ReadMore />
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      </article>
    </div>
  );
}

function ReadMore() {
  return (
    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[rgb(var(--muted))] transition group-hover:text-[rgb(var(--fg))]">
      Read more <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  );
}

function ctaText(guide: (typeof GUIDES)[number]): string {
  const labels: Record<string, string> = {
    instagram: "Open the Instagram downloader",
    youtube: "Open the YouTube downloader",
    facebook: "Open the Facebook downloader",
    pinterest: "Open the Pinterest downloader",
    vimeo: "Open the Vimeo downloader",
  };
  return labels[guide.platform] ?? guide.ctaLabel;
}
