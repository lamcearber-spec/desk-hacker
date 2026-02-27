# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is a personal knowledge vault for Arber (Radom UG), not a code repository. It contains strategy, research, project notes, and operational documentation for a portfolio of bureaucratic middleware SaaS products across Europe.

There is no build system, test runner, or deployment pipeline in this repo.

## Repository Structure

```
daily/          — Daily notes (YYYY-MM-DD.md)
projects/       — One folder per product/project
  datev-bereit/ — Flagship German DATEV converter (primary focus)
  roadmap.md    — Portfolio roadmap across all 10 apps
strategy/       — Mission, distribution playbook
infra/          — Server resource map, ops notes
team/           — Workflow rules and roles
people/         — Team member summaries
companies/      — Legal entity notes
references/     — External research and reading
```

## Mission

**Bureaucratic middleware** — file conversion SaaS that exploits regulatory mandates. One web app per country/regulation, all sharing the same architecture pattern (Next.js + FastAPI + PostgreSQL + Redis + Celery + Docker on Hetzner `46.224.214.8`).

**Goal:** 10 operating web apps by EOY 2026, €40k MRR.

## Active Products (as of roadmap.md)

| App | Market | Status |
|-----|--------|--------|
| datev-bereit.de | 🇩🇪 Germany | Live — PRIMARY FOCUS |
| zugferd-bereit.de | 🇩🇪 Germany | Live |
| facturx-pret.fr | 🇫🇷 France | Live |
| edi-pret.fr | 🇫🇷 France | Live |
| listino-pronto.it | 🇮🇹 Italy | DNS pending |
| faktura-klar.dk | 🇩🇰 Denmark | DNS pending |
| peppol-ok.be | 🇧🇪 Belgium | DNS pending |
| coda-ok.be | 🇧🇪 Belgium | DNS pending |
| checkin-ok.be | 🇧🇪 Belgium | DNS pending |

All apps run on Hetzner VPS `46.224.214.8`, ports 3006–3011.

## Team Roles

- **Arber** — Final say on everything. Orders all code changes.
- **Claude Code (CC)** — The only thing that writes/edits code in any repo. Runs on Arber's desktop.
- **Max** — Coordination, research, operations, deployment.
- **CoCo** — Info, support. No code.
- **Donnie** — SEO, strategy, research, content. No code.

**Max does NOT write code. Ever.**

## Key Files to Know

- `projects/roadmap.md` — Portfolio status and next actions
- `strategy/mission.md` — Business model and playbook
- `infra/server-resource-map.md` — Server layout, ports, known risks
- `projects/datev-bereit/summary.md` — Flagship product status
- `team/workflow-rules.md` — Who does what

## Operational Rules (from infra notes)

- **Never enable Tailscale exit node** — permanently breaks inbound routing to datev-bereit.de (incident 2026-02-14)
- **datev-bereit.de takes resource priority** over all OpenClaw/agent tooling
- `qmd` embed indexer can spike to 400% CPU — use `/usr/local/bin/qmd-limited` wrapper
- Docker internal DNS conflicts with Tailscale: web container uses `network_mode: host`

## Writing Notes

- Use `[[wikilinks]]` to link between notes (Obsidian-compatible)
- Date format: YYYY-MM-DD
- Everything gets a folder home — no loose files in root
