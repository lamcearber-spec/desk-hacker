# JC DevOps Automator Runbook

**Scope:** Docker Compose deployments on `46.224.214.8` — 12 apps, shared Hetzner VPS
**Owner:** JC (Claude Code on server)
**Updated:** 2026-03-08

---

## Deployment Procedure

All deployments follow the same pattern. CC pushes to git; JC pulls and restarts.

### Standard deploy (any app)

```bash
# 1. Pull latest code
cd /root/clawd/projects/<app-dir>
git pull origin main   # or feature branch

# 2. Apply any DB migrations (Python apps only)
docker exec <app>-api alembic upgrade head

# 3. Rebuild and restart (zero-downtime via compose)
docker compose pull          # pull new images if using registry
docker compose up -d --build # rebuild from source

# 4. Verify
docker ps | grep <app>
curl -s -o /dev/null -w "%{http_code}" https://<domain>/health
```

### datev-bereit / konverter-pro (primary app — extra care)

```bash
cd /root/clawd/projects/datev-bereit

# Always check resource usage before deploying
docker stats --no-stream

git pull origin feature/shopify-connect   # or main

# Run migrations
docker exec datevbereit-claude-api alembic upgrade head

# Restart only API + worker (not DB/Redis — avoids connection drops)
docker compose restart api worker

# Full restart only if needed
docker compose up -d --build api worker

# Health check
curl -s https://konverter-pro.de/api/v1/health | python3 -m json.tool
```

---

## Rollback Procedure

```bash
cd /root/clawd/projects/<app-dir>

# Find last good commit
git log --oneline -10

# Roll back to previous commit
git checkout <commit-hash>
docker compose up -d --build

# If DB migration was applied, rollback one step
docker exec <app>-api alembic downgrade -1

# Verify, then notify Arber
```

---

## Container Monitoring

### Live resource usage

```bash
# All containers, sorted by CPU
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" \
  | sort -k2 -rh

# Follow logs for a specific app
docker logs -f datevbereit-claude-api --tail 50

# Follow worker (Celery) logs
docker logs -f datevbereit-claude-worker --tail 50
```

### Celery task queue status (datev-bereit)

```bash
docker exec datevbereit-claude-worker celery -A app.celery_app inspect active
docker exec datevbereit-claude-worker celery -A app.celery_app inspect stats
```

### Redis queue depth

```bash
docker exec datevbereit-claude-redis redis-cli llen celery
```

---

## App Directory Map

| App | Directory | Compose project |
|-----|-----------|-----------------|
| konverter-pro.de | `/root/clawd/projects/datev-bereit` | `datevbereit-claude` |
| xaf-ok.nl | `/root/xaf-ok` | `xaf-ok` |
| loonjournaal-ok.nl | `/root/loonjournaal-ok` | `loonjournaal-ok` |
| inkasso-ok.nl | `/root/inkasso-ok` | `inkasso-ok` |
| peppol-ok.be | `/root/peppol-ok` | `peppol-ok` |
| coda-ok.be | `/root/coda-ok` | `coda-ok` |
| checkin-ok.be | `/root/checkin-ok` | `checkin-ok` |
| faktura-klar.dk | `/root/faktura-klar` | `faktura-klar` |
| facturx-pret.fr | `/root/facturx-pret` | `facturx-pret` |
| edi-pret.fr | `/root/edi-pret` | `edi-pret` |
| listino-pronto.it | `/root/listino-pronto` | `listino-pronto` |
| zugferd-bereit.de | `/root/zugferd-bereit` | `zugferd-bereit` |

---

## Deploy Script (multi-app)

```bash
#!/bin/bash
# /root/scripts/deploy.sh <app-dir> [branch]
# Example: deploy.sh datev-bereit feature/shopify-connect

set -e
APP_DIR="${1:?Usage: deploy.sh <app-dir> [branch]}"
BRANCH="${2:-main}"
BASE="/root/clawd/projects"

if [ ! -d "$BASE/$APP_DIR" ]; then
  BASE="/root"  # fallback for non-datev apps
fi

cd "$BASE/$APP_DIR"
echo "=== Deploying $APP_DIR from $BRANCH ==="

git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo "--- Running migrations (if applicable) ---"
CONTAINER=$(docker compose ps -q api 2>/dev/null | head -1)
if [ -n "$CONTAINER" ]; then
  docker compose exec -T api alembic upgrade head 2>/dev/null || echo "(no migrations)"
fi

echo "--- Restarting services ---"
docker compose restart api worker 2>/dev/null || docker compose up -d

echo "--- Health check ---"
sleep 5
docker compose ps

echo "=== Done: $APP_DIR deployed from $BRANCH ==="
```

---

## Nginx Config Management

All site configs live in `/etc/nginx/sites-available/`. Symlinked to `sites-enabled/`.

```bash
# Edit a site config
nano /etc/nginx/sites-available/konverter-pro.de

# Test before applying
nginx -t

# Apply (no downtime)
systemctl reload nginx

# Add a new site
cp /etc/nginx/sites-available/konverter-pro.de /etc/nginx/sites-available/newapp.com
# edit newapp.com
ln -s /etc/nginx/sites-available/newapp.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL cert for new domain
certbot --nginx -d newapp.com
```

---

## Cron Jobs

```bash
# View current crontab
crontab -l

# Standard crons to have in place:
# DB backups — daily at 02:00
0 2 * * * /root/scripts/backup-dbs.sh >> /root/logs/backup.log 2>&1

# Certbot auto-renewal — twice daily (standard certbot install)
# Managed by: systemctl status certbot.timer

# Docker cleanup — weekly Sunday 03:00
0 3 * * 0 docker container prune -f && docker image prune -f >> /root/logs/docker-cleanup.log 2>&1
```

---

## New App Checklist (when Arber launches a new country)

- [ ] Clone repo to `/root/<app-name>/`
- [ ] Copy `.env.production.example` → `.env.production`, fill in secrets
- [ ] Allocate port (see `infra/server-resource-map.md`)
- [ ] `docker compose up -d`
- [ ] Run DB migrations: `docker exec <app>-api alembic upgrade head`
- [ ] Add nginx site config + SSL cert via certbot
- [ ] Add domain to daily health check loop
- [ ] Add DB container to backup script
- [ ] Update `infra/server-resource-map.md` with new port allocation
- [ ] Notify Arber: app live
