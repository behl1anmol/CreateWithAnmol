# Lessons Learned

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
