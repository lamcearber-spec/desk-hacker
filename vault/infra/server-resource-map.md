# Server Resource Map — Radom1 (46.224.214.8)

> **Rule:** OpenClaw/Clawdbot must NEVER starve DatevBereit. The site is the business.

## Hardware
- **CPU:** 4 vCPUs
- **RAM:** 16 GB (no swap)
- **Disk:** 150 GB SSD
- **OS:** Ubuntu 24.04 (Linux 6.8.0)
- **Host:** Hetzner VPS

## Resource Allocation

### 🔴 Priority 1: DatevBereit (the product)
| Service | Type | Port | Memory | Notes |
|---------|------|------|--------|-------|
| nginx | systemd | 80, 443 | ~10 MB | Reverse proxy, TLS termination |
| Next.js frontend | Docker (`datevbereit-claude-web`) | 3000 | ~80-200 MB | Currently dev mode, prod build ready |
| FastAPI backend | Docker (`datevbereit-claude-api`) | 8000 (localhost) | ~120 MB | Uvicorn |
| Celery worker | Docker (`datevbereit-claude-worker`) | — | ~200 MB | 2 workers, processes conversions |
| Celery beat | Docker (`datevbereit-claude-beat`) | — | ~100 MB | Scheduler |
| PostgreSQL | Docker (`datevbereit-claude-db`) | 5432 (localhost) | ~50 MB | App database |
| Redis | Docker (`datevbereit-claude-redis`) | 6379 (localhost) | ~10 MB | Celery broker + cache |
| **Subtotal** | | | **~770 MB** | |

### 🟡 Priority 2: OpenClaw + Agents (the tools)
| Service | Type | Port | Memory | Notes |
|---------|------|------|--------|-------|
| OpenClaw gateway | systemd (user) | 18789 (loopback) | ~560 MB | Main AI orchestrator (Max, CoCo, Donnie) |
| Clawdbot gateway | systemd (user) | — | ~790 MB | Legacy bot, still running |
| Headless Chromium | snap | 9222 (loopback) | ~500 MB | Browser automation (5 processes) |
| qmd (memory) | on-demand | — | **200-500 MB spike** | ⚠️ Embedding indexer, runs periodically. Can eat 400% CPU |
| **Subtotal** | | | **~1,850-2,350 MB** | |

### ⚪ Priority 3: System Services
| Service | Type | Port | Memory | Notes |
|---------|------|------|--------|-------|
| Docker daemon | systemd | — | ~220 MB | Container runtime |
| containerd | systemd | — | ~60 MB | |
| Tailscale | systemd | — | ~30 MB | VPN (NO exit node!) |
| fail2ban | systemd | — | ~100 MB | SSH protection |
| Postfix | systemd | 25 (localhost) | ~10 MB | System mail only |
| systemd-journald | systemd | — | ~340 MB | Logs |
| **Subtotal** | | | **~760 MB** | |

## Total: ~3.4-3.9 GB used / 16 GB available

## Known Risks

### qmd embed (OpenClaw memory indexer)
- Spawns via OpenClaw every 5 min + on boot
- Can consume 200%+ CPU per process (up to 2 concurrent)
- **Mitigation:** Created `nice -n 19` wrapper at `/usr/local/bin/qmd-limited`
- **TODO:** Configure OpenClaw to use the wrapper (`memory.qmd.command`)

### Tailscale Exit Node
- **PERMANENTLY DISABLED** — breaks inbound routing to datev-bereit.de
- Never activate. See incident 2026-02-14.

### Docker Bridge Networking + Tailscale
- Tailscale interferes with Docker's internal DNS (127.0.0.11)
- Web container uses `network_mode: host` to bypass this
- Other containers use explicit `dns: [8.8.8.8, 1.1.1.1]`

### Dev Mode in Production
- Frontend still runs `pnpm dev` (Dockerfile.dev)
- Production Dockerfile exists (`Dockerfile.prod`) but needs DNS fix for build
- **TODO:** Deploy production build — will reduce memory by ~60% and eliminate compilation hangs

## Network Map

```
Internet → nginx (80/443)
              ├── /api/* → FastAPI (127.0.0.1:8000) [Docker]
              └── /*     → Next.js (127.0.0.1:3000) [Docker, host network]

Arber SSH → port 22 (92.208.108.68 + Tailscale 100.64.0.0/10 only)

OpenClaw → loopback:18789 (gateway)
         → Discord bots (4 accounts: main, max, coco, donnie)
         → WhatsApp (Arber's number)

Docker internal:
  Redis  ← 127.0.0.1:6379
  Postgres ← 127.0.0.1:5432
  API ← 127.0.0.1:8000
```

## Monitoring
- **Liveness:** Cron every 5 min curls datev-bereit.de
- **Daily audit:** 8:00 AM CET — ports, SSH, Docker, disk, CPU, SSL, Tailscale
- **Firewall:** iptables default DROP, all blocked scans logged as IPT-DROP

---
*Created: 2026-02-14 | Update after any infra changes*
