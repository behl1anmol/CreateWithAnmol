# /feature — Feature Development Workflow

Invoke with: `/feature [description of feature to build]`

If no argument is provided, ask: "What feature would you like to implement? Please describe it clearly, including which page or area it affects."

---

## Workflow — Follow Every Step In Order

### Step 1: Orient with Current State
Read before touching any code:
```
.claude/analysis/session-handoff.md   ← last 50 lines: current project state
.claude/context/implementation-phases.md  ← confirm feature is Phase 1 or 2 (not future)
```

If the feature touches Phase 3 functionality, stop and inform the user.

### Step 2: Load Relevant Context Files
Read the files relevant to the feature type:

**Frontend UI features** (new page, component, layout):
- `.claude/context/design-system.md` — colors, typography, glass utilities, spacing
- `.claude/context/frontend-rules.md` — component rules, performance constraints
- `.claude/context/design.md` — finalized page layout specs

**Backend / API features** (new route, data fetching, CMS):
- `.claude/context/backend-rules.md` — API constraints, ISR rules, fetch patterns
- `.claude/context/architecture.md` — routing, rendering strategy, data flow
- `.claude/context/content-model.md` — data schemas, field definitions

**CMS / data schema features**:
- `.claude/context/cms-schema.md` — column definitions, tab structure
- `.claude/context/cms-appscript-reference.md` — Apps Script source, deploy guide

### Step 3: Write a Feature Plan
Create a plan file at `.claude/plans/feature-{kebab-case-name}-{YYYY-MM-DD}.md`.

Include:
- Feature description and user-facing purpose
- Files to create (explicit paths)
- Files to modify (explicit paths + what changes)
- Numbered implementation steps
- Risks and constraints (what could break)
- Testing approach (what Playwright tests to write)

Do not start coding until the plan is written.

### Step 4: Implement the Feature

**Architecture rules (non-negotiable):**
- Server components by default — `'use client'` only when state or browser effects are required
- ISR pages: `export const revalidate = 3600` in the page file (never in `layout.tsx`)
- API routes: server-side only fetch (Apps Script has no CORS — browser fetch will fail)
- Never add `output: 'export'` — project uses `@opennextjs/cloudflare`

**Frontend rules:**
- Glass effects: `.glass-card`, `.glass-nav`, `.glass-panel` (never inline `backdrop-filter`)
- Typography: `.type-display-lg`, `.type-headline-md`, `.type-body-lg`, `.type-label-caps`, `.type-mono-technical`
- Filter pills: `.pill-filter` and `.pill-filter.active`
- Container: `max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)]`
- Mobile-first: all UI must function at 375px viewport width
- No WebGL, Three.js, Framer Motion, GSAP, or particle systems
- CSS transitions only (`transition-all duration-300` pattern)

**TypeScript rules:**
- Strict mode — no `any` types without explicit justification
- All props must be typed
- Async data fetching: use existing `fetchFromCMS<T>()` pattern from `src/lib/api/client.ts`

**Dependency rules:**
- Do not add npm packages without checking if existing packages cover the need
- `react-icons` v5 is available: `SiX` from `react-icons/si`, `FaX` from `react-icons/fa6`
- Note: LinkedIn is NOT in `react-icons/si` v5 — use `FaLinkedin` from `react-icons/fa6`

**Known gotchas:**
- `useSearchParams()` requires a `<Suspense>` wrapper in the parent server component
- CSS custom property in style prop needs cast: `style={{ '--brand': color } as CSSProperties}`
- Tailwind v4 CSS var hover: `hover:text-(--brand)` syntax (not `hover:text-[var(--brand)]`)
- Playwright imports: `from 'playwright/test'` (not `@playwright/test`)

### Step 5: Validate Build
```bash
npm run build
```
- Zero TypeScript errors required before proceeding
- If errors exist, fix them all — do not proceed to tests with a broken build

### Step 6: Run Tests
```bash
npx playwright test
```
- All existing tests must pass
- If tests fail, diagnose: is it the test (stale selector) or the code (regression)?
- Fix code regressions — update stale tests only if UI changed intentionally

### Step 7: Write New Tests (if UI was added)
Add Playwright tests to `e2e/` for any new user-visible UI:
- Test the golden path (feature works correctly)
- Test at desktop viewport (1440×900) and mobile (390×844)
- Use `data-testid` attributes — add them to components if not present
- Import from `playwright/test` (not `@playwright/test`)

### Step 8: Update Analysis Files
Append to `.claude/analysis/session-handoff.md`:
```
## Session: [date] — [Feature Name]

### What Was Implemented
[description]

### Files Created
- path/to/file.tsx

### Files Modified
- path/to/file.tsx — [what changed]

### Verification Status
- npm run build: PASS
- Playwright: X/Y tests passing

### Technical Notes
[any non-obvious decisions]
```

Append to `.claude/analysis/implementation-notes.md` if any non-obvious technical decisions were made.

---

## Quality Gates — Feature is NOT Complete Until All Pass
- [ ] Plan file written in `.claude/plans/`
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] All existing Playwright tests pass
- [ ] New UI has Playwright test coverage (if applicable)
- [ ] Analysis files updated with session summary
