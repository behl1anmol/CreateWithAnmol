#!/bin/bash
# Session initialization hook — Create with Anmol
# Fires at SessionStart to orient Claude with project context

echo "=== Create with Anmol — Session Start ==="
echo ""

# Current branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "Branch: $BRANCH"
echo ""

# Recent commits (last 5)
echo "Recent commits:"
git log --oneline -5 2>/dev/null || echo "  (git log unavailable)"
echo ""

# Working tree status
STATUS=$(git status --short 2>/dev/null)
if [ -n "$STATUS" ]; then
  echo "Working tree (modified files):"
  echo "$STATUS"
else
  echo "Working tree: clean"
fi
echo ""

# Warn if analysis files have uncommitted changes (common oversight)
ANALYSIS_DIRTY=$(git status --short 2>/dev/null | grep ".claude/analysis/" || echo "")
if [ -n "$ANALYSIS_DIRTY" ]; then
  echo "⚠️  Uncommitted analysis file changes detected:"
  echo "$ANALYSIS_DIRTY"
  echo "   Consider: git add .claude/analysis/ && git commit -m 'docs: update analysis files'"
  echo ""
fi

# Runtime environment
NODE_VER=$(node -v 2>/dev/null || echo "not found")
NPM_VER=$(npm -v 2>/dev/null || echo "not found")
echo "Runtime: Node $NODE_VER | npm $NPM_VER"
echo ""

# Quick reference
echo "Context files:  .claude/context/"
echo "Analysis:       .claude/analysis/session-handoff.md"
echo "Plans:          .claude/plans/"
echo ""
echo "Slash commands: /feature  /bugfix  /reviewer  /tester"
echo "Agents:         feature-agent  bugfix-agent  reviewer-agent  tester-agent  orchestrator-agent"
echo ""
echo "Build:  npm run build"
echo "Tests:  npx playwright test"
echo "Dev:    npm run dev"
echo "============================================"
