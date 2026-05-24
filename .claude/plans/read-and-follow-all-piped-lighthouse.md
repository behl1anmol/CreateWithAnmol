# Implementation Plan — Create with Anmol (Phase 1 Frontend)

## Context

Greenfield Next.js implementation. Empty `src/` directory, no `package.json`. Task is Phase 1 (frontend-only, static data — no CMS/backend integration yet).

Primary visual reference: Stitch project "Anmol AI Creator Portfolio" (`projects/4801571294272020461`), confirmed live via Stitch MCP.

---

## Screen → Route Mapping

| Stitch Screen | Route | Next.js Page |
|---|---|---|
| Cinematic Depth Refinement (home full) | `/` | `app/page.tsx` |
| Prompt Library | `/prompts` | `app/prompts/page.tsx` |
| Products | `/products` | `app/products/page.tsx` |
| Technical Writing | `/blogs` | `app/blogs/page.tsx` |
| About | `/about` | `app/about/page.tsx` |

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, body bg, LiquidLight orb
│   ├── globals.css             # Tailwind base + .glass-card, .text-gradient, .liquid-light utilities
│   ├── page.tsx                # Home: Hero + Featured Products/Blogs/Prompts
│   ├── prompts/
│   │   └── page.tsx            # Prompt Library: grid of PromptCards
│   ├── products/
│   │   └── page.tsx            # Products: hero + grid of ProductCards
│   ├── blogs/
│   │   └── page.tsx            # Technical Writing: featured article + BlogCard grid
│   └── about/
│       └── page.tsx            # About: editorial split layout
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Fixed nav, mobile hamburger
│   │   └── Footer.tsx          # Logo + links + copyright
│   ├── ui/
│   │   ├── SectionHeader.tsx   # Section label + "View All" link pattern
│   │   └── HorizontalScroll.tsx # snap-x scroll container
│   └── content/
│       ├── PromptCard.tsx      # Glass card: image + title + desc + Watch Reel / Get Full Prompt
│       ├── ProductCard.tsx     # Glass card: image + title + desc + View Product
│       └── BlogCard.tsx        # Glass card: image + title + desc + Read Article
├── lib/
│   ├── types.ts                # Prompt, Product, Blog, FeaturedItem interfaces
│   └── data/
│       ├── prompts.ts          # Static mock data, Phase 1
│       ├── products.ts
│       └── blogs.ts
public/
tailwind.config.ts
next.config.ts
```

---

## Design System Implementation (Tailwind v4 — CSS @theme)

**No `tailwind.config.ts`.** All tokens defined in `globals.css` via `@theme {}`.

Setup:
```bash
pnpm add tailwindcss @tailwindcss/postcss
```
`postcss.config.mjs`:
```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

`globals.css` structure:
```css
@import "tailwindcss";

@theme {
  /* ── Colors ── */
  --color-surface: #131313;
  --color-surface-dim: #131313;
  --color-surface-bright: #393939;
  --color-surface-container-lowest: #0e0e0e;
  --color-surface-container-low: #1c1b1b;
  --color-surface-container: #20201f;
  --color-surface-container-high: #2a2a2a;
  --color-surface-container-highest: #353535;
  --color-on-surface: #e5e2e1;
  --color-on-surface-variant: #c4c7c8;
  --color-outline: #8e9192;
  --color-outline-variant: #444748;
  --color-primary: #ffffff;
  --color-on-primary: #2f3131;
  --color-primary-container: #e2e2e2;
  --color-on-primary-container: #636565;
  --color-secondary: #c6c6c6;
  --color-on-secondary: #2f3131;
  --color-secondary-container: #484949;
  --color-on-secondary-container: #b8b8b8;
  --color-background: #131313;
  --color-on-background: #e5e2e1;
  --color-surface-variant: #353535;
  --color-inverse-surface: #e5e2e1;
  --color-inverse-on-surface: #313030;
  --color-surface-tint: #c6c6c7;

  /* ── Fonts ── */
  --font-display: 'Hanken Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-label: 'Geist', monospace;

  /* ── Type Scale ── */
  --text-display-lg: 72px;
  --text-display-lg--line-height: 1.1;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 600;

  --text-display-mobile: 40px;
  --text-display-mobile--line-height: 1.2;
  --text-display-mobile--letter-spacing: -0.01em;
  --text-display-mobile--font-weight: 600;

  --text-headline-md: 32px;
  --text-headline-md--line-height: 1.3;
  --text-headline-md--letter-spacing: 0.02em;
  --text-headline-md--font-weight: 500;

  --text-body-lg: 18px;
  --text-body-lg--line-height: 1.6;
  --text-body-lg--letter-spacing: 0.01em;

  --text-body-md: 16px;
  --text-body-md--line-height: 1.6;
  --text-body-md--letter-spacing: 0.01em;

  --text-label-caps: 12px;
  --text-label-caps--line-height: 1.0;
  --text-label-caps--letter-spacing: 0.1em;
  --text-label-caps--font-weight: 600;

  --text-mono-technical: 13px;
  --text-mono-technical--line-height: 1.5;
  --text-mono-technical--letter-spacing: 0em;

  /* ── Border Radius ── */
  --radius-sm: 0.125rem;     /* 2px */
  --radius: 0.25rem;         /* 4px — DEFAULT, sharp architectural */
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;       /* 8px */
  --radius-xl: 0.75rem;      /* 12px */
  --radius-3xl: 1.5rem;      /* 24px — glass cards */
  --radius-full: 9999px;

  /* ── Spacing ── */
  --spacing-unit: 8px;
  --spacing-gutter: 24px;
  --spacing-margin-mobile: 20px;
  --spacing-margin-desktop: 64px;
  --spacing-container-max: 1440px;
}
```

**Note on Stitch class names:** Stitch uses `font-display-lg`, `text-display-lg` etc. In v4, font-family utilities map to `--font-*` vars (`font-display`, `font-body`, `font-label`). Apply font-family and size separately, OR use `@utility` in globals.css to create shorthand classes matching the Stitch naming.

Alternative: define `@layer utilities` shorthand classes for the semantic type pairings:
```css
@layer utilities {
  .type-display-lg {
    font-family: var(--font-display);
    font-size: var(--text-display-lg);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  /* etc. */
}
```

---

## Global CSS Utilities (globals.css)

```css
body {
  background-color: #121212;
  background-image: [SVG noise at 2% opacity]; /* fixed attachment */
  color: #e5e2e1;
}

.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-top: 1px solid rgba(255,255,255,0.15);  /* inner glow simulation */
  border-left: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-nav {
  background: rgba(19,19,19,0.6);
  backdrop-filter: blur(20px);
}

.text-gradient {
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.liquid-light {
  position: fixed;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}
```

---

## Component Specs

### Navbar
- `fixed top-0 w-full z-50 glass-nav border-b border-white/10`
- Height: `h-20` (80px)
- Left: brand "Create with Anmol" — `font-headline-md text-headline-md tracking-tight text-primary`
- Center/right desktop: nav links (Prompts, Products, Blogs, About) — `font-body-md text-on-surface-variant hover:text-primary`
- Active state: `text-primary border-b border-primary`
- Desktop CTA: `bg-primary text-on-primary px-6 py-2 rounded` (label-caps)
- Mobile: hamburger `material-symbols-outlined` menu icon, drawer state via `useState`
- Use `next/navigation` `usePathname()` for active detection

### Footer
- `bg-surface-container-lowest border-t border-white/5 py-16`
- Layout: `flex flex-col md:flex-row justify-between items-center`
- Links: Instagram, Gumroad, Medium, Privacy — `font-mono-technical uppercase tracking-widest`
- Copyright right-aligned

### SectionHeader
```tsx
interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}
```
- Bottom border: `border-b border-white/10 pb-4 mb-12`
- Title: `font-headline-md text-headline-md text-primary`
- "View All" link: `font-body-md text-secondary hover:text-primary` + arrow icon

### PromptCard
```tsx
interface Prompt {
  id: string; title: string; description: string; image: string;
  category?: string; reelLink?: string; promptLink: string; featured?: boolean;
}
```
- `glass-card rounded-3xl overflow-hidden flex flex-col group`
- Image: `h-64 object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700`
- Gradient overlay: `absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60`
- Body: `p-6 flex flex-col gap-4 flex-grow`
- Footer buttons: ghost "Watch Reel" + fill "Get Full Prompt"
- Size: `w-[85vw] md:w-[400px]` (horizontal scroll) OR `w-full` (grid)

### ProductCard
- Same shell, single "View Product" fill button
- Links to `productLink` (Gumroad)

### BlogCard
- Same shell, single "Read Article" ghost button
- `grayscale group-hover:grayscale-0 transition-all duration-500` on image (Blogs page grid only)

---

## Page Layouts

### Home (`/`)
```
<main pt-32 pb-32>
  [AmbientLighting: 2× radial orbs, absolute, z-0]
  
  [Hero] centered, min-h-[716px], mb-40
    h1: display-lg text-gradient "Create with Anmol"
    p:  body-lg on-surface-variant, max-w-2xl
    button: "Explore Prompts" → /prompts
  
  [Section: Gumroad Products] mb-40
    <SectionHeader title="Gumroad Products" viewAllHref="/products" />
    <HorizontalScroll> [ProductCard × 3] </HorizontalScroll>
  
  [Section: Medium Blogs] mb-40
    <SectionHeader title="Medium Blogs" viewAllHref="/blogs" />
    <HorizontalScroll> [BlogCard × 3] </HorizontalScroll>
  
  [Section: Instagram Prompts] mb-40
    <SectionHeader title="Instagram Prompts" viewAllHref="/prompts" />
    <HorizontalScroll> [PromptCard × 3] </HorizontalScroll>
</main>
```

### Prompts (`/prompts`)
```
<main pt-32 pb-24>
  [Hero] max-w-3xl, mb-24
    h1: "Prompt Library"
    p: subtitle
  
  [Grid] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter
    [PromptCard × N]
</main>
```

### Products (`/products`)
```
<main pt-24 pb-24>
  [Hero] flex items-end justify-between, border-b border-white/5, py-24 md:py-32
    h1: "Creator Products"
    p: subtitle
  
  [Grid] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pt-16
    [ProductCard × N]
</main>
```

### Blogs (`/blogs`)
```
<main pt-32 pb-24>
  [Hero] max-w-3xl, mb-24
    h1: "Technical Writing"
    p: subtitle
  
  [Featured Article] mb-40
    glass-card rounded-xl flex flex-col md:flex-row
    Left (md:w-3/5): image h-[500px], grayscale hover effect
    Right (md:w-2/5): category tag, title (headline-md), excerpt, "Read Article →"
  
  [Section: Latest Publications] border-b mb-12
  [Grid] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-gutter gap-y-16
    [BlogCard × N] with grayscale→color hover
</main>
```

### About (`/about`)
```
<main pt-40 pb-40 flex flex-col gap-40>
  [Hero] max-w-4xl
    h1: "About Anmol" (display-lg)
    p: editorial tagline
  
  [Editorial Split] grid-cols-1 md:grid-cols-12
    col-span-5: creator portrait, glass-panel, aspect-[3/4]
    col-span-6: story sections with label-caps headers + body-md text
  
  [Platform Links] — Instagram, Gumroad, Medium links with icons
  
  [Philosophy / Vision section]
</main>
```

---

## Static Mock Data (Phase 1)

`lib/data/prompts.ts`, `products.ts`, `blogs.ts` — hardcode 4-6 realistic items per content type. Use placeholder images from Cloudinary or public domain. Mark 2-3 items `featured: true` for home page.

---

## Next.js + Cloudflare Config

**next.config.ts:**
```ts
const nextConfig = {
  output: 'export',           // Static export for Cloudflare Pages
  images: {
    unoptimized: true,        // Required with output: 'export'
    remotePatterns: [{ hostname: 'res.cloudinary.com' }],
  },
}
```

**Fonts (app/layout.tsx):**
```ts
import { Hanken_Grotesk, Inter, Geist } from 'next/font/google'
// Load with display: 'swap', subset: 'latin'
// Apply CSS variables: --font-hanken, --font-inter, --font-geist
```

**Material Symbols:** Load via `<link>` in `layout.tsx` `<head>` (or via `next/script` with `strategy="lazyOnload"`).

---

## Implementation Risks

1. **Tailwind v4 @theme token naming** — Stitch outputs v3-format class names (e.g., `font-display-lg`, `text-display-lg`). In v4, use `--font-*` and `--text-*` CSS vars. Add `@layer utilities` shorthand classes in globals.css to replicate Stitch class names, keeping components clean.
2. **`backdrop-filter` performance** — Use sparingly. Navbar + glass cards only. Avoid stacking blur layers.
3. **`output: export` + dynamic routes** — No dynamic segments in Phase 1, so no issue.
4. **Nav labels mismatch** — Stitch inner pages have "Gallery/Studio/Assets/Archive" (placeholder). Use home-screen nav: Prompts, Products, Blogs, About.
5. **Material Symbols font** — External Google Fonts dependency. Load lazily to avoid render-blocking.
6. **`rounded-3xl`** — Defined in `@theme` as `--radius-3xl: 1.5rem`. Works natively in v4.

---

## Implementation Sequence

1. `pnpm create next-app@latest` (TypeScript, App Router — **skip** built-in Tailwind option, install v4 manually)
2. `pnpm add tailwindcss @tailwindcss/postcss` — Tailwind v4
3. Configure `postcss.config.mjs` with `@tailwindcss/postcss`
4. `globals.css` — `@import "tailwindcss"` + full `@theme {}` block (all Stitch tokens)
4. `app/layout.tsx` — fonts, body, Navbar, Footer, LiquidLight
5. `components/layout/Navbar.tsx` + `Footer.tsx`
6. `lib/types.ts` + `lib/data/*.ts` (mock data)
7. `components/content/PromptCard.tsx`, `ProductCard.tsx`, `BlogCard.tsx`
8. `components/ui/SectionHeader.tsx`, `HorizontalScroll.tsx`
9. `app/page.tsx` — Home
10. `app/prompts/page.tsx`
11. `app/products/page.tsx`
12. `app/blogs/page.tsx`
13. `app/about/page.tsx`
14. Responsive QA (mobile-first check at 375px, 768px, 1280px, 1440px)

---

## Verification

- Run `pnpm dev`, open browser at localhost:3000
- Check all 5 routes render without errors
- Verify glass card effect (backdrop blur visible)
- Verify noise texture (subtle grain on dark background)
- Verify font loading (Hanken Grotesk headlines, Inter body, Geist labels)
- Verify horizontal scroll snap on home page (mobile viewport)
- Verify `pnpm build` produces static export in `/out`
- Inspect `/out` for presence of all routes as HTML files
