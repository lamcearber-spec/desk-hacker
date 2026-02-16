---
name: lead-gen-service
description: Build and sell B2B lead lists for the German market. Use when scraping public directories, cleaning lead data, packaging lists, finding buyers, or managing the lead gen pipeline. Covers data sourcing, validation, packaging, and sales.
---

# B2B Lead Gen Service

## Mission
Build sellable B2B lead lists from public German data sources. Revenue through list sales and subscriptions.

## Workflow

### 1. Source Identification
- German company registers (Handelsregister — public data)
- Industry directories (WLW, Gelbe Seiten, public listings)
- Professional associations (Steuerberaterkammer, IHK member lists)
- Job boards (for hiring signal = budget signal)
- Output: source list in `vault/projects/lead-gen-service/sources.md`

### 2. Data Collection
- Scrape ONLY publicly available data
- Fields: company name, industry, location, website, email (if public), size estimate
- Use web_fetch and exec tools for scraping
- Store raw data in `vault/projects/lead-gen-service/raw/`

### 3. Data Cleaning & Enrichment
- Deduplicate entries
- Validate emails (format check, MX record check)
- Categorize by industry, size, location
- Score leads (hiring = high score, active web presence = high score)
- Output: cleaned lists in `vault/projects/lead-gen-service/lists/`

### 4. Packaging & Sales
- Package into niche lists (e.g., "500 German Steuerberater with websites")
- Pricing: €0.10-0.50 per lead depending on enrichment level
- Sales channels: Fiverr, direct outreach, LinkedIn
- Output: sales tracker in `vault/projects/lead-gen-service/sales.md`

## Rules
- **PUBLIC DATA ONLY** — no scraping behind login walls
- No personal data (GDPR compliance) — business data only
- No spam, no unsolicited bulk email
- Document all sources and methods
- Update vault after every work session

## Progress Tracking
Update `vault/projects/lead-gen-service/summary.md` after every session with:
- Sources identified
- Leads collected
- Lists packaged
- Sales made
