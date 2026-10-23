# FetchMedia — Universal Media Downloader

One input. Any supported platform. Paste → Detect → Preview → Download.

**Supported platforms: Instagram · YouTube · Facebook · Pinterest · Vimeo.**

![stack](https://img.shields.io/badge/Next.js-15-black) ![Tailwind](https://img.shields.io/badge/Tailwind-4-blue) ![Supabase](https://img.shields.io/badge/Supabase-postgres-green) ![R2](https://img.shields.io/badge/Cloudflare-R2-orange)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill your keys (all placeholders already inside)
npm run dev                  # http://localhost:3000
```

## Env (all keys pre-listed in `.env.example` / `.env.local`)

| Key | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | server only |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Cloudflare R2 |
| `COBALT_API_URL` / `COBALT_API_KEY` | optional HD resolver (adapters degrade gracefully without it) |
| `UPSTASH_REDIS_REST_*` | optional (in-memory limiter otherwise) |
| `ADMIN_EMAILS` | admin gate |

## Scripts

```bash
npm run dev | build | start | lint | typecheck
npm run test          # vitest — detector, validation/SSRF, adapter isolation
```

## Architecture

```
paste → POST /api/media/resolve → validate (zod + SSRF guards)
      → rate-limit → cache → PlatformDetector → ResolverManager
      → isolated PlatformAdapter → normalized MediaResult → preview
download → GET /api/media/download (R2 signed URL or safe streamed proxy)
```

See `DESIGN.md` for the full visual system (7 accents × day/night, motion, landing layout).

## Unlocking real HD downloads

Out of the box: platform detection, metadata + thumbnails (oEmbed/Reddit JSON),
preview UI, safe downloads of whatever direct URLs the source exposes.

For direct video files (YouTube videos, Facebook clips, Pinterest pins,
Vimeo videos…), self-host
[Cobalt](https://github.com/imputnet/cobalt) and set in `.env.local`:

```bash
COBALT_API_URL=https://your-host/   # current versions (POST /), or …/api/getMedia for classic
COBALT_API_KEY=optional-if-your-instance-needs-it
```

…then restart the dev server. Adapters call it with a 25s timeout and merge
returned files with oEmbed metadata; classic `redirect`/`picker` shapes and new
`tunnel`/`redirect` shapes are both parsed. An extra audio pass (`downloadMode:
"audio"` → MP3) is merged alongside the video, so every resolved video also
offers an audio-only download. If Cobalt is absent or fails, the app silently
falls back to metadata — never invented qualities.

## Deploy (Vercel)

1. Push to GitHub → import in Vercel.
2. Add env vars from `.env.example` (no `NEXT_PUBLIC_` for secrets).
3. Run `supabase/schema.sql` in Supabase SQL editor (10 tables + analytics view + RLS + signup trigger + status seeds).
4. Set R2 lifecycle: prefix `downloads/` → expire after 1–3 days.

## Legal

Independent service, no affiliation with platforms. Only download content you own or are
permitted to save. Private/login-protected content is never accessed. See `/privacy`, `/terms`, `/copyright`.
