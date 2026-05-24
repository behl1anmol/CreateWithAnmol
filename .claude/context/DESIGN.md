---
name: Cinematic Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6c6'
  on-secondary: '#2f3131'
  secondary-container: '#484949'
  on-secondary-container: '#b8b8b8'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  mono-technical:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for a premium AI creator platform, prioritizing a "Liquid Glass" aesthetic that feels cinematic, editorial, and technically sophisticated. The brand personality is authoritative yet understated, avoiding the loud trends of the AI space in favor of a high-end, tool-like precision reminiscent of professional creative software.

The visual direction combines **Minimalism** with a refined **Glassmorphism**. It utilizes heavy whitespace (negative space), high-contrast typography, and translucent layers to create a sense of physical depth without clutter. The emotional response should be one of calm, focused power—providing creators with a "blank canvas" that feels expensive and intentional. 

Key stylistic pillars include:
- **Liquid Lighting:** Soft, moving radial gradients that act as "ambient light" behind glass layers.
- **Micro-textures:** A faint grain/noise overlay on dark surfaces to prevent "flat" digital blacks.
- **Editorial Contrast:** Razor-sharp white text against deep graphite voids.

## Colors

The palette is strictly monochromatic and rooted in "Graphite and Silver." 

- **Base Surfaces:** The primary interface lives on `#121212`. Elevated containers use `#1A1A1A` or semi-transparent glass.
- **Primary Accents:** Pure `#FFFFFF` is reserved for critical high-contrast text and primary actions.
- **Secondary Accents:** `#C0C0C0` (Silver) is used for secondary information, icons, and borders to provide a metallic, technical feel.
- **Liquid Elements:** Translucency is achieved through low-opacity white (`rgba(255,255,255,0.05)`), allowing background gradients to bleed through subtly.

Avoid any "gamified" colors. Success, error, and warning states should be handled with sophisticated, desaturated versions of green, red, and amber only when absolutely necessary, otherwise preferring iconography and weight.

## Typography

Typography is used as a structural element. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, while **Inter** ensures maximum readability for body content. **Geist** is introduced for labels and technical data to reinforce the "AI/Tool" nature of the platform.

- **Tracking:** Use generous letter-spacing (tracking) for uppercase labels to evoke a high-fashion, editorial feel. Headlines should have tighter tracking at larger sizes to feel "liquid" and cohesive.
- **Hierarchy:** Rely on size and tracking rather than excessive weight. Avoid "Extra Bold" or "Black" weights to maintain sophistication.
- **Contrast:** Secondary text should drop to 60% opacity rather than shifting to a different hue.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain the "editorial" look, centering content within a 1440px container. 

- **Grid:** Use a 12-column grid for desktop with wide 24px gutters.
- **Rhythm:** All spacing is derived from an 8px base unit. 
- **Negative Space:** Embrace "uncomfortable" amounts of whitespace between sections (e.g., 160px or 200px) to draw focus to the AI-generated assets.
- **Mobile:** On mobile, margins shrink to 20px, and the layout collapses to a single column. Glass cards should span the full width minus margins to maximize screen real estate for visual content.

## Elevation & Depth

Depth is not communicated through traditional drop shadows, but through **Tonal Layers** and **Backdrop Blurs**.

- **Level 0 (Background):** Deep `#121212` with a 2% opacity noise texture.
- **Level 1 (Navigation/Sidebars):** Glassmorphism with `backdrop-filter: blur(20px)` and a 1px solid border at `rgba(255,255,255,0.08)`.
- **Level 2 (Cards/Modals):** A slightly lighter fill (`#1A1A1A`) with a very subtle "inner glow" border (white at 10% opacity) on the top and left edges to simulate light hitting a glass edge.
- **Liquid Lighting:** Use large, soft radial gradients (300px-600px radius) in deep greys or very desaturated blues at 5% opacity behind the main content layers to create a sense of "moving" light.

## Shapes

The shape language is **Soft (0.25rem)** to maintain a technical, "pro-app" feel. 

- **Buttons & Inputs:** Use the base `rounded` (4px) for a sharp, architectural look.
- **Content Cards:** May use `rounded-lg` (8px) to feel more approachable as "objects" within the UI.
- **Pills:** Avoid full pill shapes (stadium buttons) unless used for status indicators or tags.
- **Borders:** Borders are critical. Use 1px "hairline" strokes for all containers to define the glass edges against the dark background.

## Components

- **Buttons:** 
  - *Primary:* Pure white background, black text, no border. Subtle "liquid" hover effect (slight scale up).
  - *Secondary:* Ghost style. 1px silver border, transparent background, white text.
- **Glass Cards:** 
  - Background: `rgba(255, 255, 255, 0.03)`.
  - Border: 1px solid `rgba(255, 255, 255, 0.1)`.
  - Effect: `backdrop-filter: blur(12px)`.
- **Input Fields:** 
  - Darker than the background (`#000000`).
  - Bottom-only border or very subtle 4-sided border. 
  - Focus state: Border brightens to `#FFFFFF` with a 2px outer "haze" (not a glow).
- **AI Progress Bar:**
  - A single 2px silver line. The progress is indicated by a white "liquid" light streak that moves across the line with a trailing gradient.
- **Contextual Lists:**
  - Use 1px silver dividers with 10% opacity. Hovering over a list item should trigger a subtle `rgba(255,255,255,0.02)` background fill.