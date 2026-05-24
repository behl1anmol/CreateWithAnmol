# Implementation Notes

## Session: 2026-05-24 — Phase 1 Frontend Planning

### Project State at Session Start
- Empty `src/` directory, no `package.json`
- Pure greenfield — no scaffolding exists yet
- All context files in `.claude/context/` are defined and stable
- Stitch project confirmed live: "Anmol AI Creator Portfolio" (`projects/4801571294272020461`)

### Stitch Screen Inventory
5 primary screens (all desktop, all visible/active):
| Screen | Route | Height |
|---|---|---|
| Cinematic Depth Refinement | `/` | 7226px |
| About | `/about` | 4162px |
| Products | `/products` | 4588px |
| Technical Writing | `/blogs` | 3886px |
| Prompt Library | `/prompts` | 2658px |

Hidden screens (3 older iterations): `6d80e7e9`, `85fa073a`, `9d617432`, `a79345a8` — do not implement.

### Design Token Extraction (Tailwind Config)
All tokens come from Stitch Tailwind config block (identical across all screens):
- Colors: full "Cinematic Precision" semantic palette (surface, on-surface, primary, secondary, outline, etc.)
- Typography: 7 semantic font sizes (display-lg, display-mobile, headline-md, body-lg, body-md, label-caps, mono-technical)
- Fonts: Hanken Grotesk (display/headline), Inter (body), Geist (label/mono)
- Border radius: DEFAULT=2px, lg=4px, xl=8px, full=12px — SHARP architectural feel
- Spacing: unit=8px, gutter=24px, container-max=1440px, margin-desktop=64px, margin-mobile=20px

NOTE: Stitch cards use `rounded-3xl` (Tailwind default 1.5rem) which is NOT in the custom radius config. Either add it or allow Tailwind defaults to coexist.

### Nav Label Decision
Stitch inner pages (About, Products, Blogs) have placeholder nav: "Gallery, Studio, Assets, Archive".
Home screen Stitch has correct nav: Prompts, Products, Blogs, About.
→ Use home screen nav labels everywhere: Prompts, Products, Blogs, About.
→ "Sign In" CTA on home → use "Start Creating" (consistent with inner pages) as a decorative CTA with no auth.

### Key CSS Patterns from Stitch
```css
/* Body */
background-color: #121212;
background-image: SVG noise (fractalNoise, baseFrequency 0.65, opacity 0.02);

/* Navbar glass */
background: rgba(19,19,19,0.6);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255,255,255,0.1);

/* Glass card */
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.1);
border-top/left: 1px solid rgba(255,255,255,0.15); /* inner light simulation */
backdrop-filter: blur(12px);

/* Text gradient (hero headline) */
background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Liquid light orb */
position: fixed; width: 600px; height: 600px;
background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
border-radius: 50%; z-index: -1;
```

### Home Page Section Order (from Stitch HTML)
1. Hero (centered, min-h-[716px])
2. Gumroad Products (horizontal scroll)
3. Medium Blogs (horizontal scroll)
4. Instagram Prompts (horizontal scroll)

### Card Patterns
- Home page: horizontal scroll snap (`overflow-x-auto snap-x snap-mandatory`)
- Card width: `w-[85vw] md:w-[400px] shrink-0`
- Inner pages: CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Blog page only: `grayscale group-hover:grayscale-0` image transition

### About Page Structure
- Hero: display-lg "About Anmol" + editorial subtitle
- Creator story: 12-column grid — 5 cols portrait + 1 spacer + 6 cols text
- Portrait: `aspect-[3/4]`, `mix-blend-luminosity opacity-80`, glass-panel
- Text: label-caps section headers, body-md paragraphs

### Static Export Strategy (Phase 1)
- `output: 'export'` in next.config.ts
- `images: { unoptimized: true }` required with static export
- All routes are static — no dynamic segments
- Compatible with Cloudflare Pages direct upload

### Foundation Implementation Status (2026-05-24)
All foundation items COMPLETE. Static build passes, all 5 routes generated. Visual QA: ✓ desktop + mobile.

### Dependency List (Phase 1 only)
- `next` (latest stable, App Router)
- `react`, `react-dom`
- `typescript`
- `tailwindcss@^4` — v4, CSS @theme config (no tailwind.config.ts)
- `@tailwindcss/postcss` — v4 PostCSS plugin (replaces postcss-tailwindcss)
- `@types/react`, `@types/node`
- No autoprefixer needed (v4 handles it internally)
- No animation libraries, no UI frameworks, no state libraries

### Tailwind v4 Key Differences from Stitch v3 Output
- No `tailwind.config.ts` — config lives in `globals.css` via `@import "tailwindcss"` + `@theme {}`
- Token naming: `--color-*`, `--text-*`, `--font-*`, `--radius-*`, `--spacing-*`
- `darkMode` class handling: set `html.dark` always (site is dark-only) or use `@variant dark`
- Font family utilities: `font-display` → maps to `--font-display` CSS var
- Class names from Stitch (e.g., `font-display-lg`, `text-display-lg`) still work in v4 once tokens are defined

---

## Session: 2026-05-24 — Homepage Full Implementation

### Files Created/Modified
- `src/app/page.tsx` — full homepage (Hero + Products + Blogs + Prompts + About teaser)
- `src/lib/data/mockData.ts` — static mock data (3 products, 3 blogs, 2 prompts)
- `src/app/globals.css` — body background upgraded to cinematic depth style

### Section Order (matches Stitch Cinematic Depth Refinement screen)
1. Hero (liquid glass CTA button, min-h-[716px])
2. Gumroad Products (horizontal scroll, icon placeholders, 3 cards)
3. Medium Blogs (horizontal scroll, icon placeholders, 3 cards)
4. Instagram Prompts (horizontal scroll, Stitch placeholder images, 2 cards + dual CTAs)
5. About Teaser (glass-panel centered editorial, links to /about)

### Card Pattern Used (from Stitch Cinematic Depth)
```
bg-[#1a1a1a]/40 backdrop-blur-2xl border border-white/5 border-t-white/15
hover:bg-[#1a1a1a]/60 hover:-translate-y-1 transition-all duration-500
rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)]
w-[85vw] md:w-[400px] shrink-0 snap-start
```

### Background Upgrade
Stitch Cinematic Depth uses `#07090c` base + multi-layer radial gradients + `background-attachment: fixed`.
Previous `#121212` flat replaced. The new style matches the Stitch atmospheric depth.

### About Teaser (Stitch shows empty stub)
Designed as: glass-panel wrapper + label-caps "CREATOR STORY" + headline-md text-gradient + body-lg description + ghost CTA button to /about.

### Hero CTA Fixed
Old: `bg-[var(--color-primary)] text-[var(--color-on-primary)]` (solid white)
New: `bg-white/80 backdrop-blur-[20px] border border-white/20 border-t-white/50 rounded-full shadow-[0_8px_32px_rgba(255,255,255,0.15)]` (liquid glass)

### Build Status
All 5 routes generate as static HTML. Zero TypeScript errors. Playwright screenshots confirm visual parity with Stitch.
