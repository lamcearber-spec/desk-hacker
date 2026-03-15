# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## Obsidian CLI ✅ READY

- **Binary:** /usr/local/bin/obsidian-cli (v0.2.3)
- **Vault:** /root/clawd/vault
- **Usage:** `obsidian-cli <command> --vault /root/clawd/vault`
- **Alias:** `obs` (added to .bashrc)
- **Commands:** list, search, search-content, print, create, move, delete, daily
- **Setup date:** 2026-02-11

Examples:
```bash
obsidian-cli list --vault /root/clawd/vault
obsidian-cli print "projects/datev-bereit/summary" --vault /root/clawd/vault
obsidian-cli search-content "keyword" --vault /root/clawd/vault
```

## X/Twitter (bird CLI)

- **Account:** @Arber__L
- **Auth:** Cookies stored in ~/.bashrc as AUTH_TOKEN and CT0
- **Usage:** `source ~/.bashrc && bird <command>`
- **Setup date:** 2026-01-25

## Browser

- **Chrome path (local):** /root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome
- **Browserbase:** ✅ PAID — cloud browser sessions for JS-heavy/auth sites
- **API Key:** In ~/.bashrc as BROWSERBASE_API_KEY
- **Use when:** web_fetch fails, need login, need JS rendering
- **Note:** X blocks headless browsers, use bird CLI instead

### Arber's Desktop Chrome (Live Sessions) ✅ READY
- **Profile:** `user` (use `profile="user"` in browser calls)
- **Connection:** Tailscale → 100.77.8.37:9222 (desktop-09j1ffk)
- **Chrome version:** 145.0.7632.160 (Windows)
- **Requires:** Arber launches Chrome with `--remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`
- **Use for:** Stripe, Google Ads, App Store Connect, any logged-in service
- **Setup date:** 2026-03-14

## Email (himalaya) ⚠️ NEEDS CONFIG

- **Binary:** /usr/local/bin/himalaya (v1.1.0)
- **Config needed:** ~/.config/himalaya/config.toml
- **Status:** Installed, awaiting email credentials from Arber

To configure:
```bash
himalaya account configure  # Interactive wizard
```

Or manually create ~/.config/himalaya/config.toml with IMAP/SMTP settings.

## Summarize ✅ READY

- **Binary:** /usr/bin/summarize
- **Usage:** `summarize "https://url" --model google/gemini-3-flash-preview`
- **Keys:** Uses ANTHROPIC_API_KEY or GEMINI_API_KEY from env

## Claude Code ✅ READY

- **Binary:** /root/.local/bin/claude
- **Usage:** See coding-agent skill
- **Note:** Always use `pty:true` when running

### CLAUDE.md Instructions for Bash Behavior (PASS BEFORE EVERY PROMPT)

**Avoid output buffering issues:**

1. **Don't pipe through:** `head`, `tail`, `less`, `more`
2. **Let commands complete fully** or use `--max-lines` flags
3. **Read log files directly** instead of tailing
4. **Run commands without pipes** when possible
5. **Use command-specific flags:**
   - ✅ `git log -n 10` instead of ❌ `git log | head -10`
   - ✅ `grep -m 10` instead of ❌ `grep | head -10`
6. **Avoid chained pipes** that buffer indefinitely

## Notion ⚠️ NEEDS CONFIG

- **Config dir:** ~/.config/notion/ (created)
- **Status:** Awaiting API key from Arber

To configure:
1. Create integration at https://notion.so/my-integrations
2. Save key: `echo "ntn_xxx" > ~/.config/notion/api_key`
3. Share pages with the integration

## AgentMail ✅ READY

- **Email:** madmax@agentmail.to
- **Display Name:** Max
- **API Key:** Stored in ~/.bashrc as AGENTMAIL_API_KEY
- **SDK:** Python venv at /tmp/agentmail_env (or use REST API)
- **Docs:** https://docs.agentmail.to
- **Setup date:** 2026-01-29

## Reddit ✅ READY

- **Username:** MadMaxInDaHaus
- **Email:** madmax@agentmail.to
- **Password:** Datevbereit2026!
- **Auth:** OAuth token in ~/.config/reddit/auth.json
- **API:** Use Bearer token with oauth.reddit.com
- **Purpose:** Organic marketing for DatevBereit, FamilyBoarding, ReturnCat
- **Strategy:** /root/clawd/projects/marketing/reddit-strategy.md
- **Proxy:** Tailscale exit node through desktop-09j1ffk (Arber's Windows)
- **User-Agent required:** Yes (always include browser UA)
- **Setup date:** 2026-01-29

## Tailscale ✅ READY

- **This machine:** radom1 (100.92.81.48)
- **⚠️ NO EXIT NODE** — removed permanently. Site uptime > Reddit proxy.
- **DO NOT activate any exit node.** It breaks datev-bereit.de routing.
- **Setup date:** 2026-01-29

## DATEV Community ✅ READY

- **Username:** maddie
- **Email:** madmax@agentmail.to
- **Password:** Madmax2026!
- **URL:** https://www.datev-community.de/
- **Purpose:** Engage with German accountants/bookkeepers for DatevBereit
- **Setup date:** 2026-01-29

## GitHub Token ✅ READY

- **Token name:** Clawdbot-VPS (no expiration)
- **Token:** REDACTED_GITHUB_TOKEN
- **Account:** lamcearber-spec
- **Stored in:** ~/.bashrc as GITHUB_TOKEN, ~/.config/gh/hosts.yml
- **Vault repo:** https://github.com/lamcearber-spec/radom-vault (private)
- **Vault path:** /root/clawd/vault/
- **Auto-push:** Every 15 min via DATEV-MONITOR cron

## App Store Connect CLI (asc) 🆕 TO INSTALL

- **What:** CLI for managing App Store Connect — reviews, submissions, metadata
- **Why:** Automate app submissions, respond to rejections, manage review workflow
- **Install:** `brew install Codemagic-CLI-Tools` or check https://github.com/appstoreconnect-swift-sdk
- **Relevant for:** FamilyBoarding, any future iOS apps
- **Source:** https://x.com/rudrank/status/2016172427626352664

---

## Agent Comms (comms) ✅ READY

- **Binary:** /usr/local/bin/comms
- **Backend:** Redis on localhost:6379 (datevbereit-claude-redis-1)
- **Discord mirror:** #agent-comms (channel 1482454796588814396)
- **Setup:** Each session must set identity: `export COMMS_AGENT=max` (or jc, cc, arber)
- **Setup date:** 2026-03-14

**Discord bot tokens (per-agent identity):**
- Max bot: `1469047155472994600` (posts as "Max")
- JC bot: `1482465848848551936` (posts as "JC")
- Tokens stored in `/usr/local/bin/comms`

Commands:
```bash
comms send <agent> <message>   # Instant delivery + Discord mirror
comms watch [timeout]          # Block until message arrives (real-time, default 300s)
comms read                     # Read + clear all pending messages
comms peek                     # View without consuming
comms history [count]          # Shared history log (last 500)
comms status                   # Inbox counts for all agents
```

**At session start, every agent must:**
```bash
export COMMS_AGENT=max   # or jc, cc, arber
comms read               # Check for pending messages
```

---

*Updated: 2026-03-14*

## Notte API ✅ READY
- Account: madmax@agentmail.to
- API key: ~/.bashrc as NOTTE_API_KEY
- **X/Twitter browser profile:** `notte-profile-5cb4003468b37f35` (NOTTE_TWITTER_PROFILE)
- Cookies injected + saved 2026-03-09 — authenticated as @Arber__L
- Usage: `client.Session(profile={"id": os.environ["NOTTE_TWITTER_PROFILE"], "persist": False})`
- Cookies file: /root/.config/twitter_cookies.txt
