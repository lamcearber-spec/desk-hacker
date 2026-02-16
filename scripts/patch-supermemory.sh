#!/bin/bash
# Patch Supermemory plugin to run alongside memory-core
# Re-run this after `openclaw plugins update`

PLUGIN_DIR="$HOME/.openclaw/extensions/openclaw-supermemory"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo "Supermemory plugin not found at $PLUGIN_DIR"
    exit 1
fi

echo "Patching Supermemory plugin..."

# Patch openclaw.plugin.json - remove kind field
if grep -q '"kind"' "$PLUGIN_DIR/openclaw.plugin.json" 2>/dev/null; then
    cp "$PLUGIN_DIR/openclaw.plugin.json" "$PLUGIN_DIR/openclaw.plugin.json.backup"
    cat "$PLUGIN_DIR/openclaw.plugin.json" | jq 'del(.kind)' > /tmp/plugin.json && mv /tmp/plugin.json "$PLUGIN_DIR/openclaw.plugin.json"
    echo "✓ Patched openclaw.plugin.json"
else
    echo "○ openclaw.plugin.json already patched"
fi

# Patch index.ts - comment out kind line
if grep -q 'kind: "memory" as const' "$PLUGIN_DIR/index.ts" 2>/dev/null; then
    cp "$PLUGIN_DIR/index.ts" "$PLUGIN_DIR/index.ts.backup"
    sed -i 's/kind: "memory" as const,/\/\/ kind removed to run alongside memory-core/' "$PLUGIN_DIR/index.ts"
    echo "✓ Patched index.ts"
else
    echo "○ index.ts already patched"
fi

echo "Done! Restart gateway: openclaw gateway restart"
