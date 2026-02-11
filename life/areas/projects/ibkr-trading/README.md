# IBKR Trading Bot Project

## Overview
Autonomous options trading by following a Twitter trader and replicating his simpler trades (puts and calls only, no margin).

## Status
🟡 Setting up

## Account
- **Broker:** Interactive Brokers (IBKR)
- **Account ID:** U15948362
- **Capital:** €300 (€88 available now, €220 incoming in ~2 days)
- **Risk tolerance:** Full loss acceptable
- **Allowed:** Any trade the account permissions and budget allow
- **Replicate:** Every trade from @ZeeContrarian1 that fits within our constraints

## Twitter Trader
- **Handle:** @ZeeContrarian1 (Z)
- **Style:** Macro/geopolitical trader, volatility harvesting, asymmetric bets
- **Instruments:** Crude oil (futures/USO), VIX, QQQ, individual stocks (NBIS, IREN, KMDA)
- **Timeframes:** Tactical 7-14 days, some longer holds
- **Key trait:** Always specifies stop losses (-0.2, -2, -3 on positions)

### Trading Style Analysis
- Loves asymmetric risk/reward (small premium, large potential payout)
- Heavy on ratio spreads, layered positions
- Current themes: Long crude oil (Iran geopolitics), short-term VIX plays
- **Rule:** Replicate every trade that account permissions + €300 budget allow

### Recent Trades (Jan 2026)
- Long crude oil ~35% allocation (via CL1 futures + options) — can replicate via USO calls
- $KMDA long-term hold (biotech, "never sell")
- $NBIS & $IREN — was bullish, now tactically bearish short-term
- $VIX combos for tariff/Iran volatility

## Monitoring Setup
- **Frequency:** Every 10 minutes during US market hours
- **Market hours:** 9:30 AM - 4:00 PM ET (15:30 - 22:00 CET)
- **Tool:** bird CLI for Twitter scraping

## Rules (to develop)
- Entry: Replicate trader's calls/puts when posted
- Exit: TBD (need to study his style first)
- Position sizing: TBD
- Stop loss: TBD

## Access
- **IBKR API:** ✅ Connected via IB Gateway on port 4001
- **Gateway location:** Hetzner server (46.224.214.8)
- **API mode:** IB API (not FIX)
- **Twitter:** bird CLI with existing auth

## IB Gateway Setup
- **Install path:** /opt/ibgateway
- **IBC path:** /opt/ibc
- **Config:** /root/ibc/config.ini
- **Logs:** /root/ibc/logs/
- **Virtual display:** :99 (Xvfb)
- **VNC port:** 5900 (no password)

## Daily Reporting
- Report to Arber daily on:
  - Open positions
  - Closed trades (P&L)
  - Account balance
  - Notable tweets/signals

## Log
- 2026-01-29: Project created. Awaiting Twitter handle and IBKR API access.
