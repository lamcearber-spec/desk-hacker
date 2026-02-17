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
- Goal: Financial freedom through web/mobile app business

## The Business
- Company: Web/mobile app development (just founded)
- Fixed costs: ~€500/month (covered)
- Urgency: High — "singularity is coming, accumulate capital before labor obsolete"

## Active Projects

### DatevBereit (Priority) ⭐
- Type: B2B SaaS
- What: Bank statements, Stripe & Shopify payouts → DATEV format converter
- Target: German freelancers, Steuerberater, e-commerce sellers
- Stack: Next.js + FastAPI + PostgreSQL + Celery + Docker
- **Pricing (decided 2026-01-26):**
  - Free: €0 (1 conversion/mo)
  - Starter: €5/mo (20 conversions)
  - Pro: €15/mo (100 conversions) ← target tier
  - Business: €50/mo (500 conversions)
- **Goal:** 1,000 Pro subscribers = €15,000 MRR
- **AI:** Moving from Mistral → GPT-4o mini (cheaper + more accurate)
- Status: Testing phase, needs API fixes then deploy
- Repo: github.com/lamcearber-spec/DatevBereit-Claude

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

### lex-bereit.de (NEW)
- Type: B2B SaaS (spin-off of DatevBereit)
- What: Bank statement → Lexware format converter
- Domain: lex-bereit.de (Arber registering)
- Architecture: **Same codebase as DatevBereit, different deploy config**
- NOT a fork — shared repo, two deployments
- Separate branding/landing pages for SEO
- Status: **IMPLEMENTATION COMPLETE** ✅ (2026-01-25)
  - Backend: `apps/api/celery_app/lexware/`
  - API: `/api/v1/lexware/` endpoints
  - Config: `.env.datev.example` / `.env.lexware.example`
  - Frontend: Dynamic branding via `siteConfig`

## 🗂️ Project Files (ALWAYS CHECK)
**Location:** `memory/projects/`
- `datev.md` — DatevBereit (web app)
- `lex.md` — lex-bereit (web app)
- `familyboarding.md` — FamilyBoarding (mobile app)
- `returncat.md` — ReturnCat (mobile app)

**Rule:** After EVERY interaction with Arber, if there's an update to any project, update the corresponding file immediately. These are the source of truth.

---

## Key Decisions (Don't Forget!)

### Architecture
- DatevBereit + lex-bereit = **One codebase, two deployments**
- Shared: upload flow, extraction logic, backend
- Different: branding, output format, landing pages

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
- New features: Max breaks down → spawn sub-agents → report
- Bug fixes: Ralph (scoped, budgeted)
- Architecture: Arber decides, Max implements
- Deploy: Arber approves, Max executes

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
*Last updated: 2026-01-25*
