#!/bin/bash
# Hook: PostToolUse — fires after Write/Edit/MultiEdit
# Purpose: ensure uk.json and en.json have identical top-level keys
# Claude Code passes tool info as JSON on stdin

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run on file writes
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "MultiEdit" ]]; then
  exit 0
fi

# Only run when an i18n file was touched
if [[ "$FILE_PATH" != *"messages/uk.json"* && "$FILE_PATH" != *"messages/en.json"* ]]; then
  exit 0
fi

UK_FILE="apps/web/messages/uk.json"
EN_FILE="apps/web/messages/en.json"

if [[ ! -f "$UK_FILE" || ! -f "$EN_FILE" ]]; then
  exit 0
fi

UK_KEYS=$(node -e "const f=require('./${UK_FILE}'); console.log(Object.keys(f).sort().join('\n'))")
EN_KEYS=$(node -e "const f=require('./${EN_FILE}'); console.log(Object.keys(f).sort().join('\n'))")

if [[ "$UK_KEYS" != "$EN_KEYS" ]]; then
  echo "I18N PARITY ERROR: uk.json and en.json have different top-level keys." >&2
  echo "" >&2
  echo "uk.json keys:  $(echo "$UK_KEYS" | tr '\n' ' ')" >&2
  echo "en.json keys:  $(echo "$EN_KEYS" | tr '\n' ' ')" >&2
  echo "" >&2
  echo "Both files must have identical top-level sections. Add the missing key to the other file." >&2
  exit 1
fi

exit 0
