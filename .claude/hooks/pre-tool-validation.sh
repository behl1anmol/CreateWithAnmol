#!/bin/bash
# Pre-tool validation hook — Create with Anmol
# Fires before every Bash tool call
# Warns on destructive patterns — never blocks (always exits 0)

# Read JSON input from stdin
INPUT=$(cat 2>/dev/null || echo "{}")

# Extract command field (best-effort — fails silently if jq unavailable)
COMMAND=""
if command -v python3 &>/dev/null; then
  COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null)
elif command -v jq &>/dev/null; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)
fi

[ -z "$COMMAND" ] && exit 0

# Destructive patterns — warn but do not block
DESTRUCTIVE_PATTERNS=(
  "git push --force"
  "git push -f "
  "git reset --hard"
  "rm -rf"
  "git clean -f"
  "git checkout -- "
  "git restore ."
  "git branch -D"
  "truncate "
  "DROP TABLE"
  "DELETE FROM"
)

for pattern in "${DESTRUCTIVE_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiF "$pattern"; then
    echo "⚠️  PRE-TOOL WARNING: Destructive pattern detected: '$pattern'"
    echo "   Full command: $COMMAND"
    echo "   Ensure this is intentional — this action may be hard to reverse."
    break
  fi
done

# Secret exposure patterns — warn if secrets might be printed to output
SECRET_PATTERNS=(
  "echo.*APPS_SCRIPT_URL"
  "cat.*\.env"
  "cat.*\.dev\.vars"
  "printenv.*TOKEN"
  "printenv.*SECRET"
  "printenv.*KEY"
  "printenv.*PASSWORD"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "⚠️  PRE-TOOL WARNING: Command may expose sensitive environment variables."
    echo "   Pattern matched: $pattern"
    echo "   Ensure no secrets are being written to logs, output, or committed files."
    break
  fi
done

# Project-specific dangerous patterns
if echo "$COMMAND" | grep -qE "npm install.*--save\b" && echo "$COMMAND" | grep -qvE "npm install (playwright|typescript|tailwindcss|next|react)"; then
  echo "ℹ️  PRE-TOOL NOTE: Installing a new npm package."
  echo "   Verify this dependency is necessary — see .claude/context/frontend-rules.md"
fi

# Always allow — this hook warns only
exit 0
