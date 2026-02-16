# Server Security Architecture

**Server:** Radom1 (46.224.214.8)
**Last Updated:** 2026-02-04
**Based on:** levelsio's security recommendations

## Philosophy

> "Never expose a VPS to the entire internet. Always firewall it to subnets."

Create tunnels from trusted sources (Cloudflare, Tailscale) to the server. Even if a service has a vulnerability, attackers can't reach it.

---

## Network Architecture

```
                    INTERNET
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
    Port 80/443    Port 22        Everything else
    (Website)      (SSH)              │
         │              │              ▼
         │              │           DROPPED
         ▼              ▼
      ALLOWED       ALLOWED only from:
    (everyone)      • Tailscale (100.64.0.0/10)
         │          • Home IP (92.208.108.68)
         │              │
         ▼              ▼
    ┌─────────────────────────────────┐
    │         RADOM1 SERVER           │
    │         46.224.214.8            │
    │                                 │
    │  nginx (websites)               │
    │  PostgreSQL (localhost only)    │
    │  Redis (localhost only)         │
    │  OpenClaw (localhost only)      │
    └─────────────────────────────────┘
```

---

## Firewall Rules (iptables)

**Location:** `/etc/iptables/rules.v4`
**Persistence:** `/etc/systemd/system/iptables-restore.service`

### Current Rules

| # | Action | Protocol | Source | Port | Purpose |
|---|--------|----------|--------|------|---------|
| 1 | ACCEPT | all | loopback | * | Local services |
| 2 | ACCEPT | all | ESTABLISHED,RELATED | * | Existing connections |
| 3 | ACCEPT | tcp | 100.64.0.0/10 | 22 | SSH from Tailscale |
| 4 | ACCEPT | tcp | 92.208.108.68 | 22 | SSH from home IP |
| 5 | ACCEPT | tcp | 0.0.0.0/0 | 80 | HTTP (website) |
| 6 | ACCEPT | tcp | 0.0.0.0/0 | 443 | HTTPS (website) |
| 7 | ACCEPT | icmp | 0.0.0.0/0 | - | Ping |
| 8 | LOG | all | 0.0.0.0/0 | * | Log dropped packets |
| 9 | DROP | all | 0.0.0.0/0 | * | Block everything else |

### Commands

```bash
# View current rules
/usr/sbin/iptables-legacy -L -n --line-numbers

# Save rules
/usr/sbin/iptables-legacy-save > /etc/iptables/rules.v4

# Restore rules
/usr/sbin/iptables-legacy-restore /etc/iptables/rules.v4
```

---

## SSH Access

### Allowed Sources
1. **Tailscale network:** 100.64.0.0/10 (any Tailscale device)
2. **Home IP:** 92.208.108.68 (Arber's home)

### How to Connect
```bash
# Via Tailscale (recommended)
ssh root@100.92.81.48

# Via home IP (backup)
ssh root@46.224.214.8
```

### SSH Hardening (already configured)
- Password auth: Disabled (key-only)
- Root login: Allowed (key-only)
- fail2ban: Active (whitelists home IP)

---

## Exposed Services

### Public (0.0.0.0)
| Port | Service | Protected By |
|------|---------|--------------|
| 80 | nginx | Open (HTTP→HTTPS redirect) |
| 443 | nginx | Open (websites) |
| 22 | sshd | iptables (Tailscale + home only) |

### Localhost Only (127.0.0.1)
| Port | Service |
|------|---------|
| 5432 | PostgreSQL |
| 6379 | Redis |
| 18789 | OpenClaw Gateway |
| 8001 | DatevBereit API |

### Disabled
| Port | Service | Status |
|------|---------|--------|
| 631 | CUPS | Killed & masked |

---

## Websites Hosted

| Domain | Type | Stack |
|--------|------|-------|
| datev-bereit.de | B2B SaaS | Next.js + FastAPI + PostgreSQL |

**Note:** Not behind Cloudflare (direct IP). If adding Cloudflare later, lock port 443 to Cloudflare IP ranges only.

---

## Tailscale Network

| Device | IP | Role |
|--------|-----|------|
| radom1 | 100.92.81.48 | Server |
| desktop-09j1ffk | 100.77.8.37 | Arber's PC (exit node) |

**⚠️ EXIT NODE WARNING:** Never enable exit node on radom1 — breaks all inbound connections!

---

## Monitoring

### Logs
```bash
# Dropped packets
journalctl | grep "IPT-DROP"

# SSH attempts
journalctl -u sshd | tail -50

# fail2ban status
fail2ban-client status sshd
```

### Health Checks
- OpenClaw heartbeat monitors gateway processes
- IBKR gateway checked on heartbeats

---

## Emergency Access

If locked out:
1. Hetzner console (VNC) — always works
2. Home IP is whitelisted — connect from home
3. Any Tailscale device in the network

---

## Future Improvements

- [ ] Add Cloudflare proxy for datev-bereit.de (lock 443 to CF IPs)
- [ ] Set up intrusion detection (fail2ban already running)
- [ ] Regular security audits
- [ ] Automated vulnerability scanning

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-04 | Initial firewall setup (iptables) |
| 2026-02-04 | SSH locked to Tailscale + home IP |
| 2026-02-04 | CUPS disabled |
| 2026-02-04 | Rules made persistent (systemd) |
