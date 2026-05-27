# Plan: Validate Image Loading — Blogs, Products, About, Homepage

## Context

User requested validation that blogs, products, and about pages don't have the same Drive image 429 issue fixed on the prompts page. Investigation via source code confirms:

---

## Status Per Page (No Code Changes Needed)

| Page | Image source | Proxy applied | Status |
|------|-------------|---------------|--------|
| `/prompts` | Sheets Drive URLs → `normalize.ts` → `toEmbeddableImageUrl()` | Yes — `/api/drive-image?id={ID}` | Fixed |
| `/blogs` | Sheets Drive URLs → `normalizeBlog()` → `toEmbeddableImageUrl()` | Yes — `/api/drive-image?id={ID}` | Fixed |
| `/products` | Sheets Drive URLs → `normalizeProduct()` → `toEmbeddableImageUrl()` | Yes — `/api/drive-image?id={ID}` | Fixed |
| `/` (home) | `getHomepageData()` → calls getPrompts/Products/Blogs → same normalize path | Yes | Fixed |
| `/about` | Hardcoded `lh3.googleusercontent.com/aida-public/...` | No — passthrough, not Drive | No fix needed |

**Why about page is fine:**
- Single image — no concurrent 429 (rate limiting only triggers on multiple parallel requests)
- URL domain is `lh3.googleusercontent.com/aida-public/` — Google AI Demo CDN, not Drive
- `toEmbeddableImageUrl()` passthrough logic leaves non-Drive `lh3` URLs unchanged
- No user data dependency — hardcoded in page.tsx

---

## Validation Plan (Playwright)

Start dev server, then run Playwright to check each page:

1. `/blogs` — all `<img>` tags with `naturalHeight > 0`
2. `/products` — same check
3. `/about` — single hero `<img>` loads
4. `/` — homepage product/blog/prompt cards render images

Assert no 429 responses in network log.

---

## Post-Validation Docs

After Playwright confirms all pages load:
- Append to `.claude/analysis/implementation-notes.md` — validation session entry
- Update `.claude/analysis/session-handoff.md` — current state summary
