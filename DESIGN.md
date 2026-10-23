# ✦ FetchMedia — Design System

> **Fast. Minimal. Premium. Universal.**
> Apple-grade restraint · Vercel-grade precision · Linear-grade motion — with our own identity.

---

## 1 · Brand

| Token | Value |
|---|---|
| Name | **FetchMedia** |
| Voice | Quiet, confident, technical |
| Personality | minimal + cinematic + technical + luxurious |
| Never | neon gradients, glassmorphism soup, floating blobs, stock illustrations |

---

## 2 · Color — 7 Accents × Day/Night

Each accent works in **Day (light)**, **Night (dark)** and **System** mode. Switcher lives in the navbar.

| Accent | Night `rgb` | Day `rgb` | Mood |
|---|---|---|---|
| 🖤 **Ink** (default) | `245 245 244` | `12 12 13` | Editorial, Apple-like |
| 🤍 **Snow** | `245 245 244` | `17 24 39` | Paper-white SaaS |
| 🩷 **Blush** | `244 114 182` | `219 39 119` | Instagram blush |
| 💛 **Honey** | `250 204 21` | `161 98 7` | Warm, optimistic |
| 💚 **Moss** | `52 211 153` | `4 120 87` | Calm, Stripe-like |
| 💙 **Azure** | `96 165 250` | `29 78 216` | Facebook blue hour |
| ❤️ **Maroon** | `248 113 113` | `153 27 27` | Cinematic velvet |

### Surfaces

```
--bg      page          Night 8 8 10        Day 250 250 249
--bg-elev bands         Night 14 14 17      Day 255 255 255
--surface controls      Night 16 16 19      Day 255 255 255
--card    glass cards   Night 20 20 24/72   Day 255 255 255/80
--line    hairlines     white 9% / black 10%
--glow    accent halo   accent @ ~25%
```

> Rule: **no hardcoded hex in components** — only `rgb(var(--…))` tokens.

---

## 3 · Typography

```
Display   Geist / Inter, 600, tracking -0.04em, leading 0.95
          Hero  48 → 96px · H1 40 → 60px · H2 30 → 40px
Body      15–18px, muted #a1a1aa for secondary
Mono      Geist Mono — badges, steps, hashes, IDs (11–12px, UPPER, tracking 0.12em)
```

Hierarchy is **editorial + spacious**: one idea per screen, generous whitespace.

---

## 4 · Shape & Depth

```
Radius    input 22px · cards 24px (rounded-3xl) · pills full
Borders   1px hairline rgb(var(--line)) — always, never heavy rings
Shadow    0 20px 80px -20px black/50 + accent glow on CTA
Grain     fixed SVG fractal-noise overlay @ 5% opacity (.grain)
```

---

## 5 · Motion (Framer Motion)

| Moment | Motion |
|---|---|
| Hero entrance | `opacity + y + blur(10px)`, 0.6–0.8s, `cubic-bezier(0.22,1,0.36,1)` |
| Platform detected | pill pops: `scale 0.85→1 + blur 4→0` |
| Stages | checklist ticks + thin progress bar, never a dead spinner |
| Result card | `y 24 + scale .98 + blur 8 → sharp`, 0.55s |
| Buttons | `hover scale 1.02 + brightness 1.1 · press 0.98` |
| Scroll | `whileInView` stagger 0.06–0.1s, once |
| Reduced motion | `prefers-reduced-motion` kills all animation |

Keep mobile calm: transforms + opacity only, no cursor effects on touch.

---

## 6 · Landing Layout (10 sections)

```
01 Hero — massive "Download Media.", subcopy, downloader card, platform strip
02 Marquee — scroll-linked platform pills (Instagram → Vimeo)
03 Platforms — 5 adapter cards: official logo + name + supported types, links to SEO pages
04 Live demo — second compact downloader (conversion anchor)
05 How it works — 01 Copy · 02 Paste · 03 Download (band background)
06 Features — 6 cards: detection, previews, isolation, privacy, limits, themes
07 Privacy — one-line trust note inside downloader + FAQ coverage
08 FAQ — 5 real answers (account, links, private, legal, storage)
09 Final CTA — glow card: "Paste. Preview. Download."
10 Footer — 4 columns + independence disclaimer + © line
```

### Hero composition

```
        ✦ Universal media downloader          (mono badge)
        Download                              (huge, fg)
        Media.                                (huge, muted)
   One link. Multiple platforms.              (muted)
┌──────────────────────────────────────────┐
│ ●  Paste a link…            [Paste][Dl]   │  (card, hairline)
└──────────────────────────────────────────┘
   Instagram · YouTube · Facebook · X …      (mono strip)
   ⚡ Instant   ▦ No account   🛡 Public only
```

### Downloader states

```
idle → [input] → resolving (5 staged steps + % bar)
     → done (preview + per-format rows + Download All feel)
     → error (friendly card, never a stack trace)
Download button: ↓ Download → ◌ Preparing… → ↓ Saving… → ✓ Saved
```

---

## 7 · Per-Platform Color Echo

Platform dots reuse brand hues **only as 8–12px dots** — never full-page theming:

```
Instagram #E1306C · YouTube #FF0000 · Facebook #0866FF · Pinterest #BD081C · Vimeo #1AB7EA
```

Page theme stays user-selected; SEO pages add one tinted badge.

---

## 8 · Responsive

```
Mobile (<640)   stacked input + full-width CTA, thumb-friendly 48px targets,
                result rows wrap, marquee slows
Tablet          2-col platform grid
Desktop         3–4 col grids, max-w-6xl (1152px), sticky navbar blur
```

---

## 9 · Accessibility

- Skip-to-content link, semantic landmarks, real `<ol>` for steps
- `aria-pressed` on every theme/mode toggle, labelled inputs
- Focus ring: `2px accent @ 3px offset`
- Contrast: muted text ≥ 4.5:1 on both modes
- `prefers-reduced-motion` respected globally

---

## 10 · Performance budget

```
LCP < 2.5s · CLS < 0.1 · INP < 200ms
Server Components by default · client islands: downloader, theme, motion
Images lazy + remotePatterns · no WebGL · no bg video · minimal JS
```

---

## 11 · Extending the system

New accent? Add 3 lines in `app/globals.css`:

```css
[data-accent="grape"] { --accent: 192 132 252; --accent-strong: 216 180 254; --glow: 192 132 252 / 0.28; }
```

…plus one entry in `ACCENTS` (`components/theme/provider.tsx`). Everything else follows automatically.

## 12 · Per-platform brand theming

Platform SEO pages (`/[platform]`) wrap themselves in `<PlatformTheme platform>` which
overrides **only** `--accent / --accent-strong / --glow` with the company color —
surfaces and Day/Night mode stay untouched:

```
Instagram #E1306C · YouTube #FF0000 · Facebook #0866FF · Pinterest #BD081C · Vimeo #1AB7EA
```

Buttons, glows, badges and progress all follow the brand automatically via tokens.
Cards additionally support a per-item `--pc` glow var for hover halos.
