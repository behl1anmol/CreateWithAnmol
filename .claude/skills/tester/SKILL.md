# /tester — Playwright E2E Testing Workflow

Invoke with: `/tester [optional flags]`

**Flags:**
- No flags: run all existing tests and report results
- `--spec <filename>`: run a specific spec file (e.g., `--spec search`)
- `--write <feature>`: write new Playwright tests for a named feature
- `--coverage`: audit test coverage, identify gaps, write missing tests
- `--debug`: run in headed mode with verbose output

---

## Environment — Critical Setup

```
Package:    playwright  (NOT @playwright/test — project has 'playwright' not '@playwright/test')
Import:     import { test, expect } from 'playwright/test'
Config:     playwright.config.ts
Tests dir:  e2e/
Base URL:   http://localhost:3000
Browser:    Chromium only (single project in config)
Dev server: Auto-started by webServer in playwright.config.ts
```

**This is the most common mistake:** importing from `@playwright/test` causes module-not-found errors. Always use `playwright/test`.

---

## Workflow — Follow Steps In Order

### Step 1: Assess Scope
Read existing tests to understand current coverage:
- `e2e/search.spec.ts` — 12 tests (search navigation, query, results, empty state, mobile/desktop)
- `e2e/social-icons.spec.ts` — 4 tests (icon visibility, hover effects, link targets)

For `--coverage` flag: map all implemented features to test files, identify gaps.
For `--write` flag: identify user flows and edge cases before writing any tests.

### Step 2: Run Tests

```bash
# All tests
npx playwright test

# Specific spec file
npx playwright test e2e/search.spec.ts

# With verbose line output
npx playwright test --reporter=list

# Headed mode (visible browser — for debugging)
npx playwright test --headed
```

### Step 3: Diagnose Failures
For each failing test:

1. Read the exact error message and stack trace
2. Determine: is this a **test bug** or a **code bug**?
   - Test bug: selector is stale, assertion is wrong, UI changed intentionally
   - Code bug: the feature is actually broken (regression)
3. **If code bug:** report the regression — do NOT silently fix code to pass tests
4. **If test bug:** update the test to match current correct behavior

**Selector priority (most stable → least stable):**
1. `data-testid="..."` — add to component if not present
2. `role="..."` with `name` — semantic
3. `aria-label="..."` — accessible
4. Visible text content — acceptable for stable strings
5. CSS class or tag — avoid (breaks on refactors)

**Timing patterns for this project:**
- Search debounce: wait 350ms after typing before asserting results
- ISR pages in dev: no ISR delay (dev server bypasses cache)
- Network settling: `page.waitForLoadState('networkidle')` for CMS-fetched content

### Step 4: Write New Tests (for --write or --coverage flags)

**File placement:**
- `e2e/search.spec.ts` — search feature tests
- `e2e/social-icons.spec.ts` — social platform tests
- `e2e/<feature-name>.spec.ts` — new feature tests

**Standard test structure:**
```typescript
import { test, expect } from 'playwright/test'

test.describe('[Feature Name]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path')
    await page.waitForLoadState('networkidle')
  })

  test('desktop: [behavior description]', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    // Arrange: navigate or set up state
    // Act: perform the user action
    // Assert: verify outcome
    await expect(page.locator('[data-testid="element"]')).toBeVisible()
  })

  test('mobile: [behavior description]', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    // Same flow at mobile viewport
  })
})
```

**Test coverage priorities (in order):**
1. Page loads without JavaScript errors (`page.on('pageerror', ...)`)
2. Navigation between pages works
3. Interactive elements function correctly (filters, search, menus, buttons)
4. Content renders (at least 1 card/item visible on content pages)
5. Error states handled gracefully (empty search, network error fallback)
6. Mobile layout not broken (nav, content, footer visible at 390px)

**Adding `data-testid` attributes:**
If a component needs a test selector and doesn't have `data-testid`, add it:
```tsx
<button data-testid="hamburger-menu" onClick={...}>
```
This is a non-breaking addition — add it directly to the component file.

### Step 5: Report Results

```
## Test Results — [date]

### Run Summary
- Total: X tests
- Passed: ✅ X
- Failed: ❌ X
- Skipped: ⏭ X

### Failing Tests
#1 [Test name] (e2e/file.spec.ts:LINE)
   Error: [exact error message]
   Type: CODE BUG / STALE TEST
   Diagnosis: [what's actually wrong]
   Fix required: [description of what needs to change]

### New Tests Written (if applicable)
- e2e/[file].spec.ts — [X tests covering Y feature]
  - Test: [name of each new test]

### Coverage Gaps (if --coverage flag)
- [feature name]: [specific scenarios that should be tested]
```

### Step 6: Update Analysis
Append test results to `.claude/analysis/session-handoff.md`:
```
### Playwright Results — [date]
Tests: X passing / Y failing
New tests: [names]
Coverage gaps found: [list or "none"]
```

---

## Constraints
- Never modify code to make tests pass if the code behavior is actually wrong
- Never delete failing tests — diagnose the root cause
- Keep test files focused: one feature per spec file
- Do not test implementation details — test user-visible behavior only
- All new test files must have `import { test, expect } from 'playwright/test'` (not `@playwright/test`)
