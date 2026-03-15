# peppol-ok.be Audit — 2026-03-14

## Site Status
- Docker container `peppolok-web` running (5hrs), port 3009
- HTTPS works (cert valid until May 29)
- HTTP also works but does NOT redirect to HTTPS (wrong nginx config in sites-enabled)

## Issues Found

### 1. CRITICAL: Nginx SSL/Redirect Misconfiguration
- `sites-enabled/peppol-ok.conf` = old HTTP-only version
- `sites-available/peppol-ok.conf` = correct SSL + HTTP→HTTPS redirect
- Need to symlink the correct version
- **JC task** (infrastructure)

### 2. Missing Pricing Page
- `/pricing` returns 404
- Blueprint specifies pricing tiers: Free (anonymous 1/day), Free (registered 5/day), Starter €20/mo, Professional €50/mo, Business €99/mo, Enterprise
- Need to create pricing page component + route
- **CC task** (code)

### 3. No Auth System (No /login, /register)
- `/login` returns 404, `/register` returns 404
- Blueprint specifies free registered tier with 5 conversions/day
- Need auth system to differentiate anonymous vs registered vs paid users
- **CC task** (code) — significant feature, may need backend

### 4. Impressum Has Placeholder Data
- "Geschäftsführer: [Name]" — should be "Arber Lamce"
- "HRB [Number]" — needs real HRB number
- "USt-IdNr.: DE[Number]" — needs real USt-IdNr
- **CC task** (simple text fix)

### 5. Footer "Product" Section Not Translated
- Footer shows "Conversion Tool" in English regardless of locale
- Should use i18n key for product link text
- **CC task** (code)

### 6. "Step 1/2/3" Labels Hardcoded in English
- Homepage shows "Step 1", "Step 2", "Step 3" in English even when NL locale is active
- Should be "Stap 1/2/3" (NL) or "Étape 1/2/3" (FR)
- **CC task** (i18n)

### 7. Mobile Nav — Hamburger Menu Behavior Unknown
- Header has hamburger button but couldn't test interactively
- Need to verify mobile nav actually shows links when tapped
- **QA task** (needs browser)

### 8. No Pricing Link in Sidebar/Nav
- Sidebar only has "Start" and "Conversietool"
- No "Pricing" link anywhere in navigation
- **CC task** (add to sidebar + create page)

### 9. Proxy Timeouts for Large PDF Uploads
- Nginx default proxy timeouts may be too short for AI-powered PDF extraction
- Blueprint mentions Azure GPT-4o fallback which could take 10-30s
- Should add proxy_read_timeout 120s
- **JC task** (nginx)

## Priority Order for Tonight
1. Nginx SSL fix (JC — 2 min)
2. Impressum placeholders (CC — 5 min)
3. Footer/Step i18n fixes (CC — 10 min)
4. Pricing page creation (CC — 30 min)
5. Proxy timeout increase (JC — 2 min)
6. Auth system (CC — major feature, may defer)
