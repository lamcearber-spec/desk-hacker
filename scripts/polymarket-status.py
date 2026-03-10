#!/usr/bin/env python3
"""Polymarket wallet status."""
import requests

WALLET = "0x5910B772559959D039D31e86E9847b827B7C8C9E"
PROXIES = {"https": "socks5h://127.0.0.1:9050", "http": "socks5h://127.0.0.1:9050"}
BETS = {
    "0x2e13b4e6de50dd80f41495c822333abbc845732a5adce0f06a760ad244fe1fda": "SpaceX 9 launches (Mar 2026)",
    "0xa312499c150a1ca94b788c99f6ae721cbbdfda7679b5d25580fe79d514fdb930": "Fidesz/Orbán wins Hungary",
    "0xfa3dc3876b9210267914d74d4686a2c71bec3bf37bc1dc059a70f3e3e41ca1a7": "US Measles ≥7,500 (2026)",
}

positions = requests.get(f"https://data-api.polymarket.com/positions?user={WALLET}", proxies=PROXIES, timeout=30).json()
total_pnl = 0
print(f"=== Polymarket: {WALLET[:10]}... ===\n")
for p in positions:
    name = BETS.get(p.get("conditionId"), p.get("conditionId", "")[:20])
    pnl = p.get("cashPnl", 0)
    total_pnl += pnl
    print(f"📊 {name}")
    print(f"   ${p.get('initialValue',0):.2f} → ${p.get('currentValue',0):.2f} | P&L: ${pnl:.2f} ({p.get('percentPnl',0):.1f}%)\n")
print(f"Total P&L: ${total_pnl:.2f}")