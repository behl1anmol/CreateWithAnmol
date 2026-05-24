# Plan: /about Page — Stitch Parity Implementation

## Context
The /about page is the last unimplemented page (stub: heading + 1 paragraph). All other pages (Home, Prompts, Products, Blogs) are Stitch-parity complete. The Stitch About screen (`c14cb04f1dbc4e5f982fe5aa8119483c`) is 4162px tall on 2560px desktop — a full editorial layout. The current implementation is ~5 lines of JSX.

## Only file to modify
`src/app/about/page.tsx` — complete rewrite. No new files, no new imports from mockData.

## Implementation (caveman-builder, single file)

### Page shell
```
static server component (no 'use client')
<main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">
```

### Ambient orbs (above all sections, aria-hidden)
```jsx
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
  <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
  <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] mix-blend-screen" />
</div>
```

### Section 1: Hero (split editorial)
- `flex flex-col md:flex-row gap-12 md:gap-16 items-center mb-32 md:mb-40 relative z-10`
- Left (`md:w-1/2`): eyebrow pill + `type-display-mobile md:type-display-lg text-gradient` headline "Architecting digital realities" + `type-body-lg` subtext + pill-filter CTA → Instagram
- Right (`md:w-1/2`): `glass-panel rounded-2xl overflow-hidden h-[360px] md:h-[480px]` + `<img>` with `object-cover w-full h-full` + gradient overlay
- Portrait image URL: `https://lh3.googleusercontent.com/aida-public/AB6AXuD26TLTkWNQMpNMXkT61Xvw3jKOZNGCjEEkev_VWuraviUaq8ZKXphXhSYZcnnWRAj1cxgrzTJ7Kj4rOcSfQO7EDXx0jn6QSz0F7mIgA9vv5sqhWAlLi9m3bANlX9OdqthN7xwtBC6VNAmWQ5W-xz4dtWsEAF6eSfBs-AF0aKchAA-YE5WWGcbQHh6b80rX1TsnFQAtAIOxkWEuWWM0GiI1Lfdh0C24yGZVEofRe7CqnfVzGBDlUqYCrt5Dxfi4ZdTazyuWo4A8CtU`

### Section 2: Stats Strip
- `glass-panel rounded-2xl p-8 md:p-10 mb-24 md:mb-32 relative z-10`
- `flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10`
- 3 stat blocks, each `flex-1 flex flex-col items-center justify-center py-6 sm:py-0 text-center`
- Inline data:
  ```
  { value: "2.4M+", label: "Total Views" }
  { value: "12+",   label: "Digital Products" }
  { value: "30+",   label: "Published Articles" }
  ```
- Value: `type-display-mobile text-gradient font-semibold`
- Label: `type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest mt-2`

### Section 3: The Architect (bio)
- `mb-24 md:mb-32 relative z-10`
- Eyebrow: `type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest mb-8`
- Two-col desktop: `flex flex-col md:flex-row gap-12 md:gap-24`
  - Left `md:w-1/3`: `type-headline-md text-[var(--color-primary)] font-semibold` heading "Designer. Engineer. Creator."
  - Right `md:w-2/3`: 3 paragraphs `type-body-lg text-[var(--color-on-surface-variant)] mb-6`
- Horizontal rule after: `<div className="h-px bg-white/5 mt-24 md:mt-32 mb-24 md:mb-32" />`

### Section 4: Core Philosophy (numbered principle cards) — the "product cards"
- Header: eyebrow "CORE PRINCIPLES" + heading "Core Philosophy" + `mb-12 md:mb-16`
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)] mb-24 md:mb-32 relative z-10`
- Each card: `glass-card glass-card-hover rounded-xl p-8 flex flex-col gap-4`
- Card anatomy:
  1. Number badge: `self-start pill-filter type-label-caps px-4 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)]` → "01"/"02"/"03" — **these are the "category pills"**
  2. Title: `text-[var(--color-primary)] font-semibold text-xl tracking-tight leading-snug`
  3. Description: `type-body-md text-[var(--color-on-surface-variant)] leading-relaxed`
- Inline data:
  ```
  { number: "01", title: "Restraint over Abundance", description: "Every element earns its place. Negative space is not emptiness — it is precision. The most powerful creative decisions are the ones you choose not to make." }
  { number: "02", title: "Liquid Lighting", description: "Light is not decoration. It is architecture. Every surface, every interface, every generation is built around how light behaves against material — real or simulated." }
  { number: "03", title: "Deterministic Outcomes", description: "Creativity at scale requires systems. Every workflow, prompt chain, and design decision is engineered for repeatability without sacrificing the edge of surprise." }
  ```

### Section 5: Network (platform link cards) — the actual "product cards"
- Header: eyebrow "PLATFORMS" + heading "Find the Work" + `mb-12 md:mb-16`
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)] mb-24 md:mb-32 relative z-10`
- Each card: `<a>` wrapper `group block glass-card glass-card-hover rounded-xl p-8 flex flex-col gap-5`
- Card anatomy:
  1. Platform pill: `self-start pill-filter type-label-caps px-4 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)]` → "INSTAGRAM"/"MEDIUM"/"GUMROAD"
  2. Icon: `material-symbols-outlined text-4xl text-[var(--color-primary)] opacity-70`
  3. Description: `type-body-md text-[var(--color-on-surface-variant)] leading-relaxed flex-grow`
  4. CTA row: `flex items-center justify-between pt-5 border-t border-white/10 mt-auto`
     - Left: `type-label-caps text-[var(--color-primary)] text-[10px] tracking-widest`
     - Right: arrow Material icon with `group-hover:translate-x-1 transition-all duration-300`
- Inline data:
  ```
  { platform: "INSTAGRAM", icon: "photo_camera", href: "https://www.instagram.com/createwithanmol",
    description: "Reels, prompt breakdowns, and cinematic AI visuals. The primary channel for new work and process documentation." }
  { platform: "MEDIUM", icon: "article", href: "https://medium.com/@createwithanmol",
    description: "In-depth technical articles on AI, design systems, and editorial workflows. Published regularly for builders who think deeply." }
  { platform: "GUMROAD", icon: "storefront", href: "https://gumroad.com",
    description: "Premium digital products: preset packs, UI kits, guides, and prompt libraries engineered for professional creative output." }
  ```

### Section 6: CTA Footer
- Mirrors products/blogs bottom CTA pattern exactly
- `pt-16 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10`
- Left: eyebrow "Let's Build" + heading "Let's collaborate" + subtext
- Right: `pill-filter` rounded-full button → Instagram link + arrow icon

## Reused patterns (from existing pages)
- `products/page.tsx` — section header pattern, pill-filter CTA, grid structure, bottom CTA
- `blogs/page.tsx` — `mix-blend-luminosity` image treatment
- `page.tsx` — ambient orb layer, `text-gradient` on display headings
- `globals.css` — all utility classes

## Responsive grid summary
| Section | Mobile | Desktop |
|---------|--------|---------|
| Hero | stacked col | `flex-row` 50/50 |
| Stats | vertical `divide-y` | horizontal `divide-x` |
| Architect | single col | `md:w-1/3` + `md:w-2/3` |
| Philosophy | 1-col | 3-col |
| Network | 1-col | 3-col |
| CTA | `flex-col` | `flex-row justify-between` |

## Implementation method
caveman-builder subagent — single file rewrite of `src/app/about/page.tsx`.
No TypeScript errors: no `'use client'`, no hooks, all `<a>` have `href`, all `<img>` have `alt`, no unused vars.

## Verification
1. `npm run build` — zero TypeScript errors, static export produces `/out/about/index.html`
2. Playwright screenshot at 1440px desktop + 390px mobile
3. Compare visually: 6 sections visible, cards render, pills visible, grid correct
4. Update `session-handoff.md` with completion notes
