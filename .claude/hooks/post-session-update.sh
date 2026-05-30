#!/bin/bash
# Post-session reminder hook — Create with Anmol
# Fires at Stop to remind about analysis file updates

echo ""
echo "=== Session End Checklist ==="
echo ""
echo "Before ending this session, confirm these are updated:"
echo ""
echo "  .claude/analysis/session-handoff.md"
echo "    → What was implemented / fixed / reviewed?"
echo "    → What is the current project state?"
echo "    → What are the next steps?"
echo ""
echo "  .claude/analysis/debugging-log.md"
echo "    → Were any bugs fixed? Document root cause + fix."
echo ""
echo "  .claude/analysis/implementation-notes.md"
echo "    → Any non-obvious technical decisions made?"
echo "    → New gotchas or traps discovered?"
echo ""
echo "  .claude/analysis/lessons-learned.md"
echo "    → Any patterns to remember across sessions?"
echo ""

# Detect uncommitted analysis changes
ANALYSIS_CHANGES=$(git status --short 2>/dev/null | grep ".claude/analysis/" | awk '{print $2}' || echo "")

if [ -n "$ANALYSIS_CHANGES" ]; then
  echo "⚠️  UNCOMMITTED ANALYSIS CHANGES:"
  echo "$ANALYSIS_CHANGES" | while read -r f; do echo "   - $f"; done
  echo ""
  echo "   Commit with:"
  echo "   git add .claude/analysis/ && git commit -m 'docs: update analysis files'"
else
  echo "✅ Analysis files: no uncommitted changes"
fi

echo ""
echo "============================="
