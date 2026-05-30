---
name: reviewer
description: |
  Thorough code review workflow for the Create with Anmol project.
  Loads all project rules (frontend, backend, design system, architecture), diffs
  the current changes, and reports findings categorized as CRITICAL / HIGH / MEDIUM /
  LOW with exact file:line references. Supports --pr (full branch vs main), --fix
  (auto-apply fixable findings), and --comment (inline PR comment format).
  Use after feature implementation or before merging PRs.
---

# /reviewer — Code Review Workflow

Invoke with: `/reviewer [optional flags]`

**Flags:**
- No flags: review all staged + unstaged changes (`git diff HEAD`)
- `--staged`: review only staged changes (`git diff --staged`)
- `--pr`: review entire branch vs main (`git diff main...HEAD`)
- `--fix`: apply all CRITICAL and HIGH fixable findings automatically
- `--comment`: format output as structured PR review comments

---

## Workflow — Follow Every Step In Order

### Step 1: Get the Diff
```bash
# Default (no flags)
git diff HEAD

# --staged flag
git diff --staged

# --pr flag
git diff main...HEAD
```

If the diff is empty, report: "No changes found to review."

### Step 2: Load All Review Rules
Read ALL of these before analyzing the diff:
- `.claude/context/frontend-rules.md` — component rules, animation restrictions, mobile requirements
- `.claude/context/backend-rules.md` — API constraints, ISR rules, fetch patterns, caching
- `.claude/context/design-system.md` — glass utilities, typography classes, color tokens
- `.claude/context/architecture.md` — routing structure, rendering strategy, dependency rules

If changes touch the data layer, also read:
- `.claude/context/cms-schema.md` — column definitions (must not be renamed)
- `.claude/context/content-model.md` — data contracts (must remain stable)

### Step 3: Analyze the Diff

Review each changed file. Categorize every finding by severity:

---

#### CRITICAL — Must fix before merge
These block the PR:

**Security:**
- SSRF vulnerabilities (unvalidated external URLs in server-side fetch)
- XSS risks (unescaped user input rendered as HTML)
- Open redirects (unvalidated redirect targets)
- Path traversal in file operations
- Secrets or API keys committed to source code
- Input validation missing at API route boundaries (`/api/*` routes)

**Data integrity:**
- Breaking changes to CMS schema (renamed columns, reordered columns)
- Normalizer updated without updating schema, or vice versa
- Type `any` used to bypass schema enforcement

**Build correctness:**
- TypeScript errors (including `any` without explicit justification)
- Missing `'use client'` directive on client components
- Missing `export const revalidate` on ISR pages

---

#### HIGH — Should fix before merge
These significantly impact correctness or security:

**Runtime bugs:**
- Logic errors causing incorrect behavior at runtime
- Missing error handling on external API calls (Apps Script fetch, Drive proxy)
- Unhandled promise rejections in async server components

**Architecture violations:**
- Apps Script fetched from a client component (CORS blocked — must be server-side)
- `APPS_SCRIPT_URL` exposed as `NEXT_PUBLIC_` (env leak — must be server-side only)
- `output: 'export'` added to next.config.ts (breaks ISR)
- `useSearchParams()` used without `<Suspense>` boundary

**Caching issues:**
- ISR `revalidate` placed in `layout.tsx` instead of the page file
- Wrong revalidate value (should be 3600 for content pages)
- Missing `Cache-Control` headers on API routes that serve images/data

**Accessibility:**
- Interactive elements with no accessible label (missing `aria-label` + no visible text)
- Images with no `alt` attribute

---

#### MEDIUM — Fix when reasonable
These affect quality, consistency, or future maintainability:

**Performance:**
- Unnecessary client component where server component works
- Missing `revalidate` on new content pages
- Large images not going through the Drive proxy

**Design system violations:**
- Arbitrary font sizes instead of `.type-display-lg`, `.type-headline-md`, etc.
- Inline `backdrop-filter` instead of `.glass-card`, `.glass-nav`, `.glass-panel`
- Hard-coded colors instead of CSS design tokens
- Arbitrary spacing instead of spacing system variables

**Test coverage:**
- New user-visible UI with no Playwright test
- Interactive component (filter, search, menu) with no E2E test
- Missing `data-testid` on elements that need test selectors

**Mobile:**
- Missing mobile breakpoint (`md:`, `lg:` without base style)
- Fixed widths that break at 375px

---

#### LOW — Optional improvements
- Unused imports or variables
- Naming inconsistencies (camelCase vs PascalCase in wrong contexts)
- Commented-out code left in
- CSS specificity issues

#### INFO — Observations only
- Positive patterns worth noting
- Architectural consistency observations

---

### Step 4: Project-Specific Rules Checklist
Go through each item explicitly and mark ✅ or ❌:

```
[ ] next.config.ts: no `output: 'export'` present
[ ] APPS_SCRIPT_URL is NOT prefixed with NEXT_PUBLIC_
[ ] Apps Script is only fetched from server components or /api/ routes
[ ] ISR pages have `export const revalidate = 3600` (not in layout.tsx)
[ ] Client components have `'use client'` as the first line
[ ] `useSearchParams()` is in a Suspense-wrapped component
[ ] Google Drive images use /api/drive-image?id={ID} proxy (not direct lh3.googleusercontent.com)
[ ] No new npm packages added without visible justification
[ ] TypeScript strict — no unexplained `any` types
[ ] All new UI works at 375px viewport
[ ] Interactive elements have aria-label or visible text
[ ] Playwright test imports from 'playwright/test' (not '@playwright/test')
```

### Step 5: Report Findings

Format the report exactly as:

```
## Code Review Report — [date]

### Summary
- CRITICAL: X findings
- HIGH: X findings
- MEDIUM: X findings
- LOW: X findings

### Project Rules Checklist
[paste checklist from Step 4]

---

## Finding #1 — CRITICAL: [Short Title]
**File:** `src/path/to/file.tsx:42`
**Issue:** [Clear description of what is wrong]
**Why it matters:** [Impact — what breaks or fails]
**Recommendation:** [Exact fix or approach]

## Finding #2 — HIGH: [Short Title]
[same format]

[continue for all findings...]

---

### What Is Done Well
[1-3 positive observations]
```

### Step 6 (if --fix flag): Apply Fixes
For CRITICAL and HIGH findings that are clearly safe to auto-fix:
1. Apply the fix
2. Run `npm run build` to verify no regressions
3. Mark finding as `[FIXED]` in the report
4. Run `npx playwright test` to confirm tests still pass

### Step 7 (if --comment flag): Format for PR Comments
Format each finding as an inline review comment:
```
[file.tsx, line X]
**[SEVERITY]**: [title]
[issue description]
**Recommendation:** [specific fix]
```
