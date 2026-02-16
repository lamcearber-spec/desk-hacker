# Browser Access — Browserbase

**Service:** Browserbase (cloud browser sessions)
**API Key:** In ~/.bashrc as BROWSERBASE_API_KEY
**Status:** ✅ PAID & READY

## What It's For
- Scraping JS-heavy sites that block web_fetch (e.g., DATEV Community)
- Logging into authenticated sites
- Screenshots, form filling, navigation

## How to Use
Use the `browser` tool with Browserbase, or use the OpenClaw browser tool directly which should pick up the config.

## Local Chrome (fallback)
- **Path:** /root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome
- **Note:** Headless, some sites block it

## Important
- All agents have access to this — use it when web_fetch fails
- Don't abuse rate limits
