# Debugging Log

## Session: 2026-05-24 — Phase 1 Foundation Bootstrap

### Issue: pnpm not installed
**Symptom:** `pnpm: command not found`
**Fix:** Used npm (v11.12.1) instead. Plan referenced pnpm but npm is the available package manager. Project works fine with npm.
**Resolution:** Added `"packageManager": "npm"` note in session-handoff.

### Issue: Playwright CLI screenshot command fails
**Symptom:** `Error: Protocol error (Page.captureScreenshot): Unable to capture screenshot` when using `npx playwright screenshot`
**Fix:** Used Playwright Node.js API directly with explicit `executablePath`. Download location: `/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell`
**Command that works:**
```js
const browser = await chromium.launch({
  executablePath: '/home/anmol/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
```

### Issue: tsconfig.json modified by Next.js dev server
**Symptom:** Next.js auto-updated tsconfig.json: changed `jsx: "preserve"` to `jsx: "react-jsx"` and added `.next/dev/types/**/*.ts` to include.
**Status:** Expected behavior — Next.js correctly updates tsconfig for App Router compatibility. Not a bug.

### Issue: `pkill -f "next dev"` returns exit code 144
**Symptom:** `pkill` exits with 144 (signals mismatch or process not found as expected)
**Fix:** Use `kill $(lsof -ti:3000)` instead for reliable port-based process termination.
