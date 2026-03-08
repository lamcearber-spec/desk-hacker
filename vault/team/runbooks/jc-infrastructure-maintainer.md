# JC Infrastructure Maintainer Runbook

**Scope:** Hetzner VPS `46.224.214.8` — single-node Docker + nginx + PostgreSQL + Redis stack
**Owner:** JC (Claude Code on server)
**Updated:** 2026-03-08

---

## Daily Health Checks

Run these every morning. All commands execute as `jc` (non-root).

```bash
# 1. Container status — all should be Up
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Disk usage — alert if >80%
df -h / /var/lib/docker

# 3. Memory
free -h

# 4. CPU load (1/5/15 min averages)
uptime

# 5. Check all nginx sites responding
for domain in konverter-pro.de xaf-ok.nl loonjournaal-ok.nl inkasso-ok.nl \
  peppol-ok.be coda-ok.be checkin-ok.be faktura-klar.dk \
  facturx-pret.fr edi-pret.fr listino-pronto.it zugferd-bereit.de; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 https://$domain)
  echo "$domain → $code"
done

# 6. PostgreSQL — check each app DB is reachable
for container in datevbereit-claude-db xaf-ok-db loonjournaal-ok-db inkasso-ok-db; do
  docker exec $container pg_isready -q && echo "$container OK" || echo "$container FAIL"
done

# 7. Redis
for container in datevbereit-claude-redis; do
  docker exec $container redis-cli ping
done

# 8. Recent API errors (last 100 lines)
docker logs --tail 100 datevbereit-claude-api 2>&1 | grep -i error | tail -20
```

---

## Resource Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Disk `/` | 75% | 85% | Clean Docker images: `docker image prune -f` |
| Disk `/var/lib/docker` | 70% | 80% | `docker system prune -f` (never prune volumes) |
| RAM used | 80% | 90% | Identify leaker: `docker stats --no-stream` |
| CPU (15-min avg) | 3.0 | 5.0 | Check `qmd` indexer — use `/usr/local/bin/qmd-limited` |
| Swap used | 50% | 80% | Restart heaviest container |

**NEVER** run `docker system prune -a` — it removes all images and breaks deployments.

---

## Emergency Procedures

### App is down (502/504 from nginx)

```bash
# Identify which container
APP=datevbereit-claude  # adjust per app

# Check container status
docker ps | grep $APP

# Check logs
docker logs --tail 50 ${APP}-api

# Restart
cd /root/clawd/projects/<app-dir>
docker compose restart api worker

# If still failing, full restart
docker compose down && docker compose up -d
```

### Database unreachable

```bash
# Check container
docker ps | grep db
docker logs --tail 30 datevbereit-claude-db

# Restart DB (data is safe in volume)
docker compose restart db

# Verify
docker exec datevbereit-claude-db pg_isready
```

### Redis unreachable

```bash
docker compose restart redis
docker exec datevbereit-claude-redis redis-cli ping
```

### Nginx not routing

```bash
# Test config
nginx -t

# Reload (no downtime)
systemctl reload nginx

# Full restart only if reload fails
systemctl restart nginx
```

### Server OOM (out of memory)

```bash
# See what's consuming memory
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}" | sort -k3 -rh

# Kill the heaviest non-critical container temporarily
# datev-bereit gets priority — never kill it first
```

### Disk full

```bash
# Find large files
du -sh /var/lib/docker/containers/*/  | sort -rh | head -10

# Safe cleanup
docker container prune -f       # remove stopped containers
docker image prune -f           # remove dangling images only
journalctl --vacuum-size=500M   # trim system logs
```

---

## Backup Scripts

### PostgreSQL dump (run daily via cron)

```bash
#!/bin/bash
# /root/scripts/backup-dbs.sh
DATE=$(date +%Y-%m-%d)
BACKUP_DIR=/root/backups/db

mkdir -p $BACKUP_DIR

for APP_DB in "datevbereit-claude-db:datevbereit" "xaf-ok-db:xaf_ok" \
              "loonjournaal-ok-db:loonjournaal_ok" "inkasso-ok-db:inkasso_ok"; do
  CONTAINER="${APP_DB%%:*}"
  DBNAME="${APP_DB##*:}"
  docker exec $CONTAINER pg_dump -U postgres $DBNAME | gzip > "$BACKUP_DIR/${DBNAME}_${DATE}.sql.gz"
  echo "Backed up $DBNAME"
done

# Keep 14 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +14 -delete
```

### Verify backup

```bash
zcat /root/backups/db/datevbereit_<date>.sql.gz | head -5
```

---

## Port Allocation Reference

See `infra/server-resource-map.md` for full port map.
Key: datev-bereit API is the highest priority service — never starve it of resources.

---

## Known Issues

- `qmd` embed indexer can spike to 400% CPU — always use `/usr/local/bin/qmd-limited`
- **Never enable Tailscale exit node** — breaks all inbound routing (incident 2026-02-14)
- Docker internal DNS conflicts with Tailscale: datev-bereit web uses `network_mode: host`
