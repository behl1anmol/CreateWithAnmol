# Plan: Google Sheets CMS Setup + Apps Script Guide

## Context

Phase 1 frontend complete. All 5 pages implemented with mock data in `src/lib/data/mockData.ts`.
Phase 2 goal: replace mock data with Google Sheets + Apps Script backend.

User has created Google Sheet "createwithanmol" with 4 tabs: Prompts, Blogs, Features, Products.
"Features" tab must be renamed to "Featured" (schema contract, user confirmed).

This plan produces:
1. Detailed Google Sheets column header guide (exact headers, rationale, example values)
2. Complete Apps Script code (validated against frontend types)
3. Step-by-step deployment guide
4. Updated context files: `cms-schema.md`, `content-model.md`
5. New context file: `cms-appscript-reference.md`
6. Memory entry for future sessions
7. CLAUDE.md update to reference new context file

---

## Critical Finding: Schema ↔ Frontend Type Gaps

The existing `cms-schema.md` was drafted before full frontend implementation. Three tabs have fields missing from the schema that the frontend **already uses**:

| Tab | Field Missing from Schema | Source of Truth | Used In |
|-----|--------------------------|-----------------|---------|
| Prompts | `tool` | `types.ts:Prompt.tool` | prompts page — "Midjourney v6" pill labels |
| Products | `category`, `price`, `badge`, `specs` | `types.ts:Product` | products page — filter pills, price badge, specs row |
| Blogs | `date` | `types.ts:Blog.date` | blogs page — publication date display |

These fields are **not optional additions** — removing them would break visible UI. Schema must be updated to match types.

---

## Final Column Headers (All 4 Tabs)

### Tab: Prompts
Column order: `id | title | description | image | category | tool | reelLink | promptLink | featured | order`

| Column | Type | Required | Example | Rationale |
|--------|------|----------|---------|-----------|
| id | string | YES | `liquid-chrome-geometry` | Stable kebab-case ID; cross-referenced by Featured tab |
| title | string | YES | `Liquid Chrome Geometry` | Card headline |
| description | string | YES | `Generate hyper-realistic...` | Card body text, keep ≤180 chars |
| image | string | YES | `https://res.cloudinary.com/...` | Cloudinary thumbnail URL, used in card image |
| category | string | NO | `AI Visuals` | Filter pill on /prompts page |
| tool | string | NO | `Midjourney v6` | Tool badge on prompt card — NEW vs original schema |
| reelLink | string | NO | `https://www.instagram.com/reel/...` | "Watch Reel" CTA link |
| promptLink | string | YES | `https://gumroad.com/...` | "Get Prompt" CTA link |
| featured | boolean | NO | `TRUE` | Homepage featured section eligibility |
| order | number | NO | `1` | Display order; lower = first |

Valid category values: `AI Visuals`, `Cinematic Prompts`, `UI Design`, `Workflow Prompts`
Valid tool values: `Midjourney v6`, `Stable Diffusion`, `DALL-E 3`, `ChatGPT-4o`

---

### Tab: Products
Column order: `id | title | description | image | productLink | category | price | badge | specs | featured | order`

| Column | Type | Required | Example | Rationale |
|--------|------|----------|---------|-----------|
| id | string | YES | `obsidian-preset-pack` | Stable ID |
| title | string | YES | `The Obsidian Preset Pack` | Product card headline |
| description | string | YES | `A complete cinematic...` | Hero card full description; grid cards use truncated |
| image | string | YES | `https://res.cloudinary.com/...` | Product cover image |
| productLink | string | YES | `https://gumroad.com/l/...` | Buy link |
| category | string | NO | `Preset Packs` | Filter pill on /products page — NEW vs original schema |
| price | string | NO | `$129` | Price badge on card — NEW vs original schema |
| badge | string | NO | `Flagship · v2.4` | Premium label badge (featured hero only) — NEW |
| specs | string | NO | `52 Presets · Lightroom + Capture One` | Spec row below description — NEW |
| featured | boolean | NO | `TRUE` | If TRUE, rendered as full-width hero on /products |
| order | number | NO | `1` | Display order |

Valid category values: `Preset Packs`, `UI Kits`, `Typography`, `Soundscapes`, `Guides`
Note: Only one product should have `featured=TRUE` — it renders as the hero card.

---

### Tab: Blogs
Column order: `id | title | excerpt | image | articleLink | category | readTime | date | featured | order`

| Column | Type | Required | Example | Rationale |
|--------|------|----------|---------|-----------|
| id | string | YES | `designing-liquid-glass-rendering-engine` | Stable ID |
| title | string | YES | `Designing the Liquid Glass Rendering Engine` | Card headline |
| excerpt | string | YES | `Exploring the mathematical foundations...` | Card body text, keep ≤220 chars |
| image | string | YES | `https://res.cloudinary.com/...` | Blog thumbnail |
| articleLink | string | YES | `https://medium.com/@createwithanmol/...` | "Read Article" link |
| category | string | NO | `Architecture` | Filter pill on /blogs page |
| readTime | string | NO | `12 min read` | Read time badge on card |
| date | string | NO | `Oct 12, 2024` | Publication date — NEW vs original schema |
| featured | boolean | NO | `TRUE` | If TRUE, rendered as featured hero on /blogs |
| order | number | NO | `1` | Display order |

Valid category values: `Architecture`, `Infrastructure`, `Engineering`, `Design`, `Workflow`, `Philosophy`
Note: Only one blog should have `featured=TRUE` — it renders as horizontal hero split.

---

### Tab: Featured
Column order: `id | contentType | contentId | section | order`
**Rename "Features" → "Featured" in Google Sheets before using.**

| Column | Type | Required | Example | Rationale |
|--------|------|----------|---------|-----------|
| id | string | YES | `feat-prompt-1` | Stable orchestration row ID |
| contentType | string | YES | `prompt` | Type of referenced content |
| contentId | string | YES | `liquid-chrome-geometry` | Must match `id` in Prompts/Products/Blogs tab exactly |
| section | string | YES | `featured-prompts` | Homepage section this item appears in |
| order | number | YES | `1` | Position within the section |

Valid contentType values: `prompt`, `product`, `blog`
Valid section values: `featured-prompts`, `featured-products`, `featured-blogs`

---

## Apps Script

### Deployment Type
Bound script (Extensions → Apps Script from within the Google Sheet).
Uses `SpreadsheetApp.getActiveSpreadsheet()` — no hardcoded spreadsheet ID needed.
Deployed as Web App: Execute as "Me", Access "Anyone".

### Routing Strategy
`?path=` query parameter routing. Simple switch — no URL path parsing needed.
Frontend fetch: `APPS_SCRIPT_URL?path=prompts`

### Complete Script (Code.gs)

```javascript
/**
 * Create with Anmol — Google Sheets CMS API
 * Bound Apps Script for "createwithanmol" Google Sheet.
 *
 * Deploy as: Web App → Execute as Me → Anyone can access
 *
 * Routes:
 *   ?path=prompts   → Prompts tab
 *   ?path=products  → Products tab
 *   ?path=blogs     → Blogs tab
 *   ?path=featured  → Featured tab
 *
 * Response envelope: { data: [...] } or { data: [], error: "..." }
 */

function doGet(e) {
  const path = e && e.parameter && e.parameter.path;

  try {
    switch (path) {
      case 'prompts':  return respond({ data: getSheetRows('Prompts') });
      case 'products': return respond({ data: getSheetRows('Products') });
      case 'blogs':    return respond({ data: getSheetRows('Blogs') });
      case 'featured': return respond({ data: getSheetRows('Featured') });
      default:
        return respond({ data: [], error: 'Unknown path: ' + path });
    }
  } catch (err) {
    return respond({ data: [], error: err.message });
  }
}

/**
 * Reads all data rows from a named sheet tab.
 * Row 1 = column headers (must match field names exactly).
 * Rows without an 'id' value are skipped (empty rows, comment rows).
 * Returns rows sorted ascending by 'order' field.
 *
 * Field normalization:
 *   - TRUE/FALSE strings (and boolean values) → JS boolean
 *   - 'order' column → JS number
 *   - Empty cells → field omitted entirely (keeps response clean)
 *   - All other values → trimmed string
 */
function getSheetRows(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    throw new Error('Tab not found: "' + tabName + '". Verify tab name in Google Sheets.');
  }

  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length < 2) return []; // Header-only or empty sheet

  const headers = values[0].map(function(h) { return String(h).trim(); });
  const dataRows = values.slice(1);
  const idIndex = headers.indexOf('id');

  var rows = [];

  for (var r = 0; r < dataRows.length; r++) {
    var row = dataRows[r];

    // Skip rows with empty id (blank rows, separator rows, comment rows)
    var idVal = idIndex >= 0 ? String(row[idIndex] || '').trim() : '';
    if (!idVal) continue;

    var obj = {};

    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      if (!header) continue; // Skip unnamed columns

      var raw = row[i];

      // Omit empty cells — preserves optional field semantics
      if (raw === '' || raw === null || raw === undefined) continue;

      // Boolean normalization (Sheets stores as boolean or 'TRUE'/'FALSE' string)
      if (raw === true || raw === 'TRUE') {
        obj[header] = true;
        continue;
      }
      if (raw === false || raw === 'FALSE') {
        obj[header] = false;
        continue;
      }

      // Numeric normalization for 'order' only
      if (header === 'order') {
        var n = Number(raw);
        obj[header] = isNaN(n) ? 999 : n;
        continue;
      }

      obj[header] = String(raw).trim();
    }

    rows.push(obj);
  }

  // Sort ascending by order; rows without order field go last
  rows.sort(function(a, b) {
    return (a.order !== undefined ? a.order : 999) - (b.order !== undefined ? b.order : 999);
  });

  return rows;
}

/**
 * Wraps payload in ContentService JSON response.
 * Note: Fetch this URL from Next.js server components only (build time / ISR).
 * Server-to-server requests bypass browser CORS restrictions.
 */
function respond(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Files to Create/Update

### CREATE: `.claude/context/cms-appscript-reference.md`
Contains:
- Final column headers for all 4 tabs (verbatim from plan)
- Complete Apps Script code
- Deployment URL format
- Fetch URL format
- CORS note (server-side only)

### UPDATE: `.claude/context/cms-schema.md`
Add missing columns to each tab definition:
- Prompts: add `tool` column between `category` and `reelLink`
- Products: add `category`, `price`, `badge`, `specs` columns after `productLink`
- Blogs: add `date` column between `readTime` and `featured`

### UPDATE: `.claude/context/content-model.md`
Match schema changes — add field rows for `tool`, `date`, `category`, `price`, `badge`, `specs`.

### UPDATE: `.claude/CLAUDE.md`
Add `cms-appscript-reference.md` entry to Context Hierarchy section.

### CREATE: Memory file
`/home/anmol/.claude/projects/-mnt-stuff-WebstormProjects-CreateWithAnmol/memory/project_gsheets_appscript.md`

---

## Validation Checklist

Before marking complete:
- [ ] All column headers in guide match `src/lib/types.ts` field names exactly (case-sensitive)
- [ ] `tool` field present in Prompts columns — renders as badge in `/prompts` page
- [ ] `category`, `price`, `badge`, `specs` present in Products columns — used by featured hero + filter pills
- [ ] `date` present in Blogs columns — rendered as publication date
- [ ] `Featured` tab (not `Features`) documented with rename instruction
- [ ] Apps Script `getSheetRows` reads by header name not column index
- [ ] Boolean normalization handles both native boolean and `'TRUE'`/`'FALSE'` string forms
- [ ] `order` field normalized to number type
- [ ] Empty cells omitted from response objects (optional fields stay optional)
- [ ] `respond()` returns `ContentService` JSON
- [ ] Guide includes deployment step: "Execute as Me, Anyone can access"
- [ ] Guide notes: fetch from server components only (no client-side fetch → no CORS issue)
- [ ] cms-schema.md updated with all new fields
- [ ] content-model.md updated with all new fields
- [ ] CLAUDE.md references `cms-appscript-reference.md`
- [ ] Memory file written

---

## Execution Order

1. Create `.claude/context/cms-appscript-reference.md` (full guide + script)
2. Update `.claude/context/cms-schema.md` (add missing fields)
3. Update `.claude/context/content-model.md` (add missing fields)
4. Update `.claude/CLAUDE.md` (add context reference)
5. Write memory file + update MEMORY.md
