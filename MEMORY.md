# MEMORY.md - Long-Term Memory

> ⚠️ **AFTER CONTEXT RESET:** Read the Obsidian vault FIRST (`/root/clawd/vault/`) before talking to Arber. Check `vault/daily/YYYY-MM-DD.md` and relevant project summaries. The vault is the source of truth.

## About Arber (My Human)
- Full name: Arber Lamce
- Location: Germany (CET/CEST)
- Phone: +4917699742900
- GitHub: lamcearber-spec
- X/Twitter: @Arber__L
- Strengths: Curious, analytical
- Weakness: Not good at selling
- Goal: **€40k MRR by end of 2026** → financial freedom
- Strategy: 10 bureaucratic middleware SaaS tools across Europe (small niches × scale = portfolio MRR)

## The Business
- Company: Web/mobile app development (just founded)
- Fixed costs: ~€500/month (covered)
- Urgency: High — "singularity is coming, accumulate capital before labor obsolete"

## Active Projects

### Konverter Pro / DatevBereit (Priority) ⭐
- **REBRANDED:** datev-bereit.de → konverter-pro.de (DATEV C&D, March 2026)
- Type: B2B SaaS
- What: Bank statements, Stripe & Shopify payouts → DATEV format converter
- Target: German freelancers, Steuerberater, e-commerce sellers
- Stack: Next.js + FastAPI + PostgreSQL + Celery + Docker
- **Live URL:** https://konverter-pro.de (datev-bereit.de 301 redirects → expires March 16)
- **Docker:** containers: datevbereit-claude-api-1, datevbereit-claude-worker-1 (web runs NATIVELY under user `jc` port 3000 — NOT Docker; health check updated 2026-03-11)
- **Repo path:** /home/muja/DatevBereit-Claude, branch: feature/shopify-connect
- **Pricing (LIVE as of 2026-03-14):** Anonym (free, limited), Registriert (free, more features), Starter €20/mo, Professional €50/mo, Business €99/mo, Enterprise (contact). Yearly option with 2 months free on homepage.
- **First revenue:** €20 from tester (2026-02-17)
- **Auth-code deadline:** March 16, 2026 — send to DATEV, reply email by March 14
- **Google Workspace:** konverter-pro.de domain added, support@/info@/arberlamce@ aliases live
- **Stripe webhook:** updated to api.konverter-pro.de; manual: update support email + OAuth redirect in dashboard
- **Stripe App:** v1.0.8 resubmitted 2026-03-06 (Account C, com.konverterpro.export) — fixed test user, connect endpoint, logo — review ~1-2wks
- **Google Ads:** PMax 23581442765 paused (0 conversions); Search campaign 23624070852 live Mar 7–14, €20/day, 10 DATEV/Stripe/Shopify keywords, Max CPC €0.80
- **Search Console:** gsc-reader@datevbereit.iam.gserviceaccount.com added to konverter-pro.de; 1 impression (indexed Mar 3)
- **API tokens:** Search Console + Workspace Admin saved at /root/clawd/tools/google-ads/
- Status: Live, feature/shopify-connect deployed
- Repo: github.com/lamcearber-spec/DatevBereit-Claude

### Full Portfolio (13 apps, 12 live as of 2026-02-28)
- **konverter-pro.de** (🇩🇪) — Live + SSL, PRIMARY FOCUS
- **zugferd-bereit.de** (🇩🇪) — Live + SSL
- **facturx-pret.fr** (🇫🇷) — Live + SSL
- **edi-pret.fr** (🇫🇷) — Live + SSL
- **listino-pronto.it** (🇮🇹) — Live + SSL
- **faktura-klar.dk** (🇩🇰) — Live + SSL
- **xaf-ok.nl** (🇳🇱) — Live + SSL, needs Stripe config
- **loonjournaal-ok.nl** (🇳🇱) — Live + SSL, needs Stripe config
- **inkasso-ok.nl** (🇳🇱) — Live + SSL, needs Stripe config
- **peppol-ok.be** (🇧🇪) — Live + SSL, needs Stripe config
- **coda-ok.be** (🇧🇪) — Live + SSL, needs Stripe config
- **checkin-ok.be** (🇧🇪) — Live + SSL, needs NSSO Chaman OAuth2
- **parte-listo.es** (🇪🇸) — Pending Spanish VAT number
- All on Hetzner VPS `46.224.214.8`, ports 3006–3015

### Polymarket
- Tor running on server (SOCKS5 127.0.0.1:9050)
- Wallet: 0x5910B772559959D039D31e86E9847b827B7C8C9E
- **~$0.54 remaining** (0.458 POL + $0.50 USDC.e) as of 2026-03-14
- Active bets: SpaceX 9 launches (6/9 done by Mar 14, looking good for ~$73 payout) + Fidesz/Orbán (April 2026 election)
- Arsenal YES token (28.5¢) — ABANDONED (never placed)

### Notte API
- Account: madmax@agentmail.to
- API key saved to ~/.bashrc as NOTTE_API_KEY
- Daily DATEV monitor cron at 09:00 CET
- ⚠️ **Cron issue (2026-03-07):** AGENTMAIL_API_KEY not available in cron env (cron doesn't source ~/.bashrc); `/v1/inboxes` endpoint also returned 404. DATEV Community check itself works. Fix needed: export vars in crontab, or check AgentMail API docs for correct endpoint.

### Sellerforum.de
- Account: MadMaxInDaHaus
- Used for datev-bereit/konverter-pro community outreach
- Threads 64219 and 61102 in progress

### SEO Content Machine (built 2026-03-15)
- Serper API key: saved (key obtained 2026-03-15 from Arber via Discord — **original message in group chat, key should be rotated if exposed**)
- GSC service account: gsc-reader@datevbereit.iam.gserviceaccount.com — new JSON key created 2026-03-15, saved by Max; ⚠️ full JSON key was posted in Discord group chat, **rotate this key**
- Daily SEO report cron: 08:00 CET → Discord #general (verify exists: `crontab -l`)
- 212 DATEV keywords: vault/projects/seo-content-machine/keywords/expanded-keywords.md
- SERP baseline: vault/projects/seo-content-machine/keywords/serp-baseline.md
- ⚠️ GSC property connected: datev-bereit.de (via sc-domain:datev-bereit.de) — confirm konverter-pro.de is also covered (old service account should already have access)

### Agent Comms System (built 2026-03-14)
- CLI: `/usr/local/bin/comms` — Redis-backed inter-agent messaging
- Commands: send, read, peek, watch, history, status, clear
- All messages mirrored to Discord #agent-comms (channel 1482454796588814396)
- Max bot: ID 1469047155472994600 (existing OpenClaw bot)
- JC bot: ID 1482465848848551936 (new bot, created by Arber)
- Discord → Redis bridge: `comms-discord-poll` systemd service (polls every 30s)

### Game Off (updated 2026-03-14)
- Type: Mobile app (React Native/Expo)
- What: Fully offline, ad-free classic game collection — competing with "Offline Games" by JindoBlu (~$130K+/mo)
- **77 games across 10 categories** (Cards, Numbers, Logic, Words, Board, Match, Arcade, Jigsaw, Trivia, Kids)
- **10,000+ variants** via difficulty × size system — do NOT market raw game count
- **Unlock model (NEW — as of 2026-03-13):**
  * 5 core games always free: Sudoku, Klondike, Wordle, Minesweeper, Snake
  * 10 kids games always free (grouped by age: 2-4, 4-6, 6-8)
  * 1 daily rotation game (changes at midnight UTC, deterministic)
  * Premium = all 77 games + all variants
  * Demo mode: 60s free play on any locked game → soft paywall
- **Pricing: $2.99/mo** (no yearly or lifetime — keep it simple)
- **Today screen:** Free users see daily game + always-free + locked preview. Premium users see "My Games" (bookmarks)
- **Onboarding:** 8-screen premium flow (personalization quiz → instant play → win → notification → soft paywall with "Start Free" escape)
- **IP safety:** No Pac-Man, Tetris, Frogger, Space Invaders names — all cloned under generic names
- **Audio:** Ambient menu music only (placeholder files, swap later). No in-game music.
- **i18n:** EN/DE/ES (111 strings each)
- **IAP:** RevenueCat (placeholder keys — swap before launch)
- Repo: github.com/lamcearber-spec/game-off, branch: master
- Key differentiator: zero ads, infinite procedural replayability, kids section, boutique curation vs shovelware
- Status: **77 engines built, all bugs fixed, logo ready** — Batches 1-5 complete (Mar 13-14). Next: final QA + App Store submission
- Plans: vault/projects/game-off/game-off-replit-plan-v2.md (build brief) + vault/projects/game-off/cc-prompts-batch-1.md
- Research: vault/projects/game-off/research/

### FamilienBoarding
- Type: Mobile app (React Native/Expo)
- What: Boarding pass scanner for families
- Status: MVP complete
- Repo: github.com/lamcearber-spec/FamilienBoarding

### ReturnCat
- Type: Mobile app (React Native/Expo)
- What: Product return tracker with reminders
- Status: MVP complete
- Repo: github.com/lamcearber-spec/ReturnCat

## 🗂️ Project Files (ALWAYS CHECK)
**Location:** `memory/projects/`
- `datev.md` — DatevBereit (web app, includes Lexware output — fully integrated)
- `familyboarding.md` — FamilyBoarding (mobile app)
- `returncat.md` — ReturnCat (mobile app)

**Rule:** After EVERY interaction with Arber, if there's an update to any project, update the corresponding file immediately. These are the source of truth.

---

## Key Decisions (Don't Forget!)

### Architecture
- DatevBereit = single codebase, single deployment
- Lexware output format is **integrated** directly into DatevBereit (not a separate product)

### Distribution Strategy
- Mobile apps → UGC creators (TikTok, Instagram)
- Web apps → SEO + Google Ads + Steuerberater forums

### UGC Playbook for Mobile Apps (from @ErnestoSOFTWARE)
1. Build roster of 10-20 creators
2. Each posts ~60x/month (3x/day)
3. When ONE cracks viral format → share with all 20
4. All 20 post same winning format = "infinite virality glitch"
5. Direct CTA to app download
6. Result: App Store top 200 ranking possible
- **Math:** 20 creators × 60 posts = 1,200 posts/month
- **Target apps:** FamilienBoarding, ReturnCat

### SEO Playbook (6 Steps — from @bloggersarvesh)
1. **Competitor keyword analysis** — Ahrefs top 20 pages, extract keywords + difficulty
2. **Low-hanging fruit** — High-intent keywords (ready-to-buy signals)
3. **Page optimization** — Embeds, niche mentions, location/context signals
4. **Review management** — Keyword-rich responses, fast reply time
5. **Content feed domination** — Competitor gap analysis, high-impact posts + CTAs
6. **Weakness exploitation** — Cover what competitors miss → win #1

### Workflow (Modus Operandi)
- New features: Max plans/scopes → CC writes code → Max reports
- Bug fixes: CC (scoped, budgeted)
- Architecture: Arber decides, CC implements
- Deploy: Arber approves, Max executes

### 🔴 THE WORKFLOW — PERMANENT (Arber has said this MANY TIMES)
1. Max → writes CC brief → sends to Arber
2. Arber → runs CC on his DESKTOP with the brief
3. CC (desktop) → writes all code, commits to repo
4. Max → pulls repo + deploys on server

Max does NOT write code. Max does NOT spawn CC autonomously.
Max writes briefs. Arber runs CC. Max deploys.

### Arber's Working Style
- Tends to procrastinate — needs daily accountability
- Wants pressure to ship, not comfort
- Daily check-in: "What's shipping today?"

## Credentials & Access
- GitHub: Token configured (gh CLI authenticated)
- X/Twitter: Cookies in ~/.bashrc (AUTH_TOKEN, CT0)
- Server: Hetzner VPS at 46.224.214.8
- Platform: **OpenClaw** (formerly Clawdbot) — current version v2026.3.13 (updated 2026-03-14)

## Working Style
- Uses Claude Code for development
- Prefers I do things directly when possible
- Values action and results over discussion
- We're partners, not just assistant/user

---
*Last updated: 2026-03-13 (by JC — OpenClaw version updated to v2026.3.11, Arsenal bet marked abandoned, Game Off project added)*

## watch-video Pipeline ✅ (2026-03-06)
- Script: `/root/clawd/scripts/watch-video.sh <youtube-url>`
- Stack: yt-dlp + deno → ffmpeg split → Azure Whisper → Claude Haiku summary
- YouTube cookies: `/root/.config/youtube_cookies.txt` (Arber's, valid ~2027)
- Rate limit: 30s between Whisper chunks, ~4 min for 1hr video
- Setup docs for JC: `/root/clawd/env/WATCH-VIDEO-SETUP.md`
- Triggered from WhatsApp via: send YouTube URL → I run it and summarize

## Google Ads Pipeline ✅ (2026-03-11)
- Script: `/root/clawd/scripts/ads-loop.py`
- Commands: `full` | `pull` | `analyze` | `generate` | `memory`
- Stack: Google Ads API → Grok 4.1 Fast (xAI, free) → ad copy generation
- Data output: `memory/ads/` (CSVs, generated headlines/descriptions, learnings.json)
- Uses compounding memory: logs learnings each cycle, feeds into next run
- Cost: €0 (Grok 4.1 Fast free tier)
- Current campaign: 23624070852 (Mar 7–14, €20/day) — run after campaign ends for final analysis

## Google Business Profile (2026-03-11)
- OAuth token: `scripts/google-business-auth.py` (auth `scripts/google-business-oauth-token.json`)
- API blocked by quota limit (Google sets new Business Profile projects to 0 req/min by default)
- Quota increase requested 2026-03-11 — Google may approve in ~5 business days
- Until then: Arber must manually update name/logo at business.google.com (~2 min)
- Profile still shows "DatevBereit" name — needs update to "Konverter Pro"

## Google Search Console (2026-03-11)
- Script: `scripts/google-search-console.py`
- Stats (last 7 days, as of 2026-03-11): 23 impressions, 1 click on "datev converter" (position #1)
- konverter-pro.de/de and /en both indexed

## Infrastructure Notes (2026-03-11)
- Ollama + Qwen 3.5 removed (freed 3.4 GB) — Ollama binary + all data deleted
- QMD updated: 1.1.5 → 2.0.1 (installed at /opt/qmd)

## SMTP Fix (2026-03-11)
- Support email changed: support@datev-bereit.de → support@konverter-pro.de (old app password expired)
- FRONTEND_URL added to .env + docker-compose.yml = https://konverter-pro.de (was missing, causing links to point to wrong domain)
- Affected window: Mar 10 ~14:00 UTC to Mar 11 ~15:00 UTC — some users may not have received verification emails
