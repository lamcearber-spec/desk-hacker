# JC Security Engineer Runbook

**Scope:** 12 apps on `46.224.214.8` — nginx, FastAPI, PostgreSQL, Docker
**Owner:** JC (Claude Code on server)
**Updated:** 2026-03-08

---

## Nginx Security Headers

All nginx server blocks should include these headers. Add to `/etc/nginx/snippets/security-headers.conf` and include in each site config.

```nginx
# /etc/nginx/snippets/security-headers.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com;" always;

# Hide server version
server_tokens off;
```

Include in each site block:
```nginx
server {
    ...
    include snippets/security-headers.conf;
    ...
}
```

### Verify headers on any domain

```bash
curl -sI https://konverter-pro.de | grep -iE 'x-frame|x-content|strict-transport|content-security'
```

---

## Firewall Audit

Current expected open ports (UFW):

```bash
# Check status
ufw status verbose

# Expected rules:
# 22/tcp    — SSH (restrict to known IPs if possible)
# 80/tcp    — HTTP (nginx, redirects to HTTPS)
# 443/tcp   — HTTPS (nginx)
# All other ports: DENY inbound

# App ports (8xxx) should NEVER be exposed externally — nginx proxies them
# Verify no app port is publicly reachable:
for port in 8000 8001 8010 8020 8021 8030 8031 8040 8041 8050 8051 8060; do
  result=$(curl -s -m 3 http://46.224.214.8:$port 2>&1)
  if echo "$result" | grep -qiv "refused\|timed out"; then
    echo "WARNING: port $port appears open — $result"
  else
    echo "port $port: blocked OK"
  fi
done
```

### Lockdown SSH (if not already done)

```bash
# /etc/ssh/sshd_config — verify these are set:
grep -E 'PermitRootLogin|PasswordAuthentication|PubkeyAuthentication' /etc/ssh/sshd_config
# Should be:
# PermitRootLogin prohibit-password  (key-only root login)
# PasswordAuthentication no
# PubkeyAuthentication yes
```

---

## SSL Certificate Monitoring

All 12 domains use Let's Encrypt via certbot.

```bash
# Check expiry for all certs
for domain in konverter-pro.de xaf-ok.nl loonjournaal-ok.nl inkasso-ok.nl \
  peppol-ok.be coda-ok.be checkin-ok.be faktura-klar.dk \
  facturx-pret.fr edi-pret.fr listino-pronto.it zugferd-bereit.de; do
  expiry=$(echo | openssl s_client -connect ${domain}:443 -servername $domain 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  echo "$domain expires: $expiry"
done

# Certbot auto-renewal status
systemctl status certbot.timer
certbot renew --dry-run
```

Alert Arber if any cert expires in < 14 days.

---

## FastAPI Input Validation Checklist

All FastAPI endpoints in the shared stack should follow these rules. When reviewing new code:

**File uploads (all apps accept CSV/PDF/Excel):**
- Max file size enforced (`MAX_FILE_SIZE` in config)
- MIME type validated against allowlist (not just extension)
- File saved to temp path, never executed
- Celery worker processes async — API never blocks on file processing

**Auth endpoints:**
- Passwords: bcrypt via `passlib` (10+ rounds)
- JWTs: short-lived access token (15-30 min) + refresh token
- Rate limiting on `/auth/login` and `/auth/register`
- No user enumeration: same response for "wrong email" vs "wrong password"

**API keys / secrets:**
- Never logged (use `mask_email()` pattern from `app.core.privacy`)
- Never returned in API responses
- Stored as `SecretStr` in pydantic config

**SQL:**
- All DB access via SQLAlchemy ORM — no raw string interpolation
- Verify: `grep -r "f\"SELECT\|f'SELECT" apps/api/` should return nothing

---

## Security Audit Script

```bash
#!/bin/bash
# Quick security posture check

echo "=== Open ports (external) ==="
ss -tlnp | grep LISTEN

echo ""
echo "=== Docker containers running as root ==="
docker ps -q | xargs docker inspect --format '{{.Name}} user={{.Config.User}}' | grep "user=$\|user= "

echo ""
echo "=== Env files with secrets (check permissions) ==="
find /root/clawd -name ".env*" -exec ls -la {} \;

echo ""
echo "=== Recent auth failures ==="
grep "Invalid credentials\|401\|403" /root/clawd/projects/datev-bereit/logs/*.log 2>/dev/null | tail -20 || \
  docker logs datevbereit-claude-api 2>&1 | grep -i "invalid credentials\|401" | tail -20

echo ""
echo "=== Certbot renewal ==="
certbot renew --dry-run 2>&1 | tail -5
```

---

## Incident Response

### Suspected brute force on login

```bash
# Check API logs for repeated 401s from same IP
docker logs datevbereit-claude-api 2>&1 | grep "401" | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Block IP via UFW
ufw deny from <IP> to any
```

### Leaked secret key

1. Rotate immediately in `.env.production`
2. Restart affected container: `docker compose restart api`
3. Revoke old key at provider (Stripe/Brevo/etc)
4. Check logs for usage of old key
5. Notify Arber

### Suspicious container activity

```bash
# Check what processes are running inside containers
docker top datevbereit-claude-api
docker exec datevbereit-claude-api ps aux
```
