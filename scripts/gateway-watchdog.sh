#!/bin/bash
# OpenClaw Gateway Watchdog
# Checks if gateway is responding, restarts if down, notifies on Discord

set -euo pipefail

LOG_FILE="/var/log/openclaw-watchdog.log"
GATEWAY_URL="http://127.0.0.1:18789"
DISCORD_CHANNEL="1468957292006347031"  # #general
MAX_RETRIES=3
RETRY_DELAY=5

log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"
}

check_gateway() {
    # Try RPC probe similar to 'openclaw gateway status'
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$GATEWAY_URL" 2>/dev/null) || response="000"
    
    if [[ "$response" == "200" || "$response" == "101" || "$response" == "426" ]]; then
        return 0
    fi
    
    # Double-check with process
    if systemctl --user is-active --quiet openclaw-gateway.service 2>/dev/null; then
        # Service active but not responding - might be stuck
        return 1
    fi
    
    return 1
}

restart_gateway() {
    log "Restarting OpenClaw gateway..."
    
    # Kill any zombie chrome processes that might block restart
    pkill -9 -f "chrome_crashpad" 2>/dev/null || true
    
    # Restart the service
    systemctl --user restart openclaw-gateway.service
    
    # Wait for it to come up
    sleep 10
    
    # Verify it's running
    if check_gateway; then
        log "Gateway restarted successfully"
        return 0
    else
        log "Gateway failed to restart properly"
        return 1
    fi
}

send_notification() {
    local message="$1"
    local status="$2"
    
    # Use openclaw's message tool via CLI
    if command -v openclaw &>/dev/null; then
        openclaw message send \
            --channel discord \
            --to "$DISCORD_CHANNEL" \
            --message "$message" 2>/dev/null || true
    fi
    
    log "Notification sent: $message"
}

main() {
    log "Watchdog check starting..."
    
    if check_gateway; then
        log "Gateway is healthy ✓"
        exit 0
    fi
    
    log "Gateway not responding! Attempting recovery..."
    
    local attempt=1
    while [[ $attempt -le $MAX_RETRIES ]]; do
        log "Restart attempt $attempt/$MAX_RETRIES"
        
        if restart_gateway; then
            send_notification "🔄 **Gateway Watchdog:** OpenClaw gateway was down and has been automatically restarted. (Attempt $attempt)" "recovered"
            exit 0
        fi
        
        ((attempt++))
        sleep $RETRY_DELAY
    done
    
    # All retries failed
    send_notification "🚨 **Gateway Watchdog:** OpenClaw gateway is DOWN and failed to restart after $MAX_RETRIES attempts. Manual intervention needed!" "failed"
    log "CRITICAL: Gateway restart failed after $MAX_RETRIES attempts"
    exit 1
}

main "$@"
