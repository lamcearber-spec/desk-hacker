# Self-Review Log

## 2026-01-31
TAG: code-rule
MISS: Edited theme.ts files directly instead of using Claude Code
FIX: ALL code changes go through Claude Code, no exceptions. Even "simple" config edits.

TAG: speed
MISS: Kept retrying Claude Code for icon generation despite repeated OOM crashes
FIX: After 2 crashes on same task, switch to simpler approach (direct ImageMagick). Don't waste time on failing tools.

---

*Check this file at start of each session. Prioritize recent MISS entries.*

## 2026-02-01
TAG: infrastructure
MISS: Left Tailscale exit node enabled, broke server connectivity for 1+ hour. Arber had to fix with Gemini.
FIX: ALWAYS disable exit node immediately after use. Set a mental timer. Never leave it on.

[2026-02-03]
TAG: depth
MISS: Left Tailscale exit node enabled after Reddit session. Forgot to disable it. This broke all inbound connections to datev-bereit.de for days — site was unreachable during launch prep.
FIX: After ANY exit node use, immediately run 'tailscale up --exit-node= --accept-routes' and verify with 'curl ifconfig.me'. Add to post-task checklist.

