# Phase 2 — CMS Wire-Up Prompt

## Purpose

This prompt is for an agent implementing Phase 2 of the Create with Anmol website:
replacing static mock data with live data fetched from a Google Apps Script API
backed by a Google Sheets CMS.

Hand this prompt to a fresh Claude Code session at the start of Phase 2 implementation.

---

## Context You Must Read First

Before writing any code, read these files in this order. They are the source of truth:

1. `.claude/context/cms-appscript-reference.md` — Apps Script URL format, tab names, column headers, response shape
2. `.claude/context/architecture.md` — rendering strategy, data flow, component architecture
3. `.claude/context/content-model.md` — schema tables matching `src/lib/types.ts` exactly
4. `.claude/analysis/architectural-decisions.md` — decisions made and rationale (especially Phase 2 migration notes)
5. `.claude/analysis/session-handoff.md` — current implementation state (top entry = most recent)
6. `src/lib/types.ts` — TypeScript interfaces for Prompt, Product, Blog, FeaturedItem
7. `src/lib/data/mockData.ts` — current mock data (understand what fields are used)

---

## Current State of the Codebase

### What Exists
- Next.js App Router, Tailwind v4, TypeScript
- `src/lib/types.ts` — interfaces: `Prompt`, `Product`, `Blog`, `FeaturedItem`
- `src/lib/data/mockData.ts` — static mock arrays: `PROMPTS`, `PRODUCTS`, `BLOGS`, `FEATURED_PRODUCTS`, `FEATURED_BLOGS`, `FEATURED_PROMPTS`
- `next.config.ts` — currently `output: 'export'` (pure static build)

### Page Structure (Critical — Read Carefully)

| Page | File | Component Type | Data Used |
|------|------|---------------|-----------|
| Home `/` | `src/app/page.tsx` | Server component (no `'use client'`) | `FEATURED_PRODUCTS`, `FEATURED_BLOGS`, `FEATURED_PROMPTS` from mockData |
| Prompts `/prompts` | `src/app/prompts/page.tsx` | **Client component** (`'use client'` + `useState` for category filter) | `PROMPTS` from mockData |
| Products `/products` | `src/app/products/page.tsx` | **Client component** (`'use client'` + `useState` for category filter) | `PRODUCTS` from mockData |
| Blogs `/blogs` | `src/app/blogs/page.tsx` | **Client component** (`'use client'` + `useState` for category filter) | `BLOGS` from mockData |

### Home Page Data Shape (Current Mock Types — Not in types.ts)
The home page currently uses local interface types (`HomeProduct`, `HomeBlog`, `HomePrompt`) that are simpler than the full types. Phase 2 replaces these with resolved items from the `Featured` tab referencing full `Prompt`/`Product`/`Blog` objects.

---

## Apps Script API

### Environment Variable
```
APPS_SCRIPT_URL
```
No `NEXT_PUBLIC_` prefix. Server-side only. Must exist in `.env.local` for local development and in Cloudflare Pages Environment Variables for production.

### Endpoint Format
```
GET {APPS_SCRIPT_URL}?path=prompts   → { data: Prompt[] }
GET {APPS_SCRIPT_URL}?path=products  → { data: Product[] }
GET {APPS_SCRIPT_URL}?path=blogs     → { data: Blog[] }
GET {APPS_SCRIPT_URL}?path=featured  → { data: FeaturedItem[] }
```

### Response Envelope
```json
{
  "data": [
    { "id": "...", "title": "...", ... }
  ]
}
```
Error response: `{ "data": [], "error": "message" }`

### CORS Constraint — Non-Negotiable
Apps Script `ContentService` does NOT emit `Access-Control-Allow-Origin` headers.
**You must never fetch from client components.** Client-side `fetch()` to the Apps Script URL will fail with a CORS error in production.

Correct fetch location: Next.js server components only, executed at build time (or ISR if enabled).

---

## Architecture: Server Component Wrapper Pattern

Inner pages (`/prompts`, `/products`, `/blogs`) are currently pure client components because they use `useState` for interactive category filtering. This creates a conflict: they need interactivity (client) but must fetch server-side (not client).

**Solution: Server component wrapper + Client content component.**

Split each page into two files:

```
src/app/[route]/page.tsx        ← Server component: fetches data, passes as props
src/app/[route]/[Route]Client.tsx ← Client component: receives data as props, handles useState
```

Pattern:

```tsx
// src/app/prompts/page.tsx — SERVER component
import { getPrompts } from '@/lib/api'
import PromptsClient from './PromptsClient'

export default async function PromptsPage() {
  const prompts = await getPrompts()
  return <PromptsClient initialData={prompts} />
}
```

```tsx
// src/app/prompts/PromptsClient.tsx — CLIENT component
'use client'
import { useState } from 'react'
import type { Prompt } from '@/lib/types'

export default function PromptsClient({ initialData }: { initialData: Prompt[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  // existing JSX unchanged, replace `PROMPTS` with `initialData`
}
```

The server component runs at build time. The client component hydrates with the pre-fetched data. No client-side fetch. No CORS issue.

---

## Implementation Plan

Execute in this exact order. Do not skip steps or reorder.

### Step 1: Create `src/lib/api/client.ts`

Fetch utility with error handling and timeout.

```typescript
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL

if (!APPS_SCRIPT_URL) {
  throw new Error('APPS_SCRIPT_URL environment variable is not set')
}

export async function fetchFromCMS<T>(path: string): Promise<T[]> {
  const url = `${APPS_SCRIPT_URL}?path=${path}`
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1 hour — ignored in static export, active when ISR enabled
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

Rationale: Graceful fallback (empty array) prevents build failure if Apps Script is temporarily unavailable. `revalidate: 3600` is a no-op with `output: 'export'` but enables ISR automatically when Phase 2B switches to `@cloudflare/next-on-pages`.

### Step 2: Create `src/lib/api/normalize.ts`

Normalize raw API response objects to match `src/lib/types.ts` interfaces exactly.
The Apps Script script omits empty cell fields — normalization applies safe defaults.

```typescript
import type { Prompt, Product, Blog, FeaturedItem } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePrompt(raw: any): Prompt {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    image: String(raw.image ?? ''),
    promptLink: String(raw.promptLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    tool: raw.tool ? String(raw.tool) : undefined,
    reelLink: raw.reelLink ? String(raw.reelLink) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    image: String(raw.image ?? ''),
    productLink: String(raw.productLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    price: raw.price ? String(raw.price) : undefined,
    badge: raw.badge ? String(raw.badge) : undefined,
    specs: raw.specs ? String(raw.specs) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBlog(raw: any): Blog {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    excerpt: String(raw.excerpt ?? ''),
    image: String(raw.image ?? ''),
    articleLink: String(raw.articleLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    readTime: raw.readTime ? String(raw.readTime) : undefined,
    date: raw.date ? String(raw.date) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeFeaturedItem(raw: any): FeaturedItem {
  return {
    id: String(raw.id ?? ''),
    contentType: raw.contentType as 'prompt' | 'product' | 'blog',
    contentId: String(raw.contentId ?? ''),
    section: String(raw.section ?? ''),
    order: typeof raw.order === 'number' ? raw.order : 999,
  }
}
```

### Step 3: Create `src/lib/api/index.ts`

Public API surface — the only file pages should import from.

```typescript
import { fetchFromCMS } from './client'
import {
  normalizePrompt,
  normalizeProduct,
  normalizeBlog,
  normalizeFeaturedItem,
} from './normalize'
import type { Prompt, Product, Blog, FeaturedItem } from '@/lib/types'

export async function getPrompts(): Promise<Prompt[]> {
  const raw = await fetchFromCMS<unknown>('prompts')
  return raw.map(normalizePrompt).filter(p => p.id)
}

export async function getProducts(): Promise<Product[]> {
  const raw = await fetchFromCMS<unknown>('products')
  return raw.map(normalizeProduct).filter(p => p.id)
}

export async function getBlogs(): Promise<Blog[]> {
  const raw = await fetchFromCMS<unknown>('blogs')
  return raw.map(normalizeBlog).filter(b => b.id)
}

export async function getFeaturedItems(): Promise<FeaturedItem[]> {
  const raw = await fetchFromCMS<unknown>('featured')
  return raw.map(normalizeFeaturedItem).filter(f => f.id && f.contentId)
}

/**
 * Resolves Featured tab rows into actual content items for each homepage section.
 * Fetches all four endpoints in parallel for performance.
 */
export async function getHomepageData() {
  const [prompts, products, blogs, featured] = await Promise.all([
    getPrompts(),
    getProducts(),
    getBlogs(),
    getFeaturedItems(),
  ])

  const resolve = <T extends { id: string }>(
    section: string,
    items: T[],
    contentType: string
  ): T[] =>
    featured
      .filter(f => f.section === section && f.contentType === contentType)
      .sort((a, b) => a.order - b.order)
      .map(f => items.find(item => item.id === f.contentId))
      .filter((item): item is T => item !== undefined)

  return {
    featuredPrompts: resolve('featured-prompts', prompts, 'prompt'),
    featuredProducts: resolve('featured-products', products, 'product'),
    featuredBlogs: resolve('featured-blogs', blogs, 'blog'),
  }
}
```

### Step 4: Update `src/app/page.tsx` (Home Page)

Home page is already a server component. Replace mock data imports with API call.

- Remove: `import { FEATURED_PRODUCTS, FEATURED_BLOGS, FEATURED_PROMPTS } from '@/lib/data/mockData'`
- Add: `import { getHomepageData } from '@/lib/api'`
- Make component `async`
- Call `const { featuredPrompts, featuredProducts, featuredBlogs } = await getHomepageData()`
- Update template to use `featuredPrompts`, `featuredProducts`, `featuredBlogs`

The home page currently renders product cards using a `HomeProduct` shape (`icon` field, `link` field). Phase 2 replaces these with actual `Product` objects (`image` field, `productLink` field). Update the JSX rendering accordingly — use `product.image` instead of icon placeholder, use `product.productLink` for the CTA link. Similarly for blogs and prompts.

Preserve all existing CSS classes, layout structure, and visual composition. Only change: data source and rendered field names.

### Step 5: Split `/prompts` Page

**Create `src/app/prompts/PromptsClient.tsx`:**
- Move entire content of current `src/app/prompts/page.tsx` into this file
- Change: component receives `{ initialData }: { initialData: Prompt[] }` as props
- Change: replace `PROMPTS` references with `initialData`
- Keep: all `useState`, JSX, CSS classes unchanged

**Rewrite `src/app/prompts/page.tsx`:**
```tsx
import { getPrompts } from '@/lib/api'
import PromptsClient from './PromptsClient'

export default async function PromptsPage() {
  const prompts = await getPrompts()
  return <PromptsClient initialData={prompts} />
}
```
No `'use client'` directive. No `useState`. Pure server component.

### Step 6: Split `/products` Page

**Create `src/app/products/ProductsClient.tsx`:**
- Move content of current `src/app/products/page.tsx`
- Props: `{ initialData }: { initialData: Product[] }`
- Replace `PRODUCTS` references with `initialData`
- Keep all JSX, state logic, CSS unchanged

**Rewrite `src/app/products/page.tsx`:**
```tsx
import { getProducts } from '@/lib/api'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialData={products} />
}
```

### Step 7: Split `/blogs` Page

**Create `src/app/blogs/BlogsClient.tsx`:**
- Move content of current `src/app/blogs/page.tsx`
- Props: `{ initialData }: { initialData: Blog[] }`
- Replace `BLOGS` references with `initialData`
- Keep all JSX, state logic, CSS unchanged

**Rewrite `src/app/blogs/page.tsx`:**
```tsx
import { getBlogs } from '@/lib/api'
import BlogsClient from './BlogsClient'

export default async function BlogsPage() {
  const blogs = await getBlogs()
  return <BlogsClient initialData={blogs} />
}
```

### Step 8: `next.config.ts` — Keep `output: 'export'` for Now

Do NOT remove `output: 'export'` in this phase.

Rationale:
- Static export runs all async server components at `npm run build` time
- Fetch to Apps Script during `npm run build` is server-to-server — CORS irrelevant
- Content freshness is managed by re-deploying when sheet is updated
- This is acceptable for a solo creator workflow (sheet updates are infrequent)

Future Phase 2B (when ISR needed): remove `output: 'export'`, add `@cloudflare/next-on-pages`, add `export const revalidate = 3600` to each page. That migration is documented in `.claude/analysis/architectural-decisions.md`.

### Step 9: TypeScript Validation

```bash
npm run build
```

Expected: zero TypeScript errors, all 5 routes in `/out` directory.

If build fails because `APPS_SCRIPT_URL` is undefined, ensure `.env.local` exists at project root with:
```
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## Validation Checklist

After implementation, verify each item:

- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `/out` directory contains all 5 HTML files (`index.html`, `prompts/`, `products/`, `blogs/`, `about/`)
- [ ] Build logs show actual data fetched (no empty arrays) — check for `CMS fetch failed` log lines
- [ ] Home page renders real product/blog/prompt titles (not mock data titles)
- [ ] `/prompts` page renders real prompts with correct images and promptLink URLs
- [ ] `/products` page renders real products with correct prices and productLink URLs
- [ ] `/blogs` page renders real blogs with correct dates and articleLink URLs
- [ ] Category filter pills still work on all three inner pages
- [ ] Featured product hero renders on `/products` (the item with `featured: true` in sheet)
- [ ] Featured blog hero renders on `/blogs` (the item with `featured: true` in sheet)
- [ ] No `NEXT_PUBLIC_APPS_SCRIPT_URL` references exist anywhere in codebase
- [ ] `src/lib/data/mockData.ts` is no longer imported by any page file
- [ ] No client-side fetch calls to Apps Script URL anywhere in codebase

---

## Files to Create

```
src/lib/api/client.ts
src/lib/api/normalize.ts
src/lib/api/index.ts
src/app/prompts/PromptsClient.tsx
src/app/products/ProductsClient.tsx
src/app/blogs/BlogsClient.tsx
```

## Files to Modify

```
src/app/page.tsx              — async server component, fetch from API
src/app/prompts/page.tsx      — rewrite to server component wrapper
src/app/products/page.tsx     — rewrite to server component wrapper
src/app/blogs/page.tsx        — rewrite to server component wrapper
```

## Files to Leave Unchanged

```
src/lib/types.ts              — types are correct, do not modify
src/lib/data/mockData.ts      — keep as reference; do not delete until build verified
next.config.ts                — keep output: 'export' for now
src/app/about/page.tsx        — no data fetching needed
src/app/layout.tsx            — no changes needed
```

---

## Error Handling Contract

The fetch layer must never throw or crash the build. All error states return empty arrays:
- Network failure → empty array + console.error
- Non-200 response → empty array + console.error
- Malformed JSON → empty array + console.error
- Apps Script API error → empty array + console.error

Pages must handle empty arrays gracefully. Each page already has an empty state UI — verify it renders correctly with an empty array.

---

## Do Not

- Do not fetch from client components (`'use client'` files) — CORS will block it
- Do not use `NEXT_PUBLIC_APPS_SCRIPT_URL` — server-side env var, no prefix
- Do not remove `output: 'export'` from `next.config.ts` — ISR migration is Phase 2B, not this task
- Do not restructure the JSX or change any CSS classes on existing page components — only the data source changes
- Do not hardcode the Apps Script URL in source code — always read from `process.env.APPS_SCRIPT_URL`
- Do not add `'use client'` to the new `page.tsx` server wrappers
- Do not delete `mockData.ts` until `npm run build` passes with live data
