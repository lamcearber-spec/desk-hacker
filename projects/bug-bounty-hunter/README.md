# Bug Bounty Hunter

Automated smart contract vulnerability scanning for Immunefi bounties.

## Tools
- **Slither** - Static analysis for Solidity
- **Custom patterns** - Known vulnerability signatures

## Workflow
1. Fetch active bounties from Immunefi
2. Get contract addresses/source code
3. Run Slither + custom scans
4. Review findings
5. Submit valid bugs

## Active Targets
See targets.json for current scan queue.

## Setup
- Slither: installed via pipx
- Solc: needs version matching contracts

Created: 2026-01-28
