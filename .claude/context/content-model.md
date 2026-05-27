# Content Model — Create with Anmol

# Content Architecture Philosophy

Create with Anmol uses:

# Google Sheets as lightweight headless CMS.

The content model prioritizes:

* simplicity
* maintainability
* human readability
* mobile editing
* frontend consistency

The system intentionally avoids:

* deeply nested structures
* relational complexity
* CMS-heavy schemas
* unnecessary metadata

All content models should remain:

* flat
* normalized
* easy to edit manually
* frontend-friendly

---

# Spreadsheet Structure

A single spreadsheet contains multiple tabs:

```text id="8c1kxt"
Prompts
Products
Blogs
Featured
```

Each tab represents:

# a distinct content domain.

---

# Global Content Rules

All content entries should:

* contain stable IDs
* support thumbnail-driven UI
* support lightweight rendering
* remain optional-field tolerant

All images should use:

* externally hosted URLs
* optimized delivery
* consistent aspect ratios when possible

Preferred:

* Cloudinary-hosted assets

---

# Shared Field Philosophy

The system prioritizes:

* explicit fields
* predictable structures
* frontend consistency

Avoid:

* ambiguous column names
* overloaded fields
* nested JSON inside sheets
* HTML content blobs

---

# Prompts Content Model

Purpose:

* AI prompt showcase
* Instagram ecosystem support
* prompt distribution

Tab Name:

```text id="md4xtt"
Prompts
```

Schema:

| Field       | Type    | Required | Description                        |
| ----------- | ------- | -------- | ---------------------------------- |
| id          | string  | Yes      | Stable unique identifier           |
| title       | string  | Yes      | Prompt title                       |
| description | string  | Yes      | Short prompt summary               |
| image       | string  | Yes      | Thumbnail image URL                |
| category    | string  | No       | Prompt category                    |
| tool        | string  | No       | AI tool name (e.g. Midjourney v6)  |
| reelLink    | string  | No       | Instagram reel URL                 |
| promptLink  | string  | Yes      | Gumroad or Google Docs prompt URL  |
| featured    | boolean | No       | Homepage featured flag             |
| order       | number  | No       | Sorting order                      |

---

# Products Content Model

Purpose:

* Gumroad product discovery
* creator monetization

Tab Name:

```text id="yzpnv0"
Products
```

Schema:

| Field       | Type    | Required | Description                              |
| ----------- | ------- | -------- | ---------------------------------------- |
| id          | string  | Yes      | Stable unique identifier                 |
| title       | string  | Yes      | Product title                            |
| description | string  | Yes      | Product summary                          |
| image       | string  | Yes      | Product cover image URL                  |
| productLink | string  | Yes      | Gumroad product URL                      |
| category    | string  | No       | Product category (filter pills)          |
| price       | string  | No       | Price string e.g. `$129`                 |
| badge       | string  | No       | Featured hero badge label                |
| specs       | string  | No       | Spec row, `·` separated                  |
| featured    | boolean | No       | Homepage featured flag (max one TRUE)    |
| order       | number  | No       | Sorting order                            |

---

# Blogs Content Model

Purpose:

* technical authority building
* Medium article discovery

Tab Name:

```text id="apd7rq"
Blogs
```

Schema:

| Field       | Type    | Required | Description                              |
| ----------- | ------- | -------- | ---------------------------------------- |
| id          | string  | Yes      | Stable unique identifier                 |
| title       | string  | Yes      | Article title                            |
| excerpt     | string  | Yes      | Short article summary                    |
| image       | string  | Yes      | Blog thumbnail image                     |
| articleLink | string  | Yes      | Medium article URL                       |
| category    | string  | No       | Blog category (filter pills)             |
| readTime    | string  | No       | Estimated read time e.g. `12 min read`   |
| date        | string  | No       | Publication date e.g. `Oct 12, 2024`     |
| featured    | boolean | No       | Homepage featured flag (max one TRUE)    |
| order       | number  | No       | Sorting order                            |

---

# Featured Content Model

Purpose:

* homepage content orchestration
* featured content control

Tab Name:

```text id="8d3x1v"
Featured
```

Schema:

| Field       | Type   | Required | Description                |
| ----------- | ------ | -------- | -------------------------- |
| id          | string | Yes      | Stable unique identifier   |
| contentType | string | Yes      | prompt, product, or blog   |
| contentId   | string | Yes      | Referenced content item ID |
| section     | string | Yes      | Homepage section           |
| order       | number | Yes      | Display ordering           |

Purpose:

* avoid hardcoded homepage selections
* allow content curation without code changes

---

# ID Rules

IDs should:

* remain stable
* avoid spaces
* use kebab-case

Example:

```text id="uj8jsz"
apple-liquid-glass-prompts
cinematic-ui-pack
idisposable-best-practices
```

Avoid:

* random generated IDs
* changing IDs after publishing

---

# Boolean Rules

Boolean fields should use:

```text id="1gqzj5"
TRUE
FALSE
```

Avoid:

* yes/no
* 1/0
* inconsistent casing

---

# Sorting Rules

The `order` field controls:

* homepage ordering
* featured content ordering
* curated section order

Lower numbers appear first.

Example:

```text id="7j6lb5"
1
2
3
```

Avoid:

* relying on spreadsheet row order
* manual frontend ordering

---

# Image Rules

Images should:

* use externally hosted URLs
* remain optimized
* support responsive rendering

Preferred image style:

* cinematic
* editorial
* visually clean
* premium quality

Avoid:

* inconsistent aspect ratios
* oversized files
* cluttered thumbnails

Supported image URL sources:

* Cloudinary-hosted assets (preferred)
* Google Drive shareable links — auto-proxied through `/api/drive-image?id={ID}` at normalization layer
* lh3.googleusercontent.com direct URLs (for non-Drive Google-hosted images)

Google Drive links stored in Sheets (`drive.google.com/file/d/{ID}/view`) are
automatically rewritten to `/api/drive-image?id={ID}` by
`src/lib/utils/imageUrl.ts` during normalization. Do not transform the URL manually in Sheets — store the raw shareable link as-is.

**Why proxy, not direct CDN URL:**
Google's "fife" CDN (lh3.googleusercontent.com) returns HTTP 429 when a browser
fires concurrent image requests (e.g., 6 cards loading at once). All direct Drive
URL formats are affected. The Next.js Route Handler at `src/app/api/drive-image/`
fetches Drive images server-side, bypassing the browser-origin rate limit.
Images are served with `Cache-Control: public, max-age=86400` for 24-hour browser caching.

---

# URL Rules

External links should:

* remain fully qualified
* use HTTPS
* point directly to content destinations

Examples:

* Instagram reel links
* Gumroad product links
* Medium article links
* Google Docs prompt links

---

# Frontend Data Contract Philosophy

Frontend components should:

* consume normalized data
* avoid spreadsheet-specific assumptions
* remain resilient to missing optional fields

The frontend should never:

* depend on column order
* depend on spreadsheet formatting
* directly parse spreadsheet structures

Always use:

# normalized API responses.

---

# Future Expansion Philosophy

Future content domains may include:

* YouTube videos
* YouTube shorts
* downloadable resources
* creator tools
* educational series

New content models should:

* follow existing naming conventions
* remain flat and normalized
* preserve operational simplicity

Avoid introducing:

* complex relational systems
* nested content trees
* CMS-heavy abstractions

---

# Content Constraint

The content model should always prioritize:

* maintainability
* clarity
* frontend consistency
* creator workflow efficiency
* lightweight architecture
* easy manual editing
