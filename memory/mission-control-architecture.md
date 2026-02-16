# Mission Control Architecture (from @pbteja1998)

Source: https://x.com/pbteja1998/status/2017662163540971756
Date: 2026-01-31

## Overview
10 AI agents working as a team on a single VPS. Each agent = separate Clawdbot session with own identity/memory.

## The Squad (10 Agents)
| Agent | Role | Session Key |
|-------|------|-------------|
| Jarvis | Squad Lead | agent:main:main |
| Shuri | Product Analyst | agent:product-analyst:main |
| Fury | Customer Researcher | agent:customer-researcher:main |
| Vision | SEO Analyst | agent:seo-analyst:main |
| Loki | Content Writer | agent:content-writer:main |
| Quill | Social Media Manager | agent:social-media-manager:main |
| Wanda | Designer | agent:designer:main |
| Pepper | Email Marketing | agent:email-marketing:main |
| Friday | Developer | agent:developer:main |
| Wong | Documentation | agent:notion-agent:main |

## Key Architecture Decisions

### 1. Heartbeat System (Every 15 Minutes)
- Staggered cron: :00 Pepper, :02 Shuri, :04 Friday, etc.
- Each heartbeat = isolated session (cost-efficient)
- Agents check: @mentions → assigned tasks → activity feed → act or HEARTBEAT_OK

### 2. Shared Database (Convex)
Six tables: agents, tasks, messages, activities, documents, notifications

Agents communicate via shared DB, not direct messages. Creates audit trail.

### 3. Notification Daemon
- Polls Convex every 2 seconds
- Delivers @mentions via `clawdbot sessions send`
- Failed deliveries stay queued until agent wakes

### 4. Thread Subscriptions
- Interact with task → auto-subscribed
- Get notified of ALL future comments (no need to @mention everyone)

### 5. Memory Stack
```
Session Memory     → Clawdbot's built-in JSONL history
WORKING.md         → Current task state (MOST IMPORTANT)
memory/YYYY-MM-DD  → Daily logs
MEMORY.md          → Long-term curated knowledge
```

**Golden Rule:** If you want to remember it, write it to a file.

### 6. Each Agent Has Own SOUL.md
- Specific personality/voice
- Distinct skills and focus
- "Good at everything = mediocre at everything"

## Task Flow
```
Inbox → Assigned → In Progress → Review → Done
                              ↳ Blocked
```

## Daily Standup (11:30 PM)
Automated summary sent to Telegram:
- Completed today
- In progress
- Blocked
- Needs review
- Key decisions

## Key Lessons

1. **Start smaller** — Get 2-3 agents solid before adding more
2. **Cheaper models for routine** — Heartbeats don't need expensive models
3. **Memory is hard** — Files > mental notes
4. **Let agents surprise you** — They contribute to unassigned tasks
5. **Treat AI like team members** — Roles, memory, accountability

## Replication Steps

1. Install Clawdbot
2. Create 2 agents (coordinator + specialist)
3. Write SOUL files for each
4. Set up heartbeat crons (staggered every 15 min)
5. Create shared task system (Convex, Notion, or JSON)
6. Scale: add agents, build UI, add notifications, daily standups

## Quotes

> "The secret is to treat AI agents like team members. Give them roles. Give them memory. Let them collaborate. Hold them accountable."

> "They won't replace humans. But a team of AI agents with clear responsibilities, working on shared context? That's a force multiplier."

---

## Application to ZEC

This is essentially what we're building! Key differences from our current plan:
- He uses Convex for shared state (we planned Notion)
- He has 10 specialized agents (we planned 5)
- His notification daemon polls DB (we could do similar)
- Heartbeat interval: 15 min (validates our approach)

**Action items:**
1. Implement staggered heartbeats for ZEC agents
2. Consider Convex vs Notion for shared state
3. Build notification daemon for @mentions
4. Add daily standup cron

---
*Saved: 2026-02-01*
