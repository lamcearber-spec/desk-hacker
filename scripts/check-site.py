#!/usr/bin/env python3
"""Check site health and conversions."""
import subprocess, requests

def sql(q):
    return subprocess.run(f'PGPASSWORD=datev_secret psql -U datev -d konverter_pro -h 127.0.0.1 -t -c "{q}"', shell=True, capture_output=True, text=True).stdout.strip()

print("=== Site Health ===")
print("✓ Web:" if requests.get("https://konverter-pro.de", timeout=10).ok else "✗ Web DOWN")
print("✓ API:" if requests.get("https://api.konverter-pro.de/health", timeout=10).ok else "✗ API DOWN")

print("\n=== Metrics ===")
print(f"Conversions (24h): {sql('SELECT COUNT(*) FROM conversions WHERE created_at > NOW() - INTERVAL 24 hours')}")
print(f"New users (today): {sql('SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE')}")