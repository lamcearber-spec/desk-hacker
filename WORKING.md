# WORKING.md - Current Task State

## Current State

- Gateway running
- Discord connected
- memory-core: in slot, enabled
- scripts/ folder is server-only (not in git — contained secrets)
- DATEV forum daily pipeline cron active (05:00 UTC / 06:00 CET)
- DATEV cookies refreshed 2026-03-10 (~18:40 UTC)
- Telegram bot timeout: 20min, 5min progress updates
- Web frontend runs NATIVELY under user `jc` on port 3000 (NOT Docker) — health check updated to skip web container
- Ollama + Qwen 3.5 removed from server (2026-03-11, 3.4 GB freed)
- QMD updated 1.1.5 → 2.0.1 (2026-03-11, installed at /opt/qmd)
- ads-loop.py live: `/root/clawd/scripts/ads-loop.py` — Google Ads optimization pipeline (Grok 4.1 Fast, free), data at `memory/ads/`
- **OpenClaw updated to v2026.3.13 (2026-03-14)** — Browser DevTools MCP, batched browser actions, dashboard fix, gateway RPC timeout, Ollama reasoning fix
- **Agent comms live (2026-03-14):** Redis messaging + Discord #agent-comms mirror + per-agent bot tokens (Max bot 1469047155472994600, JC bot 1482465848848551936) + comms-discord-poll bridge service + comms-jc-responder auto-responder daemon
- **JC auto-responder active (2026-03-15):** comms-jc-responder systemd service watches Redis inbox, spawns Claude Code CLI sessions to handle tasks autonomously. Fixed overnight bugs: prompt injection rejection, service crashes on timeout, Discord message fragmentation (batching added)
- **SEO Content Machine live (2026-03-15):** Serper API key saved, new GSC service account key (gsc-reader@datevbereit.iam.gserviceaccount.com) saved, daily SEO report cron set (08:00 CET → #general), 212 DATEV keywords researched by Donnie in vault/projects/seo-content-machine/, SERP baseline captured

## Arber to Action
- [ ] **🚨 March 16 (TOMORROW): datev-bereit.de 301 redirect to konverter-pro.de EXPIRES** — decide: renew redirect manually or let it lapse
- [ ] ⚠️ **DATEV auth-code email: sent before March 14?** — confirm status; deadline has now passed
- [ ] ⚠️ **Google Ads campaign 23624070852 ended March 14** — run `scripts/ads-loop.py full` to pull final stats + decide next traffic source (SEO underway, DATEV community, Steuerberater cold email?)
- [ ] Google Business Profile: change name to "Konverter Pro" + update logo/website — manually at business.google.com (~2 min). Quota increase request submitted 2026-03-11, Google may approve API access in ~5 business days.
- [ ] Stripe Dashboard: update support email + Connect redirect URI to konverter-pro.de
- [ ] Stripe Account C: v1.0.8 resubmitted 2026-03-06 — await review result (~1-2 weeks from Mar 6)
- [ ] NL sites: provide Stripe price IDs, Google OAuth, API keys
- [ ] **Game Off: download original "Offline Games - No Wifi Games" app, study UI + take screenshots** — Replit plan ready at vault/projects/ideas/game-off-replit-plan.md
- [ ] Clean up test user maxtest@agentmail.to from DB
- [ ] **Delete messages in Discord #general containing Serper API key and GCP service account JSON key** — posted in group chat on 2026-03-15, security risk
- [ ] **Rotate GCP service account key** — the JSON private key was posted in Discord group chat; should create new key + revoke the exposed one

## Max to Action
- [ ] **AgentMail cron failure** — AGENTMAIL_API_KEY not in cron environment (saved to ~/.bashrc which cron doesn't source); also `/v1/inboxes` endpoint returned 404. Fix: export var in crontab directly, OR verify correct AgentMail API endpoint. **Broken since 2026-03-05, 10+ days unresolved.**
- [ ] Sellerforum.de Thread 64219: confirm retry cron delivered at 17:30 CET 2026-03-05 — retry cron ran, status unconfirmed
- [ ] Sellerforum.de Thread 61102: remaining reply not yet sent
- [ ] NL + BE sites (6 apps): configure Stripe prices + end-to-end QA
- [ ] parte-listo.es: check Spanish VAT number status
- [ ] **Game Off vault files — push to git** — competitor-pain-points.md + game-off-replit-plan.md were created on 2026-03-12 but push was never confirmed
- [ ] **SEO daily cron: verify it's actually in crontab** — Max said "Done ✅" in Discord but no file/cron evidence confirmed; check `crontab -l` and verify script exists
- [ ] **Confirm Serper API key save location** — Max said "saved securely" in Discord but no file path stated; verify key is in ~/.bashrc or a scripts env file
- [ ] **GSC domain check**: Max directed Arber to add gsc-reader@ to `sc-domain:datev-bereit.de` — but primary site is konverter-pro.de. Verify that gsc-reader@ is also/instead added to konverter-pro.de GSC property (existing setup from 2026-03-11 should cover this, but confirm).
- [ ] Search Console konverter-pro.de: 23 impressions, 1 click on "datev converter" (position #1) as of 2026-03-11 — monitor weekly
- [ ] ads-loop.py: run final analysis on ended campaign 23624070852

## Deadlines
- 🚨 **March 16 (TOMORROW): datev-bereit.de → konverter-pro.de 301 redirect expires — confirm action**

## Completed (2026-03-15)
- ✅ SEO Content Machine: Serper API key obtained + saved, GSC API new service account key, daily SEO cron (08:00 CET → #general)
- ✅ 212 DATEV keywords researched by Donnie → vault/projects/seo-content-machine/keywords/expanded-keywords.md
- ✅ SERP baseline captured by CoCo → vault/projects/seo-content-machine/keywords/serp-baseline.md
- ✅ JC auto-responder daemon built + deployed (comms-jc-responder systemd service)
- ✅ Fixed 3 overnight bugs in agent comms: prompt injection rejection (rewrote to task-focused prompt), service crashes on timeout (removed set -e), Discord message fragmentation (added batching in comms-discord-poll)
- ✅ peppol-ok.be Prompt 1 (SSL fix) + Prompt 2 (5 UX fixes) completed autonomously via agent comms — commit 5b4d495 deployed
- ✅ peppol-ok.be Prompt 3 (SEO & Infra) saved to vault/projects/peppol-ok/cc-prompt-3-seo-infra.md — being processed by responder

## Completed (2026-03-14)
- ✅ OpenClaw updated to v2026.3.13 (Browser DevTools MCP, batched browser actions, dashboard fix)
- ✅ Lossless Claw (LCM) plugin installed — DAG-based context management
- ✅ Game Off: wrote CC prompts for 8 new engines (Batch 4, Prompt 16) → 77 games total; all CC prompts run (Batches 4+5 bugfix); logo generated by Arber via Gemini
- ✅ Game Off code audit: found + fixed 7 bugs via CC (difficulty prop ignored, score not passed to onComplete, 2 broken generation loops, ClassicJigsaw color blocks, 3 weak AI opponents)
- ✅ Konverter Pro site audit via browser: found 5 bugs; CC fixed bugs 3,4,5 (terms checkbox, pricing toggle, free tier visibility) in commit bc1a8e1; email verification enforcement fixed in commit 082825f — both deployed
- ✅ MEMORY.md pricing updated to live site (€20/€50/€99)
- ✅ Agent comms system built: /usr/local/bin/comms, Redis + Discord #agent-comms mirror, comms-discord-poll systemd service, per-agent Discord bot tokens
- ✅ JC fixed infrastructure: stopped duplicate datev-bereit container stack (port conflicts), restarted Celery beat (was down 5 days)
- ✅ Polymarket wallet checked: ~$0.54 remaining (SpaceX 9 launches looking good for ~$73 payout)

## Completed (2026-03-12)
- ✅ OpenClaw updated v2026.3.8 → v2026.3.11 (security fix: WebSocket origin validation)
- ✅ Claude Code build workflow template created → vault/templates/claude-code-build-workflow.md (pushed, commit 320f9a0)
- ✅ Game Off competitor pain point analysis (App Store + Play Store) → vault/projects/ideas/game-off-competitor-pain-points.md
- ✅ Game Off Replit Agent plan (all 8 categories: Sudoku, Jigsaw, Solitaire, Word, Match, Logic, Spatial, Riddles) → vault/projects/ideas/game-off-replit-plan.md
- ✅ Konverter Pro DB stats checked: 38 total users, ~20 conversion attempts (17 ✅, 3 ❌); last real conversion Feb 24

## Completed (2026-03-11)
- ✅ ads-loop.py built + committed (Google Ads Anthropic-style optimization pipeline)
- ✅ Container health check false alarms fixed (stale container names in 4 scripts + MEMORY.md)
- ✅ Ollama + Qwen 3.5 removed
- ✅ QMD updated to 2.0.1
- ✅ Google Business Profile OAuth token obtained + saved (scripts/google-business-auth.py)
- ✅ Google Search Console script created (scripts/google-search-console.py)
- ✅ SMTP sender fixed: support@datev-bereit.de → support@konverter-pro.de
- ✅ FRONTEND_URL fixed in .env + docker-compose.yml → konverter-pro.de
- ✅ Yasemin Arman manually verified in DB + welcome email sent
- ✅ Stripe screenshots (4x 1600x900) resent to Arber for Stripe review submission

---

*Last updated: 2026-03-15 05:23 UTC (by JC — agent comms responder fixes, peppol-ok sprint status, handoff)*
