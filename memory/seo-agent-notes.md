# SEO Agent Notes - Claude Computer Use for SEO
*Source: X video from @bloggersarvesh (31 min)*
*Transcribed: 2026-01-27*

## Overview
Video demonstrates using **Claude Coworker** (Claude's computer use feature) as a 24/7 SEO automation assistant. The presenter has 14+ years SEO experience.

## Key Capabilities Demonstrated

### 1. Competition Analysis with Ahrefs
- Give Claude access to Chrome + Ahrefs subscription
- Ask it to analyze competitors for a keyword (e.g., "Roofer New York")
- **Smart filtering**: Claude automatically excludes directories (Yelp, etc.) and only analyzes actual business competitors
- Calculates:
  - Average Domain Rating (DR) of top 5 competitors
  - Average referring domains
  - Example: For "Roofer New York" - avg DR was 24.6, avg referring domains was 122

### 2. Keyword Research Automation
- Navigate to Ahrefs Keywords Explorer
- Find question-based keywords customers are asking
- **Key filter**: "Lowest DR in top 5" - find keywords where at least one site with DR <10 is ranking (easier to compete)
- Claude filters out DIY keywords (not your customers) vs. service-related questions
- Good questions found: "how much is a roofing square", "how to choose a good commercial roofing contractor"

### 3. On-Page SEO Audits
- Open competitor's ranking page
- Do quick on-page audit
- Find 5 things they're doing wrong that you can do better
- Example findings:
  - Site ranking for "New York" but content talks mostly about Brooklyn (location mismatch)
  - No video content on page

### 4. Multi-tasking
- Can run multiple tasks simultaneously:
  - Content creation
  - Keyword research
  - Email outreach (visit sites, find contact pages, extract emails, add to Google Sheet)

## Workflow Tips
1. **Prepare prompts in advance** - have a list ready
2. **Let it run overnight** - come back to completed research
3. **Iterate and correct** - if it makes mistakes (like including wrong business type), just tell it
4. **Take screenshots** - Claude captures data at each step

## Prompts Used (Examples)
```
"Go to Keywords Explorer, enter [keyword], open the questions section, find 10 questions my customers may be asking which I should create blogs around"

"I am a roofing contractor - only suggest keywords that my customers would ask before getting service from me. No DIY keywords."

"Locate the lowest DR filter and enter DR 10 in top five"

"Open the first site that is a business (not a directory) and do a quick on-page SEO audit - tell me 5 things they're doing wrong"
```

## For Our SEO Agent Implementation
- Need browser/computer use capability
- Integrate with SEO tools (Ahrefs, Semrush, Ubersuggest)
- Key tasks to automate:
  1. Competition analysis (DR, backlinks)
  2. Keyword research with smart filtering
  3. On-page SEO audits
  4. Content gap analysis
  5. Email extraction for outreach

## Limitations Noted
- Takes time (not instant) - treat as async virtual assistant
- May need corrections/iterations
- Works best with clear, step-by-step prompts

---

## Programmatic SEO (pSEO)
*Added: 2026-01-27*

### What Is It?
Creating **thousands of pages automatically** from templates + data, targeting long-tail keywords at scale.

### How It Works
1. Find a keyword pattern with lots of variations (e.g., "best [X] in [city]", "[tool] vs [tool]", "[job] salary in [location]")
2. Build a template page
3. Plug in data (from databases, APIs, scraping)
4. Auto-generate hundreds/thousands of unique pages

### Examples (Companies Using pSEO)
- **Zapier**: "[App] + [App] integrations" → thousands of pages
- **Nomad List**: "Cost of living in [city]"
- **Yelp**: "Best [category] in [city]"
- **Wise**: "[Currency] to [Currency] converter"
- **TripAdvisor**: "[Hotel] reviews", "[Restaurant] in [city]"
- **G2**: "[Software] alternatives", "[Software] vs [Software]"

### Why It Works
- Captures long-tail search traffic (low competition, high intent)
- Scales without writing each page manually
- Compounds over time — more pages = more entry points

### Key Success Factors
- **Genuinely useful data** — not just keyword stuffing
- **Template quality** — each page needs real value
- **Unique content per page** — avoid thin/duplicate content
- **Good internal linking** — connect related pages
- **Fast page load** — thousands of pages need efficient architecture

### Risks / Watch Out For
- Google's getting smarter at detecting thin/spammy pSEO
- Low-quality pSEO can trigger manual actions
- Need maintenance as data changes
- Can cannibalize keywords if pages are too similar

### Implementation Ideas for Our Apps
- Find data sources we can template (APIs, databases, user-generated)
- Identify repeatable keyword patterns in our niche
- Build once, generate many approach

---
*Note: Transcription was partial (~20 min of 31 min). Core concepts captured.*

---

## Google Ads API Integration
*Added: 2026-01-28*
*Source: https://x.com/boringmarketer/status/2016585711873355959*

### Concept
Use Claude to manage Google Ads campaigns directly via API — automated ad management without touching the dashboard.

### Capabilities
- **Campaign creation** — set up campaigns programmatically
- **Ad copy generation** — write and A/B test variations at scale
- **Bid optimization** — adjust bids based on performance data
- **Performance monitoring** — react to metrics in real-time
- **Budget management** — reallocate spend to winners

### Setup Required
1. Google Ads account (with billing)
2. Developer token (apply at developers.google.com/google-ads/api)
3. OAuth 2.0 credentials
4. Google Ads API client library

### Use Cases for DatevBereit
- Target keywords: "DATEV export", "Kontoauszug DATEV", "Buchhaltung automatisieren"
- Competitor targeting: bid on alternatives
- Retargeting: users who visited but didn't convert

### When to Implement
Post-launch, once:
- Stripe is integrated
- Core product is validated
- Ready for paid acquisition

---
