#!/bin/bash
# Supermemory CLI helper for agents
# Usage: supermemory.sh add "memory content" [tag]
# Usage: supermemory.sh search "query"

API_KEY=$(cat ~/.config/supermemory/api_key 2>/dev/null)
API_URL="https://api.supermemory.ai/v3"

if [ -z "$API_KEY" ]; then
  echo "ERROR: No API key found at ~/.config/supermemory/api_key"
  exit 1
fi

case "$1" in
  add)
    CONTENT="$2"
    TAG="${3:-clawdbot}"
    curl -sL -X POST "$API_URL/documents" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"$CONTENT\", \"containerTag\": \"$TAG\"}"
    ;;
  search)
    QUERY="$2"
    curl -sL -X POST "$API_URL/search" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"q\": \"$QUERY\"}"
    ;;
  *)
    echo "Usage: supermemory.sh add \"content\" [tag]"
    echo "       supermemory.sh search \"query\""
    ;;
esac
