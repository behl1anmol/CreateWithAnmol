# Debugging Log

## 2026-05-28 — PR #1 Review: Module-Level Throw + Search Race Condition

### Fix 1 — `client.ts` crash on missing `APPS_SCRIPT_URL`

**File:** `src/lib/api/client.ts`
**Symptom:** Importing `@/lib/api` in any env without `APPS_SCRIPT_URL` set throws at module load, turning page loads into 500 errors instead of empty states.
**Root cause:** `if (!APPS_SCRIPT_URL) throw new Error(...)` at module top-level — executes at import time, not call time.
**Fix:** Removed module-level throw. Moved guard inside `fetchFromCMS`: `console.warn + return []`.
**Result:** All pages render empty gracefully on missing env.

### Fix 2 — `SearchClient.tsx` stale fetch race condition

**File:** `src/app/search/SearchClient.tsx`
**Symptom:** On slow networks, results for a shorter query ("de") could overwrite results for a newer query ("design") because the earlier fetch resolved last.
**Root cause:** Debounce prevents extra fetch triggers but doesn't cancel already-in-flight requests.
**Fix:** `abortRef = useRef<AbortController | null>(null)`. Each new fetch aborts previous controller. `signal` passed to `fetch()`. Catch ignores `AbortError`. `finally` checks `controller.signal.aborted` before `setLoading(false)`.
**Result:** Stale responses discarded. Loading state consistent under rapid typing.

---

## 2026-05-27 — Blogs/Products Grid Missing Items When Multiple featured:true

**Symptom:** Blogs page shows hero card (order 1) but grid below is empty. Homepage shows both blogs correctly. API returns 2 blogs, both `featured: true`.

**Root cause:**
```typescript
const featured = initialData.find(b => b.featured)          // takes order-1 blog as hero
const gridItems = initialData.filter(b => !b.featured)      // excludes ALL featured:true → empty []
```
When multiple items have `featured: true`, the grid filter `!b.featured` removes ALL of them. Only the first one renders as hero; the rest disappear entirely.

**Why homepage worked:** Homepage renders a flat horizontal scroll of ALL featured items via `featuredBlogs` array from `getHomepageData()` — no hero/grid split.

**Fix:** Changed grid filter from `!b.featured` (flag-based) to `b.id !== featured?.id` (ID-based). Grid now excludes only the specific item in the hero slot, not all items with `featured: true`.

Applied to:
- `src/app/blogs/BlogsClient.tsx`
- `src/app/products/ProductsClient.tsx`

Also reordered `featuredFiltered` declaration before `allFiltered`/`gridItems` in ProductsClient to fix variable reference order.

---

## 2026-05-27 — HTTP 429 from lh3.googleusercontent.com — Proxy Fix

**Symptom:** All Drive images blank after switching to `lh3.googleusercontent.com/d/{ID}` URL format.

**Root cause confirmed (browser DevTools):**
- Status: **429 Too Many Requests**
- Server: `fife` (Google's image CDN)
- Content-Type: `text/html` (rate-limit response body, not image)
- Referrer: `http://localhost:3000/` (browser-origin request)

Google's "fife" CDN rate-limits concurrent browser requests per origin. With 6 simultaneous `<img src>` requests, all 6 hit 429. No URL format (thumbnail, lh3, uc) avoids this — the throttle is applied at the CDN layer for browser-origin requests.

**Why server-side doesn't hit 429:** Server requests don't carry browser origin headers. Curl tests confirmed all formats return 200 from server context.

**Fix implemented:** Next.js Route Handler at `src/app/api/drive-image/route.ts`
- Browser requests `/api/drive-image?id={FILE_ID}` (same-origin, no rate limit)
- Next.js server fetches `drive.google.com/uc?export=view&id={ID}` server-side
- Returns image with `Cache-Control: public, max-age=86400` (browser caches 24hr)
- `toEmbeddableImageUrl` now outputs `/api/drive-image?id={ID}` for all Drive URLs

**Security:** File ID validated with regex `/^[a-zA-Z0-9_\-]{10,80}$/` to prevent SSRF.

**Affected pages fixed:** Prompts, Products, Blogs, Homepage featured (all use same utility).

---

## 2026-05-27 — Random Drive Thumbnails Fail on Concurrent Load

**Symptom:** On each page refresh, a random 1 out of 6 Drive images loads; others blank. Non-deterministic per refresh. All files confirmed publicly shared. URLs correct in inspect element.

**Root cause:** `drive.google.com/thumbnail?id={ID}&sz=w1000` CDN rate-limits concurrent requests from same browser origin. Browser fires 6 simultaneous image requests → Google's thumbnail CDN throttles → only 1-2 get through per burst. Which one "wins" is random per refresh.

**Affected:** All pages using `toEmbeddableImageUrl` — Prompts, Products, Blogs, Homepage featured. About page uses hardcoded `lh3.googleusercontent.com` — not affected.

**Fix:** Changed `src/lib/utils/imageUrl.ts` to output `lh3.googleusercontent.com/d/{FILE_ID}` instead of `drive.google.com/thumbnail?id={ID}&sz=w1000`. `lh3.googleusercontent.com` is Google's image CDN (same as Google Photos), designed for high-concurrency serving. Already whitelisted in `next.config.ts`.

**Trade-off:** No `sz=w1000` size constraint — serves original file resolution. Acceptable for card thumbnails when images are reasonably sized on upload.

---

## 2026-05-27 — Prompts Page Showing Wrong Titles + Missing Images

**Symptom:** /prompts page showed "Carousel Ideas", "Caption Starters" with blank images. Live API (`?path=prompts`) returned correct 6 prompts with Drive URLs.

**Investigation:**
- PromptsClient.tsx: no hardcoded data, purely uses `initialData` prop ✓
- `getPrompts()` → `fetchFromCMS()` → fetch with `next: { revalidate: 3600 }` ✓
- Checked `.next/cache/fetch-cache/`: 4 stale entries from 2026-05-25 01:20 IST (48hrs stale)
- File `96c8ad2e...` decoded: `{"data":[{"title":"Viral Hooks Pack"},{"title":"Carousel Ideas"},{"title":"Caption Starters"}]}` — placeholder entries with `example.com` image URLs
- Root cause: Next.js dev mode persists on-disk fetch cache past TTL between server restarts

**Fix:**
1. `rm -rf .next/cache/fetch-cache/` — cleared stale entries
2. `src/lib/api/client.ts`: `revalidate: 0` in dev, `3600` in prod — prevents recurrence

**Secondary issue (Drive image permissions):**
Drive thumbnail endpoint only works for publicly shared files. File `1GJswgI0DOXDcDuuo1nNdeHMAso3SilFB` (Luxury Portrait) confirmed public. Other 5 Drive file IDs from Sheets need "Anyone with the link can view" set in Google Drive.

---

## Session: 2026-05-25 (Update) — Phase 2 CMS Wire-Up + ISR

### Issue: `@cloudflare/next-on-pages` peer dep conflict with Next.js 16
**Symptom:** `npm install -D @cloudflare/next-on-pages` → `ERESOLVE unable to resolve dependency tree`. Peer dep requires `next@">=14.3.0 && <=15.5.2"`. Project: `next@16.2.6`.
**Fix:** Used `@opennextjs/cloudflare` instead — no Next.js version ceiling.
**Rule:** For Next.js 16+, `@opennextjs/cloudflare` is the correct adapter. Do not attempt `@cloudflare/next-on-pages` on this project.

### Issue: `opennextjs-cloudflare migrate` failed to set up ISR cache (Node version)
**Symptom:** `WARN Failed to set up cache for your project. After migration completes, please manually setup cache in wrangler.jsonc and open-next.config.ts`.
**Root cause:** wrangler requires Node ≥22; machine runs Node v20.20.2. Cache setup sub-command depends on wrangler CLI.
**Impact:** Non-blocking. R2-backed ISR cache is not configured; Worker-instance memory cache is used instead. Adequate for a solo creator site with low traffic variance.
**Fix if needed:** Upgrade to Node 22+ and re-run cache setup, or manually configure R2 binding in `wrangler.jsonc` and uncomment `r2IncrementalCache` in `open-next.config.ts`.

### Issue: `.dev.vars` missing `APPS_SCRIPT_URL` after migrate
**Symptom:** `opennextjs-cloudflare migrate` generated `.dev.vars` with only `NEXTJS_ENV=development`. `APPS_SCRIPT_URL` not present → would cause runtime error `APPS_SCRIPT_URL environment variable is not set` in wrangler dev.
**Fix:** Manually appended `APPS_SCRIPT_URL=https://...` to `.dev.vars`.
**Note:** `.env.local` (used by `next dev`) and `.dev.vars` (used by `wrangler dev`) are separate files. Migrate does not merge them.

### Issue: `next.config.ts` had `output: 'export'` retained after migrate
**Symptom:** `opennextjs-cloudflare migrate` appended `import('@opennextjs/cloudflare').then(...)` to `next.config.ts` but did NOT remove `output: 'export'`. Build would still generate static export rather than ISR-capable server build.
**Fix:** Manually removed `output: 'export'` line from `nextConfig` object.
**Rule:** Always check `next.config.ts` after migrate — the `output: 'export'` line is not automatically removed.

---

## Session: 2026-05-25 — Phase 2 CMS Backend Setup

### Issue: cms-schema.md missing 6 fields vs frontend types.ts
**Symptom:** Schema drafted during planning phase did not reflect fields added during frontend implementation.
**Affected tabs:**
- Prompts: missing `tool`
- Products: missing `category`, `price`, `badge`, `specs`
- Blogs: missing `date`
**Fix:** Updated `cms-schema.md`, `content-model.md`, and `cms-appscript-reference.md` with all missing fields.
**Prevention:** Before Phase 2 fetch integration, diff `types.ts` against schema. Types are authoritative.

### Issue: Wrong env var name recommended initially
**Symptom:** Guide initially documented `NEXT_PUBLIC_APPS_SCRIPT_URL`. Corrected after user asked about Cloudflare deployment.
**Root cause:** Defaulted to `NEXT_PUBLIC_` prefix without considering fetch is server-side only.
**Fix:** Renamed to `APPS_SCRIPT_URL` in guide, `cms-appscript-reference.md`, and memory files.
**Rule:** Only use `NEXT_PUBLIC_*` when value must be accessible in browser JS bundle.

### Issue: "Features" tab vs "Featured" tab naming discrepancy
**Symptom:** User created tab named "Features" — schema contract requires "Featured".
**Risk:** Apps Script `getSheetByName('Featured')` throws `Tab not found: "Featured"` if tab is named "Features".
**Fix:** Flagged before any data entry. User confirmed rename to "Featured".
**Note:** Apps Script tab name lookups are exact-match, case-sensitive. Tab name = code contract.

---

## Session: 2026-05-24 — Phase 1 Foundation Bootstrap

### Issue: pnpm not installed
**Symptom:** `pnpm: command not found`
**Fix:** Used npm (v11.12.1) instead. Plan referenced pnpm but npm is the available package manager. Project works fine with npm.
**Resolution:** Added `"packageManager": "npm"` note in session-handoff.

### Issue: Playwright CLI screenshot command fails
**Symptom:** `Error: Protocol error (Page.captureScreenshot): Unable to capture screenshot` when using `npx playwright screenshot`
**Fix:** Used Playwright Node.js API directly with explicit `executablePath`. Download location: `/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell`
**Command that works:**
```js
const browser = await chromium.launch({
  executablePath: '/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
```

### Issue: tsconfig.json modified by Next.js dev server
**Symptom:** Next.js auto-updated tsconfig.json: changed `jsx: "preserve"` to `jsx: "react-jsx"` and added `.next/dev/types/**/*.ts` to include.
**Status:** Expected behavior — Next.js correctly updates tsconfig for App Router compatibility. Not a bug.

### Issue: `pkill -f "next dev"` returns exit code 144
**Symptom:** `pkill` exits with 144 (signals mismatch or process not found as expected)
**Fix:** Use `kill $(lsof -ti:3000)` instead for reliable port-based process termination.
