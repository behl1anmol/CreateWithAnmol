# Plan: Social Media Icons Integration

## Context

Website currently has three outdated/placeholder social links in the About page's "Find the Work" section (Instagram/Medium/Gumroad with wrong URLs and generic Material Symbols icons). Main page has an "Explore Prompts" pill button in the hero. User wants to:

A) Replace the main page hero button with a row of all 6 social handles — grayscale by default, brand color on hover.
B) About page "Find the Work" section: expand to all 6 platforms with correct URLs, keeping identical card layout. Add cards for LinkedIn, GitHub, X. Fix wrong URLs on existing cards.

---

## Key Findings

| Item | Detail |
|------|--------|
| Main page button | `src/app/page.tsx:26-31`, inside `<div className="mt-8 flex gap-4">` |
| About PLATFORMS data | `src/app/about/page.tsx:28-50` (3 entries, all wrong URLs) |
| About card JSX | `src/app/about/page.tsx:180-208`, uses `material-symbols-outlined` string icons |
| Icon system | Material Symbols CDN — no brand icons available |
| Icon library installed | None — need to add `react-icons` |
| About grid | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — 6 cards = 2 rows of 3, no grid change needed |

**URL corrections needed (existing cards have wrong URLs):**
- Instagram: `createwithanmol` → `thestudioprompts.ai`
- Medium: `@createwithanmol` → `@behl1anmol`
- Gumroad: `gumroad.com` → `behlanmol.gumroad.com`

---

## Icon Strategy Rationale

Material Symbols is a general-purpose icon font — it has no brand icons (no LinkedIn, GitHub, X, Medium, Gumroad, Instagram logos). `react-icons/si` (Simple Icons) is the industry-standard source for brand SVG icons in React. It:
- Tree-shakes to only imported icons (~1-2KB per icon)
- Works in Server Components (pure SVG, no client runtime)
- Has all 6 required brands

**Brand hover colors (dark background context):**
| Platform | Brand Color | Rationale |
|----------|-------------|-----------|
| Instagram | `#E1306C` | Official brand pink-red |
| Medium | `#FFFFFF` | Medium logo is #000000 — invisible on dark bg; white is correct contrast |
| Gumroad | `#FF90E8` | Official brand pink |
| LinkedIn | `#0A66C2` | Official brand blue |
| GitHub | `#FFFFFF` | GitHub dark mode uses white for logo |
| X | `#FFFFFF` | X logo white on dark backgrounds |

---

## Implementation Plan

### Step 1 — Install react-icons
```bash
npm install react-icons
```

### Step 2 — Create shared social config `src/lib/social.tsx`

Single source of truth for all social data. Both pages import from here. Prevents URL drift.

```tsx
import { SiInstagram, SiMedium, SiGumroad, SiLinkedin, SiGithub, SiX } from 'react-icons/si'

export interface SocialPlatform {
  key: string
  label: string
  href: string
  brandColor: string
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  description: string
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: 'linkedin',
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/behlanmol/',
    brandColor: '#0A66C2',
    Icon: SiLinkedin,
    description: 'Professional posts on AI, design systems, and building creative tools at scale.',
  },
  {
    key: 'github',
    label: 'GITHUB',
    href: 'https://github.com/behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiGithub,
    description: 'Open source projects, prompt engineering tools, and code experiments. The engineering side of the work.',
  },
  {
    key: 'medium',
    label: 'MEDIUM',
    href: 'https://medium.com/@behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiMedium,
    description: 'In-depth technical articles on AI, design systems, and editorial workflows. Published regularly for builders who think deeply.',
  },
  {
    key: 'gumroad',
    label: 'GUMROAD',
    href: 'https://behlanmol.gumroad.com/',
    brandColor: '#FF90E8',
    Icon: SiGumroad,
    description: 'Premium digital products: preset packs, UI kits, guides, and prompt libraries engineered for professional creative output.',
  },
  {
    key: 'instagram',
    label: 'INSTAGRAM',
    href: 'https://www.instagram.com/thestudioprompts.ai/',
    brandColor: '#E1306C',
    Icon: SiInstagram,
    description: 'Reels, prompt breakdowns, and cinematic AI visuals. The primary channel for new work and process documentation.',
  },
  {
    key: 'x',
    label: 'X',
    href: 'https://x.com/behl1anmol',
    brandColor: '#FFFFFF',
    Icon: SiX,
    description: 'Real-time thoughts on AI, creativity, and the future of digital craftsmanship.',
  },
]
```

**Note:** Verify `SiX` exists in installed react-icons version. If not, fallback is `SiXdotcom` or `SiTwitter`.

### Step 3 — Change A: Main page hero — replace button with social icons row

**File:** `src/app/page.tsx`

Replace the `<div className="mt-8 flex gap-4">` block (lines 25-32) with:

```tsx
import { SOCIAL_PLATFORMS } from '@/lib/social'

{/* Social handles — replace button */}
<div className="mt-8 flex items-center gap-6">
  {SOCIAL_PLATFORMS.map(({ key, href, label, brandColor, Icon }) => (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-white/30 transition-colors duration-300 hover:text-(--brand)"
      style={{ '--brand': brandColor } as React.CSSProperties}
    >
      <Icon size={22} />
    </a>
  ))}
</div>
```

**Why no label ("Find me on"):** Hero already communicates identity via headline. Icons are self-explanatory. Additional label adds noise. Design stays restrained.

**Hover mechanism:** CSS custom property `--brand` scoped per `<a>`. Tailwind v4 `text-(--brand)` generates `color: var(--brand)`. Server Component safe — no `useState` needed.

### Step 4 — Change B: About page — update PLATFORMS + card icon rendering

**File:** `src/app/about/page.tsx`

1. Remove the `PLATFORMS` const and the `icon: string` field approach
2. Import `SOCIAL_PLATFORMS` from `@/lib/social`
3. Update card JSX to render the `Icon` component instead of Material Symbols span

**Updated card JSX:**

```tsx
import { SOCIAL_PLATFORMS } from '@/lib/social'

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
  {SOCIAL_PLATFORMS.map((pl) => (
    <a
      key={pl.key}
      href={pl.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block glass-card glass-card-hover rounded-xl p-8 flex flex-col gap-5"
      style={{ '--brand': pl.brandColor } as React.CSSProperties}
    >
      <span className="self-start pill-filter type-label-caps px-4 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)]">
        {pl.label}
      </span>
      {/* Brand icon — colorless default, brand color on group hover */}
      <div className="text-white/50 group-hover:text-(--brand) transition-colors duration-300">
        <pl.Icon size={36} />
      </div>
      <p className="type-body-md text-[var(--color-on-surface-variant)] leading-relaxed flex-grow">
        {pl.description}
      </p>
      <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
        <span className="type-label-caps text-[var(--color-primary)] text-[10px] tracking-widest">
          View
        </span>
        <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)] group-hover:translate-x-1 group-hover:text-[var(--color-primary)] transition-all duration-300">
          arrow_forward
        </span>
      </div>
    </a>
  ))}
</div>
```

**Why keep `arrow_forward` Material Symbol:** It's a UI element (not a brand icon) — Material Symbols is appropriate here. Only platform identity icons need brand treatment.

**Grid stays `lg:grid-cols-3`:** 6 cards = 2 rows of 3. Consistent with existing layout rhythm. No change needed.

---

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `react-icons` dependency |
| `src/lib/social.tsx` | Create — shared social platform config |
| `src/app/page.tsx` | Import `SOCIAL_PLATFORMS`, replace button with icon row |
| `src/app/about/page.tsx` | Remove local `PLATFORMS`, import shared config, update card icon JSX |
| `.claude/analysis/session-handoff.md` | Append session notes |
| `.claude/analysis/implementation-notes.md` | Append icon system decision |

---

## Potential Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `SiX` name may differ in installed react-icons version | After install, verify with `node -e "require('react-icons/si')"` or check package contents |
| `text-(--brand)` Tailwind v4 syntax might not work as expected | Fallback: use `style={{ color: pl.brandColor }}` on hover via a client component wrapper |
| About page is Server Component — cannot use `onMouseEnter` for hover | CSS variable approach avoids this; `group-hover` is purely CSS |
| react-icons adds bundle size | Tree-shaking ensures only 6 icons load; negligible impact |

---

## Verification (Playwright CLI)

After implementation:
```bash
npx playwright test --headed
```

Manual checks:
1. Main page hero: 6 icons visible, grayscale → brand color on hover, all links open correct URLs
2. About page: 6 cards visible in 2 rows of 3, icons colorless → brand color on card hover, all URLs correct
3. No TypeScript errors: `npx tsc --noEmit`
4. Build passes: `npm run build`
