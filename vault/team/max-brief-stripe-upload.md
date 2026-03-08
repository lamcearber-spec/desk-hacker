# Max Brief — Stripe App Upload (Konverter Pro)

**Date:** 2026-03-03
**Priority:** High
**Goal:** Upload Konverter Pro Stripe App v1.0.14 to Account C without upload error

---

## Context

All uploads from Arber's Windows machine show "upload error" in Stripe Dashboard despite the CLI reporting success. Root cause suspected: CLI auth issue (Windows machine uses `STRIPE_API_KEY` env var which Stripe Apps explicitly warns is unsupported). Server uses proper config.toml credentials and should work cleanly.

**Account C:** info@konverter-pro.de — acct_1T6qQkQhLpe601kS
**App directory on server:** `/root/clawd/projects/stripe-konverterpro/datevbereit/`

All files are already updated on the server (v1.0.14, 512x512 icon, clean manifest).

---

## Step 1 — SSH to server

```bash
ssh root@46.224.214.8
```

---

## Step 2 — Verify files are correct

```bash
cat /root/clawd/projects/stripe-konverterpro/datevbereit/stripe-app.json | grep version
# Should show: "version": "1.0.14"

python3 -c "
from PIL import Image
img = Image.open('/root/clawd/projects/stripe-konverterpro/datevbereit/icon.png')
print(img.size)
"
# Should show: (512, 512)
```

---

## Step 3 — Try uploading directly

```bash
python3 /tmp/upload_stripe.py
```

**If this works:** Done. Check Stripe Dashboard → Account C → Apps → v1.0.14 should show no error.

**If you get an auth error** (e.g. "No such account", "Authentication required", or similar): proceed to Step 4.

---

## Step 4 — Re-authenticate if needed

If auth fails, run:

```bash
stripe login --project-name accountC
```

This will print a URL like:
```
Your pairing code is: XXXX-XXXX
Press Enter to open the browser or visit:
https://dashboard.stripe.com/stripecli/confirm_auth?t=xxxxx&cliaccount=acct_1T6qQkQhLpe601kS
```

**Important:** The `cliaccount=` must be `acct_1T6qQkQhLpe601kS`. If it shows a different account ID, press Ctrl+C and tell Arber.

Open the URL in the browser while logged in to **Account C** (info@konverter-pro.de). Click "Allow access". Then re-run the upload:

```bash
python3 /tmp/upload_stripe.py
```

---

## Step 5 — Expected success output

```
✔ Built files for production
✔ Packaged files for upload
✔ Uploaded Konverter Pro - DATEV Export

Stripe needs to process your files before this version can be installed.
```

After seeing this, check Stripe Dashboard → Account C → Apps → Versions tab. v1.0.14 should appear. Refresh after 2-3 minutes to see if the "upload error" clears.

---

## Step 6 — Report back

Tell Arber:
- Whether the upload succeeded
- Whether the dashboard shows "upload error" or something else for v1.0.14
- The full terminal output if anything went wrong

---

## Notes

- **Do NOT select "Build a platform or marketplace"** in any Stripe Dashboard step. This would flag Account C as a Connect platform and permanently break the app publishing ability.
- The `live_mode_api_key` for accountC is already stored in `~/.config/stripe/config.toml` on the server.
- If Stripe CLI asks which account to use, always pick `acct_1T6qQkQhLpe601kS`.

---
*Written by CC — 2026-03-03*
