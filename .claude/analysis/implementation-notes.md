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

## Session: 2026-05-25 (Update) — Phase 2 CMS Wire-Up Complete

### What Was Built

**API layer — `src/lib/api/`:**
- `client.ts` — `fetchFromCMS<T>(path)`: fetch with `next: { revalidate: 3600 }`, graceful error→`[]`
- `normalize.ts` — `normalizePrompt`, `normalizeProduct`, `normalizeBlog`, `normalizeFeaturedItem`
- `index.ts` — `getPrompts()`, `getProducts()`, `getBlogs()`, `getFeaturedItems()`, `getHomepageData()`

**Page split pattern (all 3 inner pages):**
```
src/app/[route]/page.tsx          ← async server component, export const revalidate = 3600
src/app/[route]/[Name]Client.tsx  ← 'use client', useState, receives initialData prop
```

**Home page (`src/app/page.tsx`):**
- Made `async`, added `revalidate = 3600`
- Replaced mock imports with `getHomepageData()`
- Product/blog card image containers: replaced `<span className="material-symbols-outlined">{icon}</span>` with `<img src={item.image} .../>` (same treatment as prompts section)
- Fixed field names: `product.link` → `product.productLink`, `blog.link` → `blog.articleLink`
- Prompt section unchanged (fields already matched real `Prompt` type)

### Cloudflare / ISR Setup

**Adapter:** `@opennextjs/cloudflare` (not `@cloudflare/next-on-pages` — blocked by Next.js 16 peer dep)

**Files generated by `npx opennextjs-cloudflare migrate`:**
- `wrangler.jsonc` — Workers config (main: `.open-next/worker.js`, nodejs_compat flag, ASSETS binding)
- `open-next.config.ts` — OpenNext config (R2 cache commented out — not needed for basic ISR)
- `.dev.vars` — local Cloudflare dev env vars (must add `APPS_SCRIPT_URL` manually — migrate only sets `NEXTJS_ENV`)
- `public/_headers` — security headers for static assets
- `.gitignore` updated to include `.dev.vars*` and `.open-next/`

**Build commands:**
- Local Next.js dev: `npm run dev` (Node.js runtime, no ISR, hits Apps Script every request)
- Local Cloudflare preview: `npx opennextjs-cloudflare build && npx wrangler dev` (requires Node ≥22)
- Deploy: `npm run deploy` (= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`)

**Cloudflare Pages dashboard settings to update:**
- Build command: `npm run deploy` (or `npm run upload` if using CLI deploy separately)
- Environment Variables: add `APPS_SCRIPT_URL` for both Production and Preview environments

### Build Output Confirmation

```
Route (app)      Revalidate  Expire
┌ ○ /                    1h      1y
├ ○ /about
├ ○ /blogs               1h      1y
├ ○ /products            1h      1y
└ ○ /prompts             1h      1y
```

Zero TypeScript errors. `.open-next/worker.js` generated.

### Normalize Layer Key Guards

- `featured: raw.featured === true` — strict bool equality, not truthy (prevents `'FALSE'` string → true)
- Optional fields: `raw.field ? String(raw.field) : undefined` — preserves undefined semantics
- `order`: `typeof raw.order === 'number' ? raw.order : undefined` — 999 default in FeaturedItem normalizer

### Home Page Mock Shape vs Real Type (Field Mapping)

Mock `HomeProduct` / `HomeBlog` shapes used `icon` (Material icon name) and `link`. Real `Product`/`Blog` types use `image` (URL) and `productLink`/`articleLink`. This divergence was handled in `page.tsx` update — not a bug, just a planned migration.

---

## Session: 2026-05-25 — Phase 2 CMS Backend Setup

### Schema Gap Discovery
`cms-schema.md` was written before full Phase 1 frontend implementation.
When frontend pages were built, 6 fields were added to `types.ts` that were never added to the schema.
Always validate schema against `src/lib/types.ts` before Phase 2 integration — they must match exactly.

Gaps found and resolved:
| Tab | Missing Field | Frontend Usage |
|-----|--------------|----------------|
| Prompts | `tool` | Badge label on prompt card (`Midjourney v6`) |
| Products | `category` | Filter pill system on /products |
| Products | `price` | Price badge overlaid on card image |
| Products | `badge` | Label in featured hero card only |
| Products | `specs` | Spec row in hero + card detail |
| Blogs | `date` | Publication date on blog card (`Oct 12, 2024`) |

### Apps Script Architecture (Phase 2 Backend)

**Script type:** Bound to Google Sheet (Extensions → Apps Script)
**Advantages over standalone:** No spreadsheet ID needed, simpler auth, easier to maintain.

**Routing:** `?path=` query parameter switch in `doGet(e)`.
Endpoint format: `https://script.google.com/macros/s/SCRIPT_ID/exec?path=prompts`

**Key implementation patterns in `getSheetRows(tabName)`:**
- Read column headers from row 1 — map by name not index (resilient to column reorder)
- Skip rows where `id` column is empty (allows blank separator rows in sheet)
- Normalize booleans: `true`/`'TRUE'` → `true`, `false`/`'FALSE'` → `false`
- Normalize `order` column to JS number; defaults to 999 if missing
- Omit empty cells entirely from output object (preserves optional field semantics)
- Sort ascending by `order` before returning

**Response envelope:**
```json
{ "data": [...] }
{ "data": [], "error": "message" }
```

### Environment Variable Naming
`APPS_SCRIPT_URL` — no `NEXT_PUBLIC_` prefix.

Rationale: URL consumed server-side only at build time.
`NEXT_PUBLIC_*` embeds value into client JS bundle — unnecessary and exposes URL publicly.

**Local dev:** `.env.local` → `APPS_SCRIPT_URL=https://...`
**Production:** Cloudflare Pages Dashboard → Settings → Environment Variables → `APPS_SCRIPT_URL`
Cloudflare injects into build environment during `npm run build`. No other config needed.

### CORS Constraint
Apps Script `ContentService` does NOT set `Access-Control-Allow-Origin` headers.
Browser `fetch()` to Apps Script URL will fail with CORS error.
Mitigation: fetch only from Next.js server components (build-time or ISR) — server-to-server, no CORS check.

### Phase 2 Frontend Migration Required
Current `output: 'export'` in `next.config.ts` creates pure static HTML.
Static export has no server at runtime → can only fetch at `npm run build` time.
Limitation: content updates require rebuild to propagate.

For ISR (stale-while-revalidate) content freshness:
- Must switch to `@cloudflare/next-on-pages` adapter
- Enables server-side rendering + ISR revalidation on Cloudflare Workers
- Migration: remove `output: 'export'`, install `@cloudflare/next-on-pages`, update `wrangler.toml`

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
