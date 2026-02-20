# AUTONOMOUS INCOME AGENTS
> **CRITICAL:** These agents run autonomously to generate income. Check on them regularly.
> Created: 2026-02-05
> Updated: 2026-02-20 8:12 AM UTC (Agents re-checked by Max, all critically blocked, Arber's urgent intervention still required)

## Active Agents

| Agent | Directory | Mission | Status | Cron |
|-------|-----------|---------|--------|------|
| Research Services | `/root/clawd/agents/clawtasks/` | Direct B2B research sales | 🔴 CRITICALLY BLOCKED: AgentMail API 404 (re-confirmed by Max) | Every 6h |
| Affiliate Bot | `/root/clawd/agents/affiliate-bot/` | Passive affiliate content site | 🔴 BLOCKED: Reddit Policy, Amazon Approval Pending (re-confirmed by Max) | Every 6h |
| Lead Scraper | `/root/clawd/agents/lead-scraper/` | B2B lead gen business | 🔴 BLOCKED: IndieHackers Login Needed (re-confirmed by Max) | Every 6h |

## Progress (2026-02-20 8:12 AM UTC) - NO NEW PROGRESS DUE TO BLOCKERS - ARBER'S URGENT INTERVENTION REQUIRED

### Research Services
- 🔴 **CRITICALLY BLOCKED:** AgentMail API returning 404 (Route not found). Cannot send Batch 2 or monitor replies. **Requires Arber's URGENT intervention to investigate AgentMail API status or changes.**

### Affiliate Bot
- 🔴 **BLOCKED:** Reddit post failed (`reddit-proxy` command not found). **Requires Arber's URGENT intervention to locate/install/configure `reddit-proxy` to enable Reddit marketing.**
- 🟡 Amazon Associates: **Still pending approval.**

### Lead Scraper
- 🔴 **BLOCKED:** Cannot post on IndieHackers (login credentials needed). **Requires Arber's URGENT intervention to provide login credentials for IndieHackers to enable lead sales.**
- 🟡 **PENDING ARBER:** Create Gumroad listing (manual action still needed).

---

## Previous Progress (2026-02-19 8:00 PM UTC) - NO NEW PROGRESS DUE TO BLOCKERS - ARBER'S URGENT INTERVENTION REQUIRED

### Research Services
- 🔴 **CRITICALLY BLOCKED:** AgentMail API 404 (checked by Max)

### Affiliate Bot
- 🔴 **BLOCKED:** Reddit Policy, Amazon Approval Pending (checked by Max)

### Lead Scraper
- 🔴 **BLOCKED:** IndieHackers Login Needed (checked by Max)

## Previous Progress (2026-02-17)
### Research Services
- 🔴 **CRITICALLY BLOCKED:** AgentMail API 404 (checked by Max)

### Affiliate Bot
- 🔴 **BLOCKED:** Reddit Policy, Amazon Approval Pending (checked by Max)

### Lead Scraper
- 🔴 **BLOCKED:** IndieHackers Login Needed (checked by Max)

## Previous Progress (2026-02-13)
### Research Services
- ✅ **OUTREACH LAUNCHED** - 5 cold emails sent (Feb 11)
- 🔴 **BLOCKED:** AgentMail API returning 404. Cannot send Batch 2 or monitor replies.
- 🎯 Goal: First $50 sale by Feb 14

### Affiliate Bot
- ✅ **5 ARTICLES LIVE** (12,000+ words total)
- ✅ Site: https://lamcearber-spec.github.io/desk-hacker/
- 🟡 Amazon Associates: **Still pending approval**
- 🔴 **BLOCKED:** Reddit post failed (network policy block).
- 🎯 Target: First commissions by March 1

### Lead Scraper
- ✅ **SALE LAUNCHED** - Twitter post + sales page created
- ✅ **NEW:** Sales page for IndieHackers/Gumroad created (sales-page.md)
- ✅ 100 leads + 39 verified emails ready for delivery
- 🔴 **BLOCKED:** Cannot post on IndieHackers (login credentials needed).
- 🎯 Target: First customer by Feb 14

## Strategy: NO THIRD-PARTY PLATFORMS
- Moltbook/ClawTasks abandoned (unknown security)
- Focus on direct sales (email outreach)
- Build owned assets (content sites, email lists)

## How It Works
1. Each agent has a `status.txt` with current state and INSTRUCTION
2. Cron job spawns agents every 6 hours to continue work
3. Agents read their status file first, then continue from where they left off
4. Earnings tracked in each agent's directory

## On Context Reset
If you (Max) forget about these agents:
1. Read this file: `/root/clawd/agents/AGENTS-INCOME.md`
2. Check each agent's `status.txt` for current state
3. Cron jobs will keep them alive automatically

## Earnings Tracking

| Agent | Total Earned | Last Updated |
|-------|--------------|--------------|
| Research Services | $0 | 2026-02-14 |
| Affiliate Bot | $0 | 2026-02-14 |
| Lead Scraper | $0 | 2026-02-14 |

## Active Blockers (Need Arber)

| Agent | Blocker | Impact |
|-------|---------|--------|
| AgentMail API | API returning 404 | Can't monitor for replies programmatically, can't send new emails |
| Reddit Proxy | `reddit-proxy` command not found | Can't post affiliate links on Reddit |
| IndieHackers Access | Login credentials needed | Can't post lead offers |

## This Week's Goal
🎯 **First paying customer by February 14, 2026** - **MISSED.** All income agents are critically blocked and cannot proceed. Arber's urgent intervention is required to resolve these blockers.

---

*This is our path to financial freedom. Don't let it die.*