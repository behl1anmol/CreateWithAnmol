# CMS Apps Script Reference — Create with Anmol

## Purpose

Operational reference for:
- Google Sheets tab structure + column headers
- Google Apps Script deployment guide (step-by-step)
- Complete Apps Script source code

Use this file before:
- Setting up Google Sheets tabs
- Deploying or updating Apps Script
- Implementing Phase 2 frontend fetch layer

This file is the **authoritative source of truth** for CMS backend setup.
It extends `cms-schema.md` with implementation-ready detail.

---

## Google Sheets Structure

Spreadsheet name: **createwithanmol**
Total tabs: 4

```
Prompts
Products
Blogs
Featured
```

> **Important:** Tab named "Features" must be renamed to "Featured" before use.
> Apps Script references tab names by exact string — a mismatch throws a runtime error.

---

## Tab: Prompts

Purpose: AI prompt packs, Instagram-linked prompt content.

### Column Headers (Row 1, exact spelling, exact order)

```
id | title | description | image | category | tool | reelLink | promptLink | featured | order
```

### Field Reference

| Column | Type | Required | Constraint | Example Value |
|--------|------|----------|------------|---------------|
| id | string | YES | kebab-case, stable, no spaces | `liquid-chrome-geometry` |
| title | string | YES | Card headline, ≤60 chars ideal | `Liquid Chrome Geometry` |
| description | string | YES | Card body text, ≤180 chars | `Generate hyper-realistic 3D primitive shapes with liquid chrome materials.` |
| image | string | YES | Full HTTPS URL, Cloudinary preferred | `https://res.cloudinary.com/...` |
| category | string | NO | See valid values below | `AI Visuals` |
| tool | string | NO | AI tool name used for this prompt | `Midjourney v6` |
| reelLink | string | NO | Full Instagram reel URL | `https://www.instagram.com/reel/ABC123/` |
| promptLink | string | YES | Full URL to prompt file | `https://gumroad.com/l/xyz` |
| featured | boolean | NO | `TRUE` or `FALSE` (caps) | `TRUE` |
| order | number | NO | Integer, lower = appears first | `1` |

### Valid category Values
```
AI Visuals
Cinematic Prompts
UI Design
Workflow Prompts
```

### Valid tool Values
```
Midjourney v6
Stable Diffusion
DALL-E 3
ChatGPT-4o
```

### Notes
- `reelLink` is optional — not all prompts have an Instagram reel
- `featured=TRUE` makes a prompt eligible for the homepage Featured section (controlled by Featured tab)
- Leave `reelLink` cell empty if no reel exists — do not put placeholder URLs

---

## Tab: Products

Purpose: Gumroad digital products for sale.

### Column Headers (Row 1, exact spelling, exact order)

```
id | title | description | image | productLink | category | price | badge | specs | featured | order
```

### Field Reference

| Column | Type | Required | Constraint | Example Value |
|--------|------|----------|------------|---------------|
| id | string | YES | kebab-case, stable | `obsidian-preset-pack` |
| title | string | YES | ≤60 chars | `The Obsidian Preset Pack` |
| description | string | YES | Hero: full paragraph OK. Grid: ≤200 chars | `A complete cinematic color-grading system built for AI-generated imagery.` |
| image | string | YES | Full HTTPS URL | `https://res.cloudinary.com/...` |
| productLink | string | YES | Gumroad product URL | `https://gumroad.com/l/abc` |
| category | string | NO | See valid values below | `Preset Packs` |
| price | string | NO | Price with $ symbol | `$129` |
| badge | string | NO | Featured hero badge label | `Flagship · v2.4` |
| specs | string | NO | Spec row, use `·` as separator | `52 Presets · Lightroom + Capture One · Instant Download` |
| featured | boolean | NO | Only ONE product should be TRUE | `TRUE` |
| order | number | NO | Integer | `1` |

### Valid category Values
```
Preset Packs
UI Kits
Typography
Soundscapes
Guides
```

### Notes
- Only one product should have `featured=TRUE` — the featured product renders as a full-width hero on `/products`
- `badge` and `specs` only render in the featured hero layout — leave empty for non-featured products
- `price` renders as an overlay badge on the card image — use consistent format `$XX` or `$XX.XX`

---

## Tab: Blogs

Purpose: Medium article metadata for discovery.

### Column Headers (Row 1, exact spelling, exact order)

```
id | title | excerpt | image | articleLink | category | readTime | date | featured | order
```

### Field Reference

| Column | Type | Required | Constraint | Example Value |
|--------|------|----------|------------|---------------|
| id | string | YES | kebab-case, stable | `designing-liquid-glass-rendering-engine` |
| title | string | YES | Article headline, ≤80 chars | `Designing the Liquid Glass Rendering Engine` |
| excerpt | string | YES | Card summary, ≤220 chars | `Exploring the mathematical foundations and shader optimization techniques...` |
| image | string | YES | Full HTTPS URL, Cloudinary preferred | `https://res.cloudinary.com/...` |
| articleLink | string | YES | Full Medium article URL | `https://medium.com/@createwithanmol/article-slug` |
| category | string | NO | See valid values below | `Architecture` |
| readTime | string | NO | Estimated read time | `12 min read` |
| date | string | NO | Publication date, human-readable | `Oct 12, 2024` |
| featured | boolean | NO | Only ONE blog should be TRUE | `TRUE` |
| order | number | NO | Integer, lower = first | `1` |

### Valid category Values
```
Architecture
Infrastructure
Engineering
Design
Workflow
Philosophy
```

### Notes
- Only one blog should have `featured=TRUE` — renders as horizontal editorial hero on `/blogs`
- `date` format: `MMM DD, YYYY` (e.g., `Oct 12, 2024`) — matches frontend display
- `readTime` format: `N min read` — consistent with Medium display convention

---

## Tab: Featured

Purpose: Controls which items appear in homepage featured sections.
This is a junction/orchestration table — it references IDs from other tabs.

> **Rename "Features" → "Featured"** in Google Sheets tab settings before populating.

### Column Headers (Row 1, exact spelling, exact order)

```
id | contentType | contentId | section | order
```

### Field Reference

| Column | Type | Required | Constraint | Example Value |
|--------|------|----------|------------|---------------|
| id | string | YES | Stable orchestration ID | `feat-prompt-1` |
| contentType | string | YES | One of three values | `prompt` |
| contentId | string | YES | Must exactly match `id` in referenced tab | `liquid-chrome-geometry` |
| section | string | YES | Homepage section identifier | `featured-prompts` |
| order | number | YES | Position within section | `1` |

### Valid contentType Values
```
prompt
product
blog
```

### Valid section Values
```
featured-prompts
featured-products
featured-blogs
```

### Example Data

| id | contentType | contentId | section | order |
|----|-------------|-----------|---------|-------|
| feat-prompt-1 | prompt | liquid-chrome-geometry | featured-prompts | 1 |
| feat-prompt-2 | prompt | hyper-real-lighting-prompts | featured-prompts | 2 |
| feat-product-1 | product | obsidian-preset-pack | featured-products | 1 |
| feat-product-2 | product | liquid-glass-ui-kit | featured-products | 2 |
| feat-blog-1 | blog | designing-liquid-glass-rendering-engine | featured-blogs | 1 |
| feat-blog-2 | blog | scaling-distributed-ai-workloads | featured-blogs | 2 |

### Notes
- `contentId` must match the `id` column in Prompts/Products/Blogs exactly — case-sensitive
- Add multiple rows per section to control how many items appear in each homepage section
- Changing order here changes homepage order without any code changes

---

## Apps Script Setup Guide

### Overview

Apps Script runs server-side inside Google's infrastructure.
It reads the Google Sheet and exposes normalized JSON endpoints.
The Next.js fetch layer calls these endpoints at build time (server-to-server — no CORS issue).

### Step 1: Open Apps Script Editor

1. Open the "createwithanmol" Google Sheet
2. Click **Extensions** in the top menu
3. Click **Apps Script**
4. The Apps Script editor opens in a new tab

### Step 2: Replace Default Code

1. In the editor, you will see a file called `Code.gs` with a default empty function
2. **Select all** existing code (Ctrl+A / Cmd+A) and **delete it**
3. Paste the complete script from the next section
4. Click the **Save** button (disk icon) or press Ctrl+S / Cmd+S
5. Name the project `createwithanmol-cms` when prompted

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in the fields:
   - **Description:** `CMS API v1`
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Click **Authorize access** when prompted
6. Follow the Google authorization flow (grant permission to access the spreadsheet)
7. After authorization, the deployment URL appears — **copy it immediately**

The URL format looks like:
```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```

### Step 4: Store the URL

Add to your Next.js project root as `.env.local` (local dev only — never commit this file):
```
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> **No `NEXT_PUBLIC_` prefix.** The URL is only consumed server-side at build time.
> `NEXT_PUBLIC_*` embeds values into the client JS bundle — unnecessary and leaky here.

**Production (Cloudflare Pages):**
1. Cloudflare Dashboard → Pages → your project → Settings → Environment Variables
2. Add: `APPS_SCRIPT_URL` = your script URL
3. Set environment to `Production` (and `Preview` if needed)
4. Cloudflare injects it into `npm run build` — Next.js picks it up at build time

`.env.local` is in `.gitignore` by default — never pushed to GitHub.
Cloudflare dashboard is the only place the production value lives.

### Step 5: Test the Endpoints

Open each URL in a browser to verify:

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=prompts
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=products
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=blogs
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?path=featured
```

Expected response shape:
```json
{
  "data": [
    {
      "id": "liquid-chrome-geometry",
      "title": "Liquid Chrome Geometry",
      "category": "AI Visuals",
      ...
    }
  ]
}
```

If a tab is empty (only headers, no data rows), response is `{ "data": [] }`.

### Step 6: Redeploy After Script Changes

If you modify the script code later:
1. Click **Deploy** → **Manage deployments**
2. Click the pencil (edit) icon on the active deployment
3. Change **Version** to **New version**
4. Click **Deploy**

> **Important:** You must create a new version to deploy script changes.
> Editing and saving the script alone does NOT update the live endpoint.

---

## Complete Apps Script Code

Paste this entire block into `Code.gs` (replace all existing code):

```javascript
/**
 * Create with Anmol — Google Sheets CMS API
 * Bound Apps Script for "createwithanmol" Google Sheet.
 *
 * Deploy as: Web App → Execute as Me → Anyone can access
 *
 * Routes (via ?path= query parameter):
 *   ?path=prompts   → Prompts tab data
 *   ?path=products  → Products tab data
 *   ?path=blogs     → Blogs tab data
 *   ?path=featured  → Featured tab data
 *
 * Response envelope: { data: [...] }
 * Error response:    { data: [], error: "message" }
 */

function doGet(e) {
  var path = e && e.parameter && e.parameter.path;

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
 *
 * Behavior:
 * - Row 1 must contain column headers matching field names exactly (case-sensitive)
 * - Rows where the 'id' column is empty are skipped (blank rows, note rows)
 * - Returned rows are sorted ascending by 'order' field
 *
 * Normalization applied:
 * - TRUE / 'TRUE' → boolean true
 * - FALSE / 'FALSE' → boolean false
 * - 'order' column value → JavaScript number
 * - Empty cells → field omitted from output object (keeps optional fields optional)
 * - All other values → trimmed string
 */
function getSheetRows(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    throw new Error('Tab not found: "' + tabName + '". Check tab name in Google Sheets (case-sensitive).');
  }

  var range = sheet.getDataRange();
  var values = range.getValues();

  if (values.length < 2) return []; // Header row only — no data

  var headers = values[0].map(function(h) { return String(h).trim(); });
  var dataRows = values.slice(1);
  var idIndex = headers.indexOf('id');

  var rows = [];

  for (var r = 0; r < dataRows.length; r++) {
    var row = dataRows[r];

    // Skip rows without an id value (blank rows, separator rows, comment rows)
    var idVal = idIndex >= 0 ? String(row[idIndex] || '').trim() : '';
    if (!idVal) continue;

    var obj = {};

    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      if (!header) continue; // Skip columns with no header name

      var raw = row[i];

      // Omit empty cells — preserves optional field semantics on the frontend
      if (raw === '' || raw === null || raw === undefined) continue;

      // Boolean normalization
      // Google Sheets checkbox cells come in as native booleans.
      // Manually typed TRUE/FALSE come in as strings.
      if (raw === true || raw === 'TRUE') {
        obj[header] = true;
        continue;
      }
      if (raw === false || raw === 'FALSE') {
        obj[header] = false;
        continue;
      }

      // Numeric normalization for 'order' field only
      if (header === 'order') {
        var n = Number(raw);
        obj[header] = isNaN(n) ? 999 : n;
        continue;
      }

      // Default: trimmed string
      obj[header] = String(raw).trim();
    }

    rows.push(obj);
  }

  // Sort ascending by order field. Rows without order field sorted to end.
  rows.sort(function(a, b) {
    var aOrder = a.order !== undefined ? a.order : 999;
    var bOrder = b.order !== undefined ? b.order : 999;
    return aOrder - bOrder;
  });

  return rows;
}

/**
 * Wraps a payload object in a ContentService JSON response.
 *
 * CORS note: Fetch this endpoint from Next.js server components only
 * (at build time or via ISR). Server-to-server requests bypass browser
 * CORS restrictions. Do NOT fetch from client-side JavaScript / useEffect.
 */
function respond(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## CORS Note

Apps Script `ContentService` does not set `Access-Control-Allow-Origin` headers.
Browser-initiated `fetch()` calls will be blocked by CORS in most scenarios.

**Solution:** Always fetch Apps Script from server-side Next.js code:
- In server components (default in Next.js App Router)
- At build time via `generateStaticParams` or equivalent
- Via ISR with `revalidate`

Server-to-server HTTP calls do not go through browser CORS checks.
Phase 2 uses `@cloudflare/next-on-pages` which enables server-side rendering —
fetch lives in server components, not client components.

---

## Troubleshooting

### "Tab not found" error
Cause: Tab name in Apps Script doesn't match actual tab name in Google Sheets.
Fix: Check for exact casing — `Prompts` not `prompts`, `Featured` not `Features`.

### Response shows `{ data: [] }` but sheet has data
Cause: All data rows have empty `id` column.
Fix: Ensure every content row has a value in column A (`id`).

### Changes to script not reflected in API response
Cause: Modified script was saved but not redeployed with a new version.
Fix: Deploy → Manage deployments → Edit → New version → Deploy.

### Authorization popup during deployment
Cause: First-time deploy requires permission to access the spreadsheet.
Fix: Click "Authorize access", follow Google OAuth flow, grant all requested permissions.
The script only accesses the spreadsheet it is bound to — no external access.
