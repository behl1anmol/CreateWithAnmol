# Plan: Fix B&W Images — Restore Original Color

## Context

Images on homepage (Products, Blogs, Prompts sections) and Blogs page display in black-and-white. Root cause is two distinct CSS techniques applied to `<img>` elements that strip color information:

1. **`mix-blend-luminosity`** — Composites only the luminosity (brightness) channel of the image against the dark `#121212` card background. Since there is no color in a pure-dark background, the result is grayscale.
2. **`grayscale`** Tailwind filter — Explicitly desaturates to black-and-white.

These were likely applied as an intentional "editorial dark aesthetic" design choice, but the user wants full-color images.

---

## Root Cause — Exact Locations

### File 1: `src/app/page.tsx`

| Line | Section | Offending class(es) |
|------|---------|---------------------|
| 57 | Featured Products carousel card | `mix-blend-luminosity` |
| 102 | Featured Blogs carousel card | `mix-blend-luminosity` |
| 147 | Instagram Prompts carousel card | `mix-blend-luminosity` |

All three use identical className pattern:
```
opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity
```

### File 2: `src/app/blogs/BlogsClient.tsx`

| Line | Component | Offending class(es) |
|------|-----------|---------------------|
| 21 | `FeaturedBlogCard` | `mix-blend-luminosity group-hover:mix-blend-normal` |
| 73 | `BlogCard` (grid) | `grayscale group-hover:grayscale-0` |

---

## Fix

Remove only the desaturation-causing classes. Preserve all other visual effects (opacity transitions, scale hover, object-cover).

### `src/app/page.tsx` — 3 changes (lines 57, 102, 147)

**Before** (same pattern, 3× repeated):
```
className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity"
```

**After**:
```
className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
```

### `src/app/blogs/BlogsClient.tsx` — 2 changes

**FeaturedBlogCard (line 21) — Before:**
```
className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal"
```
**After:**
```
className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80"
```

**BlogCard (line 73) — Before:**
```
className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100"
```
**After:**
```
className="w-full h-full object-cover transition-all duration-500 opacity-70 group-hover:opacity-100"
```

---

## Why This Is Safe

- No data, logic, or API changes — purely CSS class removal
- Gradient overlays (`bg-gradient-to-t from-[#1a1a1a]/80`) still provide depth/readability
- Hover interactions (scale, opacity) preserved unchanged
- No other components affected — checked `ProductsClient.tsx` and `PromptsClient.tsx`, neither has grayscale/luminosity filters

---

## Verification (Playwright CLI)

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000` — screenshot Products, Blogs, Prompts carousels; confirm color images
3. Navigate to `http://localhost:3000/blogs` — screenshot FeaturedBlogCard and BlogCard grid; confirm color images
4. Hover state check: opacity/scale transitions still functional

---

## Post-Implementation

Update:
- `.claude/analysis/session-handoff.md` — note fix applied
- `.claude/analysis/lessons-learned.md` — document `mix-blend-luminosity` + dark bg = grayscale pattern
