import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "@/app/globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FetchMedia — Free Universal Media Downloader (Instagram, YouTube, Facebook, Pinterest, Vimeo)",
    template: "%s · FetchMedia",
  },
  description:
    "Paste one public link from Instagram, YouTube, Facebook, Pinterest or Vimeo and save videos, reels, photos, pins and audio in seconds. Free online video downloader — no signup, no ads, no watermarks.",
  keywords: [
    "media downloader", "video downloader", "free online downloader",
    "instagram video downloader", "instagram reels downloader", "instagram photo downloader",
    "facebook video downloader", "fb video download",
    "pinterest video downloader", "pinterest image downloader", "pin saver",
    "vimeo downloader", "vimeo video download",
    "youtube video downloader", "youtube shorts downloader", "youtube audio downloader",
    "save reels online", "download videos in seconds", "fetchmedia",
  ],
  applicationName: "FetchMedia",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FetchMedia — One link. Save anything.",
    description:
      "Paste a public media link, preview it, download it in seconds. Instagram, YouTube, Facebook, Pinterest and Vimeo in one clean downloader.",
    url: "/",
    type: "website",
    siteName: "FetchMedia",
  },
  twitter: {
    card: "summary_large_image",
    title: "FetchMedia — One link. Save anything.",
    description:
      "Paste a public media link, preview it, download it in seconds. Instagram, YouTube, Facebook, Pinterest and Vimeo in one clean downloader.",
  },
  robots: { index: true, follow: true },
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "FetchMedia",
      url: APP_URL,
      description:
        "Universal media downloader — paste a public link from Instagram, YouTube, Facebook, Pinterest or Vimeo and save the media in seconds.",
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: "FetchMedia",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: APP_URL,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Instagram reels and photo downloads",
        "Facebook video downloads",
        "Pinterest pin photo and video downloads",
        "Vimeo video downloads",
        "Audio-only downloads where available",
        "No signup required",
      ],
    },
    {
      "@type": "Organization",
      name: "FetchMedia",
      url: APP_URL,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain min-h-screen antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
        <ThemeProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[rgb(var(--accent))] focus:px-4 focus:py-2 focus:text-sm">
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
