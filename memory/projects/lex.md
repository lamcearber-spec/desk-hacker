# Lex (lex-bereit)
*Web App — Lexware Import/Conversion Tool*

## Status
- MVP: ✅ Built (almost done)
- Live: ❌ Not yet
- **Priority:** On hold (Datev first)
- **Next:** After Datev launches

## What It Does
- Converts bank statements / payment provider exports into Lexware format
- Target: German businesses using Lexware for accounting

## Pricing (decided 2026-01-27)
| Tier | Price | Conversions |
|------|-------|-------------|
| Free | €0 | 2/mo |
| Basic | €5/mo | 100/mo |
| Pro | €30/mo | 500/mo |

*Rationale: Lexware users are price-sensitive (Lexware itself ~€20/mo). Can't price above the tool it serves.*

## Tech
- AI: GPT-4o mini
- **Same codebase as DatevBereit** — shared repo, different deploy config
- Hosting: Google Cloud (same infra as Datev)
- Repo: `/root/clawd/projects/DatevBereit-Claude` (shared)

## Launch Blockers
- [ ] Final testing (Arber)
- [ ] Domain purchased (Arber) ← NEED lex-bereit.de
- [ ] Point DNS to 46.224.214.8
- [ ] Fill in .env.lexware secrets (DB password, Stripe, OpenAI)
- [ ] Run deploy script
- [ ] SSL certs (certbot after DNS)
- [ ] Payment integration (Stripe)

## Deployment (Hetzner - READY)
- **Server:** 46.224.214.8 (same as Datev)
- **Ports:** Web :3002, API :8002
- **Files prepared:**
  - `docker-compose.hetzner.yml` (shared with Datev)
  - `deploy/nginx/sites/datev-lex.conf` (shared)
  - `scripts/deploy-hetzner.sh` (shared)
  - `.env.lexware`
- **Uses:** Host PostgreSQL + Redis (already running)

## Post-Launch
- [ ] SEM (Google Ads)
- [ ] SEO (content, keywords)

## Notes
- Sister product to DatevBereit
- Separate branding/landing pages for SEO

---
*Last updated: 2026-01-27*
