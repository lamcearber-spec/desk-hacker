# Active Tasks (Crash Recovery)

> Read this FIRST on restart. Resume any incomplete tasks.

## Current Tasks

### ✅ Stripe Connect Integration (COMPLETE - Feb 21)
**Status:** Deployed, Arber testing

**Commits:**
- 3202b4b: Full implementation (backend + frontend)
- 7594841: Fixed STRIPE_CLIENT_ID env var
- 2236d10: Changed scope read_only → read_write

**What's live:**
- OAuth flow: /api/v1/stripe/connect/authorize → callback → tokens stored
- Frontend: API Integrations page with Connect button
- Transaction import + DATEV export ready

**Stripe credentials:**
- client_id: `ca_U1H5nPYTZ9fXeZ7BXcB81siKdQ0pp5Ub`
- redirect: `https://datev-bereit.de/api/v1/stripe/connect/callback`
- **CoCo: Email enrichment** — 500/1000 emails, still scraping. Goal: maximize before launch.
- **Donnie: Cold email templates** — ✅ Done at `vault/projects/datev-bereit/marketing/outreach/cold-email-templates.md`
- **Launch postponed to next week** — use extra time for enrichment + content

## Pending (Arber action needed)
- [ ] Create DatevBereit Instagram account
- [ ] Set up Google Ads account
- [ ] Confirm site deployment

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

## NL Sites — SSL Certs Pending [PINNED — 2026-02-28]
All 3 deployed and Nginx configured. Waiting on DNS propagation.
Once `dig inkasso-ok.nl` returns 46.224.214.8, run:
```
certbot --nginx -d inkasso-ok.nl -d www.inkasso-ok.nl
certbot --nginx -d xaf-ok.nl -d www.xaf-ok.nl
certbot --nginx -d loonjournaal-ok.nl -d www.loonjournaal-ok.nl
```
Still needed from Arber (after SSL):
- Stripe price IDs for each site
- Google OAuth clients for each site
- OpenAI/Azure API keys per site
