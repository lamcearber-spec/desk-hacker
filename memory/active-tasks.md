# Active Tasks (Crash Recovery)

> Read this FIRST on restart. Resume any incomplete tasks.

## Current Tasks

### 🔴 Stripe Integration (NEXT SESSION - Feb 21)
**Status:** Step 1 pending - waiting for Arber's Stripe Connect OAuth credentials

**What Arber needs to do first:**
1. Go to https://dashboard.stripe.com/settings/connect
2. Enable Connect (if not already)
3. Go to Settings → Connect → OAuth
4. Get the `client_id` (starts with `ca_`)
5. Set redirect URI: `https://datev-bereit.de/api/stripe/callback`
6. Share the `client_id` with Max

**Full plan:**
- Step 1: Stripe OAuth Setup (need client_id from Arber)
- Step 2: Store Stripe tokens in user model
- Step 3: Fetch Stripe data (transactions, payouts)
- Step 4: Stripe → DATEV converter
- Step 5: UI & download in dashboard

**App location:** `/root/clawd/projects/stripe-datevbereit/datevbereit/`
**Current version:** 1.0.2 (uploaded, not published)
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
