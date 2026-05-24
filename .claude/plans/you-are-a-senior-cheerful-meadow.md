# Phase 2 CMS Wire-Up + Phase 2B ISR — Implementation Plan

## Context

Replace static mock data with live Google Sheets data via Apps Script API.
User chose ISR (Phase 2B) so sheet updates go live within 1 hour without redeployment.

**Architecture shift**: `output: 'export'` → `@cloudflare/next-on-pages` + `revalidate: 3600`.
Server components now run as Cloudflare Pages Functions (Edge Runtime Workers).
Fetch still server-side only — CORS non-issue remains.

---

## Critical Field Mapping — Home Page

Current `page.tsx` uses simplified mock shapes that differ from real types:

| Section | Mock field | Real type field |
|---------|-----------|-----------------|
| Featured Products | `product.icon` (Material icon name) | `product.image` (URL) |
| Featured Products | `product.link` | `product.productLink` |
| Featured Blogs | `blog.icon` (Material icon name) | `blog.image` (URL) |
| Featured Blogs | `blog.link` | `blog.articleLink` |
| Featured Prompts | `prompt.image`, `prompt.reelLink`, `prompt.promptLink` | **Already match** real `Prompt` type |

Product + blog card image containers currently render `<span className="material-symbols-outlined">{icon}</span>`.
Phase 2 replaces these with `<img src={...} />` (same pattern as prompts section already uses).

---

## Risk: Featured Tab Dependency

`getHomepageData()` resolves home sections via the `Featured` tab in Google Sheets.
If Featured tab is empty → all three home sections render empty.

**Mitigation**: In `getHomepageData()`, if Featured resolution yields zero items, fall back to items with `featured: true` flag directly from main collections.

---

## Execution Order

### Part A — Cloudflare / ISR Setup

**Step 1 — Install packages**
```bash
npm install -D @cloudflare/next-on-pages wrangler
```

**Step 2 — Update `next.config.ts`**
- Remove `output: 'export'`
- Keep `images` config (unoptimized: true, remotePatterns unchanged)
- Add `@cloudflare/next-on-pages` ESLint plugin comment if needed

Result:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
```

**Step 3 — Create `wrangler.toml`** (project root)
```toml
name = "createwithanmol"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```
`nodejs_compat` flag required — gives Workers access to Node.js APIs (needed for Next.js internals).

**Step 4 — Update `package.json` scripts**
Add deployment build command:
```json
"pages:build": "npx @cloudflare/next-on-pages"
```
`next dev` remains unchanged for local development (runs Node.js runtime, not Workers).

Cloudflare Pages build command (set in Pages dashboard): `npm run pages:build`

### Part B — API Layer

**Step 5 — Create `src/lib/api/client.ts`**
```typescript
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL

if (!APPS_SCRIPT_URL) {
  throw new Error('APPS_SCRIPT_URL environment variable is not set')
}

export async function fetchFromCMS<T>(path: string): Promise<T[]> {
  const url = `${APPS_SCRIPT_URL}?path=${path}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      console.error(`CMS fetch failed for "${path}": ${res.status} ${res.statusText}`)
      return []
    }
    const json = await res.json()
    if (json.error) {
      console.error(`CMS API error for "${path}": ${json.error}`)
      return []
    }
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`CMS fetch exception for "${path}":`, err)
    return []
  }
}
```
`revalidate: 3600` — active with ISR, tells Next.js to re-fetch from Apps Script every 1 hour.

**Step 6 — Create `src/lib/api/normalize.ts`**
Normalizers exactly as spec: `normalizePrompt`, `normalizeProduct`, `normalizeBlog`, `normalizeFeaturedItem`.
Key guards: `featured: raw.featured === true`, optional fields use ternary `raw.field ? String(raw.field) : undefined`.

**Step 7 — Create `src/lib/api/index.ts`**
Public surface. `getHomepageData` with Featured tab fallback:
```typescript
export async function getHomepageData() {
  const [prompts, products, blogs, featured] = await Promise.all([
    getPrompts(), getProducts(), getBlogs(), getFeaturedItems(),
  ])

  const resolve = <T extends { id: string }>(
    section: string, items: T[], contentType: string
  ): T[] =>
    featured
      .filter(f => f.section === section && f.contentType === contentType)
      .sort((a, b) => a.order - b.order)
      .map(f => items.find(item => item.id === f.contentId))
      .filter((item): item is T => item !== undefined)

  // Try Featured tab resolution first; fall back to featured:true flag if empty
  const featuredPrompts = resolve('featured-prompts', prompts, 'prompt').length > 0
    ? resolve('featured-prompts', prompts, 'prompt')
    : prompts.filter(p => p.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const featuredProducts = resolve('featured-products', products, 'product').length > 0
    ? resolve('featured-products', products, 'product')
    : products.filter(p => p.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const featuredBlogs = resolve('featured-blogs', blogs, 'blog').length > 0
    ? resolve('featured-blogs', blogs, 'blog')
    : blogs.filter(b => b.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  return { featuredPrompts, featuredProducts, featuredBlogs }
}
```

### Part C — Pages

**Step 8 — `src/app/page.tsx`**
Changes:
1. `export default async function Home()`
2. Remove mock imports, add `import { getHomepageData } from '@/lib/api'`
3. `const { featuredPrompts, featuredProducts, featuredBlogs } = await getHomepageData()`
4. Add `export const revalidate = 3600` at file top
5. Product card image container: replace icon `<span>` with `<img src={product.image} .../>`:
   ```tsx
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img
     src={product.image}
     alt={product.title}
     className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity"
   />
   ```
6. Product CTA: `href={product.link}` → `href={product.productLink}`
7. Blog card image container: same img replacement pattern
8. Blog CTA: `href={blog.link}` → `href={blog.articleLink}`
9. Prompt section: field names already match `Prompt` type — no change needed
10. Preserve ALL CSS classes, layout, structure

**Step 9-11 — Page Splits (Prompts, Products, Blogs)**

Create `[Name]Client.tsx` per route — copy current page.tsx verbatim, change:
- Component name → `[Name]Client`
- Props → `({ initialData }: { initialData: [Type][] })`
- Mock constant reference → `initialData`
- Add `export const revalidate = 3600` (not needed in client files — goes in server page.tsx)

Rewrite `page.tsx` per route:
```tsx
import { get[Type]s } from '@/lib/api'
import [Type]sClient from './[Type]sClient'

export const revalidate = 3600

export default async function [Type]sPage() {
  const items = await get[Type]s()
  return <[Type]sClient initialData={items} />
}
```

Products page: `ProductsClient.tsx` keeps `FeaturedProductCard` + `ProductCard` inline.
Blogs page: `BlogsClient.tsx` keeps `FeaturedBlogCard` + `BlogCard` inline.

---

## Files Created

```
src/lib/api/client.ts
src/lib/api/normalize.ts
src/lib/api/index.ts
src/app/prompts/PromptsClient.tsx
src/app/products/ProductsClient.tsx
src/app/blogs/BlogsClient.tsx
wrangler.toml
```

## Files Modified

```
package.json               — add pages:build script, add @cloudflare/next-on-pages + wrangler devDeps
next.config.ts             — remove output: 'export'
src/app/page.tsx           — async, revalidate, getHomepageData, field renames, img tags
src/app/prompts/page.tsx   — server wrapper + revalidate
src/app/products/page.tsx  — server wrapper + revalidate
src/app/blogs/page.tsx     — server wrapper + revalidate
```

## Files Unchanged

```
src/lib/types.ts
src/lib/data/mockData.ts   — keep until build verified
src/app/about/page.tsx
src/app/layout.tsx
```

---

## Verification

### Local dev (Node.js runtime)
```bash
npm run dev
# Visit localhost:3000 — live data loads from Apps Script
# Dev does NOT use ISR, every request hits Apps Script
```

### Local Cloudflare Workers preview
```bash
npm run pages:build
npx wrangler pages dev
# Tests actual Workers runtime + ISR behavior locally
```

### Production build check
```bash
npm run pages:build
# Expect: zero TS errors, .vercel/output/static directory generated
# Watch for CMS fetch log lines during build
```

### Playwright smoke (after local preview up)
- Home `/`: real images in product/blog cards (not Material icon spans)
- `/prompts`: grid renders, category filter pills work
- `/products`: featured hero renders, grid renders, category filter works
- `/blogs`: featured blog hero renders, grid renders, category filter works

### Final checklist
- [ ] `npm run dev` — data loads from Apps Script, no console errors
- [ ] `npm run pages:build` — zero errors
- [ ] No `output: 'export'` in `next.config.ts`
- [ ] `revalidate = 3600` exported from all 4 page.tsx files
- [ ] No `NEXT_PUBLIC_APPS_SCRIPT_URL` anywhere in codebase
- [ ] No mockData import in any page.tsx
- [ ] Category filters work on all 3 inner pages
- [ ] Cloudflare Pages dashboard build command updated to `npm run pages:build`
- [ ] `APPS_SCRIPT_URL` set in Cloudflare Pages Environment Variables