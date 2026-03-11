#!/usr/bin/env python3
"""
Ads Optimization Loop — Anthropic-style Growth Marketing Pipeline
=================================================================

Inspired by Anthropic's one-person growth marketing team workflow:
1. Pull live performance data from Google Ads
2. Analyze what's underperforming
3. Generate new ad copy variations (split by headlines/descriptions)
4. Log hypotheses + results to memory for compounding learnings
5. Optionally apply changes

Usage:
  python ads-loop.py pull         # Pull current performance data to CSV
  python ads-loop.py analyze      # Analyze performance + find underperformers
  python ads-loop.py generate     # Generate new ad copy variations
  python ads-loop.py memory       # Show learning history
  python ads-loop.py full         # Run full loop: pull → analyze → generate → log
  python ads-loop.py apply        # Apply recommended changes (needs confirmation)
"""

import os
import sys
import json
import csv
import subprocess
from datetime import datetime, timedelta
from pathlib import Path


def _get_bashrc_key(key_name):
    """Read an env var, falling back to parsing ~/.bashrc."""
    val = os.environ.get(key_name)
    if val:
        return val
    try:
        with open(os.path.expanduser("~/.bashrc")) as f:
            for line in f:
                if key_name in line and "export" in line:
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except:
        pass
    return None

# ============================================================
# PATHS
# ============================================================
ADS_DIR = Path("/root/clawd/tools/google-ads")
DATA_DIR = Path("/root/clawd/memory/ads")
MEMORY_FILE = DATA_DIR / "learnings.json"
PERFORMANCE_CSV = DATA_DIR / "performance.csv"
SEARCH_TERMS_CSV = DATA_DIR / "search-terms.csv"
AD_COPY_CSV = DATA_DIR / "ad-copy.csv"
GENERATED_DIR = DATA_DIR / "generated"

# Ensure dirs exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# GOOGLE ADS API
# ============================================================
GOOGLE_ADS_CONFIG = {
    "developer_token": _get_bashrc_key("GOOGLE_ADS_DEV_TOKEN") or os.environ.get("GOOGLE_ADS_DEV_TOKEN", ""),
    "client_id": _get_bashrc_key("GOOGLE_ADS_CLIENT_ID") or os.environ.get("GOOGLE_ADS_CLIENT_ID", ""),
    "client_secret": _get_bashrc_key("GOOGLE_ADS_CLIENT_SECRET") or os.environ.get("GOOGLE_ADS_CLIENT_SECRET", ""),
    "refresh_token": _get_bashrc_key("GOOGLE_ADS_REFRESH_TOKEN") or os.environ.get("GOOGLE_ADS_REFRESH_TOKEN", ""),
    "login_customer_id": "9918036486",
    "use_proto_plus": True,
}
CUSTOMER_ID = "5868493025"


def get_client():
    from google.ads.googleads.client import GoogleAdsClient
    return GoogleAdsClient.load_from_dict(GOOGLE_ADS_CONFIG)


# ============================================================
# 1. PULL — Export live performance data to CSV
# ============================================================
def pull():
    """Pull campaign, keyword, ad, and search term data from Google Ads API."""
    client = get_client()
    ga = client.get_service("GoogleAdsService")
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"📥 Pulling Google Ads data ({today})...")

    # --- Campaign performance ---
    rows = []
    query = """
        SELECT
            campaign.id, campaign.name, campaign.status,
            ad_group.id, ad_group.name,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions, metrics.ctr, metrics.average_cpc
        FROM ad_group
        WHERE campaign.status = 'ENABLED'
        AND segments.date DURING LAST_14_DAYS
    """
    try:
        response = ga.search(customer_id=CUSTOMER_ID, query=query)
        for row in response:
            rows.append({
                "date": today,
                "campaign_id": row.campaign.id,
                "campaign": row.campaign.name,
                "campaign_status": row.campaign.status.name,
                "ad_group_id": row.ad_group.id,
                "ad_group": row.ad_group.name,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "cost": row.metrics.cost_micros / 1_000_000,
                "conversions": row.metrics.conversions,
                "ctr": round(row.metrics.ctr * 100, 2),
                "avg_cpc": row.metrics.average_cpc / 1_000_000 if row.metrics.average_cpc else 0,
            })
    except Exception as e:
        print(f"⚠️  Campaign query error: {e}")

    if rows:
        with open(PERFORMANCE_CSV, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys())
            w.writeheader()
            w.writerows(rows)
        print(f"  ✅ {len(rows)} ad group rows → {PERFORMANCE_CSV}")
    else:
        print("  ⚠️  No enabled campaigns found")

    # --- Keyword performance ---
    kw_rows = []
    kw_query = """
        SELECT
            campaign.name,
            ad_group.name,
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions, metrics.ctr
        FROM keyword_view
        WHERE campaign.status = 'ENABLED'
        AND segments.date DURING LAST_14_DAYS
    """
    try:
        response = ga.search(customer_id=CUSTOMER_ID, query=kw_query)
        for row in response:
            kw_rows.append({
                "campaign": row.campaign.name,
                "ad_group": row.ad_group.name,
                "keyword": row.ad_group_criterion.keyword.text,
                "match_type": row.ad_group_criterion.keyword.match_type.name,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "cost": round(row.metrics.cost_micros / 1_000_000, 2),
                "conversions": row.metrics.conversions,
                "ctr": round(row.metrics.ctr * 100, 2),
            })
    except Exception as e:
        print(f"⚠️  Keyword query error: {e}")

    kw_file = DATA_DIR / "keywords.csv"
    if kw_rows:
        with open(kw_file, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=kw_rows[0].keys())
            w.writeheader()
            w.writerows(kw_rows)
        print(f"  ✅ {len(kw_rows)} keyword rows → {kw_file}")

    # --- Search terms ---
    st_rows = []
    st_query = """
        SELECT
            campaign.name,
            search_term_view.search_term,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions, metrics.ctr
        FROM search_term_view
        WHERE campaign.status = 'ENABLED'
        AND segments.date DURING LAST_14_DAYS
    """
    try:
        response = ga.search(customer_id=CUSTOMER_ID, query=st_query)
        for row in response:
            st_rows.append({
                "campaign": row.campaign.name,
                "search_term": row.search_term_view.search_term,
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "cost": round(row.metrics.cost_micros / 1_000_000, 2),
                "conversions": row.metrics.conversions,
                "ctr": round(row.metrics.ctr * 100, 2),
            })
    except Exception as e:
        print(f"⚠️  Search terms query error: {e}")

    if st_rows:
        with open(SEARCH_TERMS_CSV, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=st_rows[0].keys())
            w.writeheader()
            w.writerows(st_rows)
        print(f"  ✅ {len(st_rows)} search term rows → {SEARCH_TERMS_CSV}")

    # --- Ad copy performance ---
    ad_rows = []
    ad_query = """
        SELECT
            campaign.name, ad_group.name,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            metrics.impressions, metrics.clicks, metrics.ctr,
            metrics.conversions, metrics.cost_micros
        FROM ad_group_ad
        WHERE campaign.status = 'ENABLED'
        AND ad_group_ad.status = 'ENABLED'
        AND segments.date DURING LAST_14_DAYS
    """
    try:
        response = ga.search(customer_id=CUSTOMER_ID, query=ad_query)
        for row in response:
            headlines = [h.text for h in row.ad_group_ad.ad.responsive_search_ad.headlines]
            descriptions = [d.text for d in row.ad_group_ad.ad.responsive_search_ad.descriptions]
            ad_rows.append({
                "campaign": row.campaign.name,
                "ad_group": row.ad_group.name,
                "headlines": " | ".join(headlines),
                "descriptions": " | ".join(descriptions),
                "impressions": row.metrics.impressions,
                "clicks": row.metrics.clicks,
                "ctr": round(row.metrics.ctr * 100, 2),
                "conversions": row.metrics.conversions,
                "cost": round(row.metrics.cost_micros / 1_000_000, 2),
            })
    except Exception as e:
        print(f"⚠️  Ad copy query error: {e}")

    if ad_rows:
        with open(AD_COPY_CSV, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=ad_rows[0].keys())
            w.writeheader()
            w.writerows(ad_rows)
        print(f"  ✅ {len(ad_rows)} ad rows → {AD_COPY_CSV}")

    print(f"\n📁 All data saved to {DATA_DIR}/")
    return True


# ============================================================
# 2. ANALYZE — Find underperformers and opportunities
# ============================================================
def analyze():
    """Analyze exported data and produce insights."""
    print("🔍 Analyzing performance data...\n")

    # Load previous learnings for context
    learnings = load_memory()
    learnings_context = ""
    if learnings:
        recent = learnings[-5:]  # Last 5 entries
        learnings_context = "\n\nPREVIOUS LEARNINGS (use these to inform analysis):\n"
        for l in recent:
            learnings_context += f"- [{l['date']}] {l['insight']}\n"

    # Read all CSVs
    data_files = {}
    for name, path in [
        ("performance", PERFORMANCE_CSV),
        ("keywords", DATA_DIR / "keywords.csv"),
        ("search_terms", SEARCH_TERMS_CSV),
        ("ad_copy", AD_COPY_CSV),
    ]:
        if path.exists():
            data_files[name] = path.read_text()

    if not data_files:
        print("❌ No data files found. Run 'pull' first.")
        return None

    # Build prompt for Claude
    prompt = f"""You are a Google Ads performance analyst for konverter-pro.de, a B2B SaaS that converts bank statements, Stripe & Shopify payouts into DATEV format for German accountants and freelancers.

Pricing: Free (1 conv/mo), Starter €5/mo (20/mo), Pro €15/mo (100/mo), Business €50/mo (500/mo)

Analyze this Google Ads data and provide:

1. **UNDERPERFORMERS** — Keywords/ads wasting budget (high cost, low/no conversions or clicks)
2. **WINNERS** — What's working well (high CTR, good cost efficiency)
3. **OPPORTUNITIES** — Missing keywords, search terms to add as exact match, negative keywords to add
4. **AD COPY ISSUES** — Headlines/descriptions that could be improved
5. **BUDGET ALLOCATION** — Where to shift spend

Be specific with numbers. Reference actual keywords and metrics.
{learnings_context}

DATA:
"""
    for name, content in data_files.items():
        prompt += f"\n--- {name.upper()} ---\n{content}\n"

    # Call Claude via CLI
    result = run_claude(prompt, "analysis")
    if result:
        # Save analysis
        analysis_file = DATA_DIR / f"analysis-{datetime.now().strftime('%Y%m%d')}.md"
        analysis_file.write_text(f"# Google Ads Analysis — {datetime.now().strftime('%Y-%m-%d')}\n\n{result}")
        print(f"\n📄 Analysis saved to {analysis_file}")
    return result


# ============================================================
# 3. GENERATE — New ad copy variations
# ============================================================
def generate():
    """Generate new headlines and descriptions using specialized sub-prompts."""
    print("✍️  Generating new ad copy variations...\n")

    # Load existing ad copy for context
    existing_copy = ""
    if AD_COPY_CSV.exists():
        existing_copy = AD_COPY_CSV.read_text()

    # Load learnings
    learnings = load_memory()
    learnings_context = ""
    if learnings:
        copy_learnings = [l for l in learnings if "copy" in l.get("category", "").lower() or "headline" in l.get("insight", "").lower() or "ad" in l.get("insight", "").lower()]
        if copy_learnings:
            learnings_context = "\nPREVIOUS AD COPY LEARNINGS:\n"
            for l in copy_learnings[-5:]:
                learnings_context += f"- {l['insight']}\n"

    # --- Sub-agent 1: Headlines (max 30 chars) ---
    headline_prompt = f"""You are a Google Ads headline specialist for konverter-pro.de.

Product: B2B SaaS converting bank statements, Stripe & Shopify payouts → DATEV format
Target: German freelancers, Steuerberater, e-commerce sellers
Language: German

STRICT CONSTRAINT: Each headline must be ≤ 30 characters (including spaces).

Generate 15 new headline variations. Focus on:
- Pain points (manual data entry, format errors)
- Benefits (time savings, accuracy, automation)
- Specificity (mention DATEV, Stripe, Shopify, CSV)
- CTAs (Jetzt testen, Kostenlos starten)
- Numbers/social proof when possible

{learnings_context}

EXISTING HEADLINES (don't repeat these):
{existing_copy}

Output format — one per line:
HEADLINE | CHARACTER_COUNT
"""

    # --- Sub-agent 2: Descriptions (max 90 chars) ---
    description_prompt = f"""You are a Google Ads description specialist for konverter-pro.de.

Product: B2B SaaS converting bank statements, Stripe & Shopify payouts → DATEV format
Target: German freelancers, Steuerberater, e-commerce sellers  
Language: German
Pricing: Free plan available, Starter €5/mo

STRICT CONSTRAINT: Each description must be ≤ 90 characters (including spaces).

Generate 15 new description variations. Focus on:
- Explaining what the tool does clearly
- Highlighting the free plan or low price
- Addressing pain points (manual DATEV import, format errors)
- Including CTAs
- Mentioning supported formats (CSV, MT940, Stripe, Shopify)

{learnings_context}

EXISTING DESCRIPTIONS (don't repeat these):
{existing_copy}

Output format — one per line:
DESCRIPTION | CHARACTER_COUNT
"""

    print("  📝 Generating headlines (≤30 chars)...")
    headlines = run_claude(headline_prompt, "headlines")

    print("  📝 Generating descriptions (≤90 chars)...")
    descriptions = run_claude(description_prompt, "descriptions")

    # Save generated copy
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    if headlines:
        out = GENERATED_DIR / f"headlines-{timestamp}.txt"
        out.write_text(headlines)
        print(f"  ✅ Headlines → {out}")

    if descriptions:
        out = GENERATED_DIR / f"descriptions-{timestamp}.txt"
        out.write_text(descriptions)
        print(f"  ✅ Descriptions → {out}")

    return headlines, descriptions


# ============================================================
# 4. MEMORY — Learning log
# ============================================================
def load_memory():
    """Load learnings from memory file."""
    if MEMORY_FILE.exists():
        return json.loads(MEMORY_FILE.read_text())
    return []


def save_learning(insight, category="general", metrics=None):
    """Save a new learning to the memory file."""
    learnings = load_memory()
    learnings.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "insight": insight,
        "category": category,
        "metrics": metrics or {},
        "cycle": len(learnings) + 1,
    })
    MEMORY_FILE.write_text(json.dumps(learnings, indent=2, ensure_ascii=False))
    return len(learnings)


def show_memory():
    """Display learning history."""
    learnings = load_memory()
    if not learnings:
        print("📭 No learnings recorded yet. Run 'full' to start the loop.")
        return

    print(f"🧠 Ad Optimization Learnings ({len(learnings)} entries)\n")
    print("=" * 60)
    for l in learnings:
        print(f"[{l['date']}] Cycle #{l.get('cycle', '?')} ({l.get('category', 'general')})")
        print(f"  → {l['insight']}")
        if l.get("metrics"):
            print(f"  📊 {l['metrics']}")
        print()


# ============================================================
# 5. FULL LOOP — Pull → Analyze → Generate → Log
# ============================================================
def full_loop():
    """Run the complete optimization loop."""
    print("🔄 RUNNING FULL ADS OPTIMIZATION LOOP")
    print("=" * 60)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"Started: {ts}\n")

    # Step 1: Pull data
    print("━" * 40)
    print("STEP 1/4: Pull live data")
    print("━" * 40)
    pull()

    # Step 2: Analyze
    print(f"\n{'━' * 40}")
    print("STEP 2/4: Analyze performance")
    print("━" * 40)
    analysis = analyze()

    # Step 3: Generate new copy
    print(f"\n{'━' * 40}")
    print("STEP 3/4: Generate new ad copy")
    print("━" * 40)
    headlines, descriptions = generate()

    # Step 4: Log learnings
    print(f"\n{'━' * 40}")
    print("STEP 4/4: Log learnings")
    print("━" * 40)

    if analysis:
        # Extract key insights from analysis for memory
        summary_prompt = f"""From this Google Ads analysis, extract the 3 most important actionable insights. 
Each should be one sentence, specific, with metrics where possible.
Format: one insight per line, no bullets or numbers.

{analysis}"""
        insights = run_claude(summary_prompt, "summary")
        if insights:
            for line in insights.strip().split("\n"):
                line = line.strip()
                if line and len(line) > 10:
                    save_learning(line, category="analysis")
                    print(f"  💾 Saved: {line}")

    print(f"\n{'=' * 60}")
    print("✅ OPTIMIZATION LOOP COMPLETE")
    print(f"📁 Data: {DATA_DIR}/")
    print(f"📝 Generated copy: {GENERATED_DIR}/")
    print(f"🧠 Learnings: {MEMORY_FILE}")
    print(f"{'=' * 60}")


# ============================================================
# HELPERS
# ============================================================
def run_claude(prompt, label="query"):
    """Run a prompt through an LLM. Uses xAI Grok (free) → Ollama Qwen (free local) → Claude fallback."""
    from openai import OpenAI

    # Try xAI Grok first (free, configured in OpenClaw)
    xai_key = _get_bashrc_key("XAI_API_KEY")
    if xai_key:
        try:
            client = OpenAI(api_key=xai_key, base_url="https://api.x.ai/v1")
            response = client.chat.completions.create(
                model="grok-4-1-fast",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"  ⚠️  xAI error ({label}): {e}")

    # Try Ollama Qwen (free, local)
    try:
        client = OpenAI(api_key="ollama", base_url="http://localhost:11434/v1")
        response = client.chat.completions.create(
            model="qwen3.5:4b",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"  ⚠️  Ollama error ({label}): {e}")

    # Try Gemini as last resort
    gemini_result = run_gemini(prompt, label)
    if gemini_result:
        return gemini_result

    print(f"  ❌ All LLM providers failed for {label}")
    return None


def _get_bashrc_key(key_name):
    """Read an env var, falling back to parsing ~/.bashrc."""
    val = os.environ.get(key_name)
    if val:
        return val
    try:
        with open(os.path.expanduser("~/.bashrc")) as f:
            for line in f:
                if key_name in line and "export" in line:
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except:
        pass
    return None


def run_gemini(prompt, label="query"):
    """Fallback to Gemini Flash for analysis if Claude fails."""
    try:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            try:
                with open(os.path.expanduser("~/.bashrc")) as f:
                    for line in f:
                        if "GEMINI_API_KEY" in line and "export" in line:
                            api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                            break
            except:
                pass

        if not api_key:
            print(f"  ❌ No GEMINI_API_KEY found for fallback ({label})")
            return None

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"  ❌ Gemini fallback error ({label}): {e}")
        return None


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "pull":
        pull()
    elif cmd == "analyze":
        analyze()
    elif cmd == "generate":
        generate()
    elif cmd == "memory":
        show_memory()
    elif cmd == "full":
        full_loop()
    elif cmd == "learn":
        # Manual learning entry
        if len(sys.argv) < 3:
            print("Usage: ads-loop.py learn 'your insight here' [category]")
        else:
            cat = sys.argv[3] if len(sys.argv) > 3 else "manual"
            n = save_learning(sys.argv[2], category=cat)
            print(f"💾 Saved learning #{n}")
    else:
        print(__doc__)
