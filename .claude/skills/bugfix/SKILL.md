# /bugfix — Bug Fix Workflow

Invoke with: `/bugfix [description of the bug]`

If the description is vague, ask for:
1. What is the symptom? (what does the user see vs what they expect)
2. Which page or component is affected?
3. Is it reproducible? (always / sometimes / only in production)
4. When did it start? (after which change or deploy)

---

## Workflow — Follow Every Step In Order

### Step 1: Read Debugging History
Before touching any code:
```
.claude/analysis/debugging-log.md     ← has this exact bug been seen before?
.claude/analysis/session-handoff.md   ← last 30 lines: what changed recently?
.claude/analysis/lessons-learned.md  ← known patterns and project-specific traps
```

If the bug is already documented in debugging-log.md, check if the fix was applied correctly.

### Step 2: Reproduce the Bug
- Identify the exact file(s) involved based on the symptom
- Read the relevant source code in full
- Trace the data flow: where does the bug originate, how does it propagate to the symptom?
- If it's a runtime error: check the browser console output and server logs
- If it's a build error: run `npm run build` to see the full TypeScript error

### Step 3: Root Cause Analysis
Document your findings with numbered entries — do not skip this step:

```
1. Symptom: [what the user observes]
2. Entry point: [the first file/function where the problem begins]
3. Root cause: [the actual bug — not a downstream symptom]
4. Mechanism: [why this root cause produces the observed symptom]
5. Scope: [are there other places where the same pattern could cause bugs?]
```

Do not start writing the fix until you have completed all 5 points.

### Step 4: Write a Fix Plan
Create `.claude/plans/bugfix-{kebab-case-description}-{YYYY-MM-DD}.md`:
- Root cause (copy from Step 3)
- Proposed fix (exact minimal change — one sentence description)
- Risk assessment (what could the fix break?)
- How to verify the fix works

### Step 5: Implement the Fix

**Minimal change principle:**
- Apply only what is required to fix the root cause
- Do not refactor, reformat, or improve surrounding code
- Do not change APIs, interfaces, or data schemas unless the bug is in them
- Do not add new npm dependencies to fix a bug

**TypeScript rules:**
- Never use `any` as an escape hatch — fix the actual type
- Never use `@ts-ignore` or `@ts-expect-error` without documenting why
- If a type definition is wrong, fix the type definition

**Known project-specific bugs to check:**
- Google Drive images returning 429 → ensure using `/api/drive-image?id={ID}` proxy, not direct `lh3.googleusercontent.com`
- `useSearchParams()` without Suspense → Next.js build error — wrap in `<Suspense>` in parent `page.tsx`
- LinkedIn icon missing → use `FaLinkedin` from `react-icons/fa6` (not from `/si`)
- Apps Script CORS → cannot fetch from client components, only from server components or API routes
- ISR stale cache in dev → `revalidate: 0` during development (check `process.env.NODE_ENV`)
- `output: 'export'` re-added → breaks ISR and `@opennextjs/cloudflare` — must not be in next.config.ts

### Step 6: Verify the Fix
```bash
npm run build    # Must pass with zero TypeScript errors
npx playwright test  # All tests must pass
```

If the bug was user-visible, write a Playwright regression test:
- The test should describe the scenario that was broken
- It must pass after the fix
- Add it to the most appropriate `e2e/` spec file
- Import from `playwright/test` (not `@playwright/test`)

### Step 7: Document the Fix
Append to `.claude/analysis/debugging-log.md`:
```
## Bug: [short description] — [date]
**Symptom:** [what the user saw]
**Root cause:** [actual cause with file:line reference]
**Fix:** [what was changed and why — be specific]
**Files modified:** [list of files]
**Regression test:** [test name in e2e/file.spec.ts — or "none — not user-visible"]
```

Append to `.claude/analysis/session-handoff.md`:
```
## Session: [date] — Bug Fix: [description]
[summary of bug, root cause, fix applied, verification status]
```

---

## Quality Gates — Bug Fix is NOT Complete Until All Pass
- [ ] Root cause analysis documented (5 points)
- [ ] Plan file written in `.claude/plans/`
- [ ] Fix is minimal (no unrelated refactoring)
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] All existing Playwright tests pass
- [ ] Regression test written for user-visible bugs
- [ ] Debugging log updated

---

## Constraints
- Never use `--no-verify` or skip TypeScript validation
- Never suppress errors with `any` or `@ts-ignore` — fix the actual issue
- Never introduce workarounds that mask the root cause
- Never fix tests to hide code bugs — fix the code, update tests only if UI changed intentionally
