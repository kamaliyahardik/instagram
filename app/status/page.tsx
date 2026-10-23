import type { Metadata } from "next";
import StatusClient from "./status-client";

import { SITE_URL } from "@/lib/site";

const APP_URL = SITE_URL;

export const metadata: Metadata = {
  title: "Service Status — Is FetchMedia Working Right Now?",
  description:
    "Live operational status for every FetchMedia platform: Instagram, Facebook, Pinterest, Vimeo and YouTube. Privacy-safe aggregate uptime and response stats.",
  alternates: { canonical: "/status" },
  openGraph: { title: "FetchMedia Service Status", url: "/status", type: "website", siteName: "FetchMedia" },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "FetchMedia Service Status",
  url: `${APP_URL}/status`,
};

export default function StatusPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <StatusClient />
    </>
  );
}
