"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine, Check, ClipboardPaste, Copy, Download, ExternalLink, Loader2, ShieldCheck, XCircle,
} from "lucide-react";
import { detectPlatform, PLATFORM_META } from "@/lib/resolver/detector";
import { PlatformLogo } from "@/components/icons/platform-icons";
import type { MediaItem, MediaResult } from "@/types/media";
import { Button, Card, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/activity";

// Download filename = the video's actual caption/title, cleaned for disk.
// Falls back to platform-id only when there is no title at all.
function niceFilename(title: string | undefined, fallback: string): string {
  const cleaned = (title ?? "")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned.length > 100 ? cleaned.slice(0, 100).trimEnd() : cleaned) || fallback;
}

type Stage = "idle" | "resolving" | "done" | "error";
type DlState = "ready" | "preparing" | "downloading" | "complete";

const STEPS = ["Link detected", "Platform identified", "Fetching media", "Preparing download", "Ready"];

export function Downloader({
  compact = false,
  initialUrl = "",
  placeholder = "Paste any public link…",
  disabled = false,
}: {
  compact?: boolean;
  initialUrl?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState(initialUrl);
  // The source link that produced the current result — used to transparently
  // re-resolve when a resolver tunnel link expires before the user saves.
  const sourceRef = useRef(initialUrl);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<MediaResult | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dl, setDl] = useState<Record<string, DlState>>({});
  const [dlPct, setDlPct] = useState<Record<string, number>>({});
  const [dlErr, setDlErr] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(m: MediaItem) {
    if (!m.url) return;
    try {
      await navigator.clipboard.writeText(m.url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = m.url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedId(m.id);
    setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 2000);
  }

  const platform = useMemo(() => (url.trim() ? detectPlatform(url.trim()) : null), [url]);

  async function paste() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setUrl(t.trim());
        setStage("idle");
        setError("");
      }
    } catch { /* clipboard denied */ }
  }

  async function fetchResolve(source: string): Promise<MediaResult> {
    const res = await fetch("/api/media/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: source }),
    });
    // Defensive parse: server always returns JSON now, but never let a
    // non-JSON body surface as "Unexpected token…" to the user.
    let j: {
      success?: boolean;
      error?: string;
      platform?: MediaResult["platform"];
      contentType?: MediaResult["contentType"];
      title?: string;
      thumbnail?: string;
      author?: MediaResult["author"];
      media?: MediaResult["media"];
    } | null = null;
    try {
      j = await res.json();
    } catch {
      throw new Error(`Server error (${res.status}). Please try again.`);
    }
    if (!res.ok || !j || j.success !== true)
      throw new Error(typeof j?.error === "string" ? j.error : "Something went wrong. Please try again.");
    return j as MediaResult;
  }

  async function resolve() {
    if (!url.trim()) return;
    setStage("resolving");
    setError("");
    setResult(null);
    setProgress(0);
    // YouTube is temporarily disabled — YouTube's anti-bot protection is
    // blocking automated streams for now; the service returns in the future.
    if (platform === "youtube") {
      await new Promise((r) => setTimeout(r, 400));
      setError("YouTube downloads are temporarily unavailable. The service will be re-enabled in the future.");
      setStage("error");
      return;
    }
    // staged progress animation (never a dead spinner)
    for (const p of [12, 34, 58, 79]) {
      await new Promise((r) => setTimeout(r, 260));
      setProgress(p);
    }
    try {
      const j = await fetchResolve(url.trim());
      sourceRef.current = url.trim();
      setResult(j);
      logActivity({
        kind: "resolve",
        url: url.trim(),
        platform: j.platform ?? "unknown",
        title: j.title,
      });
      setStage("done");
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStage("error");
    }
  }

  function fileExt(u?: string, fmt?: string, type?: string): string {
    if (fmt) return `.${fmt.toLowerCase()}`;
    const m = u?.match(/\.(mp4|webm|mov|m4a|mp3|jpg|jpeg|png|webp|gif)(\?|#|$)/i);
    if (m) return `.${m[1].toLowerCase()}`;
    // Sane fallback by media kind so saved files never end extension-less.
    if (type === "audio") return ".mp3";
    if (type === "image") return ".jpg";
    return ".mp4";
  }

  async function downloadItem(m: MediaItem, prefix: string, isRetry = false) {
    if (!m.url) return;
    const key = m.id;
    setDlErr((s) => {
      if (!s[key]) return s;
      const n = { ...s };
      delete n[key];
      return n;
    });
    setDl((s) => ({ ...s, [key]: "preparing" }));
    setDlPct((s) => ({ ...s, [key]: 0 }));
    try {
      const filename = `${prefix}${fileExt(m.url, m.format, m.type)}`;
      const res = await fetch(
        `/api/media/download?url=${encodeURIComponent(m.url)}&filename=${encodeURIComponent(filename)}`,
      );
      // Server errors come back as JSON — surface them as text instead of
      // saving a garbage file to disk.
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || ct.includes("application/json")) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `Download failed (${res.status}). Please try again.`);
      }
      setDl((s) => ({ ...s, [key]: "downloading" }));
      // Stream with real progress instead of blind blob wait.
      const total =
        Number(res.headers.get("content-length") ?? res.headers.get("estimated-content-length") ?? 0) || 0;
      if (!res.body) throw new Error("Download stream failed. Please try again.");
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0)
            setDlPct((s) => ({ ...s, [key]: Math.min(99, Math.round((loaded / total) * 100)) }));
        }
      }
      const blob = new Blob(chunks, { type: ct.split(";")[0] || "application/octet-stream" });
      if (blob.size === 0)
        throw new Error("Empty file received — the link likely expired. Resolve again and download immediately.");
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 5000);
      setDl((s) => ({ ...s, [key]: "complete" }));
      logActivity({
        kind: "download",
        url: m.url ?? "",
        platform: result?.platform ?? "unknown",
        title: result?.title ?? filename,
      });
      setTimeout(() => setDl((s) => ({ ...s, [key]: "ready" })), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed. Please try again.";
      // Resolver tunnel links expire (~1h) or silently stop serving bytes.
      // Transparently re-resolve the source once and retry with a fresh URL.
      const staleLink = /expired|unavailable|empty|couldn/i.test(msg);
      if (!isRetry && staleLink && sourceRef.current) {
        try {
          const fresh = await fetchResolve(sourceRef.current);
          setResult(fresh);
          const fm =
            fresh.media.find((x) => x.id === m.id && x.url && x.url !== m.url) ??
            fresh.media.find((x) => x.type === m.type && x.url && x.url !== m.url);
          if (fm) {
            return downloadItem(fm, prefix, true);
          }
        } catch { /* re-resolve failed — show the original error */ }
      }
      setDl((s) => ({ ...s, [key]: "ready" }));
      setDlErr((s) => ({ ...s, [key]: msg }));
    }
  }

  const doneCount = stage === "done" ? STEPS.length : stage === "resolving" ? Math.min(4, 2 + Math.floor(progress / 30)) : url.trim() ? 1 : 0;

  return (
    <div className="w-full">
      {/* ── Input bar ── */}
      <Card className={cn("overflow-hidden p-2", compact ? "rounded-2xl" : "rounded-[22px]")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--surface))] text-[rgb(var(--muted))]">
              {platform ? (
                <PlatformLogo platform={platform} size={16} style={{ color: PLATFORM_META[platform].color }} />
              ) : (
                <ArrowDownToLine size={17} />
              )}
            </span>
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (stage !== "idle") setStage("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && resolve()}
              placeholder={placeholder}
              aria-label="Paste a public media link"
              spellCheck={false}
              disabled={disabled}
              className={cn(
                "w-full bg-transparent text-[15px] outline-none placeholder:text-[rgb(var(--muted))]",
                disabled && "cursor-not-allowed opacity-60",
              )}
            />
            <AnimatePresence>
              {platform && !disabled && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--surface))] px-3 py-1.5 text-xs font-medium sm:flex"
                >
                  <PlatformLogo platform={platform} size={13} style={{ color: PLATFORM_META[platform].color }} />
                  {PLATFORM_META[platform].label} detected
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 p-1">
            {!disabled && (
              <button
                onClick={paste}
                className="hairline inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
              >
                <ClipboardPaste size={16} /> Paste
              </button>
            )}
            <Button
              onClick={resolve}
              disabled={disabled || !url.trim() || stage === "resolving"}
              className="px-7"
            >
              {stage === "resolving" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {disabled ? "Unavailable" : stage === "resolving" ? "Fetching…" : "Download"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Processing stages ── */}
      <AnimatePresence mode="wait">
        {(stage === "resolving" || stage === "done") && url.trim() && (
          <motion.div
            key="stages"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="mt-4 p-5">
              <ol className="space-y-2.5">
                {STEPS.map((s, i) => {
                  const done = i < doneCount;
                  const active = i === doneCount && stage === "resolving";
                  return (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span className={cn(
                        "grid h-5 w-5 place-items-center rounded-full text-[11px]",
                        done ? "bg-[rgb(var(--accent))] text-[rgb(var(--bg))]"
                          : active ? "border border-[rgb(var(--accent))]" : "hairline text-[rgb(var(--muted))]",
                      )}>
                        {done ? <Check size={12} strokeWidth={3} /> : active ? <Loader2 size={11} className="animate-spin" /> : <span className="h-1 w-1 rounded-full bg-current" />}
                      </span>
                      <span className={done || active ? "" : "text-[rgb(var(--muted))]"}>{s}</span>
                      {active && <span className="ml-auto font-mono text-[11px] text-[rgb(var(--muted))]">{progress}%</span>}
                    </li>
                  );
                })}
              </ol>
              {stage === "resolving" && (
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-[rgb(var(--surface))]">
                  <motion.div
                    className="h-full rounded-full bg-[rgb(var(--accent))]"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* ── Error ── */}
        {stage === "error" && (
          <motion.div key="err" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="mt-4 flex items-start gap-3 border-red-500/30 p-5">
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium">Couldn&apos;t fetch that link</p>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">{error}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Result ── */}
        {stage === "done" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="mt-4 overflow-hidden">
              {result.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.thumbnail} alt={result.title ?? "Media preview"} className="aspect-video w-full object-cover" loading="lazy" />
              )}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{result.platform}</Badge>
                  <Badge>{result.contentType}</Badge>
                  {result.cached && <Badge>cached</Badge>}
                </div>
                {result.title && <h3 className="mt-3 font-semibold leading-snug">{result.title}</h3>}
                {result.author?.name && (
                  <p className="mt-1 text-sm text-[rgb(var(--muted))]">by {result.author.name}</p>
                )}
                {(() => {
                  const a = result.media.find((x) => x.type === "audio" && x.url);
                  return a?.url ? (
                    <audio key={a.url} src={a.url} controls preload="none" className="mt-4 w-full" />
                  ) : null;
                })()}
                {(() => {
                  const v = result.media.find((x) => x.type === "video" && x.url);
                  return v?.url ? (
                    <div className="hairline mt-4 overflow-hidden rounded-2xl bg-black">
                      <video
                        key={v.url}
                        src={v.url}
                        controls
                        preload="metadata"
                        playsInline
                        className="max-h-[420px] w-full"
                      />
                    </div>
                  ) : null;
                })()}
                <div className="mt-5 space-y-2">
                  {result.media.length === 0 && (() => {
                    const hasMeta =
                      Boolean(result.thumbnail) ||
                      (Boolean(result.title) && result.title !== "Public media");
                    if (!hasMeta) {
                      return (
                        <div className="rounded-2xl bg-[rgb(var(--surface))] p-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
                          <span className="font-medium text-[rgb(var(--fg))]">We couldn&apos;t find this media. </span>
                          It&apos;s likely private, deleted, or age-restricted — or the link
                          isn&apos;t a media page (channel and playlist pages aren&apos;t supported).
                          Open the link in an incognito window: if it doesn&apos;t play there,
                          we can&apos;t fetch it either.
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-2xl bg-[rgb(var(--surface))] p-4 text-sm text-[rgb(var(--muted))]">
                        Preview ready. Connect a resolver (e.g. Cobalt API via{" "}
                        <code className="font-mono text-xs">COBALT_API_URL</code>) to unlock
                        direct HD downloads for {result.platform}. Metadata + thumbnails work out of the box.
                      </div>
                    );
                  })()}
                  {result.media.map((m, i) => {
                    const st = dl[m.id] ?? "ready";
                    const rowErr = dlErr[m.id];
                    const pct = dlPct[m.id] ?? 0;
                    return (
                      <div key={m.id} className="hairline rounded-2xl bg-[rgb(var(--surface))] p-3">
                        <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--bg))] font-mono text-[11px] text-[rgb(var(--muted))]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {m.type} {m.quality ? `· ${m.quality}` : ""} {m.format ? `· ${m.format.toUpperCase()}` : ""}
                          </p>
                          <p className="font-mono text-[11px] text-[rgb(var(--muted))]">
                            {m.width && m.height ? `${m.width}×${m.height}` : m.type}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => downloadItem(m, niceFilename(result.title, `${result.platform}-${m.id}`))}
                          disabled={st === "preparing" || st === "downloading"}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent))] px-4 py-2 text-[13px] font-semibold text-[rgb(var(--bg))] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                        >
                          {st === "ready" && (<><Download size={14} /> Download</>)}
                          {st === "preparing" && (<><Loader2 size={14} className="animate-spin" /> Preparing…</>)}
                          {st === "downloading" && (<><Download size={14} /> {pct > 0 ? `${pct}%` : "Saving…"} </>)}
                          {st === "complete" && (<><Check size={14} strokeWidth={3} /> Saved</>)}
                        </button>
                        {m.url && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open source video in new tab"
                            aria-label="Open source video in new tab"
                            className="hairline grid h-9 w-9 place-items-center rounded-full text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {m.url && (
                          <button
                            onClick={() => copyLink(m)}
                            title={copiedId === m.id ? "Copied!" : "Copy source link"}
                            aria-label="Copy source link"
                            className="hairline grid h-9 w-9 place-items-center rounded-full text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                          >
                            {copiedId === m.id ? <Check size={15} strokeWidth={3} /> : <Copy size={15} />}
                          </button>
                        )}
                        </div>
                        </div>
                        {(st === "downloading" || st === "preparing") && (
                          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[rgb(var(--bg))]">
                            {pct > 0 ? (
                              <div
                                className="h-full rounded-full bg-[rgb(var(--accent))] transition-[width] duration-200"
                                style={{ width: `${pct}%` }}
                              />
                            ) : (
                              <div className="h-full w-1/3 animate-pulse rounded-full bg-[rgb(var(--accent))]" />
                            )}
                          </div>
                        )}
                        {rowErr && (
                          <p className="mt-2 px-1 text-[13px] leading-snug text-red-400">{rowErr}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-[rgb(var(--muted))]">
                  <ShieldCheck size={13} /> Only download content you own or are permitted to save.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
