# Lessons Learned

## Session: 2026-05-29 — PR #1 Comment Security + Performance Fixes

### Google Drive Proxy — Use `thumbnail` Endpoint, Not `uc?export=view`

`uc?export=view` triggers a virus-scan redirect page for large files and is increasingly
rate-limited by Google. The `thumbnail?id={ID}&sz=w1000` endpoint returns image binary
directly with no redirect. Use this in all server-side Drive proxy fetches.

**Rule:** `drive.google.com/thumbnail?id={ID}&sz=w1000` → always. Never `uc?export=view`.

---

### Proxy Routes Must Validate Content-Type (Defense-in-Depth)

A server-side proxy forwarding Drive responses with no content-type check is a stored
XSS vector: a crafted Drive file returning `text/html` with `<script>` executes under
your origin. Always validate that the content-type starts with `image/` before forwarding.
Also add `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'`
to the response headers.

**Rule:** Never forward upstream content-type without validating the MIME family. Fail
closed (return 400) rather than defaulting to `image/jpeg` on missing content-type.

---

### Stream Proxy Responses — Never Buffer with `arrayBuffer()`

Buffering an image with `arrayBuffer()` in a Next.js route handler (or Cloudflare Worker)
loads the entire file into memory before sending. Cloudflare Workers have a 128 MB memory
limit — large images can hit the ceiling. `res.body` is a `ReadableStream` in both Node
and Edge runtimes; pass it directly to `new Response(res.body, ...)`.

**Rule:** In proxy route handlers, always stream with `res.body`. `arrayBuffer()` is only
appropriate when you need to inspect/transform the body bytes.

---

## Session: 2026-05-28 — PR #1 Review Fixes

### Never Throw at Module Level for Missing Env Vars in Next.js

**Situation:** `src/lib/api/client.ts` threw `Error('APPS_SCRIPT_URL environment variable is not set')` at module load time. Any file importing `@/lib/api` crashed on startup in envs without the var (CI, fresh clone, Playwright web server via `npm run dev`).

**Root cause:** Module-level `throw` executes when the module is first imported, not when the function is called. Next.js eagerly imports route modules, so crash happens before any request is served.

**Fix:** Moved env guard inside `fetchFromCMS`. Uses `console.warn` + `return []`. Pages render empty states; no crash.

**Rule:** Never throw for missing env vars at module top-level in Next.js. Guard inside the function that needs the var. Throw is only appropriate when the missing var makes the entire process non-functional (e.g., DB connection string at server startup), not for optional data sources that can gracefully degrade.

---

### AbortController Pattern for Debounced Search Inputs

**Situation:** `SearchClient.tsx` debounced fetch with 300ms timer but never aborted in-flight requests. A slower response for an earlier query could arrive after a newer one, overwriting results with stale data.

**Scenario:** User types "de" (fetch starts), types "design" (new fetch starts) — if "de" response arrives last, user sees results for "de" while input shows "design".

**Fix pattern:**
```tsx
const abortRef = useRef<AbortController | null>(null)

// In debounced callback:
abortRef.current?.abort()
const controller = new AbortController()
abortRef.current = controller

fetch(url, { signal: controller.signal })
  .catch(err => { if (err.name === 'AbortError') return; ... })
  .finally(() => { if (!controller.signal.aborted) setLoading(false) })

// In cleanup:
return () => { clearTimeout(timer); abortRef.current?.abort() }
```

**Key detail:** `finally` always runs even when `catch` returns early — check `controller.signal.aborted` in `finally` to avoid setting `loading=false` when a newer request has already set `loading=true`.

**Rule:** Any `useEffect` that fires async fetches on user input needs both debounce (prevent excess requests) AND AbortController (cancel stale in-flight requests). Debounce alone is insufficient.

---

## Session: 2026-05-28 — `mix-blend-luminosity` Over Dark Backgrounds = Grayscale

**Situation:** All homepage card images and blog page images rendered as black-and-white despite being full-color source images.

**Root cause:** `mix-blend-luminosity` CSS blend mode composites ONLY the luminosity (brightness) channel of an element against its background. When the background is near-black (`#121212`), there is no color information in the backdrop to blend with — only the lightness value of the image survives. Result is visually identical to a grayscale filter.

**Secondary cause:** `grayscale` Tailwind utility class on BlogCard images — explicit desaturation.

**Fix:** Remove `mix-blend-luminosity` / `grayscale` classes from `<img>` tags. Depth/contrast preserved via gradient overlays and opacity alone.

**Rule:** Never apply `mix-blend-luminosity` or `mix-blend-color` to images on dark/black backgrounds unless intentional desaturation is the design goal. These blend modes are only safe over colorful/light backgrounds.

---

## Session: 2026-05-27 — Universal Search Architecture

### Never Assume Low Data Volume on a Growing Content Site

**Situation:** Planned client-side search (all data loaded into browser, filtered in JS) based on current data count (7 prompts, 3 blogs, 2 products).

**Why wrong:** The creator explicitly stated data volume will grow. Client-side search has hard scaling problems: memory grows with dataset size, full dataset transferred on every search page load, no upgrade path without full rearchitecture.

**Correct default:** Any search feature on a content site should be server-side by default. For this project: create a `/api/search?q=` Next.js API route that fetches data server-side (leveraging existing ISR Data Cache in `fetchFromCMS`), filters in Node.js, returns only matching items to client. Apps Script hit rate stays at once per hour regardless of search volume.

**Rule:** Assume the dataset will be 10–100x its current size. Design search around server-side filtering. Client-side filtering is only appropriate for known, bounded, static datasets (e.g., a fixed config list).

**Future path if dataset grows to 1000+:** Move filtering to Apps Script by adding `?path=search&q=query` endpoint. The Next.js API route interface stays unchanged.

---

## Session: 2026-05-25 (Update) — Phase 2 CMS Wire-Up + ISR

### `@cloudflare/next-on-pages` Locks to Next.js ≤15 — Use `@opennextjs/cloudflare` on Next.js 16

**Situation:** `npm install -D @cloudflare/next-on-pages` failed with `ERESOLVE` — peer dep requires `next@">=14.3.0 && <=15.5.2"`. Project uses Next.js 16.2.6.

**Lesson:** `@cloudflare/next-on-pages` has a hard Next.js version ceiling. For any project on Next.js 16+, use `@opennextjs/cloudflare` instead. It is now the Cloudflare-recommended adapter and has no version ceiling.

**Rule:** Before installing a Cloudflare Next.js adapter, check its peer dep range. Next.js major version bumps routinely break `@cloudflare/next-on-pages` compat. `@opennextjs/cloudflare` is the safe default for latest-stable Next.js.

---

### Run `opennextjs-cloudflare migrate` First — It Does Most of the Config Work

**Situation:** Manually planned wrangler.toml config. The migrate command auto-generated everything correctly.

**Lesson:** `npx opennextjs-cloudflare migrate` scaffolds: `wrangler.jsonc` (with correct `main`, `compatibility_flags`, `assets` binding), `open-next.config.ts`, `.dev.vars`, `public/_headers`, gitignore entries, package.json scripts. Run it before writing any config manually. Only manual step: add project-specific env vars (e.g., `APPS_SCRIPT_URL`) to `.dev.vars`.

---

### `.dev.vars` Needs Project Env Vars Added Manually After Migrate

**Situation:** `opennextjs-cloudflare migrate` created `.dev.vars` with only `NEXTJS_ENV=development`. `APPS_SCRIPT_URL` was missing → `wrangler dev` would fail at runtime.

**Lesson:** The migrate command does not copy vars from `.env.local`. Always check `.dev.vars` after migrate and manually add any project-specific env vars that are needed at runtime. `.env.local` serves `next dev`; `.dev.vars` serves `wrangler dev`.

---

### Home Page Mock Types Diverge From Real Types — Audit Before Migration

**Situation:** `HomeProduct` mock type used `icon` (Material Symbols name) and `link`. Real `Product` type uses `image` (URL) and `productLink`. Home page would have rendered blank image containers and broken links after migration without explicit field renaming.

**Lesson:** Before any mock→live migration, diff the mock type shape against the real TypeScript interface field by field. Even if the visual layout is identical, field name differences will silently break rendering. Write out the mapping table (mock field → real field) before touching code.

---

### Both Fetch-Level and Page-Level `revalidate` Are Required for ISR

**Situation:** Wasn't sure if `export const revalidate = 3600` on each page was needed given `next: { revalidate: 3600 }` was already in `fetchFromCMS()`.

**Lesson:** They control different cache layers:
- `fetch(..., { next: { revalidate: 3600 } })` → Next.js data cache (the HTTP response from Apps Script)
- `export const revalidate = 3600` on `page.tsx` → page-level ISR (when Next.js regenerates the HTML)

Both are needed. Omitting the page-level export means the page is treated as fully static with no revalidation schedule, even if the underlying fetch is cached with TTL.

---

### wrangler Requires Node.js ≥22 — On Node 20, Build Works But Local Preview Doesn't

**Situation:** Machine runs Node v20.20.2. `wrangler@4.94.0` emitted `EBADENGINE` warnings. `npx wrangler dev` would not function reliably.

**Lesson:** `opennextjs-cloudflare build` (which calls `next build` under the hood) works on Node 20. The Node ≥22 requirement is only for wrangler's local dev server. For CI/CD on Cloudflare Pages, the build environment uses the correct Node version. Local preview requires a Node version manager upgrade (`nvm use 22` or volta) to use `wrangler dev`. This is a local-only limitation, not a deployment blocker.

---

## Session: 2026-05-25 — Phase 2 CMS Backend Setup

### Schema Must Be Validated Against types.ts Before Phase 2

**Situation:** `cms-schema.md` was written during planning, before frontend pages were fully implemented. When pages were built, `types.ts` gained 6 fields not present in the schema (`tool`, `date`, `category`/`price`/`badge`/`specs`).

**Lesson:** At any phase boundary (especially Phase 1 → Phase 2), always diff `src/lib/types.ts` against `cms-schema.md` column definitions. The types file is the authoritative runtime contract — schema must match it, not the other way around.

**Action:** Before implementing Phase 2 fetch layer, run a quick audit: every field in `types.ts` interfaces must exist as a column in the corresponding Google Sheet tab.

---

### `NEXT_PUBLIC_` Prefix Is Wrong for Build-Time Server-Side Fetch

**Situation:** Initially documented env var as `NEXT_PUBLIC_APPS_SCRIPT_URL`. This was incorrect.

**Lesson:** `NEXT_PUBLIC_*` is for values that need to be accessible in client-side JavaScript (embedded into the browser bundle by Next.js at build time). Apps Script URL is only needed server-side during `next build` — it should never appear in the browser bundle. Use `APPS_SCRIPT_URL` (no prefix). Server components and `getStaticProps`-style fetching read it from `process.env` at build time only.

**Rule:** If a value is only read in server components or at build time, no `NEXT_PUBLIC_` prefix.

---

### Apps Script ContentService Has No CORS Headers

**Situation:** Apps Script `ContentService.createTextOutput()` returns JSON without `Access-Control-Allow-Origin` headers. Any browser `fetch()` call to the Apps Script URL will be blocked by CORS.

**Lesson:** Never fetch Apps Script URL from client-side code (`useEffect`, client components, or browser `fetch()`). Always fetch from Next.js server components (build time or ISR). Server-to-server HTTP calls bypass browser CORS enforcement entirely.

**Corollary:** If client-side fetch to Apps Script is ever needed (e.g., form submissions, dynamic filtering without ISR), a proxy server or Cloudflare Worker is required. For this project, server-side build-time fetch is sufficient.

---

### Cloudflare Pages Env Vars Are Injected Into Build Environment

**Situation:** Needed to understand where `APPS_SCRIPT_URL` lives in production since `.env.local` is never committed.

**Lesson:** Cloudflare Pages Dashboard → Settings → Environment Variables injects variables into `npm run build`. Next.js `process.env.APPS_SCRIPT_URL` reads them correctly during build. No special Cloudflare-specific config needed. Set for both `Production` and `Preview` environments independently.

---

### Apps Script: Read by Column Header Name, Not Column Index

**Situation:** Could have mapped sheet columns by position (index 0 = id, index 1 = title, etc.).

**Lesson:** Reading by header name (find index of `'id'` in row 1, map by name) makes the script resilient to column reordering in the sheet. A creator managing the sheet might drag columns around — positional reading would silently corrupt all data. Header-name reading is always safer for human-managed spreadsheets.

---

## Session: 2026-05-24 — Phase 1 Foundation Bootstrap

### Tailwind v4 @theme — Font Family Semantic Naming

**Situation:** Stitch HTML uses class names like `font-display-lg`, `font-headline-md`, `font-body-md` which in Tailwind v3 mapped to font-family AND font-size (via `fontFamily` and `fontSize` in config).

**Lesson:** In Tailwind v4, `--font-display-lg` in `@theme` generates a `font-display-lg` utility that sets `font-family` only. `--text-display-lg` generates `text-display-lg` that sets `font-size` + `line-height` + `letter-spacing`. Font-weight must be separate.

**Recommended approach for page implementations:**
```tsx
// Use @theme semantic classes directly in v4:
<h1 className="text-display-mobile md:text-display-lg font-display-lg font-semibold text-gradient">
```

NOT arbitrary value syntax (`text-[var(--color-primary)]`). Tailwind v4 auto-generates `text-primary`, `bg-primary`, etc. from `--color-primary` in @theme. Use semantic classes.

### Tailwind v4 — Color Utilities Are Auto-Generated

**Situation:** Used `text-[var(--color-primary)]` verbose arbitrary syntax in initial implementation.

**Lesson:** `--color-primary: #ffffff` in `@theme` automatically generates `text-primary`, `bg-primary`, `border-primary`, `shadow-primary`, etc. Use `text-primary` directly.

**Action:** Future page implementations should use semantic color classes. Refactor existing components when building full pages.

### `next/font/google` — Geist Is Available

**Confirmed:** `Geist` is importable from `next/font/google` in Next.js 16. No need for the separate `geist` npm package. Both `Hanken_Grotesk` and `Geist` work from `next/font/google`.

### Playwright in Project Context

**Situation:** Need to use explicit `executablePath` for chromium when running Playwright Node scripts:
```
/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell
```

**Lesson:** The version number in the path will change as Playwright updates. Either use `npx playwright screenshot` (which has bugs with some configs) or install playwright in project and use Node API with explicit path from `npx playwright install --dry-run`.

### Tailwind v4 + Next.js 16 Static Export

**Works correctly:** `output: 'export'` in `next.config.ts` + `@tailwindcss/postcss` PostCSS plugin. All 5 routes generate as static HTML.

### CSS Custom Properties in `@theme` vs Arbitrary Values

**Do:** Use semantic classes generated by v4 from `@theme` tokens
```tsx
className="text-primary bg-surface-container-lowest"
```

**Don't:** Use arbitrary CSS var syntax unnecessarily
```tsx
className="text-[var(--color-primary)] bg-[var(--color-surface-container-lowest)]"
```

Both work, but semantic classes are cleaner and compile to smaller CSS output.

### Composite Type Classes in globals.css

**Lesson:** The `.type-display-lg`, `.type-headline-md` etc. composite classes in `globals.css` work well. They bundle font-family + font-size + line-height + letter-spacing + font-weight into one class, matching Stitch's single class intent.

### About Teaser — Design When Stitch Stub Is Empty

When Stitch shows an empty section stub, design using the established visual system:
- Use `glass-panel` wrapper with `rounded-3xl` and generous padding (`p-12 md:p-20`)
- Center-align editorial content: label-caps → headline-md → body-lg → ghost CTA
- Apply `text-gradient` to headline for visual consistency with hero
- This pattern works for any "callout" or editorial section on the site.

### Inline Stitch Placeholder Images

The Stitch design uses `lh3.googleusercontent.com/aida-public/` URLs for AI-generated placeholder images. These are publicly accessible and appropriate for mock data in development. Use them in `src/lib/data/mockData.ts` for prompt cards until Cloudinary assets are wired in Phase 2.

### Page.tsx Top-Level Wrapper Must Stay Relative

page.tsx returns a `<div>` that is a child of `<main>` in layout.tsx. The top wrapper must be `relative` (not `absolute`) or ambient orbs bleed beyond page bounds. Pattern:
```tsx
<div className="relative z-10 pt-32 pb-32">
  <div className="absolute inset-0 z-0 ..."> {/* orbs */} </div>
  <section className="relative z-10 ..."> {/* content */} </section>
</div>
```

When using them, don't double-apply properties:
```tsx
// Good:
<h1 className="type-display-lg text-gradient">

// Redundant (type-display-lg already sets font-family):
<h1 className="type-display-lg font-display-lg text-gradient">
```
