# Plan: Fix Stale Fetch Cache + Drive Image Loading

## Context

Two distinct issues causing the prompts page to show wrong data with missing images.

---

## Issue 1: Stale Next.js Fetch Cache (Wrong Data)

**Root cause confirmed:**
`/mnt/stuff/WebstormProjects/CreateWithAnmol/.next/cache/fetch-cache/96c8ad2e197a89c266d434c094f8d439675ee4a4199f6efd47f94ed008a8c522`

This on-disk cache entry was written **May 25, 2026 01:20 IST** — over 48 hours ago. It contains:

```json
{"data":[
  {"id":"prompt-pack-1","title":"Viral Hooks Pack","image":"https://example.com/image1.jpg",...},
  {"id":"prompt-pack-2","title":"Carousel Ideas","image":"https://example.com/image2.jpg",...},
  {"id":"prompt-pack-3","title":"Caption Starters","image":"https://example.com/image3.jpg",...}
]}
```

This is what the browser shows as cards 2 and 3 ("Carousel Ideas", "Caption Starters") with broken images — `example.com` URLs return nothing.

The current live API (`?path=prompts`) returns the correct 6 prompts with Drive image URLs. The fetch cache (`next: { revalidate: 3600 }`) in Next.js dev mode does **not** auto-invalidate on disk when the TTL expires — it only revalidates on the next matching server request. Since no request triggered revalidation, the stale May 25 data persists.

**Fix:** Delete stale cache files. No code change.

```bash
rm -rf .next/cache/fetch-cache/
```

Then restart dev server. Next.js will fetch fresh from the API on the next page load.

---

## Issue 2: Drive Image Permissions

After clearing cache, the page will render the 6 live prompts with Drive thumbnail URLs (from the `toEmbeddableImageUrl` transform implemented in the previous session).

Drive thumbnails only work for **publicly shared files** ("Anyone with the link can view"). If a file is not public, the thumbnail endpoint returns a redirect to Google auth → broken image.

The first image (Luxury Fashion Portrait) loads → that file IS publicly shared. Others may not be.

**Fix:** No code change. Each Drive image file must be set to **"Anyone with the link"** sharing in Google Drive.

**How to verify sharing per file:**
- Open file in Drive → Share → "Anyone with the link can view"
- File IDs from the API to check:
  - `1GJswgI0DOXDcDuuo1nNdeHMAso3SilFB` (Luxury Portrait — already works)
  - `19SCdNpusXEPMMS8piTu2ITM2KB5b8UZ8` (Timeless Desert)
  - `1-obSdfohngmWzHJrfz-XMYeEkAfefrSA` (IPL fanportrait)
  - `1j8RjBgyiOzhzks-AS25Bh2ahHcEev-q4` (IPL fancity)
  - `1JLlYzQekM5VZ-wSG4TKuT0xbRlEnivIE` (Skin Analysis)
  - `1LYFWmcz5R-QZvJ6h9cL-SB5GVj_ZUJ86` (Style Analysis)

---

## Code Change: Dev Mode Cache Bypass

To prevent this problem recurring in development, add a conditional revalidate that skips the cache in dev mode.

**File:** `src/lib/api/client.ts`

Change:
```typescript
const res = await fetch(url, {
  next: { revalidate: 3600 },
})
```

To:
```typescript
const res = await fetch(url, {
  next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
})
```

`revalidate: 0` = always re-fetch in dev. Production behaviour unchanged (1-hour ISR cache).

---

## Implementation Steps

1. Delete stale cache files: `rm -rf .next/cache/fetch-cache/`
2. Edit `src/lib/api/client.ts` — conditional revalidate (prevents future stale cache in dev)
3. Restart dev server
4. Verify Drive file sharing for all 5 remaining Drive image files
5. Check prompts page renders all 6 cards with images

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/api/client.ts` | `revalidate: 0` in dev, `3600` in prod |
| `.next/cache/fetch-cache/` | Delete all (manual/bash step, not code) |

---

## Verification

1. Prompts page shows 6 cards with correct titles (Luxury Fashion Portrait, Timeless Desert, IPL x2, Skin Analysis, Style Analysis)
2. All card images render (Drive thumbnails load)
3. Filter pills: "AI Visuals, UI Design, etc." are static/hardcoded — categories in live data (Fashion, IPL, Style) won't match these pills, but all cards show under "All" tab (not a bug — filter pill update is a separate UX improvement)
