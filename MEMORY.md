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
- **Docker:** project `konverter-pro`, web container `konverter-pro-web-1`
- **Repo path:** /home/muja/DatevBereit-Claude, branch: feature/shopify-connect
- **Pricing:** Free €0 (1 conversion/mo), Starter €5/mo (20/mo), Pro €15/mo (100/mo), Business €50/mo (500/mo)
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
- ~$10.50 USDC remaining
- Active bets: SpaceX 9 launches + Fidesz/Orbán
- Pending: Arsenal YES token research (28.5¢)

### Notte API
- Account: madmax@agentmail.to
- API key saved to ~/.bashrc as NOTTE_API_KEY
- Daily DATEV monitor cron at 09:00 CET
- ⚠️ **Cron issue (2026-03-07):** AGENTMAIL_API_KEY not available in cron env (cron doesn't source ~/.bashrc); `/v1/inboxes` endpoint also returned 404. DATEV Community check itself works. Fix needed: export vars in crontab, or check AgentMail API docs for correct endpoint.

### Sellerforum.de
- Account: MadMaxInDaHaus
- Used for datev-bereit/konverter-pro community outreach
- Threads 64219 and 61102 in progress

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
- Platform: **OpenClaw** (formerly Clawdbot) — current version 2026.2.14

## Working Style
- Uses Claude Code for development
- Prefers I do things directly when possible
- Values action and results over discussion
- We're partners, not just assistant/user

---
*Last updated: 2026-03-07 (by JC — nightly review: pricing corrected, Stripe App + Google Ads + Search Console added)*

## watch-video Pipeline ✅ (2026-03-06)
- Script: `/root/clawd/scripts/watch-video.sh <youtube-url>`
- Stack: yt-dlp + deno → ffmpeg split → Azure Whisper → Claude Haiku summary
- YouTube cookies: `/root/.config/youtube_cookies.txt` (Arber's, valid ~2027)
- Rate limit: 30s between Whisper chunks, ~4 min for 1hr video
- Setup docs for JC: `/root/clawd/env/WATCH-VIDEO-SETUP.md`
- Triggered from WhatsApp via: send YouTube URL → I run it and summarize
