# Phase 2 CMS Wire-Up — Implementation Plan

## Context

Replace static mock data with live Google Sheets data fetched via Apps Script API.
Build constraint: `output: 'export'` stays — all fetches happen at `npm run build` (server-to-server, no CORS issue).
CORS-safe pattern: server components fetch, client components receive data as props.

---

## Critical Field Mapping — Home Page

Current `page.tsx` uses simplified mock shapes that differ from real types:

| Section | Mock field | Real type field |
|---------|-----------|-----------------|
| Featured Products | `product.icon` (Material Symbols name) | `product.image` (URL) |
| Featured Products | `product.link` | `product.productLink` |
| Featured Blogs | `blog.icon` (Material Symbols name) | `blog.image` (URL) |
| Featured Blogs | `blog.link` | `blog.articleLink` |
| Featured Prompts | `prompt.image`, `prompt.reelLink`, `prompt.promptLink` | **Already match** real `Prompt` type |

Home page product + blog card image containers currently render `<span className="material-symbols-outlined">{icon}</span>`.
Phase 2 replaces these with `<img src={item.image} ... />` (same style as prompts section already has).

---

## Risk: Featured Tab Dependency

`getHomepageData()` resolves home page content via the `Featured` tab in Google Sheets.
If the Featured tab is empty or unpopulated, all three home sections render empty.

**Mitigation in plan**: if Featured tab returns zero items, fall back to items with `featured: true` flag directly from main data. Implement this in `getHomepageData()` — try Featured resolution first, fall back to `featured: true` filter.

---

## Files to Create

```
src/lib/api/client.ts       — fetch utility, graceful error → empty array
src/lib/api/normalize.ts    — raw API object → typed interface
src/lib/api/index.ts        — public surface: getPrompts, getProducts, getBlogs, getFeaturedItems, getHomepageData
src/app/prompts/PromptsClient.tsx    — client component, receives initialData: Prompt[]
src/app/products/ProductsClient.tsx  — client component, receives initialData: Product[]
src/app/blogs/BlogsClient.tsx        — client component, receives initialData: Blog[]
```

## Files to Modify

```
src/app/page.tsx             — async server component; replace mock imports; update field names
src/app/prompts/page.tsx     — rewrite to server wrapper (no 'use client')
src/app/products/page.tsx    — rewrite to server wrapper (no 'use client')
src/app/blogs/page.tsx       — rewrite to server wrapper (no 'use client')
```

## Files Unchanged

```
src/lib/types.ts             — types are correct
src/lib/data/mockData.ts     — keep until build verified
next.config.ts               — keep output: 'export'
src/app/about/page.tsx
src/app/layout.tsx
```

---

## Step-by-Step Implementation

### Step 1 — `src/lib/api/client.ts`

Exact spec from prompt. Key behaviors:
- Module-level `APPS_SCRIPT_URL` read (throws at build if unset — acceptable; `.env.local` exists)
- `next: { revalidate: 3600 }` in fetch options (no-op with static export, future-safe for ISR)
- All error paths return `[]` + `console.error`, never throw

### Step 2 — `src/lib/api/normalize.ts`

Exact spec from prompt. Key behaviors:
- `featured: raw.featured === true` — strict equality, handles string "TRUE" from Sheets returning as boolean from Apps Script
- Optional fields use ternary guard (`raw.field ? String(raw.field) : undefined`)
- `order` uses `typeof raw.order === 'number'` check

### Step 3 — `src/lib/api/index.ts`

Follows spec with one addition to `getHomepageData()`:

```typescript
// Fallback: if Featured tab empty, use featured:true flag from each collection
const featuredPrompts = resolve('featured-prompts', prompts, 'prompt').length > 0
  ? resolve('featured-prompts', prompts, 'prompt')
  : prompts.filter(p => p.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

// Same pattern for products and blogs
```

This ensures home page is never blank even if Featured tab is not yet configured.

### Step 4 — `src/app/page.tsx`

Changes:
1. Add `async` to component signature
2. Remove mock imports, add `import { getHomepageData } from '@/lib/api'`
3. Call `const { featuredPrompts, featuredProducts, featuredBlogs } = await getHomepageData()`
4. **Product cards**: Replace icon container with `<img src={product.image} .../>`, update CTA href to `product.productLink`
5. **Blog cards**: Replace icon container with `<img src={blog.image} .../>`, update CTA href to `blog.articleLink`
6. **Prompt cards**: Already use `prompt.image`, `prompt.reelLink`, `prompt.promptLink` — field names match real type, no change needed
7. Preserve ALL CSS classes, layout structure, gap/padding values

Image container replacement pattern (products + blogs):
```tsx
// Before (icon placeholder):
<div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
  <span className="material-symbols-outlined text-6xl text-white/10">{product.icon}</span>
</div>

// After (real image, same opacity treatment as prompts section):
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={product.image}
  alt={product.title}
  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity"
/>
```

### Step 5-7 — Page Splits (Prompts, Products, Blogs)

Pattern per route:

**`PromptsClient.tsx`** (new file):
- Copy entire current `page.tsx` content verbatim
- Change component name to `PromptsClient`
- Change props: `({ initialData }: { initialData: Prompt[] })`
- Replace `PROMPTS` with `initialData` (2 occurrences)
- Keep `'use client'`, all useState, all JSX, all CSS unchanged

**`page.tsx`** (rewrite):
```tsx
import { getPrompts } from '@/lib/api'
import PromptsClient from './PromptsClient'

export default async function PromptsPage() {
  const prompts = await getPrompts()
  return <PromptsClient initialData={prompts} />
}
```
No `'use client'`. No imports from mockData. Pure server component.

Same pattern for Products (`ProductsClient.tsx`, `ProductsPage`) and Blogs (`BlogsClient.tsx`, `BlogsPage`).

For **Products**: `ProductsClient.tsx` retains `FeaturedProductCard` and `ProductCard` sub-components inline. Props: `{ initialData: Product[] }`. Replace `PRODUCTS` (2 occurrences).

For **Blogs**: `BlogsClient.tsx` retains `FeaturedBlogCard` and `BlogCard` sub-components inline. Props: `{ initialData: Blog[] }`. Replace `BLOGS` (2 occurrences).

---

## Verification

### Build verification
```bash
npm run build
# Expect: zero TS errors, /out directory with index.html + prompts/ + products/ + blogs/ + about/
# Watch build logs for: "CMS fetch failed" lines (indicates API issue)
```

### Playwright smoke tests (after build)
```bash
npx serve out -p 3001
# Then run playwright against localhost:3001
```

Checks:
- Home `/`: product cards show real images (not Material Symbols icons), blog cards show real images, prompt cards render
- `/prompts`: grid renders, category filter pills work
- `/products`: featured product hero renders, grid renders, category filter works
- `/blogs`: featured blog hero renders, grid renders, category filter works
- No `NEXT_PUBLIC_APPS_SCRIPT_URL` in any source file
- No `mockData` import in any `page.tsx` file

### Final checklist
- [ ] `npm run build` zero errors
- [ ] All 5 routes in `/out`
- [ ] No client-side fetch to Apps Script URL
- [ ] Home page shows real content (not mock titles)
- [ ] Category filters functional on all inner pages
- [ ] Featured heroes render on products + blogs pages
