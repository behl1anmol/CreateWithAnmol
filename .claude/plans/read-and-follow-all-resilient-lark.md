# Plan: Homepage Full Implementation — Stitch Parity

## Context

The homepage (`src/app/page.tsx`) currently has only the Hero section. Five required sections are missing. The approved Stitch design (`create_with_anmol_cinematic_depth_refinement`, screen height 7226px) shows the complete composition. This plan implements all missing sections to achieve structural and visual parity with Stitch.

---

## Gap Analysis: Current vs Stitch

| Section | Current | Stitch | Action |
|---|---|---|---|
| Hero | ✓ (solid button) | ✓ (liquid glass button) | Fix CTA style |
| Ambient orbs inside `<main>` | ✗ | ✓ (absolute blobs) | Add |
| Featured Products (Gumroad) | ✗ | ✓ (horiz scroll, 2 cards) | Implement |
| Featured Blogs (Medium) | ✗ | ✓ (horiz scroll, 2 cards) | Implement |
| Instagram Prompts | ✗ | ✓ (horiz scroll, 2 cards + images) | Implement |
| About teaser | ✗ | empty stub | Design + implement |
| Footer | ✓ (in layout) | ✓ | No change |

---

## Files to Create / Modify

### 1. `src/lib/data/mockData.ts` — NEW
Static mock data arrays (3 products, 3 blogs, 2 prompts). Used only on homepage for now.

```ts
// Products (3 items)
{ id, title, description, icon, productLink }
// Mastering Lighting / Prompt Engineering Pro / Cinematic Depth Pack

// Blogs (3 items)
{ id, title, excerpt, icon, articleLink }
// The Future of AI Design / Cinematic Prompting 101 / Midjourney Advanced Techniques

// Prompts (2 items with real Stitch placeholder image URLs)
{ id, title, description, image, reelLink, promptLink }
// Cinematic Midjourney Masters (lh3.googleusercontent.com/aida-public/AB6AXuD26...)
// Hyper-Real Lighting Prompts (lh3.googleusercontent.com/aida-public/AB6AXuDaJRV...)
```

### 2. `src/app/page.tsx` — MODIFY
Replace stub with full homepage. All JSX inline (no new components needed for this task).

Section structure:
```
<main relative z-10 pt-32 pb-32>
  <!-- Ambient orbs (absolute inside main) -->
  <!-- 1. Hero -->
  <!-- 2. Featured Products section -->
  <!-- 3. Featured Blogs section -->
  <!-- 4. Instagram Prompts section -->
  <!-- 5. About teaser section -->
</main>
```

### 3. `src/app/globals.css` — MINOR MODIFICATION
- Background: upgrade body bg from flat `#121212` to cinematic depth style matching Stitch:
  `background-color: #07090c` + multi-layer radial gradients + noise + `background-attachment: fixed`
- Verify `--radius-3xl: 1.5rem` exists (it does — already present, no change needed)

---

## Detailed Section Specs

### Ambient Orbs (inside `<main>`, absolute)
```html
<div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
  <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
  <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] mix-blend-screen" />
</div>
```

### Hero CTA button — fix to liquid glass
Current: `bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full`  
Stitch: `bg-white/80 backdrop-blur-[20px] border border-white/20 border-t-white/50 text-surface rounded-full hover:bg-white/95 hover:-translate-y-0.5 shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.25)]`

### Section Header (shared pattern)
```html
<div class="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
  <h2 class="type-headline-md text-[var(--color-primary)]">Section Title</h2>
  <a href="/page" class="type-body-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
    View All <span class="material-symbols-outlined text-sm">arrow_forward</span>
  </a>
</div>
```

### Horizontal Scroll Container
```html
<div class="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
  <!-- cards -->
</div>
```

### Card Structure (all card types share this shell)
```html
<div class="snap-start shrink-0 w-[85vw] md:w-[400px] 
  bg-[#1a1a1a]/40 backdrop-blur-2xl 
  border border-white/5 border-t-white/15
  hover:bg-[#1a1a1a]/60 hover:border-white/10 hover:border-t-white/25 hover:-translate-y-1
  transition-all duration-500 overflow-hidden flex flex-col group
  rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
  
  <!-- Image/Icon area: h-64 bg-[#121212] relative overflow-hidden -->
  <!-- Content area: p-6 flex flex-col gap-4 flex-grow z-10 bg-gradient-to-b from-white/5 to-transparent -->
  <!-- CTA area: mt-auto flex gap-3 pt-4 border-t border-white/5 -->
</div>
```

### Card CTAs by type
- **Products**: single `"View Product"` — `bg-white/10 border border-white/10 border-t-white/20 rounded-xl`
- **Blogs**: single `"Read Article"` — `bg-white/5 border border-white/10 border-t-white/20 rounded-xl`
- **Prompts**: dual `"Watch Reel"` (ghost) + `"Get Full Prompt"` (filled white/10)

### Icon placeholder (products + blogs)
```html
<div class="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
  <span class="material-symbols-outlined text-6xl text-white/10">lightbulb</span>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent opacity-80" />
```

### Image card (prompts)
```html
<img src={prompt.image} alt={prompt.title}
  class="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 mix-blend-luminosity" />
<div class="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-transparent to-transparent opacity-80" />
```

### About Teaser (Stitch stub — designed to match visual system)
Glass panel, centered editorial layout, links to `/about`:
```html
<section class="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-40">
  <div class="glass-panel rounded-3xl p-16 md:p-20 flex flex-col items-center text-center gap-6">
    <span class="type-label-caps text-[var(--color-on-surface-variant)]">Creator Story</span>
    <h2 class="type-headline-md text-gradient max-w-2xl">
      Building at the intersection of AI and cinematic design
    </h2>
    <p class="type-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
      From prompt engineering to visual storytelling — exploring what's possible when technology meets art.
    </p>
    <a href="/about"
       class="mt-4 type-label-caps border border-white/20 text-[var(--color-primary)] px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-300 tracking-widest">
      Learn More
    </a>
  </div>
</section>
```

---

## File Creation Order

1. Create `src/lib/data/mockData.ts`
2. Modify `src/app/page.tsx` — replace stub with full implementation
3. Modify `src/app/globals.css` — update background style (body bg + radial gradients)

---

## Verification

1. `npm run build` — confirm static export passes, zero TypeScript errors
2. Run Playwright screenshot at 1440px (desktop) and 390px (mobile) using:
   - `executablePath`: `/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell`
   - Launch args: `--no-sandbox --disable-setuid-sandbox --disable-gpu`
3. Visually compare screenshot against Stitch (`screen.png`) for:
   - Section presence: all 5 sections visible
   - Card layout: horizontal scroll with correct card widths
   - Typography hierarchy: correct scale per section
   - About teaser: centered editorial with glass panel
   - Mobile: full-width cards (`w-[85vw]`), single-column layout
4. Fix any layout inconsistencies
5. Update analysis files: `implementation-notes.md`, `lessons-learned.md`, `debugging-log.md`, `session-handoff.md`
