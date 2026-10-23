import Link from "next/link";

export function Footer() {
  const cols: { h: string; links: { label: string; href: string }[] }[] = [
    {
      h: "Downloaders",
      links: [
        { label: "Instagram Downloader", href: "/instagram-downloader" },
        { label: "YouTube Downloader", href: "/youtube-downloader" },
        { label: "Facebook Downloader", href: "/facebook-downloader" },
        { label: "Pinterest Downloader", href: "/pinterest-downloader" },
        { label: "Vimeo Downloader", href: "/vimeo-downloader" },
      ],
    },
    {
      h: "Product",
      links: [
        { label: "All platforms", href: "/all-platforms" },
        { label: "Guides", href: "/guides" },
        { label: "Status", href: "/status" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      h: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Copyright", href: "/copyright" },
      ],
    },
  ];
  return (
    <footer className="border-t border-[rgb(var(--line))] py-12 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="text-lg font-semibold tracking-tight">FetchMedia</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[rgb(var(--muted))]">
            One link. Multiple platforms. A premium universal media downloader for
            public content you have the right to save.
          </p>
          <p className="mt-5 font-mono text-[11px] text-[rgb(var(--muted))]">
            Independent service. Not affiliated with YouTube, Facebook, Pinterest or Vimeo.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[rgb(var(--muted))]">{c.h}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-14 max-w-6xl px-5 font-mono text-[11px] text-[rgb(var(--muted))]">
        © 2026 FetchMedia · Only download content you own or are permitted to save.
      </p>
    </footer>
  );
}
