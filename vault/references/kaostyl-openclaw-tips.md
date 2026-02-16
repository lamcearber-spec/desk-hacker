# Kaostyl's OpenClaw Battle-Tested Patterns

> Source: https://x.com/kaostyl/status/2021856676551278845
> Saved: 2026-02-13

## Key Patterns

### 1. Memory Architecture Split
- `memory/active-tasks.md` → crash recovery "save game"
- `memory/YYYY-MM-DD.md` → daily raw logs
- Thematic long-term files → projects, people, etc.
- Agent loads only what it needs per session

### 2. Sub-Agents = 10x Multiplier
- Spawn 3-5 in parallel for big tasks
- Define clear success criteria BEFORE spawning
- Each agent validates its own work, then you verify

### 3. Cron > Heartbeats for Specific Tasks
- Heartbeats: batch periodic checks (email + calendar + mentions)
- Cron: precise schedules (daily content at 6am, research at 2am)
- Each cron runs in isolation — no token waste

### 4. Crash Recovery Pattern
- START task → write to active-tasks.md
- SPAWN sub-agent → note session key
- COMPLETE → update file
- On restart → read file first, resume autonomously

### 5. Security: Model Selection by Task
- External content (tweets, articles, emails) → Opus (strongest)
- Internal tasks (files, reminders, local) → Sonnet is fine
- Weaker models vulnerable to prompt injection from hostile sites

### 6. HEARTBEAT.md Should Be Tiny
- Under 20 lines, just a checklist
- Heavy work goes in cron jobs
- Runs every ~30min, burns tokens if bloated

### 7. Skill Routing Logic
- Add "Use when / Don't use when" to each skill description
- Without this, agent misfires ~20% picking wrong skill
