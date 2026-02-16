# OpenClaw Tools Reference

**Owner:** Team  
**Updated:** 2026-02-12

## Web Access Tools

### web_fetch
Fetch and extract readable content from URLs (HTML → markdown/text).
- **Usage:** `web_fetch(url, maxChars?, extractMode?)`
- **extractMode:** "markdown" or "text"

### web_search
Search the web using Brave Search API.
- **Requires:** Brave API key (run `openclaw configure --section web`)
- **Usage:** `web_search(query, count?, country?, freshness?)`
- **country:** 2-letter country code (DE for Germany)

## Browser Control

### browser
Control web browser via OpenClaw's browser control server.
- **Status:** `browser(action="status")`
- **Start:** `browser(action="start")`
- **Open URL:** `browser(action="open", targetUrl="https://...")`
- **Snapshot:** `browser(action="snapshot")`
- **Act/Click:** `browser(action="act", request={kind: "click", ref: "..."})`

**Note:** Browser service must be running on the host. If unavailable, use web_fetch as fallback.

## Cross-Agent Messaging

### sessions_send
Send a message to another agent session.
- **Usage:** `sessions_send(sessionKey?, label?, message?)`

### sessions_list
List active sessions.
- **Usage:** `sessions_list(limit?, messageLimit?)`

## Cron & Scheduling

### cron
Manage Gateway cron jobs and wake events.
- **Actions:** status, list, add, update, remove, run, runs, wake

## Configuration

### gateway
Restart, apply config, or update the Gateway.
- **Actions:** config.get, config.patch, config.apply, restart, update.run

## Discord

### message
Send, delete, and manage messages via channel plugins.
- **Actions:** send, edit, delete, read, react, pin, etc.
- **Usage:** `message(action="send", channel="discord", target?, message?)`
