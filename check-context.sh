#!/bin/bash

# Ensure Clawdbot CLI is in PATH
export PATH="$PATH:/usr/local/bin"

# Get session status
STATUS_JSON=$(/usr/bin/clawdbot session_status --json)
CURRENT_CONTEXT=$(echo "$STATUS_JSON" | jq -r '.output.context.current')
MAX_CONTEXT=$(echo "$STATUS_JSON" | jq -r '.output.context.max')

# Calculate percentage. bc -l for floating point arithmetic.
# Check if MAX_CONTEXT is non-zero to avoid division by zero.
if [ "$MAX_CONTEXT" -eq 0 ]; then
    echo "MAX_CONTEXT is zero, cannot calculate percentage."
    exit 1
fi

PERCENTAGE=$(awk "BEGIN {print $CURRENT_CONTEXT / $MAX_CONTEXT}")

# Compare percentage with 0.95 (95%)
if (( $(echo "$PERCENTAGE > 0.95" | bc -l) )); then
    echo "Context is at $(awk "BEGIN {printf "%.2f%%", $PERCENTAGE * 100}")%, taking screenshot..."

    SCREENSHOT_PATH="/root/clawd/context-screenshot.png"
    MEMORY_NOTE_PATH="/root/clawd/memory/session-screenshot.md"
    BROWSER_TARGET_ID="2159EB288C643905AE97DA7CB7B1E4C7"
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Take screenshot using the Python browser tool with the correct targetId
    /usr/bin/clawdbot browser act --profile clawd --target-id "$BROWSER_TARGET_ID" --request-json '{"kind": "screenshot", "fullPage": true, "path": "'"$SCREENSHOT_PATH"'"}'

    # Send message with screenshot to WhatsApp
    /usr/bin/clawdbot message send --to "+4917699742900" --message "CONTEXT WARNING: My context window is near full ($(awk "BEGIN {printf "%.2f%%", $PERCENTAGE * 100}"))%. Here's a screenshot of the current browser state." --media "$SCREENSHOT_PATH"

    # Write note to memory file
    /usr/bin/clawdbot write --path "$MEMORY_NOTE_PATH" --content "Latest context screenshot taken at $TIMESTAMP because context was at $(awk "BEGIN {printf "%.2f%%", $PERCENTAGE * 100}").
"
fi
