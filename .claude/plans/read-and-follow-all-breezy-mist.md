# Plan: /blogs Page — Full Stitch Parity Implementation

## Context

`/blogs` page is a 14-line stub (hero only). Stitch "Technical Writing" screen (`7865d1ecf02a4efe9a6ce0c07d0584a5`) shows a complete editorial layout with featured article + article grid. The current implementation is missing all content beyond the `<h1>`.

Reference: `.claude/stitch-design/create_with_anmol_technical_writing/code.html` (local, confirmed correct).

---

## Stitch Design Analysis

**Sections (top → bottom):**
1. Hero — H1 + subtitle paragraph, `mb-24 md:mb-[160px] max-w-3xl`
2. Category pills — user-required, additive to Stitch (same pattern as Products page)
3. Featured Article — horizontal split card, `mb-24 md:mb-[200px]`
4. "Latest Publications" grid — 3-col, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-gutter gap-y-16`
5. Bottom CTA — user-required (same structural pattern as Products page)

**Featured card structure:**
- `glass-card rounded-xl overflow-hidden flex flex-col md:flex-row`
- Image: `md:w-3/5 h-64 md:h-[500px]` with `mix-blend-luminosity group-hover:mix-blend-normal opacity-80` hover
- Content: `md:w-2/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10`
- Meta: category (uppercase mono-technical) + dot separator + date
- Title: `type-headline-md`, excerpt: `line-clamp-4`
- CTA: `inline-flex` underline style — "Read Article →" (NOT a button)

**Grid card structure (key distinction from Products):**
- `<article class="group cursor-pointer">` — no glass-card on outer wrapper
- Image container: `aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-lowest glass-card`
- Image effect: `grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100` (cinematic hover)
- Meta: category + dot + date (mono-technical)
- Title: `font-headline-md text-body-lg` (headline font family, body-lg size)
- Excerpt: `line-clamp-2`
- No explicit CTA link on grid cards (article is whole-card clickable)

**Grid section header:**
- `flex justify-between items-end mb-12 border-b border-white/10 pb-6`
- Label: `font-mono-technical text-mono-technical uppercase tracking-widest text-on-surface-variant` → "Latest Publications"

---

## Files to Modify

### 1. `src/lib/types.ts`
Add `date?: string` to `Blog` interface (additive, optional, needed for Stitch date display).

### 2. `src/lib/data/mockData.ts`
Add `export const BLOGS: Blog[]` — 6 items total:
- 1 featured (Architecture, uses Stitch image URL for featured article)
- 5 grid items (Infrastructure, Engineering, Design, Workflow, Philosophy)
- Use Stitch-provided image URLs for first 3; reuse existing aida-public URLs for remainder
- Include `articleLink: 'https://medium.com/@createwithanmol'` on all items

Blog items mirror Stitch content:
| # | title | category | date | featured |
|---|-------|----------|------|---------|
| 1 | Designing the Liquid Glass Rendering Engine | Architecture | Oct 12, 2024 | true |
| 2 | Scaling Distributed AI Workloads | Infrastructure | Sep 28, 2024 | — |
| 3 | Type-Safe Prompt Injection | Engineering | Sep 15, 2024 | — |
| 4 | Typography in the Age of AI | Design | Aug 30, 2024 | — |
| 5 | Workflow Automation for AI Creators | Workflow | Aug 12, 2024 | — |
| 6 | The Editorial Philosophy of Cinematic AI | Philosophy | Jul 28, 2024 | — |

### 3. `src/app/blogs/page.tsx`
Full rewrite. Structure:

```
'use client'

CATEGORIES = ['All', 'Architecture', 'Infrastructure', 'Engineering', 'Design', 'Workflow', 'Philosophy']

FeaturedBlogCard({ blog }) → horizontal split glass-card with mix-blend hover
BlogCard({ blog }) → <article> with grayscale image, meta, title, excerpt

export default BlogsPage():
  useState(activeCategory)
  derived: featured (featured=true + category match)
  derived: gridItems (non-featured + category match)

  return <main pt-[160px] pb-32 ...>
    <header> Hero </header>
    <div> Category pills </div>
    {featured && <section> FeaturedBlogCard </section>}
    {gridItems.length > 0 && <section> "Latest Publications" + grid </section>}
    {empty state}
    <div> Bottom CTA </div>
  </main>
```

**Category pill logic:**
- Same as Products: `useState('All')`, `pill-filter` + `pill-filter.active` classes
- `activeCategory === 'All'` → show featured + all grid
- Specific category → show matching featured as hero (if featured.category matches), all matching in grid

**Bottom CTA:**
- "Read more on Medium?" → link to `https://medium.com/@createwithanmol`
- Same structure as Products bottom CTA

---

## Design Fidelity Notes

- Spacing: hero `mb-24 md:mb-[160px]`, featured `mb-24 md:mb-[200px]` — preserve exactly
- Featured image: `mix-blend-luminosity` becomes `mix-blend-normal` on hover
- Grid images: grayscale → color on hover (cinematic Stitch signature effect)
- Grid title: `font-headline-md text-body-lg` — keep this two-token combo from Stitch
- All text uses existing CSS var `--color-primary`, `--color-on-surface-variant`, etc.
- `glass-card-hover` class NOT used on grid articles (just `cursor-pointer`)

---

## Existing Utilities to Reuse

- `glass-card`, `glass-card-hover` — `globals.css`
- `pill-filter`, `pill-filter.active` — `globals.css`
- `.type-display-mobile`, `.type-body-lg`, etc. — `globals.css`
- Spacing vars: `--spacing-margin-mobile`, `--spacing-margin-desktop`, `--spacing-container-max`, `--spacing-gutter`
- Color vars: `--color-primary`, `--color-on-surface-variant`, `--color-on-surface`
- Material Symbols: `arrow_forward` icon in featured CTA

---

## Verification

1. `npm run build` — zero TypeScript errors, all 6 static routes in `/out`
2. Playwright screenshot at 1440px desktop — compare hero + featured + grid against Stitch
3. Playwright screenshot at 390px mobile — verify stacked layout, full-width image
4. Update `.claude/analysis/session-handoff.md` — mark `/blogs` complete
