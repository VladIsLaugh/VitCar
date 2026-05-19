#!/bin/bash
# Hook: PreToolUse — fires before Bash commands
# Purpose: block destructive DB operations when DATABASE_URL points to a remote Railway host
# Claude Code passes tool info as JSON on stdin

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept bash commands
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

# Patterns that indicate a destructive database operation
DANGEROUS_PATTERNS=(
  "prisma migrate reset"
  "prisma db push --force"
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    DB_URL="${DATABASE_URL:-}"
    if [[ "$DB_URL" == *"railway.app"* ]] || [[ "$DB_URL" == *"railway.internal"* ]]; then
      echo "BLOCKED: Destructive database command against a REMOTE database." >&2
      echo "" >&2
      echo "Command:      $COMMAND" >&2
      echo "DATABASE_URL: points to Railway (non-local)" >&2
      echo "" >&2
      echo "This operation is only allowed against localhost. Switch to local Docker DB first." >&2
      exit 1
    fi
  fi
done

exit 0
