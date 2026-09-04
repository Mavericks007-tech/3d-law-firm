# Law Firm Landing Page — Build Spec

Paste this whole file into Claude Code as the brief.
Replace `[FIRM]` with the real firm name before starting.

---

## 0. What we're building

A single-page marketing site for a law firm. Premium, restrained, heavy
on typography and whitespace. The one memorable moment is a bronze Lady
Justice sculpture that rises and grows as the visitor scrolls, with a
huge ghosted word drifting behind it at a different speed. Everything
else on the page stays quiet so that moment lands.

Audience: people with a serious legal problem who are deciding whether
to trust this firm. The feeling to hit is composure and authority — not
energy, not friendliness. Nothing bounces. Every easing curve is
slow-out.

---

## 1. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | Static export is fine, no server needed |
| Styling | Tailwind CSS v4 | CSS-first config in `globals.css` via `@theme` |
| Animation | GSAP 3 + ScrollTrigger | Registered client-side only |
| Smooth scroll | Lenis | Drives the whole scroll feel |
| Fonts | `next/font/local` | Self-hosted, no layout shift |
| Images | `next/image` | AVIF/WebP, `priority` on the hero statue |

```bash
npx create-next-app@latest firm-site --typescript --tailwind --app --eslint
cd firm-site
npm i gsap lenis
```

**Do not use** Framer Motion (Lenis + GSAP already own the scroll),
`AOS`, or any scroll-reveal library. All motion goes through one GSAP
context so it can be killed cleanly on unmount.

**Do not use** GSAP SplitText. Write a tiny `splitWords()` helper that
wraps each word in a `<span>` — it's twelve lines, has no licensing
question attached, and gives cleaner control over the highlight.

### Lenis + GSAP wiring

These two must share one ticker or the scrub will judder. Set it up once
in a `<SmoothScroll>` client component that wraps `{children}` in the
root layout:

```ts
const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```

---

## 2. Design tokens

Palette is sampled from the statue image itself so the artwork and the
UI read as one material. Put these in `globals.css` under `@theme`.

```css
--color-base:    #FAF8F4;  /* page background, warm off-white */
--color-surface: #EFEBE4;  /* nav pills, quiet chips */
--color-ink:     #171310;  /* headings and body */
--color-muted:   #8B8177;  /* sub-copy, stat labels */
--color-bronze:  #916A44;  /* primary accent — sampled from statue */
--color-shadow:  #5E4329;  /* deep bronze, button fills, hovers */
```

Rules:
- Bronze is for actions and small marks only. Never a bronze heading,
  never a bronze section background, never a bronze gradient wash.
- Body text is `--color-ink` at full strength. Do not grey it down for
  "softness" — that reads as unconfident on a page about the law.
- Exactly one border radius in the system: `999px`, for pills and
  buttons. Everything else has square corners. No card kit, no
  drop shadows anywhere on the page.

### Typography

Two families, clearly distinct in width:

- **Display** — Cabinet Grotesk (Fontshare, free). Wide, slightly odd
  letterforms, holds up at 80px+. Used for the h1 and section headings.
- **Body** — Switzer (Fontshare, free). Neutral, excellent at 16–18px.

Download both, drop the `.woff2` in `/app/fonts/`, load with
`next/font/local`. Google Fonts fallback if Fontshare is a hassle:
Archivo (display) + Inter (body).

Scale — build it as a modular scale, don't hand-pick sizes:

```
h1   clamp(2.75rem, 7vw, 5.5rem)   weight 500  tracking -0.03em  leading 0.95
h2   clamp(2rem, 4vw, 3.25rem)     weight 500  tracking -0.02em  leading 1.05
body 1.0625rem                     weight 400  leading 1.6  max-width 62ch
```

Sentence case throughout. No all-caps labels, no eyebrow text above
headings, no `→` glued onto button text.

---

## 3. Assets

Two transparent PNGs are supplied, 1024×1536:

- `statue-rear.png` — hero. Rear three-quarter view, scales held out to
  the right in clear space.
- `statue-front.png` — About section. Front view, scales to the left.

Both include a circular pedestal at the bottom. **Do not crop it off.**
Fade it out in CSS instead so the statue reads as rising out of the page
rather than sitting on a shelf:

```css
mask-image: linear-gradient(to bottom, #000 62%, transparent 92%);
```

Serve at `sizes="(max-width: 768px) 90vw, 46vw"`. Source is only 1024
wide, so never render it wider than ~560 CSS px or it will go soft.
`priority` on the hero one, lazy on the other.

---

## 4. Page structure

```
┌──────────────────────────────────────────┐
│ [logo]   (Home)(Services)(About)(Cases)  │  sticky nav, pills
│                          [ Book a call ] │
├──────────────────────────────────────────┤
│                                          │
│        Your legal partner in             │  h1, centred
│           every situation                │
│         one line of sub-copy             │
│         [ Book a consultation ]          │
│                                          │
│              L A W Y E R                 │  ghost word, huge
│                 ╱▐▌╲                     │  statue, overlaps word
│                ▐████▌                    │
├──────────────────────────────────────────┤
│    [scroll-highlighted paragraph]        │  centred, ~55ch
├──────────────────────────────────────────┤
│  12+   │  100+  │ (◍) │  95%  │   2k+    │  stats, notch in centre
├──────────────────────────────────────────┤
│  [full-bleed photograph of a lawyer]     │
│     (Corporate) (IP) (Family) (Criminal) │  floating pills
└──────────────────────────────────────────┘
```

Hero content is centre-aligned. Everything below it is left-aligned on
a 12-column grid with generous outer margin — the centring is a hero-only
gesture so it stays special.

The stats bar sits directly above the photograph and has a semicircular
notch cut out of its bottom edge, with a circular bronze medallion
sitting in the notch. Build the notch with a CSS mask, not an SVG
`<clipPath>` — it needs to survive responsive width changes:

```css
mask: radial-gradient(circle 52px at 50% 100%, transparent 98%, #000 100%);
```

---

## 5. Motion spec

This is the part that matters. Numbers below are measured off the
reference; treat them as the starting point, then tune by eye.

### 5.1 Hero load (runs once, on mount)

One orchestrated sequence, not five independent fades.

| Element | From | To | Duration | Delay |
|---|---|---|---|---|
| nav | `y:-16, opacity:0` | `y:0, opacity:1` | 0.6 | 0 |
| h1 words | `y:24, opacity:0, filter:blur(6px)` | settled | 0.7 | stagger 0.045 |
| sub-copy | `y:12, opacity:0` | settled | 0.5 | 0.45 |
| CTA | `y:12, opacity:0` | settled | 0.5 | 0.58 |

Ease `power3.out` on all of it. Total sequence under 1.4s.

The statue does **not** animate on load. It enters only through scroll —
that separation is what makes the scroll feel like it has weight.

### 5.2 Statue scroll-scrub — the centrepiece

```
trigger: hero section
start: 'top top'
end: 'bottom top'
scrub: 1            ← the 1 is essential; it creates the lag/weight
```

Statue tweens across that range:
- `scale: 0.72 → 1.18`
- `yPercent: 10 → -8`
- `transformOrigin: '50% 100%'`

Ghost word `LAWYER` on the same trigger, but slower — this is the whole
parallax illusion:
- `yPercent: 0 → -22` (roughly 0.35× the statue's travel)
- sits at `opacity: 0.055`, colour `--color-ink`
- font-size `clamp(6rem, 22vw, 20rem)`, display face, `z-index` below
  the statue and above the background

The statue must be fully opaque and sit above the word. Do not use
`mix-blend-mode: multiply` as a shortcut for the cutout — the ghost word
bleeds through the bronze and kills the depth.

### 5.3 Scroll-linked word highlight

The paragraph starts at `--color-muted` and fills to `--color-ink` word
by word as it crosses the viewport.

```
start: 'top 78%'
end: 'top 32%'
scrub: true
stagger: { each: 0.02 }
```

Scrubbed, not triggered — it must track the scrollbar both directions.

### 5.4 Stat counters

`start: 'top 82%'`, fires once (`once: true`). Count from 0 over 1.6s,
ease `power2.out`. Suffixes (`+`, `%`, `k+`) are static text next to the
number, not part of the tween.

### 5.5 Medallion

Continuous `rotate: 360` over 26s, `ease: 'none'`, infinite. Rotate only
the outer engraved ring — the scales glyph in the middle stays upright.

### 5.6 Practice-area pills

`start: 'top 70%'`, stagger 0.08, `y: 14 → 0`, opacity `0 → 1`. After
they land, a slow independent float on each (`y: ±5`, 4–6s, `yoyo`,
randomised offsets so they don't pulse in sync).

### 5.7 Reduced motion — required, not optional

Wrap everything in `gsap.matchMedia()`:

```ts
mm.add('(prefers-reduced-motion: no-preference)', () => { /* all of the above */ })
mm.add('(prefers-reduced-motion: reduce)', () => {
  // statue at scale 1, text at final colour, counters at final value,
  // medallion static. Lenis disabled.
})
```

---

## 6. Copy

Write real copy, not lorem. Plain language, active voice, no legal
jargon and no "we fight for you" boilerplate.

- **h1:** Your legal partner in every situation
- **Sub:** A short line about being reachable and clear about cost.
- **CTA:** `Book a consultation`
- **Stats:** `12+` years in practice · `100+` matters resolved ·
  `95%` win rate in court · `2k+` clients
- **Practice areas:** Corporate & business, Intellectual property,
  Family & divorce, Criminal defence, Estate planning

Replace the stat figures with real ones before launch. Publishing an
invented win rate on a solicitor's site is a regulatory problem, not
just a copy problem.

---

## 7. Quality floor

- Responsive from 360px up. On mobile the statue shrinks and the ghost
  word drops to `12rem`; the scrub stays but the travel range halves.
- Visible keyboard focus rings, bronze, 2px offset.
- Every `ScrollTrigger` and the Lenis instance torn down on unmount via
  `gsap.context()` + `ctx.revert()`.
- Lighthouse: LCP under 2.0s, CLS 0.
- No console warnings, no hydration mismatch. GSAP imports are
  client-only.

---

## 8. Build order

1. Layout shell, fonts, tokens, Lenis wiring. Verify smooth scroll works
   with nothing else on the page.
2. Static hero — nav, type, statue, ghost word — positioned correctly at
   rest, no animation yet.
3. Scroll-scrub on the statue and the word. **Stop and check this one
   before continuing** — it's the whole page. If it doesn't feel heavy,
   nothing else will save it.
4. Hero load sequence.
5. Remaining sections top to bottom.
6. Reduced-motion pass, teardown pass, responsive pass.
