# CMS Schema — Create with Anmol

# Purpose

This document defines the operational Google Sheets CMS structure for Create with Anmol.

The spreadsheet acts as:

# a lightweight headless CMS

for:

* Next.js frontend rendering
* Google Apps Script APIs
* Cloudflare Pages deployment
* static-first content delivery

This schema is considered:

# a backend/frontend contract.

Changes to this schema should be handled carefully to avoid:

* frontend rendering issues
* API inconsistencies
* schema drift
* content mapping failures

---

# CMS Architecture Principles

The CMS structure must remain:

* lightweight
* human-editable
* mobile-manageable
* frontend-friendly
* normalized
* flat
* operationally simple

Avoid:

* nested structures
* relational complexity
* spreadsheet overengineering
* presentation-specific formatting

---

# Spreadsheet Structure

The Google Sheet must contain EXACTLY these tabs:

```text id="rrkwfh"
Prompts
Products
Blogs
Featured
```

Do not introduce additional tabs without explicit architectural need.

---

# TAB — Prompts

Purpose:
Store AI prompt packs and Instagram-related prompt content.

Column order must remain:

| id | title | description | image | category | tool | reelLink | promptLink | featured | order |

---

## Field Definitions

### id

Type:

* string

Requirements:

* stable identifier
* kebab-case
* human-readable

Example:

```text id="4zj2ul"
apple-liquid-glass-prompts
```

Avoid:

* GUIDs
* random IDs
* spaces

---

### title

Type:

* string

Purpose:

* prompt title

---

### description

Type:

* string

Purpose:

* short prompt summary

Keep concise and frontend-friendly.

---

### image

Type:

* string

Purpose:

* externally hosted thumbnail URL

Preferred:

* Cloudinary-hosted assets

---

### category

Type:

* string

Purpose:

* prompt categorization

Example:

```text id="gn1j38"
UI Design
Cinematic Prompts
Workflow Prompts
```

---

### tool

Type:

* string

Purpose:

* AI tool used to generate this prompt

Example:

```
Midjourney v6
Stable Diffusion
DALL-E 3
ChatGPT-4o
```

Rationale: Frontend `Prompt` interface includes `tool` field; rendered as a badge on prompt cards.

---

### reelLink

Type:

* string

Purpose:

* Instagram reel URL

---

### promptLink

Type:

* string

Purpose:

* Google Docs prompt URL

---

### featured

Type:

* boolean

Allowed values:

```text id="qmjlwm"
TRUE
FALSE
```

---

### order

Type:

* number

Purpose:

* display ordering

Lower numbers appear first.

---

# TAB — Products

Purpose:
Store Gumroad creator products.

Column order must remain:

| id | title | description | image | productLink | category | price | badge | specs | featured | order |

---

## Field Definitions

### id

Stable kebab-case identifier.

Example:

```text id="m5whx0"
cinematic-ui-toolkit
```

---

### title

Product title.

---

### description

Short product summary.

---

### image

Product thumbnail URL.

---

### productLink

Gumroad product URL.

---

### category

Type:

* string

Purpose:

* product categorization for filter pills on /products page

Example:

```
Preset Packs
UI Kits
Typography
Soundscapes
Guides
```

Rationale: Frontend `Product` interface includes `category`; rendered as filter pill system.

---

### price

Type:

* string

Purpose:

* price display on product card image badge

Example:

```
$129
$49
$35
```

Rationale: Frontend `Product` interface includes `price`; overlaid as badge on card image.

---

### badge

Type:

* string

Purpose:

* premium label shown on featured hero card only

Example:

```
Flagship · v2.4
```

Rationale: Frontend renders `badge` in the featured product hero layout only. Leave empty for non-featured products.

---

### specs

Type:

* string

Purpose:

* technical spec row shown below description

Separator convention: use `·` between spec items.

Example:

```
52 Presets · Lightroom + Capture One · Instant Download
```

Rationale: Frontend `Product` interface includes `specs`; rendered as spec row in hero and card detail.

---

### featured

Boolean:

```text id="xtq6jr"
TRUE
FALSE
```

Only one product should have `featured=TRUE` — renders as full-width hero on /products page.

---

### order

Numeric display order.

---

# TAB — Blogs

Purpose:
Store Medium blog metadata.

Column order must remain:

| id | title | excerpt | image | articleLink | category | readTime | date | featured | order |

---

## Field Definitions

### id

Stable kebab-case identifier.

Example:

```text id="wqme6r"
idisposable-best-practices
```

---

### title

Blog title.

---

### excerpt

Short editorial article summary.

---

### image

Blog thumbnail URL.

---

### articleLink

Medium article URL.

---

### category

Technical category.

Example:

```text id="mkjns7"
.NET
AI
System Design
```

---

### readTime

Estimated read time.

Example:

```text id="u9lmn8"
5 min read
```

---

### date

Type:

* string

Purpose:

* publication date display on blog cards

Format: `MMM DD, YYYY`

Example:

```
Oct 12, 2024
Sep 28, 2024
```

Rationale: Frontend `Blog` interface includes `date`; rendered as publication date on blog cards.

---

### featured

Boolean:

```text id="y1jlwm"
TRUE
FALSE
```

Only one blog should have `featured=TRUE` — renders as horizontal hero split on /blogs page.

---

### order

Numeric display order.

---

# TAB — Featured

Purpose:
Control homepage featured content dynamically.

Column order must remain:

| id | contentType | contentId | section | order |

---

## Field Definitions

### id

Stable identifier.

---

### contentType

Allowed values:

```text id="r9x7ob"
prompt
product
blog
```

---

### contentId

References:

* Prompts.id
* Products.id
* Blogs.id

Must remain consistent.

---

### section

Homepage section identifier.

Example:

```text id="7kfc97"
featured-prompts
featured-products
featured-blogs
```

---

### order

Numeric display ordering.

---

# Global CMS Rules

## Formatting Rules

Use:

* simple formatting
* readable column widths
* clean organization

Avoid:

* merged cells
* complex formulas
* presentation-heavy styling
* nested content structures

---

# Content Rules

Content should remain:

* curated
* intentional
* frontend-friendly
* lightweight

Avoid:

* excessively long text blocks
* HTML content
* markdown blobs
* inconsistent formatting

---

# URL Rules

All URLs should:

* use HTTPS
* remain fully qualified
* point directly to external destinations

Supported URLs:

* Instagram reels
* Gumroad products
* Medium articles
* Google Docs

---

# Image Rules

Images should:

* remain optimized
* support responsive rendering
* use consistent aspect ratios where possible

Preferred:

* cinematic thumbnails
* editorial-style imagery
* visually clean compositions

---

# Schema Stability Rules

Do not:

* rename columns
* reorder columns
* change field meaning
* introduce nested structures

without updating:

* frontend mapping logic
* Apps Script normalization logic
* content-model.md

---

# Frontend Contract Rules

The frontend should:

* consume normalized API responses
* avoid spreadsheet-specific assumptions

The frontend must never depend on:

* spreadsheet formatting
* manual row ordering
* presentation-specific sheet behavior

---

# Operational Philosophy

The CMS is intentionally:

* lightweight
* maintainable
* solo-creator friendly
* mobile-manageable

The CMS should remain:

* operationally simple
* easy to update
* easy to debug
* easy to scale gradually

Avoid evolving the CMS into:

* enterprise content systems
* database-style relational complexity
* admin-dashboard-heavy workflows
