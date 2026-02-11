# HEARTBEAT.md

## @ZeeContrarian1 Trade Monitoring (Priority during US market hours)
During US market hours (14:30-21:00 UTC / 9:30 AM-4 PM ET):
- Check @ZeeContrarian1's latest tweets using bird CLI
- Look for NEW trade signals (options, futures, stocks)
- If actionable trade found that we can replicate with ~€300:
  - Alert Arber immediately with: ticker, direction, entry, stop loss
  - Log in /life/areas/projects/ibkr-trading/trades.md
- Skip: commentary, complex ratio spreads, margin strategies

## Daily Ship Check (9 AM CET / 8 AM UTC)
If it's between 07:00-10:00 UTC and you haven't done the daily check today:
- Ask Arber: "What's shipping today?"
- Be direct — he asked for accountability pressure
- Log that you did the check in memory/heartbeat-state.json

## Periodic Checks (rotate, 2-4x daily during waking hours 08:00-22:00 CET)
- Email inbox (if configured)
- Calendar events (next 24-48h)
- App review progress (if in progress)

## Fact Extraction (every heartbeat)
After handling the above, extract durable facts from recent conversations:
1. Scan today's `memory/YYYY-MM-DD.md` for new info
2. Identify durable facts: relationships, status changes, milestones, decisions
3. Write to relevant entity's `items.json` in `/life/areas/`
4. Update `memory/heartbeat-state.json` with `lastFactExtraction` timestamp

**Focus on:** Relationships, status changes, milestones, key decisions
**Skip:** Casual chat, temporary info, routine tasks
