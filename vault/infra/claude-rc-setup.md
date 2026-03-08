# Claude RC (Remote Control) Setup

Server: `46.224.214.8` (Radom1)
Systemd service: `claude-rc.service` (enabled, auto-restarts)
Purpose: lets Arber control JC on the server from iOS/macOS via claude.ai/code

---

## Quick re-setup after a `claude` update

After `claude` auto-updates, the patches below get overwritten and the service will break.
Run this sequence:

### 1 — Re-apply the 4 patches

```bash
ssh root@46.224.214.8 'python3 /tmp/claude_rc_patch.py'
```

If `/tmp/claude_rc_patch.py` is gone (server rebooted), copy-paste the full script from the **Patch Script** section below.

### 2 — Re-authenticate JC

```bash
# On your desktop (Windows), run:
python3 /tmp/claude_rc_auth.py
```

Full script in **Auth Script** section below. Needs your claude.ai session cookies (see **Credentials** section). Completes the full OAuth flow automatically via Browserbase.

### 3 — Restart the service

```bash
ssh root@46.224.214.8 'systemctl restart claude-rc && sleep 5 && systemctl status claude-rc --no-pager | grep -E "Active|bridge"'
```

The new bridge URL appears in the logs. Use it in the Claude iOS app.

---

## Why patches are needed (root cause)

Claude Code v2.x `claude auth login` has 3 bugs when authenticating a Max plan account on a headless Linux server:

| # | Bug | Fix |
|---|-----|-----|
| 1 | Requests `org:create_api_key` scope → Anthropic returns 400 on token exchange for Max plan | Remove that scope from the auth URL (`Z_1` scope selector) |
| 2 | When code is delivered via HTTP `/callback`, `hasPendingResponse()=true` → F$8 uses localhost `redirect_uri`, mismatching the manual auth URL | Force `hasPendingResponse()` to always return `false` |
| 3 | `user:inference` not in returned scopes → `If6` skips saving the token, `Q$8` is called and fails | Inject `user:inference` into scopes at start of `Yc6` |

And two rc-specific bugs:

| # | Bug | Fix |
|---|-----|-----|
| 4 | Session spawner uses `process.execPath` (`/usr/bin/node`) with `--sdk-url` as first arg → node treats it as a node flag | Use `process.argv[1]` (path to cli.js) as execPath instead |
| 5 | `--dangerously-skip-permissions` (bypassPermissions mode) blocked when running as root | Remove the root uid check |

---

## Patch Script

Save as `/tmp/claude_rc_patch.py` on the **server** and run with `python3 /tmp/claude_rc_patch.py`.

```python
#!/usr/bin/env python3
"""Re-apply 4 patches to claude cli.js after an update.
Run on server: python3 /tmp/claude_rc_patch.py
"""
import shutil, re, sys

CLI = "/usr/lib/node_modules/@anthropic-ai/claude-code/cli.js"
BAK = CLI + ".bak"

with open(CLI) as f:
    content = f.read()

shutil.copy2(CLI, BAK)
print(f"Backup: {BAK}")

patches = [
    (
        "Patch 1: remove org:create_api_key from claude.ai auth scope",
        "let J=w?[dS]:BU1",
        "let J=w?[dS]:(z?a61:BU1)",
    ),
    (
        "Patch 2: inject user:inference into scopes in Yc6",
        "async function Yc6(A){await Qd6({clearOnboarding:!1})",
        "async function Yc6(A){if(!A.scopes?.includes(dS))A={...A,scopes:[dS,...(A.scopes??[])]};await Qd6({clearOnboarding:!1})",
    ),
    (
        "Patch 3: hasPendingResponse always false (force MANUAL redirect_uri)",
        "hasPendingResponse(){return this.pendingResponse!==null}",
        "hasPendingResponse(){return!1}",
    ),
    (
        "Patch 4: use argv[1] (cli.js) as execPath for session spawning",
        "execPath:process.execPath,env:process.env,",
        "execPath:process.argv[1]||process.execPath,env:process.env,",
    ),
    (
        "Patch 5: remove root check blocking --dangerously-skip-permissions",
        'process.platform!=="win32"&&typeof process.getuid==="function"&&process.getuid()===0&&process.env.IS_SANDBOX!=="1"&&process.env.CLAUDE_CODE_BUBBLEWRAP!=="1"',
        "!1",
    ),
]

ok = True
for desc, old, new in patches:
    count = content.count(old)
    if count == 1:
        content = content.replace(old, new, 1)
        print(f"  ✓  {desc}")
    elif count == 0:
        print(f"  ✗  {desc}  — string NOT FOUND (already patched or API changed)")
        # Don't abort — might already be patched
    else:
        print(f"  ✗  {desc}  — found {count} matches, expected 1. SKIPPING.")
        ok = False

with open(CLI, "w") as f:
    f.write(content)

if ok:
    print("\nAll patches applied. Run: systemctl restart claude-rc")
else:
    print("\nSome patches may need manual review. Check the strings above.")
```

---

## Auth Script

Run on your **desktop** (Python 3.11 at `C:\Users\49176\AppData\Local\Programs\Python\Python311\python.exe`).

Requires: `pip install playwright requests` and `playwright install chromium`.

```python
#!/usr/bin/env python3
"""Authenticate JC on server via Browserbase + claude.ai session cookies.
Run on desktop after patching cli.js on the server.
"""
import requests, asyncio, re, subprocess, time
import warnings
warnings.filterwarnings("ignore")
from playwright.async_api import async_playwright

BB_KEY = 'bb_live_0zksDW8MdkPq6Kfxe5x9nctqXSs'
PROJECT_ID = '551376c4-5125-4d43-bb12-f713de07f400'

# Update these if session expires (copy from browser devtools → Application → Cookies → claude.ai)
CLAUDE_COOKIES = [
    {"name": "sessionKey", "value": "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", "domain": ".claude.ai", "path": "/", "secure": True, "httpOnly": True},
    {"name": "anthropic-device-id", "value": "5e95c03a-be3d-4e0c-9af3-ba6e2fa4a98c", "domain": "claude.ai", "path": "/", "secure": True},
    {"name": "lastActiveOrg", "value": "737a3087-359b-45ba-b8f1-0fba835c3118", "domain": ".claude.ai", "path": "/", "secure": True},
]

SERVER = "root@46.224.214.8"

def get_auth_url_and_port():
    """Start claude auth login on server, return (url, port)."""
    # Kill any existing auth session
    subprocess.run(["ssh", SERVER, "tmux kill-session -t claude-auth 2>/dev/null; rm -f /tmp/auth-out.txt"], capture_output=True)
    # Start fresh
    subprocess.run(["ssh", SERVER,
        "tmux new-session -d -s claude-auth 'claude auth login 2>&1 | tee /tmp/auth-out.txt'"],
        capture_output=True)
    time.sleep(4)
    # Read URL
    r = subprocess.run(["ssh", SERVER, "cat /tmp/auth-out.txt"], capture_output=True, text=True)
    m = re.search(r'(https://claude\.ai/oauth/authorize[^\s]+)', r.stdout)
    if not m:
        raise RuntimeError(f"No auth URL found. Output: {r.stdout[:300]}")
    url = m.group(1)
    # Find port
    r2 = subprocess.run(["ssh", SERVER,
        "ss -tlnp | grep '::1' | grep claude | awk '{print $4}' | grep -oE '[0-9]+$'"],
        capture_output=True, text=True)
    port = r2.stdout.strip()
    if not port:
        raise RuntimeError("Could not find claude auth server port")
    return url, port

async def authorize_and_deliver(auth_url, port):
    """Use Browserbase to click Authorize, extract code, deliver to server."""
    s = requests.Session()
    s.verify = False
    s.headers['x-bb-api-key'] = BB_KEY
    sess = s.post('https://api.browserbase.com/v1/sessions', json={'projectId': PROJECT_ID}).json()
    print(f"  Browserbase session: {sess.get('id')}")

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(sess['connectUrl'])
        ctx = browser.contexts[0] if browser.contexts else await browser.new_context()
        await ctx.add_cookies(CLAUDE_COOKIES)
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        await page.goto(auth_url, timeout=30000)
        try: await page.wait_for_load_state("networkidle", timeout=10000)
        except: pass
        await page.wait_for_timeout(2000)

        body = await page.evaluate("() => document.body.innerText")
        if "Authorize" not in body:
            raise RuntimeError(f"No Authorize button. Page: {body[:200]}")

        await page.get_by_role("button", name="Authorize").click()
        await page.wait_for_timeout(5000)
        result_url = page.url

        m = re.search(r'code=([^&\s]+)', result_url)
        st = re.search(r'state=([^&\s]+)', result_url)
        if not m or not st:
            raise RuntimeError(f"No code in redirect URL: {result_url}")

        code, state = m.group(1), st.group(1)
        print(f"  Got code: {code[:20]}...")

        cb_url = f'http://[::1]:{port}/callback?code={code}&state={state}'
        r = subprocess.run(
            ["ssh", SERVER, f'curl -s -o /dev/null -w "%{{http_code}}" --max-time 20 "{cb_url}"'],
            capture_output=True, text=True, timeout=30
        )
        print(f"  Callback HTTP: {r.stdout}")
        await browser.close()

def check_auth():
    r = subprocess.run(["ssh", SERVER, "claude auth status 2>&1"], capture_output=True, text=True)
    return r.stdout

def main():
    print("Step 1: Starting claude auth login on server...")
    url, port = get_auth_url_and_port()
    print(f"  URL: {url[:80]}...")
    print(f"  Port: {port}")

    print("Step 2: Completing OAuth via Browserbase...")
    asyncio.run(authorize_and_deliver(url, port))

    time.sleep(8)
    print("Step 3: Checking auth status...")
    status = check_auth()
    print(f"  {status.strip()}")

    if '"loggedIn": true' in status:
        print("\nAuth succeeded! Restarting claude-rc service...")
        subprocess.run(["ssh", SERVER, "systemctl restart claude-rc"], capture_output=True)
        time.sleep(5)
        r = subprocess.run(["ssh", SERVER,
            "journalctl -u claude-rc -n 5 --no-pager | grep bridge"],
            capture_output=True, text=True)
        print(f"Bridge URL: {r.stdout.strip()}")
    else:
        print("\nAuth FAILED. Check server logs.")

if __name__ == "__main__":
    main()
```

---

## Credentials

| Item | Value |
|------|-------|
| Browserbase API key | `bb_live_0zksDW8MdkPq6Kfxe5x9nctqXSs` |
| Browserbase project | `551376c4-5125-4d43-bb12-f713de07f400` |
| claude.ai org UUID | `737a3087-359b-45ba-b8f1-0fba835c3118` |
| claude.ai device ID | `5e95c03a-be3d-4e0c-9af3-ba6e2fa4a98c` |

**Session cookie** (`sessionKey`): may expire. If auth fails with "not logged in" in Browserbase, refresh by copying `sessionKey` from browser DevTools → Application → Cookies → `claude.ai`.

---

## Systemd service

File: `/etc/systemd/system/claude-rc.service`

```ini
[Unit]
Description=Claude Code Remote Control (JC)
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/claude-rc-start.sh
Restart=always
RestartSec=30
Environment=HOME=/root

[Install]
WantedBy=multi-user.target
```

Start script: `/usr/local/bin/claude-rc-start.sh`

```bash
#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd /root/clawd
exec claude remote-control --permission-mode acceptEdits
```

Commands:
```bash
systemctl status claude-rc
systemctl restart claude-rc
journalctl -u claude-rc -f          # live logs + bridge URL
```

---

## Notes

- Patches are in `cli.js` at `/usr/lib/node_modules/@anthropic-ai/claude-code/cli.js`
- Original backed up at `cli.js.bak` (only the last backup, overwritten each patch run)
- `claude` updates are installed automatically — check `claude --version` if rc breaks
- The `acceptEdits` permission mode means the remote session auto-accepts file edits but still prompts for bash commands. Appropriate for running as root.
- Working directory for sessions is `/root/clawd`
