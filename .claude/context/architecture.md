# Architecture — Create with Anmol

# Architectural Philosophy

Create with Anmol follows a:

* static-first
* content-driven
* lightweight
* AI-assisted
* creator-focused

architecture strategy.

The system is intentionally designed to:

* minimize operational complexity
* maximize maintainability
* support fast iteration
* optimize performance
* reduce infrastructure overhead

The project is NOT intended to operate as:

* a traditional CMS platform
* a database-heavy application
* a SaaS dashboard
* a backend-centric system

The website acts primarily as:

* a premium creator ecosystem hub
* a content discovery layer
* a visual creator platform
* a content aggregation system

---

# Core Tech Stack

## Frontend

* Next.js
* Tailwind CSS

## Hosting

* Cloudflare Pages

## Content Management

* Google Sheets

## API Layer

* Google Apps Script

## Media

* External image hosting (Cloudinary recommended)

---

# Architectural Priorities

The system prioritizes:

1. Performance
2. Visual consistency
3. Simplicity
4. Mobile responsiveness
5. Maintainability
6. Reusable component architecture
7. Static rendering

Avoid:

* unnecessary backend infrastructure
* complex server logic
* unnecessary state management
* overengineered abstractions

---

# Rendering Strategy

The website uses:

# static-first rendering.

Content should primarily be:

* statically generated
* cached aggressively
* periodically refreshed

The system should avoid:

* unnecessary runtime rendering
* per-request API fetching
* dynamic server-side complexity

Preferred strategy:

* build-time fetching
* incremental revalidation
* lightweight API consumption

---

# Application Structure

Recommended high-level structure:

```text id="7m9vdc"
app/
components/
lib/
styles/
public/
```

---

# Page Architecture

The application consists of:

## Landing Page

Purpose:

* creator identity
* featured discovery
* audience conversion
* traffic routing

Contains:

* hero section
* featured prompts
* featured products
* featured blogs
* creator CTA sections

---

## Prompts Page

Purpose:

* prompt discovery
* Instagram ecosystem support
* AI workflow showcase

Contains:

* prompt cards
* prompt categories
* reel links
* prompt links

---

## Products Page

Purpose:

* Gumroad product discovery
* digital product showcase

Contains:

* product cards
* featured products
* product descriptions
* external product links

---

## Blogs Page

Purpose:

* establish technical authority
* showcase Medium writing

Contains:

* blog cards
* article previews
* Medium article links

---

## About Page

Purpose:

* creator positioning
* personal brand trust
* creator philosophy

Contains:

* creator story
* platform links
* creator vision
* ecosystem positioning

---

# Component Architecture

The frontend should follow:

# reusable component-driven architecture.

Core reusable components:

```text id="h3fx5w"
Navbar
Footer
SectionHeader
PromptCard
ProductCard
BlogCard
HeroSection
FeaturedGrid
```

Components should:

* remain modular
* avoid deep nesting
* prioritize composition
* support responsive behavior

Avoid:

* duplicated layouts
* page-specific card logic
* tightly coupled UI

---

# Data Architecture

Google Sheets acts as:

# lightweight headless CMS.

A single spreadsheet should contain multiple tabs:

```text id="1l3xt8"
Prompts
Products
Blogs
Featured
```

This structure optimizes:

* operational simplicity
* mobile management
* creator workflow efficiency

---

# API Architecture

Google Apps Script exposes:

# normalized API endpoints.

Recommended endpoint structure:

```text id="scxvqe"
/api/prompts
/api/products
/api/blogs
/api/featured
```

The frontend should NEVER directly depend on:

* spreadsheet column order
* raw spreadsheet structure
* Apps Script implementation details

Always introduce:

# abstraction layer.

Recommended structure:

```text id="mzblx2"
lib/api/
lib/content/
```

Purpose:

* isolate fetch logic
* normalize data
* simplify future migrations

---

# Content Flow

Recommended flow:

```text id="qkhz4g"
Google Sheets
    ↓
Apps Script APIs
    ↓
Next.js Fetch Layer
    ↓
Static Rendering
    ↓
Cloudflare CDN
```

This architecture prioritizes:

* simplicity
* scalability
* performance
* maintainability

---

# Media Strategy

Images should preferably use:

* Cloudinary-hosted assets
* optimized delivery
* responsive image support

Avoid:

* storing media inside Sheets
* heavy local asset growth
* unoptimized image delivery

Images should primarily support:

* thumbnails
* cinematic previews
* creator branding
* product visuals

---

# Performance Architecture

Performance is a primary architectural concern.

The frontend should:

* remain lightweight
* minimize client-side JavaScript
* avoid excessive animation libraries
* avoid unnecessary runtime logic

Avoid:

* WebGL
* Three.js
* particle systems
* excessive backdrop blur
* expensive rendering effects

Preferred:

* CSS transforms
* lightweight transitions
* opacity animations
* static rendering

---

# Mobile Architecture

The system is:

# mobile-first.

All pages and components must:

* scale responsively
* maintain spacing consistency
* preserve readability
* maintain smooth scrolling

Mobile UX is a primary requirement.

---

# Routing Philosophy

Routing should remain:

* minimal
* clean
* predictable

Recommended routes:

```text id="sc4ff7"
/
 /prompts
 /products
 /blogs
 /about
```

Avoid:

* deeply nested routes
* unnecessary route complexity
* dynamic route overengineering

---

# State Management Philosophy

The application should remain:

# mostly stateless.

Avoid:

* global state libraries
* unnecessary client-side stores
* complex frontend state management

Most content is:

* read-only
* externally managed
* statically rendered

---

# Future Expansion Philosophy

The architecture should support future expansion into:

* YouTube content
* creator tools
* downloadable resources
* AI workflow utilities
* richer creator ecosystems

However:
future functionality must preserve:

* performance
* simplicity
* premium visual identity
* lightweight architecture

Avoid evolving into:

* bloated creator dashboards
* enterprise-style SaaS systems
* overly complex content platforms

---

# Architectural Constraint

Every architectural decision should prioritize:

* simplicity
* maintainability
* visual quality
* creator experience
* performance

Avoid introducing complexity unless it clearly improves:

* scalability
* maintainability
* user experience
* operational efficiency.
