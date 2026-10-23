// Guides are data-driven: each entry is a complete, SEO-targeted article
// rendered by app/guides/[guide]. To publish a new guide, add one object
// here and rebuild — breadcrumbs, HowTo / FAQ schema and internal links are
// generated automatically.

import type { Platform } from "@/types/media";

export type Guide = {
  slug: string;
  platform: Platform;
  title: string;
  description: string;
  keywords: string[];
  readMinutes: number;
  updated: string;
  intro: string;
  steps: { title: string; body: string }[];
  tips: string[];
  faq: { q: string; a: string }[];
  ctaLabel: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-download-instagram-reels",
    platform: "instagram",
    title: "How to Download Instagram Reels (Free, No App, 2026)",
    description:
      "Step-by-step guide to download Instagram reels in HD on any device — phone or PC — without installing an app. Free, watermark-free files, no signup.",
    keywords: ["how to download instagram reels", "instagram reels download", "save instagram reels", "reels downloader online", "download instagram reels on pc"],
    readMinutes: 4,
    updated: "2026-10-23",
    ctaLabel: "Open the Instagram Reels downloader",
    intro:
      "Instagram reels are shared everywhere, yet the app gives you no save button for someone else's reel. The good news: you don't need an app, a login or a shady extension. This guide shows the fastest free way to download any public Instagram reel in the original quality on a phone or a computer, using nothing more than the reel's link.",
    steps: [
      {
        title: "Open the reel in the Instagram app",
        body:
          "Tap on the reel so it opens full-screen. Any public account's reel works — private or followers-only accounts can't be downloaded by anyone, and honest tools won't try.",
      },
      {
        title: "Copy the reel link",
        body:
          "Tap the paper-airplane (share) icon under the reel, then choose 'Copy link'. You'll get a clean URL like instagram.com/reel/C…/. On a desktop browser you can simply copy the URL from the address bar.",
      },
      {
        title: "Paste the link into the downloader",
        body:
          "Open FetchMedia, paste the link in the box and press Download. Detection is instant — the reel is fetched together with its cover, author and caption title.",
      },
      {
        title: "Preview, then save",
        body:
          "You'll see the original video quality returned by the source, plus an MP3 option when the source exposes an audio stream. Hit Download next to the format you want — the file is named after the reel's actual caption, not a random code.",
      },
    ],
    tips: [
      "Reels are vertical video — for a crisp result pick the highest quality listed.",
      "One link can hide more than one file: multi-slide posts are expanded item by item.",
      "Saved links expire quickly; paste → download in one go.",
      "If a reel was deleted or set private after you copied the link, the resolver will tell you it's unavailable instead of returning junk.",
    ],
    faq: [
      { q: "Is this free or is there a limit?", a: "Guests get generous fair-use hourly limits and signup is never required for a reel." },
      { q: "Do reels save with a watermark?", a: "No. You get the source file as the creator uploaded it — no overlay, no logo, no re-encoding to jot quality down." },
      { q: "Why does my reel show as unavailable?", a: "The post is private, deleted or the region blocks it. Only publicly visible reels can be fetched." },
      { q: "Can I download just the sound?", a: "Yes — when the source provides audio it appears as a separate MP3 item next to the video." },
    ],
  },
  {
    slug: "how-to-download-instagram-photos",
    platform: "instagram",
    title: "How to Download Instagram Photos (Full Quality, No App)",
    description:
      "Save any public Instagram photo, carousel slide or profile post in full resolution on phone or PC — free, without an app and without login.",
    keywords: ["how to download instagram photos", "instagram photo downloader", "save instagram photos", "instagram carousel download"],
    readMinutes: 3,
    updated: "2026-10-23",
    ctaLabel: "Open the Instagram photo downloader",
    intro:
      "Instagram compresses what you see in the feed and hides the original quality. Whether it is a single photo or a ten-slide carousel, you can pull every slide in full resolution with nothing more than the post link — no app install, no account, no jpeg soup.",
    steps: [
      {
        title: "Open the post and copy its link",
        body:
          "In the Instagram app tap the three-dot menu on the post, then 'Copy link'. Desktop users can copy the URL straight from the browser — /p/ links and carousels work the same.",
      },
      {
        title: "Paste it into the photo downloader",
        body:
          "FetchMedia detects the content type automatically. A carousel is not one blob: every slide appears as its own separate item so you can grab one or all.",
      },
      {
        title: "Pick the slides you want",
        body:
          "Each item shows its format and quality. Download a single slide or every slide in sequence — files are labelled so you can tell them apart later.",
      },
    ],
    tips: [
      "Screenshot = compression. A fetched file is the original upload quality.",
      "Secret boards and private posts can't be reached — and that's a feature, not a bug.",
      "Move fast: fetched links are short-lived by design, download right after previewing.",
    ],
    faq: [
      { q: "Do carousels really expand?", a: "Yes — every public carousel slide becomes its own downloadable item." },
      { q: "Is the quality the original?", a: "You receive the file the creator uploaded, not a re-compressed copy." },
      { q: "Does this work for profile photos?", a: "Any public post link works. Avatar-only pages (profile URLs without a /p/ post) aren't media pages." },
    ],
  },
  {
    slug: "how-to-download-facebook-video-hd",
    platform: "facebook",
    title: "How to Download Facebook Videos in HD (Watch, Page & fb.watch)",
    description:
      "Download any public Facebook video — Watch clips, Page videos or fb.watch links — in HD on any device. Free, no app, no login, watermark-free.",
    keywords: ["how to download facebook videos", "facebook video downloader hd", "download fb video", "fb.watch downloader"],
    readMinutes: 3,
    updated: "2026-10-23",
    ctaLabel: "Open the Facebook video downloader",
    intro:
      "Facebook plays its videos well but locks the file away. Public Watch clips and Page videos can be saved directly in HD with just the post link. Group-only or friends-only videos are a different story — nobody outside the audience can fetch those, and any tool claiming otherwise is lying to you.",
    steps: [
      {
        title: "Open the video post",
        body:
          "Locate the video in the Facebook app or on facebook.com in a browser. Public Page videos resolve most reliably; Watch clips and short fb.watch links work identically.",
      },
      { title: "Copy the video link", body: "Use the share menu → 'Copy link'. On desktop, the browser URL bar already holds the correct address." },
      {
        title: "Paste, preview and save",
        body:
          "Drop the link into the downloader. You get a preview with title and author first, then the qualities the source genuinely exposes. If a live stream is still running, come back once it has ended and Facebook publishes the replay.",
      },
    ],
    tips: [
      "fb.watch short links are equal citizens — no need to expand them.",
      "Audience matters: if the post is friends-only, it will correctly show unavailable.",
      "Private videos are never accessed, so you never download something you shouldn't.",
    ],
    faq: [
      { q: "Which Facebook videos work?", a: "Public videos: Page uploads, Watch replays, public groups are not accessible. If a logged-out browser can see it, we can fetch it." },
      { q: "Do I need the exact watch URL?", a: "No — watch links, page video permalinks and fb.watch shorts all resolve the same way." },
      { q: "Can I download Facebook audio only?", a: "Where the integration exposes an audio stream, it shows up as a separate MP3 download." },
    ],
  },
  {
    slug: "how-to-save-pinterest-videos-and-images",
    platform: "pinterest",
    title: "How to Save Pinterest Videos and Images (Pin in Full Quality)",
    description:
      "Save any public Pinterest pin — image, video or idea pin — in the best available resolution on phone or desktop. Free pin saver, no app, no watermark.",
    keywords: ["how to save pinterest videos", "pinterest video downloader", "pinterest image downloader", "save pins", "pinterest pin saver"],
    readMinutes: 3,
    updated: "2026-10-23",
    ctaLabel: "Open the Pinterest downloader",
    intro:
      "Pinterest is a visual search engine, yet it won't give you the raw file when you want to keep a pin. The pin's original image or video can be saved in seconds: paste the pin link, preview, download. pin.it short links are equally welcome.",
    steps: [
      {
        title: "Open the pin you want to keep",
        body: "Open the pin so its detail page shows. Every public pin works; secret boards and login-walled content are out of scope for everyone.",
      },
      {
        title: "Copy the pin link",
        body: "Use the share button → copy link, or copy the URL on desktop. Short pin.it links resolve exactly like full pinterest.com/pin/… links.",
      },
      {
        title: "Save the image or the video",
        body:
          "The preview shows what the pin actually is. Image pins save the highest resolution the source exposes; video pins return the video file, and you can grab the cover image from the result too.",
      },
    ],
    tips: [
      "Quality varies by upload — the tool never upscales, it only offers what exists.",
      "Secret or private pins show as unavailable — that's Pinterest's wall, not the tool's.",
      "For a video pin, both the video and its poster image can be downloaded separately.",
    ],
    faq: [
      { q: "Are idea pins supported?", a: "Where the pin exposes a video file, it is offered as a download. All public pins resolve for preview." },
      { q: "Why is the image quality lower than I expected?", a: "The saver returns the original upload quality — Pinterest itself may have compressed it on the way in." },
      { q: "Can I download video pins on iPhone?", a: "Yes — the flow is browser-based, so it works the same on iOS, Android and desktop." },
    ],
  },
  {
    slug: "how-to-download-vimeo-videos",
    platform: "vimeo",
    title: "How to Download Vimeo Videos (Unlisted Links Included)",
    description:
      "Download Vimeo clips in original quality on any device — public and unlisted videos both supported. Free online downloader, no app or signup.",
    keywords: ["how to download vimeo videos", "vimeo video downloader", "save vimeo video", "vimeo download unlisted"],
    readMinutes: 3,
    updated: "2026-10-23",
    ctaLabel: "Open the Vimeo downloader",
    intro:
      "Vimeo usually hosts the cleanest source files of any platform, and its creators often rely on the video being portable. Link-only (unlisted) videos resolve as easily as public ones — you only need the URL in your clipboard.",
    steps: [
      {
        title: "Copy the Vimeo link",
        body: "From vimeo.com copy the video URL (or an unlisted link a creator gave you). Password-protected and domain-locked videos can't be opened by anyone without credentials.",
      },
      {
        title: "Paste it into the downloader",
        body: "Vimeo's public oEmbed resolves title, author and thumbnail instantly, then the resolver lists every quality the source truly provides.",
      },
      {
        title: "Pick the top quality and save",
        body: "Vimeo sources are frequently very high quality — take the top row. The filename comes from the video's own title so it stays organised in your library.",
      },
    ],
    tips: [
      "Unlisted (link-only) videos work — password ones don't.",
      "Staff picks, reels and showcase videos are all ordinary Vimeo videos.",
      "If a video was uploaded long ago in SD only, SD is all that exists — honesty beats fake 1080p.",
    ],
    faq: [
      { q: "Do unlisted Vimeo links work?", a: "Yes — link-only videos resolve like public ones, since the link itself is the access key." },
      { q: "Why is my video unavailable?", a: "Password-protected, private or domain-restricted embeds are never accessed." },
      { q: "What quality will I get?", a: "Exactly what the source exposes — commonly up to the creator's original upload quality." },
    ],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
