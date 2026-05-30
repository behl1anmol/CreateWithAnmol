# Architectural Decisions

## Session: 2026-05-28 — Universal Search Architecture

### Decision: Server-Side Search via Next.js API Route (Not Client-Side)

**Context:** Implementing universal search across prompts, products, blogs.

**Decision:** Created `/api/search` route that fetches and filters server-side. Client sends debounced requests; receives only matching records.

**Rationale:**
- Data volume grows over time — client-side (load all → filter in JS) doesn't scale
- `fetchFromCMS` uses `next: { revalidate: 3600 }` which applies to API route handlers too (Next.js Data Cache) — Apps Script hit at most once/hour regardless of search volume
- Client payload = only matches, not full dataset

**Future upgrade path:**
If dataset grows to 1000+ items, add `?path=search&q=query` to Apps Script. API route interface stays unchanged — swap `getPrompts/getProducts/getBlogs + filter` with a single `getSearchResults(q)` call.

**Rejected alternative:** Pure client-side (all data as props to SearchClient). Fast to build, wrong default for growing content site.

---

## FUTURE CONSIDERATION — Apps Script Server-Side Search Filtering

**Status:** Not implemented. Document kept here for future sessions.

### What it is
Move search filtering from Node.js (current) into Apps Script itself. Currently the `/api/search` route fetches all rows of all 3 tabs, then filters in Node. As row count grows, the fetch payload from Apps Script grows even though ISR caches it server-side.

### When to implement
Trigger this when:
- Any single tab (Prompts/Products/Blogs) exceeds ~500 rows, OR
- Cold ISR cache misses cause noticeable latency on the search endpoint

### How to implement

**Apps Script side (`Code.gs`):**
Add a `search` case to the existing `path` switch:

```javascript
case 'search':
  var q = (params.q || '').toLowerCase().trim();
  if (q.length < 2) {
    output = { data: { prompts: [], products: [], blogs: [] } };
    break;
  }
  var promptRows = getSheetData('Prompts');
  var productRows = getSheetData('Products');
  var blogRows = getSheetData('Blogs');
  output = {
    data: {
      prompts: promptRows.filter(function(r) {
        return matches(q, r.title, r.description, r.category, r.tool);
      }),
      products: productRows.filter(function(r) {
        return matches(q, r.title, r.description, r.category, r.badge, r.specs);
      }),
      blogs: blogRows.filter(function(r) {
        return matches(q, r.title, r.excerpt, r.category);
      }),
    }
  };
  break;

// helper — add once at top level:
function matches(q) {
  var fields = Array.prototype.slice.call(arguments, 1);
  return fields.some(function(f) { return f && String(f).toLowerCase().indexOf(q) !== -1; });
}
```

**Next.js side (`src/app/api/search/route.ts`):**
Replace the 3 separate fetches + filter with a single call:

```typescript
// Replace this:
const [prompts, products, blogs] = await Promise.all([getPrompts(), getProducts(), getBlogs()])
return NextResponse.json({ prompts: prompts.filter(...), ... })

// With this:
const results = await fetchFromCMS<{ prompts: unknown[], products: unknown[], blogs: unknown[] }>(`search&q=${encodeURIComponent(q)}`)
return NextResponse.json({
  prompts: (results[0]?.prompts ?? []).map(normalizePrompt).filter(p => p.id),
  products: (results[0]?.products ?? []).map(normalizeProduct).filter(p => p.id),
  blogs: (results[0]?.blogs ?? []).map(normalizeBlog).filter(b => b.id),
})
```

**Important:** Apps Script deployment required after any `Code.gs` change. Re-deploy as new version and update the deployed URL if it changes. See `cms-appscript-reference.md` for deployment steps.

**Trade-off:** Apps Script has execution time limits (6 min) and daily quotas. At moderate scale (< 10k rows), server-side filtering in Apps Script is fine. At very high scale, a dedicated search service (Algolia, Typesense, pg full-text) would be needed.

---

## Session: 2026-05-25 (Update) — Phase 2 CMS Wire-Up + ISR

---

### Decision: `@opennextjs/cloudflare` Over `@cloudflare/next-on-pages`

**Context:** Phase 2B ISR migration. `@cloudflare/next-on-pages` was the previously planned adapter.

**Decision:** Use `@opennextjs/cloudflare` (OpenNext) instead.

**Rationale:**
- `@cloudflare/next-on-pages@1.13.16` peer dep: `next@">=14.3.0 && <=15.5.2"` — blocks Next.js 16
- `@opennextjs/cloudflare` has no Next.js version ceiling; supports Next.js 16.x
- OpenNext is now the Cloudflare-recommended adapter for Next.js on Workers
- `npx opennextjs-cloudflare migrate` command auto-scaffolds all config (wrangler.jsonc, open-next.config.ts, .dev.vars, .gitignore entries)

**Migration steps actually executed:**
1. `npm install -D @opennextjs/cloudflare wrangler`
2. `npx opennextjs-cloudflare migrate` — scaffolds all config files
3. Remove `output: 'export'` from `next.config.ts`
4. Add `APPS_SCRIPT_URL` to `.dev.vars` (migrate does not copy project env vars)
5. Build: `npx opennextjs-cloudflare build` → `.open-next/worker.js`

**Note:** Previous plan in this file referenced `@cloudflare/next-on-pages` — that plan is superseded. Do not use `@cloudflare/next-on-pages` on this project.

---

### Decision: Server-Side Proxy for Google Drive Images

**Session:** 2026-05-27

**Context:** Google Drive's CDN ("fife" server, lh3.googleusercontent.com) returns HTTP 429 Too Many Requests when a browser makes concurrent image requests. This affects any direct browser-to-Drive URL regardless of format (thumbnail, lh3, uc). Root cause confirmed empirically via browser DevTools — 429 with `Content-Type: text/html` body.

**Decision:** Route all Drive image requests through a Next.js Route Handler at `/api/drive-image?id={FILE_ID}`. Server fetches Drive image server-side, returns to browser with 24-hour cache headers.

**Why proxy works:** Server-to-server fetches don't carry browser origin headers and are not subject to Google's per-origin concurrency limits.

**Alternatives rejected:**
- `drive.google.com/thumbnail?id={ID}&sz=w1000` — browser requests still hit 429 via redirect
- `lh3.googleusercontent.com/d/{ID}` — direct 429, no redirect bypass
- `loading="lazy"` on img tags — reduces concurrency but doesn't eliminate 429 for visible cards

**Security:** File ID validated with `/^[a-zA-Z0-9_\-]{10,80}$/` before use in fetch URL. Prevents SSRF.

**Trade-off:** First image load adds one server hop. Mitigated by `Cache-Control: public, max-age=86400` (24-hour browser cache). Subsequent page loads serve from browser cache instantly.

**Cloudflare Workers compatibility:** Route Handler uses only `fetch()` and `Response` — both available in Workers edge runtime. No Node.js-specific APIs used.

---

### Decision: Google Drive Image URL Normalization via `thumbnail` Endpoint

**Session:** 2026-05-27

**Context:** Google Sheets CMS stores images as Google Drive shareable links (`drive.google.com/file/d/{ID}/view?usp=sharing`). Plain `<img src>` against these URLs receives an HTML page, not image binary → broken images in all card components.

**Decision:** Transform Drive shareable links to `thumbnail` endpoint at normalization layer (`src/lib/api/normalize.ts`), using utility `src/lib/utils/imageUrl.ts`.

**Transform:** `drive.google.com/file/d/{ID}/view?usp=sharing` → `drive.google.com/thumbnail?id={ID}&sz=w1000`

**Why `thumbnail` over `uc?export=view`:**
- `uc?export=view` triggers Google virus scan page for large files; increasingly rate-limited
- `thumbnail?id={ID}&sz=w1000` returns image binary directly, stable, honours public share permission
- `sz=w1000` sufficient quality for card images (typically 300–600px wide)

**Why normalize.ts, not Client components:**
- Centralized — one change covers all current and future consumers
- Matches existing normalization philosophy: clients receive clean, ready-to-use data

**Passthrough behaviour:** Non-Drive URLs (Cloudinary, `lh3.googleusercontent.com`) pass through unchanged — zero regression on existing data.

**Files touched:** `src/lib/utils/imageUrl.ts` (new), `src/lib/api/normalize.ts`, `next.config.ts`, `.claude/context/content-model.md`

---

### Decision: Server Component Wrapper + Client Component Pattern for ISR + Interactivity

**Context:** Inner pages (`/prompts`, `/products`, `/blogs`) need both ISR (server-side fetch) and client-side `useState` for category filtering.

**Decision:** Split each page into two files:
- `page.tsx` — server component: fetches data via `getXxx()`, passes as `initialData` prop, exports `revalidate`
- `[Name]Client.tsx` — client component (`'use client'`): receives `initialData`, handles `useState`

**Rationale:**
- Server components cannot use `useState`; client components cannot be `async`
- This split satisfies both: server fetches once at render time (ISR), client handles interactivity in browser
- Data flows server→client as props — no client-side fetch, no CORS issue
- Pattern is explicit and future-maintainers can follow it

**File structure:**
```
src/app/prompts/page.tsx         ← server, async, revalidate = 3600
src/app/prompts/PromptsClient.tsx ← 'use client', useState, receives initialData: Prompt[]
```

---

### Decision: `getHomepageData()` With Featured Tab Fallback

**Context:** Home page needs a curated subset of content (not all items). Featured tab in Google Sheets defines which items appear on home page and in what order.

**Decision:** Implement `getHomepageData()` with two-stage resolution:
1. Fetch `Featured` tab — filter by `section` + `contentType`, resolve to full objects
2. If Featured tab returns zero items for a section → fall back to items with `featured: true` flag from main collection, sorted by `order`

**Rationale:**
- Prevents home page showing blank sections when Featured tab is empty or not yet configured
- Graceful degradation: sheet can be populated incrementally
- `featured: true` flag on individual items is simpler to maintain than the relational Featured tab

---

### Decision: `revalidate = 3600` On Both Fetch and Page Level

**Context:** ISR requires two-layer configuration in Next.js App Router.

**Decision:** Set `revalidate` in both places:
- `fetchFromCMS()`: `fetch(url, { next: { revalidate: 3600 } })` — per-fetch cache
- Each `page.tsx`: `export const revalidate = 3600` — page-level ISR

**Rationale:**
- Per-fetch `revalidate` controls Next.js data cache (de-duplication + caching of the `fetch()` call)
- Page-level `revalidate` controls how often Next.js regenerates the HTML page
- Both needed for correct ISR behavior — page-level alone is insufficient if fetch is cached longer

---

## Session: 2026-05-25

---

### Decision: Apps Script Deployment — Bound Script, `?path=` Routing

**Context:** Phase 2 CMS backend. Google Apps Script needed to expose content from Google Sheets as JSON API.

**Decision:** Bound script (attached to the Google Sheet via Extensions → Apps Script), not standalone. Route on `?path=` query parameter in `doGet(e)`.

**Rationale:**
- Bound scripts automatically have read access to the sheet — no OAuth or spreadsheet ID configuration needed
- `SpreadsheetApp.getActiveSpreadsheet()` works without credentials
- `?path=` routing is the simplest Apps Script routing pattern — no URL path parsing, no regex
- Single `Code.gs` file — easy to read, update, redeploy

**Trade-off:** Bound scripts are locked to one spreadsheet. If the spreadsheet is ever migrated to a new file, the script must be re-attached. For a solo creator workflow, acceptable.

---

### Decision: `APPS_SCRIPT_URL` Env Var — No `NEXT_PUBLIC_` Prefix

**Context:** Apps Script deployment URL must be available to Next.js at build time for server-side fetching.

**Decision:** Use `APPS_SCRIPT_URL` without `NEXT_PUBLIC_` prefix.

**Rationale:**
- URL is only consumed in server components at build time — not in browser JavaScript
- `NEXT_PUBLIC_*` embeds values into the client bundle — exposes URL in browser DevTools unnecessarily
- Apps Script URLs are effectively public (deployed as "Anyone can access") but embedding them in client JS is poor hygiene
- Server-side-only env vars are the correct pattern for build-time API credentials

**Local:** `.env.local` → `APPS_SCRIPT_URL=...`
**Production:** Cloudflare Pages Dashboard → Settings → Environment Variables

---

### Decision: CORS Mitigation — Server-Side Fetch Only

**Context:** Apps Script `ContentService` does not emit `Access-Control-Allow-Origin` headers. Browser fetch will be blocked.

**Decision:** Fetch Apps Script exclusively from Next.js server components (at build time). No client-side fetch to Apps Script.

**Rationale:**
- Server-to-server HTTP requests bypass browser CORS enforcement
- Content is read-only and non-realtime — no need for client-side dynamic fetch
- Build-time static generation (or ISR) is sufficient for this content type

**Implication for Phase 2:** Pages must be server components fetching at build time. Any page that needs to be a client component (e.g., with `useState` filters) must receive data as props from a parent server component, not fetch independently.

---

### Decision: Phase 2 ISR Migration — `output: 'export'` → `@opennextjs/cloudflare`

**Context:** `output: 'export'` (Phase 1) generates pure static HTML. Phase 2 needs ISR so sheet updates propagate within 1 hour without manual redeploy.

**Decision:** Migrated to `@opennextjs/cloudflare` adapter. **COMPLETED in 2026-05-25 session.**

**Status:** DONE. `output: 'export'` removed. All 4 routes show `Revalidate: 1h` in build output.

**Build command for Cloudflare Pages:** `npm run deploy` (= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`)
**Output artifact:** `.open-next/worker.js`

**Note:** Originally planned to use `@cloudflare/next-on-pages` — blocked by Next.js 16 peer dep. Used `@opennextjs/cloudflare` instead. See new decision above.

---

## Session: 2026-05-24

---

### Decision: Static Export (`output: 'export'`) for Phase 1

**Context:** Cloudflare Pages hosting, static-first philosophy, no backend yet.

**Decision:** Use `output: 'export'` in next.config.ts. This generates pure static HTML/CSS/JS into `/out`.

**Rationale:**
- Eliminates need for `@cloudflare/next-on-pages` adapter complexity
- Aligns with Phase 1 constraint: no backend, no API routes
- Cloudflare Pages supports static site uploads natively
- Simplest deployment path for a solo creator workflow

**Trade-off:** Phase 2 (CMS integration) will need `next/revalidate` or ISR, which requires switching to `@cloudflare/next-on-pages`. That migration is straightforward but planned.

---

### Decision: Tailwind CSS v4 (latest)

**Context:** Project rule requires latest stable tech. Stitch HTML uses v3 CDN config format but Stitch output is a reference, not implementation source.

**Decision:** Use Tailwind CSS v4 (`tailwindcss@^4`) with `@tailwindcss/postcss`.

**Rationale:**
- Latest stable version aligns with project tech-stack rule
- v4 uses CSS `@theme` directives in `globals.css` — no separate `tailwind.config.ts` needed
- All Stitch design tokens translate directly to CSS custom properties with `--color-*`, `--text-*`, `--radius-*`, `--spacing-*` prefixes
- Cleaner, more maintainable long-term

**v4 Token Translation Strategy:**
Stitch v3 `theme.extend.colors.surface: '#131313'` → v4 CSS `--color-surface: #131313;`
Stitch v3 `theme.extend.fontSize.display-lg: ['72px', {...}]` → v4 CSS:
```css
--text-display-lg: 72px;
--text-display-lg--line-height: 1.1;
--text-display-lg--letter-spacing: -0.02em;
--text-display-lg--font-weight: 600;
```
Stitch v3 `borderRadius.DEFAULT: 0.25rem` → v4 `--radius: 0.25rem;`
Stitch v3 `spacing.gutter: 24px` → v4 `--spacing-gutter: 24px;`

**Setup:**
```bash
pnpm add tailwindcss @tailwindcss/postcss
```
`postcss.config.js`:
```js
module.exports = { plugins: { '@tailwindcss/postcss': {} } }
```
`globals.css`:
```css
@import "tailwindcss";
@theme { /* all custom tokens */ }
```

**Trade-off:** Stitch class names like `font-display-lg`, `text-display-lg` map to v4 utilities automatically once `--text-display-lg` and `--font-display-lg` are defined in `@theme`. Minor class renaming may be needed (v4 uses `font-` prefix for font-family utilities; font-size uses `text-` prefix with the semantic name).

---

### Decision: Phase 1 = Static Mock Data (no CMS)

**Context:** Phase 1 explicitly excludes Google Sheets / Apps Script integration.

**Decision:** `lib/data/prompts.ts`, `products.ts`, `blogs.ts` as hardcoded TypeScript arrays matching content model schemas.

**Rationale:**
- Decouples frontend build from CMS availability
- Allows visual QA of all layouts before backend exists
- Schema types defined in `lib/types.ts` will serve as exact contract for Phase 2 API responses

**Note:** Mock data must match field names from `content-model.md` exactly so Phase 2 is a drop-in replacement.

---

### Decision: Navbar Labels from Home Screen (not inner screens)

**Context:** Inner Stitch screens (About, Products, Blogs) have placeholder nav: "Gallery, Studio, Assets, Archive". Home Stitch screen has correct nav: "Prompts, Products, Blogs, About".

**Decision:** Use home-screen nav labels everywhere.

**Rationale:** Inner screen labels are Stitch generation artifacts from different prompts. The architecture doc and home design are authoritative.

---

### Decision: Material Symbols via `<link>` in layout head

**Context:** Stitch uses Google Material Symbols icon font for icons (menu, arrow_forward, account_circle, etc.).

**Decision:** Load via `<link rel="stylesheet">` in root layout head with `strategy="lazyOnload"` behavior pattern — use Next.js `<Script>` for non-critical or just `<link>` in `<head>` since it's display content.

**Rationale:** Keeps icons working without a JS icon library. Acceptable trade-off for Phase 1. Can be replaced with a proper SVG icon system in Phase 2 if needed.

---

### Decision: `images: { unoptimized: true }` with static export

**Context:** `next/image` requires a server or third-party service for optimization when using `output: 'export'`.

**Decision:** Set `unoptimized: true`. Phase 1 uses Cloudinary-hosted images which are pre-optimized at the CDN level.

**Rationale:** Cloudinary handles responsive delivery and format optimization. Next.js image optimization would be redundant overhead.

---

### Decision: No Global State Library

**Context:** Frontend is almost entirely static/read-only content.

**Decision:** Use only React `useState` locally in Navbar for mobile menu state. No Zustand, Redux, Jotai, or similar.

**Rationale:** Over-engineering for content that doesn't change during a session.

---

### Decision: CSS `backdrop-filter` Budget

**Context:** `backdrop-filter: blur()` is expensive on GPU. Design uses it in multiple places.

**Decision:** Allow blur only on:
1. Navbar (`blur(20px)`) — single fixed element
2. Glass cards (`blur(12px)`) — but only on hover or always-on for visible cards

**Rationale:** Stacking multiple blur layers degrades scroll performance on mobile. Cards without hover don't need active blur — can reduce to `blur(8px)` if performance issues arise.
