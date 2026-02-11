# Datev (DatevBereit)
*Web App — DATEV Import/Conversion Tool*

## Status
- MVP: ✅ Built (almost done)
- Live: ❌ Not yet
- **Priority:** ⭐ FOCUS (Lex on hold)
- **Next:** Testing → Deploy → SEM/SEO

## What It Does
- Converts bank statements / payment provider exports into DATEV format
- Target: German businesses, accountants, bookkeepers

## Pricing (decided 2026-01-26)
| Tier | Price | Conversions |
|------|-------|-------------|
| Free | €0 | 1/mo |
| Starter | €5/mo | 20/mo |
| Pro | €15/mo | 100/mo |
| Business | €50/mo | 500/mo |

## Tech
- Stack: Next.js + FastAPI + PostgreSQL + Celery + Docker
- AI: GPT-4o mini (moving from Mistral)
- Cost: ~€0.02-0.05/conversion (worst case)
- Hosting: Google Cloud (exploring)
- Repo: `/root/clawd/projects/DatevBereit-Claude`

## Launch Plan (decided 2026-01-27 20:17 UTC)
**Step-by-step — DO NOT SKIP:**

1. **Set up Hetzner hosting for datev-bereit.de**
   - Point DNS at joker.com → 46.224.214.8
   - Run deploy script
   - Get SSL certs

2. **Make website live**

3. **Run tests with test data**
   - Use CSV samples in `/test-data/`
   - Test full conversion flow

4. **If conversion issues → switch Mistral → OpenAI**
   - Already have Azure GPT-4o mini planned
   
5. **If tests pass → implement paywall**
   - Stripe integration
   - Pricing tiers (Free/Starter/Pro/Business)

6. **Set up email**
   - Add datevbereit.de to Google Workspace (Radom.group)
   - MX records at joker.com

## Launch Blockers
- [x] Domain purchased ✅ (datev-bereit.de + datevbereit.de)
- [x] DNS pointed at joker.com → 46.224.214.8 ✅
- [x] nginx installed and configured ✅
- [ ] SSL certs (Let's Encrypt can't reach server - try DNS challenge)
- [ ] Fix Next.js build errors (missing translations, prerender issues)
- [ ] Deploy frontend (currently broken - pricing page errors)
- [ ] Deploy backend API
- [ ] Test conversions
- [ ] Paywall (Stripe)
- [ ] Email setup (Google Workspace)

## Issues Encountered & FIXED (2026-01-27)
1. **SSL Certificate blocked** - Let's Encrypt servers can't reach server (firewall somewhere?)
   - Workaround: Running HTTP-only for now, SSL later via DNS challenge
2. **Frontend build errors - FIXED:**
   - ✅ Added missing translations (landing.trust.filesConverted, pricing.json)
   - ✅ Wrapped useSearchParams in Suspense for pricing page
   - ✅ Added @tanstack/react-query dependency
   - ✅ Disabled typedRoutes and ignoreBuildErrors in next.config.js
3. **FRONTEND LIVE at http://datev-bereit.de** ✅

## What's Running
- **Frontend:** http://datev-bereit.de (Next.js on port 3001)
  - systemd service: `datev-web.service` (auto-starts on boot)
- **nginx:** Proxying requests to frontend
- **Database:** PostgreSQL datev_bereit ready
- **Backend API:** NOT YET DEPLOYED (next step)

## Startup Commands
```bash
# Frontend (managed by systemd)
systemctl status datev-web
systemctl restart datev-web
journalctl -u datev-web -f

# Logs
tail -f /tmp/next-datev.log
```

## Deployment (Hetzner - READY)
- **Server:** 46.224.214.8 (existing Hetzner VPS)
- **Ports:** Web :3001, API :8001
- **Files prepared:**
  - `docker-compose.hetzner.yml`
  - `deploy/nginx/sites/datev-lex.conf`
  - `scripts/deploy-hetzner.sh`
  - `.env.datev`
- **Uses:** Host PostgreSQL + Redis (already running)

## Post-Launch
- [ ] SEM (Google Ads)
- [ ] SEO (content, keywords)

## Notes
- Goal: 1,000 subscribers at €15/mo = €15,000 MRR
- Breakeven: ~34 Pro subscribers covers €500/mo costs

---
*Last updated: 2026-01-27*
