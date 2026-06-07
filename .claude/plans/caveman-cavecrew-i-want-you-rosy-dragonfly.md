# Plan — Hero Background Image with Scroll Fade

## Context

The homepage hero (`src/app/page.tsx`, the "Anmol Behl" section) currently has no
background image — it sits on the global body gradient and looks plain. The user
added `public/images/anmol-cover.png` (1920×1080) and wants it behind the hero
**only**. As the user scrolls down into the featured sections (Instagram Prompts →
Medium Blogs → Gumroad Products) the image must fade out; scrolling back up it
fades back in. A slight dark overlay + vignette is required so the white hero text
stays readable over a bright image.

**User decisions (confirmed):**
- Behavior: **"Scrolls away + fades"** — image is attached to the hero region,
  scrolls up with the page like normal content, AND opacity-fades near the
  hero→featured boundary. It does not stay pinned to the viewport.
- Overlay: **Slight** — ~40% dark wash + soft vignette + bottom blend into page bg.

## Grounding facts (verified in code)

- `src/app/page.tsx` is a **server component** (`async function Home`). Its root is
  `<div className="relative z-10 pt-32 pb-32">` (line 12) containing, in order:
  ambient-orb div (14–17), Hero `<section>` (20–42), Instagram Prompts (44–97),
  Blogs (99–142), Products (144–187), About (189–206).
- The wrapper is `position: relative` → it is the offset/stacking parent. All
  sections are `z-10`; an `absolute inset-x-0 top-0 z-0` child therefore paints
  **behind** all content but **above** the body gradient. Hero text (`z-10`)
  stays above the image. No transformed ancestor.
- `globals.css`: body base color is `#07090c` (line 121); `.liquid-light` orbs are
  `position:fixed; z-index:-1`. So a `z-0` layer sits cleanly above orbs+body.
- No animation libraries (`package.json`: only next/react/react-icons). Project
  rules (`.claude/context/frontend-rules.md`, `design-system.md`) **forbid** anim
  frameworks and **prefer opacity transitions** + CSS — our opacity-only fade is
  the explicitly preferred motion. No existing scroll/IntersectionObserver code;
  no `prefers-reduced-motion` handling yet.
- Convention: plain `<img>`/CSS backgrounds, `next.config.ts` has
  `images.unoptimized: true`. A CSS `background-image` (decorative, `aria-hidden`)
  fits convention and avoids `next/image`.

## Approach

Implementation will be delegated to **feature-agent** (per user request), following
this spec.

### 1. New client component: `src/components/home/HeroBackground.tsx`

A `'use client'` component rendering an **absolute** full-bleed layer pinned to the
top of the page wrapper, height = the hero region (measured), opacity driven by
scroll. Because it is `absolute` (not `fixed`) it scrolls up with the hero; the
fade dissolves it near the boundary; the bottom gradient blends it into the page
so there is never a hard edge.

Layer stack inside the component (back → front):
1. Image: `<div>` with `style={{ backgroundImage: "url('/images/anmol-cover.png')" }}`,
   classes `absolute inset-0 bg-cover bg-center`.
2. Slight dark wash: `absolute inset-0 bg-[#07090c]/40`.
3. Vignette: `absolute inset-0` with
   `radial-gradient(ellipse at center, transparent 35%, rgba(7,9,12,0.85) 100%)`.
4. Bottom blend into page bg: `absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-[#07090c]`.

Outer wrapper of the component:
`aria-hidden="true" className="absolute inset-x-0 top-0 z-0 pointer-events-none overflow-hidden"`,
inline `style={{ height: height ?? '100vh', opacity, transition: 'opacity 120ms linear' }}`.

**Logic (useEffect, mirrors the existing SearchClient useEffect+cleanup convention):**
- Read boundary marker `document.getElementById('hero-bg-end')`; bail if absent.
- `measure()` → `setHeight(sentinel.offsetTop)`. `offsetParent` is the relative
  wrapper, so `offsetTop` = exact hero-region height. Set the layer height to it so
  the image covers only the pre-featured area.
- `computeOpacity()` → from `sentinel.getBoundingClientRect().top` vs
  `window.innerHeight`: full opacity while boundary is low in the viewport, linear
  fade to 0 as it rises. `start = vh*0.7`, `end = vh*0.15`,
  `o = clamp01((top - end) / (start - end))`. Recomputes every scroll → fades back
  in on scroll up automatically.
- Throttle scroll with `requestAnimationFrame` (passive listener). Add a `resize`
  listener that re-measures height + recomputes. Full cleanup in the return.
- **Reduced motion:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`,
  skip the scroll listener and leave `opacity` at 1 — the image still scrolls away
  naturally and blends via the bottom gradient, just without the cross-fade. No
  layout branch needed.
- SSR fallback: default `height` `'100vh'`, `opacity` 1 → no CLS (layer is
  absolute, out of flow).

### 2. Edit `src/app/page.tsx` (server component, 2 small additions)

- Import the component: `import HeroBackground from '@/components/home/HeroBackground'`.
- Render `<HeroBackground />` as a child of the wrapper, immediately **after** the
  ambient-orb div (after line 17) so it paints above the subtle orbs within the
  hero region.
- Add the boundary marker as a **direct child** of the wrapper, between the Hero
  `</section>` (line 42) and the Instagram Prompts `<section>` (line 44):
  `<div id="hero-bg-end" aria-hidden="true" />`. Must be a direct child so its
  `offsetTop` is measured against the relative wrapper.

No other files change. No new dependencies. Hero markup/text untouched.

## Critical files
- **New:** `src/components/home/HeroBackground.tsx`
- **Edit:** `src/app/page.tsx` (import + `<HeroBackground />` + `#hero-bg-end` marker)
- **Asset (exists):** `public/images/anmol-cover.png` → referenced as `/images/anmol-cover.png`

## Rationale highlights (no hallucination)
- `absolute` over `fixed` → user chose "scrolls away + fades"; absolute scrolls with
  the page. `z-0` inside the `relative z-10` wrapper guarantees it sits behind all
  `z-10` content but above body/orbs (verified stacking).
- Height from `sentinel.offsetTop` → image covers exactly hero→featured, never
  bleeds behind featured/About/footer.
- Opacity-only + CSS transition + rAF throttle + passive listeners → satisfies the
  project's performance/motion rules; no animation library introduced.
- Overlay color `#07090c` == body base → bottom blend is seamless.
- `aria-hidden` decorative CSS background → matches the no-`next/image` convention,
  no a11y/alt noise.

## Verification
1. `npm run build` — TypeScript + lint must pass clean (no new bugs).
2. `npm run dev`, open `/`:
   - Image visible behind hero with slight darkening + vignette; "Anmol Behl",
     tagline, and social icons clearly readable.
   - Scroll down: image fades out as Instagram Prompts enters; gone by the time
     featured cards are in view; no hard edge (bottom blend).
   - Scroll back up: image fades back in.
   - No image behind Blogs/Products/About/Footer.
   - Resize window (esp. mobile widths): height re-measures; no overflow/CLS.
   - Other routes (`/prompts`, `/blogs`, `/products`, `/about`) unaffected.
3. (Optional) Playwright via `/tester` — assert `#hero-bg-end` exists and the
   backdrop layer is present on `/` only; smoke-test scroll opacity if feasible.
4. Tunable after visual review: vignette strength, dark-wash %, fade `start`/`end`
   ratios, `bg-center` focal point on mobile.
