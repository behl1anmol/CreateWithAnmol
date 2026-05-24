# Plan: /prompts Page — Stitch Parity Implementation

## Context

`/prompts/page.tsx` is a 14-line stub (hero title + subtitle only). The Stitch design is a full editorial page with category filter pills, a 3-column prompt card grid, per-card image/badge/CTA. Current implementation has ~5% parity. Task: bring it to full structural parity.

---

## Gap Analysis (Current vs Stitch)

| Element | Current | Stitch |
|---|---|---|
| Hero section | ✅ (partial — wrong padding, wrong subtitle) | `pt-[160px]`, left desktop / center mobile |
| Filter pill row | ❌ missing | 6 pills, scrollable mobile, active state |
| Prompt grid | ❌ missing | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Prompt cards | ❌ missing | image + badge + title + desc + footer CTA |
| `pill-filter` CSS | ❌ not in globals.css | custom class needed |
| Prompt data | ❌ only 2 items, missing fields | need 6 items w/ category + tool |

---

## Implementation Plan

### Step 1 — Add `pill-filter` CSS to `src/app/globals.css`

Append after `.glass-card-hover` block:

```css
.pill-filter {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
.pill-filter:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.pill-filter.active {
  background: #ffffff;
  color: #121212;
  border-color: #ffffff;
}
```

### Step 2 — Add `Prompt` type to `src/lib/types.ts`

```ts
export interface Prompt {
  id: string
  title: string
  description: string
  category: string
  tool: string
  image: string
  promptLink: string
}
```

### Step 3 — Add 6 prompts to `src/lib/data/mockData.ts`

Export `PROMPTS: Prompt[]` with these 6 entries (using Stitch images + existing mockData images):

| # | Title | Category | Tool | Image |
|---|---|---|---|---|
| 1 | Liquid Chrome Geometry | AI Visuals | Midjourney v6 | Stitch img 1 |
| 2 | Neon Noir Terminals | Cinematic Prompts | Stable Diffusion | Stitch img 2 |
| 3 | Frosted Glass Interfaces | UI Design | DALL-E 3 | Stitch img 3 |
| 4 | Cinematic Midjourney Masters | Cinematic Prompts | Midjourney v6 | existing mockData img 1 |
| 5 | Hyper-Real Lighting Prompts | AI Visuals | Midjourney v6 | existing mockData img 2 |
| 6 | Workflow Automation Chains | Workflow Prompts | ChatGPT-4o | Stitch img 1 (reuse) |

Categories covered: AI Visuals, UI Design, Cinematic Prompts, Workflow Prompts — maps to all 6 pills.

### Step 4 — Rewrite `src/app/prompts/page.tsx`

Add `"use client"` (needed for `useState` active pill). Structure:

```
PromptsPage
├── <main> pt-[160px] pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto
│   ├── <header> Hero — mb-16 md:mb-24, text-center md:text-left, max-w-3xl
│   │   ├── <h1> type-display-mobile md:type-display-lg text-gradient tracking-tight
│   │   └── <p>  type-body-lg text-on-surface-variant max-w-2xl
│   ├── Filter Row — flex flex-wrap gap-3 mb-16, overflow-x-auto scrollbar-hide
│   │   └── 6× <button> pill-filter type-label-caps px-5 py-2.5 rounded-full
│   └── Grid — grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]
│       └── 6× PromptCard (inline in page, no new file)
│           ├── Image block — h-48 md:h-64, object-cover, group-hover:scale-105 duration-700
│           │   └── Category badge — absolute top-4 left-4, glass pill, type-label-caps
│           └── Content block — p-6 flex flex-col flex-grow
│               ├── <h3> text-xl md:text-2xl tracking-tight text-primary
│               ├── <p>  type-body-md text-on-surface-variant line-clamp-2 flex-grow
│               └── Footer row — border-t border-white/10 flex justify-between
│                   ├── Tool name — type-mono-technical text-on-surface-variant
│                   └── "Get Prompt →" — type-label-caps text-primary, group-hover:translate-x-1
```

**Filtering logic:** `useState<string>('All')` — filter pills set active category. Grid filters `PROMPTS.filter(p => active === 'All' || p.category === active)`.

**Card wrapper:** `glass-card glass-card-hover rounded-xl group flex flex-col cursor-pointer` — reuses existing CSS utilities.

**Category badge:** `bg-[rgba(19,19,19,0.8)] backdrop-blur-md px-3 py-1 rounded border border-white/10 type-label-caps text-[10px]`

**Next.js `<Image>` vs `<img>`:** Use `<img>` (not `next/image`) because all image URLs are external CDN and the site is static export — same pattern used in `mockData.ts` existing images.

---

## Files Modified

- `src/app/globals.css` — add `pill-filter` CSS block
- `src/lib/types.ts` — add `Prompt` interface (or add inline to mockData if types.ts doesn't exist yet)
- `src/lib/data/mockData.ts` — add `PROMPTS` export (6 items)
- `src/app/prompts/page.tsx` — full rewrite with all UI systems

No new files created.

---

## Verification

1. `npm run build` — confirm zero TypeScript errors, static export succeeds
2. Run Playwright screenshot at 1440px + 390px — confirm grid, pills, cards all render
3. Click filter pills — verify grid filters correctly by category
4. Compare against Stitch screenshot: `https://lh3.googleusercontent.com/aida/ADBb0ujKCVxhHtxcGmb-DDUWq70hn8BvZ85xkDzyiZLWxzDnp2Mhd5otRc9JgbPK43HWTA_2vlKsO1hg5_dfYhvk5gpFh1heVdv4tV6J_UUEgTo0U88mxIeDbWVF2PjuWFlCmZCnzFeDejnwK9YRqI2P-D1bUYevEubpkM4WUkxiVwxlMEY8Xqf6IK49cy2GUVaNQueRUK8Xp5c9VOVIcesEBDBtacHP2IESBfI_iUh8-s339q7RrxgpSm0JzeM`
5. Update `analysis/session-handoff.md` with prompts page complete status
