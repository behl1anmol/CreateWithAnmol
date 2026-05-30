# Cache Clearing Guide

Reference when data looks stale, old entries appear, or images misbehave after Sheets changes.

---

## 1. Next.js Fetch Cache (most common cause of stale Sheets data)

**Symptom:** Page shows old prompt/product/blog titles. Sheets data updated but page still shows old content.

**Location:** `.next/cache/fetch-cache/`

**Clear:**
```bash
rm -rf .next/cache/fetch-cache/
```

Then restart the dev server. Next.js will fetch fresh from the Apps Script API.

**Why it happens:** `fetchFromCMS` uses `next: { revalidate: 3600 }`. In dev mode, Next.js persists this cache to disk across server restarts. The 1-hour TTL does not auto-invalidate on disk between restarts.

**Prevention (already implemented):** `client.ts` uses `revalidate: 0` in `development` mode, so new dev server starts always fetch fresh. Manual clearing is only needed for caches created before this fix was applied.

---

## 2. Next.js Full Build Cache

**Symptom:** Unexpected errors after dependency upgrades or config changes. Old compiled pages loading.

**Location:** `.next/` (entire directory)

**Clear:**
```bash
rm -rf .next/
```

Rebuild with `npm run build` or restart dev server (`npm run dev` rebuilds automatically).

**When to clear:** After changing `next.config.ts`, after major package upgrades, after deleting/renaming pages.

---

## 3. Node Modules Cache

**Symptom:** Module resolution errors, version conflicts, unexpected import failures.

**Clear:**
```bash
rm -rf node_modules/
npm install
```

**When to clear:** After resolving peer dependency conflicts, after force-installing packages.

---

## 4. Browser Cache (DevTools)

**Symptom:** Old images or JS loading even after code/data change. Network tab shows cached responses.

**Clear (Chrome/Edge/Firefox):**
- DevTools → Network tab → right-click any request → "Clear browser cache"
- OR: DevTools open → right-click reload button → "Empty Cache and Hard Reload"
- OR: Settings → Clear browsing data → Cached images and files

**When to clear:** After changing image URL format, after deploying new assets.

---

## 5. Google Drive Proxy Image Cache (`/api/drive-image`)

**Symptom:** Old image shows after updating a Drive file's content (same file ID, new image).

**How it works:** The `/api/drive-image?id={ID}` proxy route serves Drive images with `Cache-Control: public, max-age=86400` (24-hour browser cache). Once a browser has loaded an image, it caches it for 24 hours.

**Clear:** Hard reload in browser (Ctrl+Shift+R / Cmd+Shift+R) to bypass browser cache. Or clear cache via DevTools (see section 4 above).

**Note:** The file ID in the URL is stable per image. If you replace an image in Drive with a new file (new file ID), update the Sheets row with the new shareable link — the URL will change and browser won't use the old cache.

---

## 6. Cloudflare Edge Cache (Production)

**Symptom:** Old content serving on production after Sheets update.

**Clear:** ISR revalidation happens automatically after `revalidate: 3600` (1 hour). To force immediate refresh:
- Trigger a new deployment via `npx opennextjs-cloudflare build && wrangler deploy`
- OR: Use Cloudflare dashboard → Caching → Purge Cache → Purge Everything

---

## Quick Reference

| Problem | Command |
|---------|---------|
| Stale Sheets data in dev | `rm -rf .next/cache/fetch-cache/` + restart dev |
| Build errors / old pages | `rm -rf .next/` + restart dev |
| Module errors | `rm -rf node_modules/ && npm install` |
| Old images in browser | Hard reload (Ctrl+Shift+R) |
| Old production content | Wait for ISR (up to 1 hour) or redeploy |
