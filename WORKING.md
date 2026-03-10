# WORKING.md - Current Task State

## Current State

- Gateway running
- Discord connected
- memory-core: in slot, enabled

## Arber to Action
- [ ] Stripe Dashboard: update support email + Connect redirect URI to konverter-pro.de
- [ ] Stripe Account C: v1.0.8 resubmitted 2026-03-06 (fixed: test user, connect endpoint 302, logo 512x512) — await review result (~1-2 weeks from Mar 6)
- [ ] NL sites: provide Stripe price IDs, Google OAuth, API keys

## Max to Action
- [ ] **AgentMail cron failure** — AGENTMAIL_API_KEY not in cron environment (saved to ~/.bashrc which cron doesn't source); also `/v1/inboxes` endpoint returned 404. Fix: export var in crontab directly, OR verify correct AgentMail API endpoint. DATEV Community check itself is working. **Broken since 2026-03-05, 4 days unresolved.**
- [ ] Sellerforum.de Thread 64219: confirm retry cron delivered at 17:30 CET 2026-03-05 — retry cron ran 4 days ago, status still unconfirmed
- [ ] Sellerforum.de Thread 61102: remaining reply not yet sent
- [ ] ~~Arsenal / Polymarket: Gemini research (YES @ 28.5¢)~~ — **STALE (6 days). Drop this or check current market price NOW. Lesson written twice. Still not acted on.**
- [ ] NL + BE sites (6 apps): configure Stripe prices + end-to-end QA
- [ ] parte-listo.es: check Spanish VAT number status
- [ ] Google Ads campaign 23624070852: monitor performance (running Mar 7–14, €20/day Search) — **check results today, €40 spent so far**
- [ ] Search Console konverter-pro.de: 1 impression as of Mar 6 — monitor growth

## Deadlines
- 🚨 **March 14 (4 days): Send DATEV auth-code reply email to DATEV — CRITICAL, ALERT ARBER NOW**
- ⚠️ March 16 (6 days): konverter-pro.de 301 redirect from datev-bereit.de expires

---

*Last updated: 2026-03-10 (by JC — nightly review: updated deadline countdown, flagged Max's failure to alert Arber on urgent deadline)*
