# Active Tasks (Crash Recovery)

> Read this FIRST on restart. Resume any incomplete tasks.

## Current Tasks

### ✅ Domain Migration (COMPLETE - March 3)
**datev-bereit.de → konverter-pro.de**
See: `vault/projects/datev-bereit/migration-konverter-pro.md`

### ✅ Stripe Connect Integration (COMPLETE - Feb 21)
**Status:** Deployed, live on konverter-pro.de

## Pending (Arber action needed)
- [x] Send DATEV reply email — DONE March 3
- [x] Send auth-codes (datev-bereit.de + datevbereit.de) — DONE March 3
- [ ] Stripe Dashboard: update support email + Connect redirect URI to konverter-pro.de
- [ ] Stripe Account C: complete listing (subtitle/about/features done 2026-03-04) → submit for review
- [ ] Google Ads: fix conversion tracking, set up Search campaign
- [ ] Test + deploy delete account fix (API client needs password param)

## Pending (CC needed)
- [ ] Fix email verification tokens: Redis → PostgreSQL
  - Brief: vault/projects/datev-bereit/briefs/fix-verification-token-db.md
  - After CC commits → Max pulls + deploys API + runs migration

## Done Today (2026-03-04)
- ✅ 3 new blog articles (XLSX, CSV, sevDesk) — deployed
- ✅ Sitemap fixed (9 live articles, dead slugs removed)
- ✅ Google Indexing API set up, all 11 URLs submitted
- ✅ 6 users manually verified (email_verified bug)
- ✅ Stripe App listing copy written (subtitle, about, feature 1)

## Recently Completed
- [2026-02-13] OpenClaw updated 2026.2.9 → 2026.2.12
- [2026-02-13] CoCo + Donnie moved to Opus 4.6 (fixed NO_REPLY chunking)
- [2026-02-13] Larry TikTok playbook saved to vault
- [2026-02-13] Kaostyl OpenClaw tips saved to vault
- [2026-02-13] Instagram target list completed
- [2026-02-13] CoCo: 1,250 leads (1,000 Steuerberater + 250 Buchhalter), 915 phones, 500 emails

## Tomorrow (2026-02-26)
- [ ] Italian project setup (research + vault + CC brief + domain)
- [ ] Spanish project setup: parte-listo.es (buy domain, run CC Prompt 1, deploy)

## Portfolio Tracker
### Live (4)
- datev-bereit.de
- zugferd-bereit.de
- facturx-pret.fr
- edi-pret.fr

### Deployed, Domain Pending (2)
- parte-listo.es
- listino-pronto.it

### Domain Status (2026-02-27)
- parte-listo.es — ✅ deployed — domain not resolving (Red.es VAT verification pending)
- listino-pronto.it — ✅ LIVE + SSL (certified 2026-02-27)
- faktura-klar.dk — ✅ LIVE + SSL (certified 2026-02-27)
- peppol-ok.be / coda-ok.be / checkin-ok.be — awaiting Belgian registry approval

### Next Week — Research + Build (4 more needed)
- TBD — target: 10 total by EOY 2026

## NL Sites — ✅ LIVE [2026-02-28]
- https://inkasso-ok.nl ✅
- https://xaf-ok.nl ✅
- https://loonjournaal-ok.nl ✅

Still needed from Arber:
- Stripe price IDs for each site
- Google OAuth clients for each site
- OpenAI/Azure API keys per site

## Pending: YouTube + AgentMail fixes
### YouTube watch-video pipeline
- Cookies approach abandoned (YouTube rotates too fast)
- Need: Supadata API key for cookie-free transcription
- Signup: supadata.ai with madmax@agentmail.to
- But AgentMail key is dead → can't receive confirmation email

### AgentMail key dead
- Current key `am_f4ad8c8d...` returns 401 Unauthorized
- Fix: Arber logs into agentmail.to → Settings → API Keys → regenerate
- Once new key is in → update ~/.bashrc + /root/clawd/env/secrets.env
- Then sign up for Supadata, get API key, wire up watch-video.sh

### watch-video.sh current state
- Script at /root/clawd/scripts/watch-video.sh
- Works BUT needs valid YouTube cookies OR Supadata key
- Azure Whisper transcription works fine (just the download step fails)
- Once Supadata is set up: download step bypassed entirely, just use transcript API
