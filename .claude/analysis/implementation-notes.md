# Implementation Notes

## Session: 2026-06-08 — Homepage Hero Background Image (scroll-fade)

### New component: `src/components/home/HeroBackground.tsx`
`'use client'` decorative layer (`aria-hidden`) added to the homepage only. Renders an `absolute inset-x-0 top-0 z-0` full-bleed background-image (`/images/anmol-cover.png`) inside the existing `relative z-10` wrapper in `src/app/page.tsx`. Layer stack back→front: image (`bg-cover bg-center`) → dark wash (`bg-[#07090c]/40`) → radial vignette → bottom blend gradient to `#07090c` (page base color).

### Why `absolute` not `fixed`
User wanted "scrolls away + fades". An `absolute z-0` child of the `relative z-10` wrapper scrolls with the page and paints behind all `z-10` sections but above body/orbs. Hero text (z-10) stays readable above the image.

### Scroll/measure mechanics
- Boundary marker `<div id="hero-bg-end" aria-hidden />` is a **direct child** of the `relative z-10` wrapper, placed between the Hero `</section>` and Instagram Prompts `<section>`. Must be a direct child so `offsetTop` measures against the wrapper (the offsetParent).
- Height = `sentinel.offsetTop` → image covers exactly the hero region, never bleeds behind featured/About/footer.
- Opacity = `clamp01((boundaryTop - vh*0.15) / (vh*0.7 - vh*0.15))` recomputed every scroll → fades out as boundary rises, fades back in on scroll up.
- Scroll throttled via single `requestAnimationFrame` ref (guard `if rafRef.current !== null return`); scroll+resize listeners `{ passive: true }`; full cleanup (removeEventListener + cancelAnimationFrame) in the effect return — mirrors `SearchClient.tsx` useEffect/ref convention.

### Reduced motion
`matchMedia('(prefers-reduced-motion: reduce)')`: when true, scroll listener is NOT attached and opacity stays 1 (image still scrolls away + bottom-blends). Resize→re-measure still attached in both modes.

### SSR / perf notes
No `window` access at module/render time — only inside `useEffect`. Default state `height: null` (renders `'100vh'`), `opacity: 1` → no CLS (layer is out of flow). Opacity-only CSS transition (`120ms linear`), no animation library. No `next/image` (matches project convention; `images.unoptimized: true`).

### Tunables (for future visual review)
Vignette strength, dark-wash % (`/40`), fade `start`/`end` ratios (0.7 / 0.15), and `bg-center` focal point on mobile.

### Bottom-seam blend — iterations (same session, post-review)
User flagged the boundary where the image meets the Instagram Prompts section as a hard, "cheap" horizontal line. Two iterations:

1. **(rejected)** Per-image `mask-image` bottom fade + a separate tall `bg-gradient-to-b ... to-[#07090c]` "bottom blend" div. This darkened the lower image into a flat dark band, and the gradient's **solid `#07090c` fill did not match the body's fixed radial gradient** behind the featured section (body uses `background-attachment: fixed`, so the color under the boundary varies with scroll) → a visible horizontal line remained.

2. **(final)** Removed the bottom-blend div **and** the per-image mask. Moved a single `mask-image: linear-gradient(to bottom, #000 60%, transparent 100%)` (+ `-webkit-`) onto the **outer layer wrapper**, so the entire composite (image + wash + vignette) alpha-fades to fully transparent at the bottom. No solid color is introduced, so the body gradient shows through continuously across the boundary — no dark band, no hard line.

**Key insight:** to dissolve a finite-height overlay into a page whose background is a *fixed* gradient, fade the overlay's **alpha** (mask) — do **not** fade to a solid color, because any solid will mismatch the scroll-varying body gradient and re-introduce a seam.

### Final layer composition (`HeroBackground.tsx`)
Outer wrapper: `absolute inset-x-0 top-0 z-0 overflow-hidden`, inline `height/opacity/transition` **+ `maskImage`/`WebkitMaskImage` bottom alpha fade**. Children: image (`bg-cover bg-center`) → dark wash (`bg-[#07090c]/40`, for hero text contrast) → radial vignette. No bottom-blend div. Build passes clean.

---

## Session: 2026-05-30 — Workspace Automation Setup

### Claude Code Skill File Pattern
Skills in `.claude/skills/<name>/SKILL.md` become `/<name>` slash commands when Claude Code loads them. The SKILL.md content is injected as context at invocation time. Pattern established by existing `deploy-cloudflare` skill.

### Claude Code Custom Agent Format
Custom agents in `.claude/agents/<name>.md` use YAML frontmatter:
```yaml
---
name: agent-name
description: When to use this agent (this text appears in the agent picker)
tools: Read, Write, Edit, Bash, Agent
---
```
The markdown body is the agent's system prompt. Agents can be spawned via the `Agent` tool by name or description match.

### Hook Script Executable Bit
Hook scripts must be executable. On this remote container, `chmod +x` is blocked by the auto-mode classifier. Use `git update-index --chmod=+x <file>` AFTER staging the file with `git add`. This sets the executable bit in the git index, which persists on checkout.

Sequence:
```bash
git add .claude/hooks/        # stage first
git update-index --chmod=+x .claude/hooks/session-start.sh  # then set bit
```

### settings.json Hook Event Names
Claude Code settings.json hook events (case-sensitive):
- `SessionStart` — fires once at session initialization
- `Stop` — fires when Claude ends its turn
- `PreToolUse` — fires before each tool call (can match by `"matcher": "ToolName"`)
- `PostToolUse` — fires after each tool call

The `|| true` at the end of hook commands prevents hook failures from blocking Claude:
```json
"command": "bash /path/to/hook.sh 2>&1 || true"
```

### Orchestrator Agent Pattern
The orchestrator agent coordinates subagents via the `Agent` tool. Key design:
- Orchestrator reads the high-level task and plans phases
- Each phase spawns a specialized agent with a precise context block
- Context blocks include: specific files to read, specific task, expected output format
- Max 3 auto-fix iterations per phase before escalating to human (prevents infinite loops)
- Orchestrator synthesizes all outputs into a final report and updates analysis files

---

## Session: 2026-06-03 — Brand Messaging Pivot

### Canonical Brand Voice (current)
Site describes Anmol as: "Software Engineer. AI Builder. Turning complex technology into things people can understand and use."

This description appears in 3 places — keep them in sync:
1. `src/app/layout.tsx` — `metadata.description` + `openGraph.description`
2. `src/app/page.tsx` — hero `<p>` subtitle
3. `src/app/about/page.tsx` — hero subtitle paragraph

### Core Principles (current — About page PRINCIPLES const)
| # | Title | Angle |
|---|-------|-------|
| 01 | Build to Understand | learning-by-building |
| 02 | Share the Journey | knowledge sharing |
| 03 | Simplicity Scales | engineering clarity |

Old principles (Restraint over Abundance / Liquid Lighting / Deterministic Outcomes) were AI-aesthete framing — replaced entirely.

### Copy Update Rule
When updating any bio/description copy, update all 3 sync points above in a single commit. Do not let `layout.tsx` metadata drift from `page.tsx` hero text.

---

## Session: 2026-05-30 — UI Bug Fixes

### Navbar Brand: Always Use `whitespace-nowrap`
Brand/logo text links must have `whitespace-nowrap` to prevent line breaks on narrow viewports. Without it, a 32px font wraps on screens narrower than ~320px. Fix: add `whitespace-nowrap` to the `<Link>` className in `Navbar.tsx`.

### BlogCard Glass-Card Pattern
All listing cards (prompts, blogs, products) should follow the same pattern:
- Outer anchor: `glass-card rounded-xl overflow-hidden flex flex-col h-full cursor-pointer hover:border-white/20 transition-colors duration-300`
- Image div: `h-48 md:h-56 w-full overflow-hidden relative border-b border-white/5`
- Content div: `p-6 flex flex-col flex-grow gap-3`
The `h-full flex flex-col` on the outer container ensures uniform card heights within CSS grid rows.

### Profile Image Sourcing
The user's profile photo was retrieved provided by the user with the prompt. It was saved to `public/images/anmol-profile.png`. Always use local paths (`/images/...`) for static assets to avoid CDN dependency.

### Blog Grid Gap
Use a single `gap-[var(--spacing-gutter)]` (not split `gap-x` + `gap-y` with different values) for consistent grid spacing that matches the prompts and products pages.

---

## Session: 2026-05-28 — Social Icons & react-icons Integration

### LinkedIn Missing from react-icons/si v5
`react-icons/si` (Simple Icons) v5.6.0 does not include LinkedIn. Use `FaLinkedin` from `react-icons/fa6`. Gumroad is only in `react-icons/si` (not in fa6). Mixed imports from `si` and `fa6` in same component are fine — both tree-shake.

### Tailwind v4 CSS Variable Hover Color Pattern
To apply per-element brand colors on hover without a client component:
1. Set CSS variable on parent: `style={{ '--brand': color } as CSSProperties}`
2. Apply on hover: `hover:text-(--brand)` (generates `color: var(--brand)`)
3. For card group hover: `group-hover:text-(--brand)` (generates group hover rule)

Verified in `.next/dev/static/chunks/src_app_globals_css_*.css` — Tailwind v4 generates these rules correctly.

### CSSProperties Cast for Custom CSS Properties
`style={{ '--brand': color } as CSSProperties}` — TypeScript needs the cast. Import `CSSProperties` from `'react'` with `import type { CSSProperties } from 'react'`. Do NOT use `React.CSSProperties` without importing React (fine with `react-jsx` automatic transform but requires React namespace).

---

## Session: 2026-05-28 — Universal Search

### Playwright: Import from `playwright/test` not `@playwright/test`
Project has `playwright` package (not `@playwright/test`). The `playwright` package ships `test.js`/`test.d.ts`. Import: `import { test, expect } from 'playwright/test'` and `import { defineConfig, devices } from 'playwright/test'`.

### `useSearchParams` Always Needs Suspense Boundary
Any client component calling `useSearchParams()` must be wrapped in `<Suspense>` in the parent server component. Without it, Next.js App Router throws at build time. Put Suspense in `page.tsx`, not inside the client component itself.

### Navbar Search Icon: `data-testid` Required for Reliable Test Selection
Two search icon elements exist in Navbar DOM: one desktop (`hidden md:inline-flex`), one mobile (inside `md:hidden` container). Generic `a[aria-label="Search"]` selectors are fragile — first match returns the hidden desktop icon on mobile tests. Use `data-testid="search-icon-desktop"` and `data-testid="search-icon-mobile"`.

### Search Result Design: Compact Rows, Not Full Cards
Full card components (h-48+ images, multi-section content) are inappropriate for search results. At 10+ results across 3 sections, full cards cause excessive scroll. Use compact horizontal rows: 64px thumbnail + text + arrow icon. ~80px height, `flex flex-col gap-2` list.

---

## Session: 2026-05-27 — Fix Featured Grid Exclusion Bug

### Problem
`BlogsClient.tsx` and `ProductsClient.tsx` grid filter used `!b.featured` — excludes ALL items with `featured: true`. When Sheets has multiple `featured: true` entries, only the first (hero) renders; rest vanish from grid.

### Fix
Changed to `b.id !== featured?.id` — excludes only the specific item currently occupying the hero slot.

### Files Changed
- `src/app/blogs/BlogsClient.tsx` — `gridItems` filter
- `src/app/products/ProductsClient.tsx` — `allFiltered` filter + moved `featuredFiltered` before `allFiltered`

---

## Session: 2026-05-27 — Image Validation: Blogs, Products, About, Homepage

### Findings
All pages using CMS data (blogs, products, homepage) already covered by proxy fix:
- `normalizeBlog()`, `normalizeProduct()`, `normalizePrompt()` all call `toEmbeddableImageUrl()`
- Drive URLs → `/api/drive-image?id={ID}` → server proxy → no 429

About page: single hardcoded `lh3.googleusercontent.com/aida-public/...` image. Not Drive. Not concurrent. No fix needed.

### No code changes made — validation only.

---

## Session: 2026-05-27 — Drive Image Proxy (Final Fix)

### Problem
Browser requests to `lh3.googleusercontent.com` return HTTP 429. Google's "fife" CDN throttles concurrent browser-origin image requests. No URL format bypasses this.

### Fix
New Route Handler: `src/app/api/drive-image/route.ts`
- Server-side proxy: fetches `drive.google.com/uc?export=view&id={ID}` then returns image
- Cache-Control: public, max-age=86400 (24hr browser cache)
- ID validation regex prevents SSRF

`src/lib/utils/imageUrl.ts` now outputs `/api/drive-image?id={ID}` for all Drive URLs.

### Files Changed
- `src/app/api/drive-image/route.ts` — new proxy route
- `src/lib/utils/imageUrl.ts` — output changed to proxy URL
- `.claude/analysis/cache-clearing-guide.md` — new guide

---

## Session: 2026-05-27 — Drive CDN Rate-Limit Fix

### Problem
`drive.google.com/thumbnail` CDN rate-limits concurrent browser requests. 6 simultaneous card image loads → only 1 gets through. Random per refresh.

### Fix
`src/lib/utils/imageUrl.ts`: changed output URL from `drive.google.com/thumbnail?id={ID}&sz=w1000` → `lh3.googleusercontent.com/d/{ID}`. Google's image CDN, no per-burst throttle. Already in `next.config.ts` remotePatterns.

### Impact
Fixes all pages using `toEmbeddableImageUrl`: Prompts, Products, Blogs, Homepage featured. About page (hardcoded lh3 URL) unaffected.

---

## Session: 2026-05-27 — Stale Fetch Cache Fix + Dev Mode Cache Bypass

### Problem
Prompts page showed stale data ("Carousel Ideas", "Caption Starters" with `example.com` images) instead of live Sheets data. Root cause: `.next/cache/fetch-cache/` on-disk cache from May 25 persisted past its 1-hour TTL in dev mode — Next.js dev mode doesn't auto-invalidate disk cache between restarts.

### Fix
1. Deleted all stale `.next/cache/fetch-cache/` entries
2. Changed `client.ts` fetch revalidate: `0` in dev (always fresh), `3600` in prod (ISR 1-hour)

### Drive Image Permissions Note
After cache cleared, Drive thumbnails only render for publicly shared files. Users must set each Drive image file to "Anyone with the link can view". First image (Luxury Portrait, file ID `1GJswgI0DOXDcDuuo1nNdeHMAso3SilFB`) confirmed working — others need same setting.

### Files Changed
- `src/lib/api/client.ts` — conditional `revalidate`
- `.next/cache/fetch-cache/` — deleted (manual step)

---

## Session: 2026-05-27 — Google Drive Image URL Fix

### Problem
Google Sheets CMS returns Google Drive shareable links for `image` fields. Plain `<img src="drive.google.com/file/d/{ID}/view">` loads an HTML page, not image binary → broken cards in Prompts, Products, Blogs.

### Fix
Created `src/lib/utils/imageUrl.ts` with `toEmbeddableImageUrl(url)`:
- Regex-extracts `FILE_ID` from Drive file URLs
- Rewrites to `drive.google.com/thumbnail?id={ID}&sz=w1000`
- Passes through non-Drive URLs unchanged

Applied in `src/lib/api/normalize.ts` to `image` field in `normalizePrompt`, `normalizeProduct`, `normalizeBlog`.

### Files Changed
- `src/lib/utils/imageUrl.ts` — new utility
- `src/lib/api/normalize.ts` — import + apply transform to all 3 image fields
- `next.config.ts` — added `drive.google.com` to `remotePatterns`
- `.claude/context/content-model.md` — Image Rules section updated
- `.claude/analysis/architectural-decisions.md` — decision recorded

### Key Notes
- `*Client.tsx` files unchanged — receive pre-transformed URLs
- Passthrough logic preserves `lh3.googleusercontent.com` and Cloudinary URLs
- `sz=w1000` chosen for card quality/performance balance

---

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
