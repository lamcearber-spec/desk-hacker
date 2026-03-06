# /root/clawd/env/ — Credentials & Config Index

## secrets.env
All API keys in one place. Source with: `source /root/clawd/env/secrets.env`

## Config Files (not moved, just referenced here)
| Service | Location | Notes |
|---------|----------|-------|
| Stripe CLI | ~/.config/stripe/config.toml | 3 accounts: default(A), accountb, accountc |
| Google Ads API | /root/clawd/tools/google-ads/google-ads.yaml | Customer: 5868493025 |
| Google Search Console | /root/.config/gsc-service-account.json | gsc-reader@datevbereit.iam.gserviceaccount.com |
| Google OAuth tokens | /root/clawd/tools/google-ads/*.json | indexing, workspace-admin, search-console |
| Reddit cookies | ~/.config/reddit/auth.json | MadMaxInDaHaus, expires ~90 days |
| Himalaya (email) | ~/.config/himalaya/config.toml | info@datev-bereit.de Gmail IMAP |
| Polymarket wallet | ~/.config/max-wallet/wallet.json | 0x5910B772559959D039D31e86E9847b827B7C8C9E |

## Stripe Accounts
| Account | Email | ID | Purpose |
|---------|-------|----|---------|
| A (default) | arberlamce@radom.group | acct_1T0zEqCL9DvLLy9E | OAuth Connect (konverter-pro.de) |
| B | info@datev-bereit.de | acct_1T3vF74DYNAeQ80b | Old app (deprecated) |
| C | info@konverter-pro.de | acct_1T6qQkQhLpe601kS | Stripe App Marketplace |

## Google Ads
- Manager account: 991-803-6486
- Client account: 586-849-3025 (konverter-pro.de)
- Active campaign: KP Search DE 20260306 (ID: 23624070852) — €20/day, Mar 7-14

## Reddit
- Account: MadMaxInDaHaus
- Email: madmax@agentmail.to
- Password: stored in vault/projects/datev-bereit/
- Posting: MUST use Tor (socks5h://127.0.0.1:9050)

## DATEV Community
- Username: maddie | Password: Madmax2026!
- URL: https://www.datev-community.de/
