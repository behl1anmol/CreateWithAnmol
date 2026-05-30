# Plan: Fix Featured Blog/Product Grid Exclusion Bug

## Root Cause

`BlogsClient.tsx` and `ProductsClient.tsx` both use `featured: boolean` flag to split data into hero + grid. Bug: when multiple items have `featured: true`, the grid filter `!b.featured` excludes ALL of them — only the first one renders as hero, the rest disappear entirely.

**API confirms:** both blogs have `featured: true`. Order-1 → hero slot. Order-2 → excluded from grid because `!b.featured === false`. Never renders.

**Same bug in `ProductsClient.tsx`:** identical logic, same failure mode if multiple products are marked `featured: true`.

## Fix

Replace `!b.featured` / `!p.featured` with `b.id !== featured?.id` / `p.id !== featured?.id`.

Logic: exclude only the specific item currently occupying the hero slot (matched by ID), not all items where `featured: true`.

---

## Files to Change

### 1. `src/app/blogs/BlogsClient.tsx`

**Current (line ~108):**
```typescript
const gridItems = activeCategory === 'All'
    ? initialData.filter(b => !b.featured)
    : initialData.filter(b => b.category === activeCategory && !b.featured)
```

**Fix:**
```typescript
const gridItems = activeCategory === 'All'
    ? initialData.filter(b => b.id !== featured?.id)
    : initialData.filter(b => b.category === activeCategory && b.id !== featured?.id)
```

Also fix `featuredFiltered` category filter — currently skips showing featured if category doesn't match but DOES include in grid. After fix, if category filter is active and the featured blog isn't in that category, it correctly falls out of featured AND shows in grid:

```typescript
const featuredFiltered = activeCategory === 'All'
    ? featured
    : (featured?.category === activeCategory ? featured : undefined)
```

When `featuredFiltered` is undefined (category doesn't include featured blog), the same featured blog should appear in `gridItems`. So grid filter should exclude only the blog shown as hero:

```typescript
const gridItems = activeCategory === 'All'
    ? initialData.filter(b => b.id !== featured?.id)
    : initialData.filter(b => b.category === activeCategory && b.id !== (featuredFiltered?.id))
```

Wait — on category filter: if featured blog is NOT in selected category, it shouldn't be in hero OR grid for that category. The existing `featuredFiltered` logic handles that correctly. Grid just needs to not show `featuredFiltered` specifically.

**Simplest correct fix:**
```typescript
const featuredFiltered = activeCategory === 'All'
    ? featured
    : (featured?.category === activeCategory ? featured : undefined)

const gridItems = activeCategory === 'All'
    ? initialData.filter(b => b.id !== featured?.id)
    : initialData.filter(b => b.category === activeCategory && b.id !== featuredFiltered?.id)
```

For "All" category: grid = all items except the hero. For specific category: grid = items in category except the hero (if hero is in that category).

### 2. `src/app/products/ProductsClient.tsx`

**Current (line ~140):**
```typescript
const allFiltered = activeCategory === 'All'
    ? initialData.filter(p => !p.featured)
    : initialData.filter(p => p.category === activeCategory && !p.featured)
```

**Fix:**
```typescript
const allFiltered = activeCategory === 'All'
    ? initialData.filter(p => p.id !== featured?.id)
    : initialData.filter(p => p.category === activeCategory && p.id !== featuredFiltered?.id)
```

---

## Files NOT Changed
- `PromptsClient.tsx` — no featured hero slot, grid shows all, no issue
- `normalize.ts`, `types.ts`, API layer — unchanged
- `about/page.tsx`, `page.tsx` — unchanged

---

## Post-Implementation
- Update `.claude/analysis/debugging-log.md`
- Update `.claude/analysis/implementation-notes.md`
