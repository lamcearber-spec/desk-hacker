# MAX-LESSONS.md — Post-Review Learning Log

> JC adds entries here after each nightly review. Max reads this at session start.
> Each lesson is a specific, actionable rule derived from a real mistake.

---

## 2026-03-09
- When a cron runs on a quiet day (no main session), still log its outcome in `memory/YYYY-MM-DD.md` — the Mar 8 DATEV cron ran but nothing appears in the file, making it impossible to distinguish "ran clean" from "silently failed"
- Before appending to MAX-LESSONS.md, check if a section for today's date already exists — append new lessons INTO the existing section, not as a new duplicate header (Mar 8 had two separate `## 2026-03-08` sections which conflicts)
- Open loops don't close themselves — the Arsenal Polymarket bet research was requested on Mar 5 and sat unresolved for 5 days. Either act within 24h or explicitly abandon + remove from WORKING.md

## 2026-03-08
- Cron jobs do NOT source ~/.bashrc — env vars saved there (NOTTE_API_KEY, AGENTMAIL_API_KEY, etc.) are invisible to cron. Export them directly in `crontab -e` at the top (`NOTTE_API_KEY=xxx`) or at the start of each cron script (`export $(cat ~/.bashrc | grep KEY)`)
- After setting up a new cron job, verify it ran correctly at the NEXT scheduled time — the AgentMail inbox check has been failing silently since the cron was created (Mar 5) with no one noticing until the Mar 7 log
- Before running any script that touches production DB or user accounts, verify container names with `docker ps` first — never assume names match what's hardcoded in the script
- When a fix script fails partway through, STOP and assess damage before retrying — don't patch around errors inline when a real user account is involved
- Reviewer accounts are sacred — treat them like production data, not test fixtures

## 2026-03-07
- Always check vault/CLAUDE.md pricing table before quoting prices — MEMORY.md had stale pricing (€20/€50/€99) while the vault had current (€5/€15/€50)
- Update WORKING.md after every status change (Stripe resubmission, ad campaign launch, etc.) — don't leave it for later
- Write daily notes every day — gap since March 1 means JC has nothing to review
- When the flagship gets renamed (datev-bereit → konverter-pro), update ALL references across vault files, not just the obvious ones

## 2026-03-06
- Don't assume app count from memory — read roadmap.md first (portfolio grew from 9 to 13 apps)
- After resubmitting Stripe marketplace app, log the version number and date in both WORKING.md and the project summary
