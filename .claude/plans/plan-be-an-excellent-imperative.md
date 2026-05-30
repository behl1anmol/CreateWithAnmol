# Plan: Google Drive Image URL Transform

## Context

Google Sheets CMS stores images as Google Drive shareable links (`drive.google.com/file/d/{ID}/view?usp=sharing`). These URLs return an HTML "preview page" — not image binary — when used as `<img src>`. Result: broken/blank images across all card components in Prompts, Products, and Blogs pages.

All 3 `*Client.tsx` files render `<img src={item.image}>` directly. Fix belongs at normalization layer (server-side), so transformed URLs arrive at every consumer automatically.

---

## Root Cause

| URL format stored in Sheets | What browser gets | Problem |
|---|---|---|
| `drive.google.com/file/d/{ID}/view?usp=sharing` | HTML page | Not embeddable as `<img>` |
| `drive.google.com/thumbnail?id={ID}&sz=w1000` | Actual image binary | Embeddable ✓ |

Fix: regex-extract `FILE_ID` → rewrite to `thumbnail` endpoint at normalization time.

---

## Approach Rationale

**Why `thumbnail` endpoint over `uc?export=view`?**
- `uc?export=view` triggers Google's virus scan page for files >25MB and is increasingly rate-limited
- `thumbnail?id=ID&sz=w1000` returns image binary directly, is stable, and respects the public share permission
- `sz=w1000` keeps quality adequate for card use (cards are typically 300–600px wide) without over-fetching

**Why normalize.ts, not the Client components?**
- Centralized: 1 change covers all current and future consumers
- Consistent with existing normalization philosophy (see `frontend-data-contract-philosophy` in content-model.md)
- Clients should receive clean, ready-to-use data

**Why passthrough non-Drive URLs?**
- Cloudinary and `lh3.googleusercontent.com` URLs are valid as-is
- Passthrough ensures zero regression on existing mock data and any already-valid URLs

---

## Files to Change

### 1. NEW — `src/lib/utils/imageUrl.ts`

Utility with one exported function. Handles two Drive URL patterns:

```typescript
export function toEmbeddableImageUrl(url: string): string {
  if (!url) return url;

  // Pattern 1: drive.google.com/file/d/{ID}/...
  const fileMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
  }

  // Pattern 2: drive.google.com?id={ID} or drive.google.com/open?id={ID}
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[?&]id=([^&#]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }

  return url; // passthrough: Cloudinary, lh3.googleusercontent.com, etc.
}
```

### 2. EDIT — `src/lib/api/normalize.ts`

Import `toEmbeddableImageUrl` and apply to `image` field in 3 normalizers:

- `normalizePrompt` line 9: `image: toEmbeddableImageUrl(String(raw.image ?? '')),`
- `normalizeProduct` line 25: `image: toEmbeddableImageUrl(String(raw.image ?? '')),`
- `normalizeBlog` line 42: `image: toEmbeddableImageUrl(String(raw.image ?? '')),`

`normalizeFeaturedItem` has no `image` field — no change.

### 3. EDIT — `next.config.ts`

Add `drive.google.com` to `remotePatterns`:

```typescript
{ hostname: 'drive.google.com' },
```

Rationale: future-proofs for `next/image` migration. Plain `<img>` tags work without this, but maintaining the whitelist avoids surprises.

### 4. EDIT — `.claude/context/content-model.md`

Add to the **Image Rules** section (currently line 276–295):

```markdown
Supported image URL sources:

* Cloudinary-hosted assets (preferred)
* Google Drive shareable links — auto-transformed to thumbnail endpoint at normalization layer
* lh3.googleusercontent.com direct URLs

Google Drive links stored in Sheets (`drive.google.com/file/d/{ID}/view`) are
automatically rewritten to `drive.google.com/thumbnail?id={ID}&sz=w1000` by
`src/lib/utils/imageUrl.ts` during normalization. Do not transform manually in Sheets.
```

### 5. EDIT — `.claude/analysis/implementation-notes.md`

Append session entry documenting the change, rationale, and files touched.

### 6. EDIT — `.claude/analysis/architectural-decisions.md`

Append decision: "Google Drive image URL normalization via thumbnail endpoint" with rationale.

---

## Files NOT Changed

| File | Reason |
|---|---|
| `PromptsClient.tsx` | Receives pre-transformed URL — no change |
| `ProductsClient.tsx` | Same |
| `BlogsClient.tsx` | Same |
| `src/lib/types.ts` | `image: string` type is still correct |
| `src/lib/api/client.ts` | Fetch layer unchanged |
| `src/lib/api/index.ts` | Orchestration unchanged |

---

## Verification Steps

1. Add one real Google Drive shareable link to `src/lib/data/mockData.ts` as a test image URL
2. Run `npm run dev` and load `/prompts`, `/products`, `/blogs`
3. Confirm card images render (no broken image icons)
4. Confirm existing `lh3.googleusercontent.com` mock images still render (passthrough test)
5. Check browser Network tab — image requests should go to `drive.google.com/thumbnail?id=...`

---

## Implementation Order (for caveman-build)

1. Create `src/lib/utils/imageUrl.ts`
2. Edit `src/lib/api/normalize.ts`
3. Edit `next.config.ts`
4. Edit `content-model.md`
5. Edit `implementation-notes.md` + `architectural-decisions.md`
