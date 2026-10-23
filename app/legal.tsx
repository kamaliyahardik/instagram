import { Badge } from "@/components/ui/primitives";

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-24">
      <Badge>Legal</Badge>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">{title}.</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[rgb(var(--muted))]">{children}</div>
    </div>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy">
      <p>FetchMedia is an independent service. We store minimal metadata (request platform, status, timing) to operate rate limits and analytics. IPs are stored as truncated hashes only.</p>
      <p>Temporary media is held in private Cloudflare R2 with signed, expiring URLs and automatic deletion — never a permanent archive.</p>
      <p>Contact: hello@example.com for data requests.</p>
    </Page>
  );
}
export function Terms() {
  return (
    <Page title="Terms">
      <p>Use FetchMedia only for public content you own, that is licensed to you, or where the owner permits downloading. Private or login-protected content is not supported and must not be submitted.</p>
      <p>FetchMedia is not affiliated with YouTube, Facebook, Pinterest or Vimeo.</p>
      <p>Abuse, circumvention attempts, or rate-limit evasion may result in blocking.</p>
    </Page>
  );
}
export function Copyright() {
  return (
    <Page title="Copyright">
      <p>If you believe content available through FetchMedia infringes your copyright, contact hello@example.com with the source URL, your ownership evidence, and requested action.</p>
      <p>We do not host source media; temporary processing copies are deleted automatically after expiry.</p>
    </Page>
  );
}
export function Contact() {
  return (
    <Page title="Contact">
      <p>Support, takedowns and platform issues: hello@example.com.</p>
      <p>Include the source URL, timestamp, and the error message you saw.</p>
    </Page>
  );
}
