# Frontend Rules — Create with Anmol

# Frontend Philosophy

The frontend architecture should prioritize:

* simplicity
* maintainability
* visual consistency
* performance
* reusable components
* mobile-first implementation

The frontend should feel:

* lightweight
* premium
* cinematic
* responsive
* intentional

Avoid:

* overengineering
* unnecessary abstractions
* bloated dependencies
* overly complex component trees

---

# Core Frontend Stack

Use:

* Next.js
* Tailwind CSS

Avoid introducing:

* unnecessary UI frameworks
* component-heavy design systems
* large animation frameworks
* excessive third-party abstractions

The frontend should remain:

* lightweight
* understandable
* maintainable

---

# Component Philosophy

The frontend follows:

# reusable component-driven architecture.

Prefer:

* modular reusable components
* compositional design
* shared layout patterns

Avoid:

* duplicated UI structures
* page-specific component duplication
* tightly coupled components

---

# Core Shared Components

The following components should remain reusable:

```text id="ybf8lc"
Navbar
Footer
SectionHeader
PromptCard
ProductCard
BlogCard
HeroSection
FeaturedGrid
```

Shared components should:

* remain generic
* support responsive layouts
* avoid content-specific assumptions

---

# Styling Rules

Use:

* Tailwind utility classes
* consistent spacing
* shared visual patterns

Avoid:

* large custom CSS files
* inline style clutter
* inconsistent spacing systems
* arbitrary styling patterns

Visual consistency is a core priority.

---

# Layout Rules

Layouts should:

* feel editorial
* remain breathable
* support cinematic spacing
* preserve readability

Avoid:

* dense layouts
* cramped grids
* excessive nested containers
* visually noisy structures

Use:

* generous section spacing
* consistent container widths
* predictable responsive behavior

---

# Mobile-First Rules

The frontend is:

# mobile-first.

All components must:

* scale cleanly to mobile
* maintain readability
* preserve spacing rhythm
* support touch interactions

Mobile UX is not optional.

Avoid:

* desktop-only layouts
* tiny touch targets
* horizontal overflow
* compressed mobile spacing

---

# Card Rules

Cards are a primary interaction pattern.

Cards should:

* remain lightweight
* feel tactile
* support subtle depth
* preserve visual consistency

Cards should NOT:

* contain excessive nested elements
* become visually overloaded
* rely on large shadows
* use excessive glass effects

Preferred:

* restrained glass materials
* subtle elevation
* clean spacing
* strong hierarchy

---

# Button Rules

Buttons should:

* remain minimal
* feel responsive
* preserve readability
* follow liquid material styling

Avoid:

* oversized buttons
* excessive glow
* aggressive gradients
* flashy hover effects

Hover states should:

* remain subtle
* use lightweight transitions
* support tactility

---

# Animation Rules

Animations should:

* support hierarchy
* improve polish
* remain subtle
* remain performant

Preferred:

* opacity transitions
* transform animations
* lightweight hover effects
* smooth easing

Avoid:

* bouncing animations
* excessive parallax
* continuous movement
* exaggerated motion
* expensive animation systems

---

# Performance Rules

Performance is a primary frontend concern.

Avoid:

* WebGL
* Three.js
* particle systems
* excessive backdrop blur
* excessive re-renders
* large client-side bundles
* unnecessary JavaScript

Prefer:

* static rendering
* lightweight interactions
* CSS transitions
* optimized assets

The frontend should feel:

* smooth
* fast
* responsive

especially on mobile devices.

---

# Rendering Rules

Prefer:

* server components where appropriate
* static rendering
* minimal client-side interactivity

Avoid:

* unnecessary client components
* excessive hydration
* frontend-heavy logic

Most content is:

* read-only
* externally managed
* statically rendered

---

# State Management Rules

Avoid:

* global state libraries
* unnecessary frontend stores
* complex client-side state systems

Prefer:

* local component state
* lightweight state management
* prop-driven composition

The application should remain:

# mostly stateless.

---

# Dependency Rules

Only introduce dependencies when:

* clearly justified
* performance-conscious
* aligned with architecture

Avoid:

* dependency-heavy frontend stacks
* unnecessary abstraction libraries
* visually bloated frameworks

Every dependency should have:

* clear architectural value
* low operational cost

---

# Image Rules

Images should:

* remain optimized
* load efficiently
* support responsive layouts

Use:

* optimized image rendering
* consistent thumbnail sizing
* cinematic editorial presentation

Avoid:

* oversized assets
* inconsistent image ratios
* visually cluttered imagery

---

# Accessibility Rules

The frontend should maintain:

* semantic HTML structure
* accessible interactions
* keyboard navigability
* readable contrast hierarchy

Accessibility should support:

* usability
* clarity
* responsiveness

without compromising visual quality.

---

# Code Organization Rules

Recommended structure:

```text id="n9u8iz"
app/
components/
lib/
styles/
public/
```

Avoid:

* deeply nested folder structures
* unclear component ownership
* scattered utility logic

Frontend organization should remain:

* predictable
* maintainable
* scalable

---

# Frontend Constraint

Every frontend decision should prioritize:

1. visual consistency
2. performance
3. maintainability
4. responsiveness
5. simplicity

Avoid introducing complexity unless it significantly improves:

* UX quality
* maintainability
* scalability
* performance
