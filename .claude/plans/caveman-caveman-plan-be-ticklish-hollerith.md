# Universal Search — Implementation Plan

## Context

The site (createwithanmol.com) has prompts, products, and blogs but zero search capability — only category filters exist per listing page. Users have no way to find content by keyword across types. This adds a universal search icon to the Navbar and a `/search` page with server-filtered search via a dedicated API route.

---

## Architecture Decision: Server-Side Search via Next.js API Route

**No Apps Script changes. One new API route. No full data load on the client.**

### Why NOT pure client-side search

The site currently has 7 prompts, 3 blogs, 2 products — but data volume is expected to grow significantly. Client-side search (loading all records into the browser) has problems at scale:

- **Memory**: All records + images URLs loaded into client JS heap
- **Initial load**: Entire dataset transferred on every `/search` page visit
- **No future-proofing**: At 500+ items, the JS payload + filtering cost becomes user-visible

Pure client-side search is the wrong default for a growing content site.

### Architecture

```
User types → debounced 300ms → GET /api/search?q=term
                                        ↓
                           Next.js API route (server-side)
                           calls getPrompts() / getProducts() / getBlogs()
                           (each uses fetchFromCMS → fetch with next: { revalidate: 3600 })
                           ↓
                           Apps Script hit at most ONCE PER HOUR (ISR Data Cache)
                           ↓
                           Server filters in Node.js
                           ↓
                           Returns { prompts: [...], products: [...], blogs: [...] }
                           (only matching items, not full dataset)
                                        ↓
                           SearchClient renders compact result rows
```

**Key insight:** `fetchFromCMS` already uses `fetch` with `next: { revalidate: 3600 }`. In Next.js App Router, this Data Cache applies equally to API route handlers — so Apps Script is called at most once per hour regardless of search volume. Client only receives matching records.

### Future path for even higher data volume

If data grows to 1000+ items: add `?path=search&q=query` support to Apps Script so Google Sheets filters server-side before returning. The Next.js API route interface stays the same — only the implementation of `getSearchResults()` changes.

### Why not Apps Script search now

Apps Script has no `search` endpoint yet. Adding one requires: re-deployment of the script, handling query parsing in Apps Script, and introducing a new uncached endpoint. Given Next.js ISR already caches the full dataset hourly on the server, filtering in Node.js is faster and simpler than a new Apps Script endpoint.

---

## CORS is not an issue

`/api/search` is a same-origin Next.js API route. The client fetches from the same domain. No CORS headers needed. The Apps Script fetch happens server-to-server (no browser involved), bypassing CORS entirely — consistent with the existing architecture.

---

## Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/search/route.ts` | **Create** | Search API: fetches cached data, filters server-side, returns matches |
| `src/app/search/page.tsx` | **Create** | Minimal server component: renders SearchClient inside Suspense |
| `src/app/search/SearchClient.tsx` | **Create** | Client component: debounced input, fetch to /api/search, result sections |
| `src/components/layout/Navbar.tsx` | **Modify** | Add search icon (desktop + mobile) |
| `playwright.config.ts` | **Create** | Playwright config pointing at `localhost:3000` |
| `e2e/search.spec.ts` | **Create** | End-to-end tests for search feature |

**No changes to:** `globals.css`, `types.ts`, `api/index.ts`, `api/client.ts`, any existing page/client component, Apps Script.

---

## Implementation: `src/app/api/search/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPrompts, getProducts, getBlogs } from '@/lib/api'

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  return fields.some(f => f?.toLowerCase().includes(q))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''

  if (!q || q.length < 2) {
    return NextResponse.json({ prompts: [], products: [], blogs: [] })
  }

  const [prompts, products, blogs] = await Promise.all([
    getPrompts(),
    getProducts(),
    getBlogs(),
  ])

  return NextResponse.json({
    prompts: prompts.filter(p => matches(q, p.title, p.description, p.category, p.tool)),
    products: products.filter(p => matches(q, p.title, p.description, p.category, p.badge, p.specs)),
    blogs: blogs.filter(b => matches(q, b.title, b.excerpt, b.category)),
  })
}
```

**Min length guard:** Queries under 2 chars return empty immediately — avoids noisy results for single-letter input and unnecessary server processing.

**No response caching headers:** Each search query returns dynamic results. The underlying data fetch is cached (via `fetchFromCMS`), but the response itself is not cached at HTTP level.

---

## Implementation: `src/app/search/page.tsx`

```tsx
import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata = { title: 'Search — Create with Anmol' }

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  )
}
```

No `revalidate` needed — this page has no server-side data fetching. Suspense is required because `SearchClient` uses `useSearchParams()`.

---

## Implementation: `src/app/search/SearchClient.tsx`

### State
```tsx
const searchParams = useSearchParams()
const router = useRouter()
const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')
const [results, setResults] = useState<SearchResults | null>(null)
const [loading, setLoading] = useState(false)
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

### Fetch with debounce
```tsx
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current)

  const q = inputValue.trim()
  if (q.length < 2) { setResults(null); return }

  debounceRef.current = setTimeout(async () => {
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }, 300)

  return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
}, [inputValue])
```

### URL sync on submit
```tsx
function handleSubmit(e: FormEvent) {
  e.preventDefault()
  const q = inputValue.trim()
  router.replace(q ? `/search?q=${encodeURIComponent(q)}` : '/search', { scroll: false })
}
```

**On mount**: if URL has `?q=`, initialize `inputValue` from it AND trigger initial fetch.

### States

| Condition | UI |
|-----------|-----|
| `inputValue.length < 2` | Landing: "Search across prompts, products, and articles." |
| `loading === true` | Subtle loading indicator (spinner or pulse) |
| `results` with all arrays empty | "No results for `{query}`." |
| `results.prompts.length > 0` | Prompts section with count |
| `results.products.length > 0` | Products section with count |
| `results.blogs.length > 0` | Blogs section with count |

Empty sections are skipped entirely — no "0 Prompts" heading rendered.

### Result Row Design (inline component functions)

Each row: `<a href={externalLink} target="_blank">` wrapping:
- `w-16 h-16 shrink-0 rounded-lg overflow-hidden` thumbnail (`object-cover`)
- Category badge (`type-mono-technical text-xs text-[var(--color-on-surface-variant)]`)
- Title (primary, `line-clamp-1`, `type-body-md font-medium text-[var(--color-primary)]`)
- Description/excerpt (`line-clamp-1`, `type-mono-technical text-[var(--color-on-surface-variant)]`)
- `arrow_forward` Material Symbol icon on right

Container per row: `glass-card rounded-xl flex items-center gap-5 p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-300`.

Results list: `flex flex-col gap-2` inside each section.

### Section structure
```tsx
{results.prompts.length > 0 && (
  <section data-testid="section-prompts">
    <div className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs mb-6 pb-4 border-b border-white/10 flex justify-between">
      <span>Prompts</span>
      <span className="opacity-60">{results.prompts.length}</span>
    </div>
    <div className="flex flex-col gap-2">
      {results.prompts.map(p => <PromptResultRow key={p.id} prompt={p} />)}
    </div>
  </section>
)}
```

### Page layout
```
<main pt-[160px] pb-32 ...>  ← identical padding to other pages
  <header>
    <span type-label-caps>Search</span>
    <h1 type-display-mobile md:type-display-lg>Find anything.</h1>
  </header>

  <form onSubmit={handleSubmit} className="mb-16">
    <div glass-card rounded-xl flex items-center px-6 py-4 gap-4>
      <span material-symbols-outlined search />
      <input data-testid="search-input" autoFocus type="search" ... className="flex-1 bg-transparent outline-none type-body-lg text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)]" />
    </div>
  </form>

  <div className="flex flex-col gap-16">
    {landing | loading | no-results | sections}
  </div>
</main>
```

---

## Implementation: Navbar Modification

Current desktop: `[Logo] [Nav links.hidden.md:flex] [Instagram CTA.hidden.md:block]`
Modified desktop: `[Logo] [Nav links.hidden.md:flex] [Search icon.hidden.md:inline-flex] [Instagram CTA.hidden.md:block]`

Current mobile header: `[Logo] [Hamburger button.md:hidden]`
Modified mobile header: `[Logo] [flex div.md:hidden containing: Search icon | Hamburger]`

```tsx
// Desktop — add after </nav>, before Instagram CTA:
<Link
  href="/search"
  aria-label="Search"
  className={['hidden md:inline-flex items-center p-2 transition-colors duration-300',
    pathname === '/search'
      ? 'text-[var(--color-primary)]'
      : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]'
  ].join(' ')}
>
  <span className="material-symbols-outlined text-[22px]">search</span>
</Link>

// Mobile — replace standalone hamburger button with:
<div className="md:hidden flex items-center gap-1">
  <Link href="/search" aria-label="Search"
    className={pathname === '/search' ? 'text-[var(--color-primary)] p-2' : 'text-[var(--color-on-surface-variant)] p-2'}>
    <span className="material-symbols-outlined">search</span>
  </Link>
  <button onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={mobileOpen} className="text-[var(--color-primary)] p-2">
    <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
  </button>
</div>
```

Also add `/search` link to mobile menu dropdown (same `Link` pattern as other nav links).

---

## Playwright Config (`playwright.config.ts`)

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'line',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

---

## Test Cases (`e2e/search.spec.ts`)

```
- search icon visible in desktop navbar
- search icon visible in mobile header  
- clicking search icon navigates to /search
- input is auto-focused on page load
- no-query state (< 2 chars) shows landing hint
- typing 2+ chars triggers results fetch
- prompts section visible (data-testid="section-prompts") when matches exist
- products section visible (data-testid="section-products") when matches exist
- blogs section visible (data-testid="section-blogs") when matches exist
- section absent when no matches in that content type
- zero total results shows no-results message
- pressing Enter updates URL ?q= param
- loading /search?q=<term> pre-fills input and shows results
- clearing input (< 2 chars) returns to landing state
```

`data-testid` attributes: `search-input`, `section-prompts`, `section-products`, `section-blogs`, `search-no-results`, `search-landing`.

---

## Implementation Order

1. **Create `src/app/api/search/route.ts`** — isolated, testable endpoint with no UI dependencies
2. **Create `src/app/search/page.tsx`** — minimal wrapper with Suspense, no SearchClient yet
3. **Create `src/app/search/SearchClient.tsx`** — wire input + fetch + result rows + all states
4. **Modify `Navbar.tsx`** — add search icon. Last because it touches shared component
5. **Create `playwright.config.ts` + `e2e/search.spec.ts`** — run tests
6. **Update `.claude/analysis/` files** — session notes, lessons, architecture decisions

---

## Verification

```bash
npx playwright test e2e/search.spec.ts --reporter=line
```

Manual checks:
- Glassmorphism style matches other pages
- Search icon active on `/search`, inactive elsewhere
- Mobile: search icon + hamburger coexist cleanly
- Searching a real keyword from Google Sheets data returns results
- Empty state renders for nonsense query
- URL updates to `?q=term` on Enter
- Direct nav to `/search?q=term` pre-fills and shows results
