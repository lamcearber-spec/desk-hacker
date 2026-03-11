#!/usr/bin/env python3
"""
Google Search Console API Script for konverter-pro.de

Usage:
  python3 google-search-console.py performance    # Last 7 days search performance
  python3 google-search-console.py queries         # Top queries
  python3 google-search-console.py pages           # Top pages
  python3 google-search-console.py inspect <url>   # URL inspection
  python3 google-search-console.py sitemaps        # List sitemaps
  python3 google-search-console.py sites           # List verified sites

Auth: Uses OAuth token from /root/clawd/tools/google-ads/search-console-token.json
      with client credentials from /root/clawd/tools/google-ads/client_secret.json
"""
import sys, json, requests, os
from datetime import datetime, timedelta
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================
TOKEN_FILE = Path("/root/clawd/tools/google-ads/search-console-token.json")
CLIENT_FILE = Path("/root/clawd/tools/google-ads/client_secret.json")
SITE_URL = "sc-domain:konverter-pro.de"  # Domain property

def _get_bashrc_key(key_name):
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
# AUTH
# ============================================================
def get_access_token():
    """Refresh and return a valid access token."""
    token_data = json.loads(TOKEN_FILE.read_text())
    client = json.load(open(CLIENT_FILE))["installed"]

    resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": client["client_id"],
        "client_secret": client["client_secret"],
        "refresh_token": token_data["refresh_token"],
        "grant_type": "refresh_token"
    })

    if resp.ok:
        new_token = resp.json()
        # Save updated token
        token_data["access_token"] = new_token["access_token"]
        TOKEN_FILE.write_text(json.dumps(token_data, indent=2))
        return new_token["access_token"]
    else:
        print(f"❌ Token refresh failed: {resp.text}")
        sys.exit(1)


def api(method, endpoint, data=None):
    """Make an authenticated API request."""
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"https://searchconsole.googleapis.com/webmasters/v3/{endpoint}"

    if method == "GET":
        r = requests.get(url, headers=headers)
    else:
        r = requests.post(url, headers=headers, json=data)

    if r.ok:
        return r.json()
    else:
        print(f"❌ API error ({r.status_code}): {r.text[:500]}")
        return None


# ============================================================
# COMMANDS
# ============================================================
def list_sites():
    """List all verified sites."""
    result = api("GET", "sites")
    if result:
        print("📋 Verified Sites:\n")
        for site in result.get("siteEntry", []):
            url = site.get("siteUrl", "")
            level = site.get("permissionLevel", "")
            print(f"  • {url} ({level})")


def performance(days=7, dimension="query"):
    """Get search performance data."""
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    data = {
        "startDate": start,
        "endDate": end,
        "dimensions": [dimension],
        "rowLimit": 25,
        "dataState": "all"
    }

    encoded_site = requests.utils.quote(SITE_URL, safe="")
    result = api("POST", f"sites/{encoded_site}/searchAnalytics/query", data)

    if not result:
        return

    rows = result.get("rows", [])
    if not rows:
        print(f"📭 No data for last {days} days.")
        return

    print(f"📊 Search Performance — Last {days} days ({start} → {end})")
    print(f"   Site: {SITE_URL}\n")

    # Summary
    total_clicks = sum(r.get("clicks", 0) for r in rows)
    total_impressions = sum(r.get("impressions", 0) for r in rows)
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0
    avg_pos = sum(r.get("position", 0) for r in rows) / len(rows) if rows else 0

    print(f"   Total: {total_clicks} clicks, {total_impressions} impressions, {avg_ctr:.1f}% CTR, avg pos {avg_pos:.1f}\n")

    # Table
    dim_label = dimension.upper()
    print(f"   {'#':>3}  {dim_label:<50} {'CLICKS':>7} {'IMPR':>7} {'CTR':>7} {'POS':>5}")
    print(f"   {'─'*3}  {'─'*50} {'─'*7} {'─'*7} {'─'*7} {'─'*5}")

    for i, row in enumerate(rows, 1):
        keys = row.get("keys", [""])
        key = keys[0] if keys else ""
        clicks = row.get("clicks", 0)
        impr = row.get("impressions", 0)
        ctr = row.get("ctr", 0) * 100
        pos = row.get("position", 0)
        print(f"   {i:>3}  {key:<50} {clicks:>7} {impr:>7} {ctr:>6.1f}% {pos:>5.1f}")


def queries():
    """Top search queries."""
    performance(days=7, dimension="query")


def pages():
    """Top pages."""
    performance(days=7, dimension="page")


def sitemaps():
    """List sitemaps."""
    encoded_site = requests.utils.quote(SITE_URL, safe="")
    result = api("GET", f"sites/{encoded_site}/sitemaps")
    if result:
        entries = result.get("sitemap", [])
        if not entries:
            print("📭 No sitemaps found.")
            return
        print("🗺️ Sitemaps:\n")
        for s in entries:
            path = s.get("path", "")
            submitted = s.get("lastSubmitted", "")
            print(f"  • {path} (submitted: {submitted})")


def inspect(url):
    """Inspect a URL."""
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    r = requests.post(
        "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        headers=headers,
        json={
            "inspectionUrl": url,
            "siteUrl": SITE_URL
        }
    )

    if r.ok:
        result = r.json().get("inspectionResult", {})
        index_status = result.get("indexStatusResult", {})
        verdict = index_status.get("verdict", "UNKNOWN")
        coverage = index_status.get("coverageState", "UNKNOWN")
        crawled = index_status.get("lastCrawlTime", "never")
        robot = index_status.get("robotsTxtState", "UNKNOWN")

        print(f"🔍 URL Inspection: {url}\n")
        print(f"   Verdict:    {verdict}")
        print(f"   Coverage:   {coverage}")
        print(f"   Last crawl: {crawled}")
        print(f"   Robots.txt: {robot}")
    else:
        print(f"❌ Inspection failed ({r.status_code}): {r.text[:500]}")


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "performance":
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
        performance(days=days)
    elif cmd == "queries":
        queries()
    elif cmd == "pages":
        pages()
    elif cmd == "sitemaps":
        sitemaps()
    elif cmd == "sites":
        list_sites()
    elif cmd == "inspect":
        if len(sys.argv) < 3:
            print("Usage: google-search-console.py inspect <url>")
        else:
            inspect(sys.argv[2])
    else:
        print(__doc__)
