#!/bin/bash
# Health check script for DatevBereit services
# Alerts Arber via file flag that Max picks up on heartbeat

SERVICES=("datev-web" "datev-api")
API_URL="http://127.0.0.1:8001/docs"
WEB_URL="http://127.0.0.1:3001"
ALERT_FILE="/tmp/datev-health-alert"
SENT_FILE="/tmp/health-alert-sent"

check_failed=false
failures=""

# Check systemd services
for service in "${SERVICES[@]}"; do
    if ! systemctl is-active --quiet "$service"; then
        check_failed=true
        failures+="- $service is DOWN\n"
    fi
done

# Check API responds (200 expected)
api_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null)
if [ "$api_code" != "200" ]; then
    check_failed=true
    failures+="- API not responding (got $api_code)\n"
fi

# Check Web responds (307 redirect is OK, means it's working)
web_code=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL" 2>/dev/null)
if [ "$web_code" != "307" ] && [ "$web_code" != "200" ]; then
    check_failed=true
    failures+="- Web not responding (got $web_code)\n"
fi

if $check_failed; then
    # Write alert for Max to pick up on heartbeat
    if [ ! -f "$SENT_FILE" ]; then
        echo -e "🚨 HEALTH CHECK FAILED:\n$failures" > "$ALERT_FILE"
        touch "$SENT_FILE"
    fi
    echo -e "❌ Health check failed:\n$failures"
    exit 1
else
    # Clear alert files if everything OK
    rm -f "$ALERT_FILE" "$SENT_FILE"
    echo "✅ All services healthy"
    exit 0
fi
