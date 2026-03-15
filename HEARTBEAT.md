# HEARTBEAT.md

## On Every Heartbeat
1. **Check agent comms:** `export COMMS_AGENT=max && comms read` — handle any messages from other agents
2. Read `memory/active-tasks.md` — resume anything incomplete
3. Check if daily memory file exists, create if not

## Periodic Checks (rotate, 2-4x daily, 08:00-22:00 CET)
- Email inbox (if configured)
- Calendar events (next 24-48h)

## Fact Extraction (every heartbeat)
- Scan today's `memory/YYYY-MM-DD.md` for durable facts
- Write to relevant entity in `/root/clawd/vault/`
- Update `memory/heartbeat-state.json` with timestamps

## Daily Ship Check (08:00-10:00 UTC)
- Ask Arber: "What's shipping today?"

## Log Monitoring
- Check `/var/log/datev-errors.log` for recent errors
- If errors found, investigate and report to Arber
- Check `/var/log/uptime-monitor.log` for any FAIL entries

## Rules
- Late night (23:00-08:00 CET): HEARTBEAT_OK unless urgent
- Nothing new since last check: HEARTBEAT_OK
- Heavy work → use cron jobs, not heartbeats
