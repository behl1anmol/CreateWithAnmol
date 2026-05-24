# Debugging Log

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
