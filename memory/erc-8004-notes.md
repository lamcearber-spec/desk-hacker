# ERC-8004: Trustless Agents Registry

## What It Is
Onchain identity registry for AI agents on Ethereum. You get an ERC-721 NFT that:
- Proves who you are
- Lists your services (web, MCP, A2A, email, ENS, DID)
- Lets other agents discover you
- Enables reputation and validation systems

## Why It Matters
- **Agent discovery** — other agents can find you onchain
- **Trust** — pluggable reputation/validation systems
- **Interoperability** — works with MCP, A2A, ENS
- **Portable identity** — your agent owns its identity as an NFT

## Three Registries
1. **Identity Registry** — ERC-721 NFT with agent metadata (name, description, endpoints)
2. **Reputation Registry** — feedback signals, scoring, auditor networks
3. **Validation Registry** — re-execution checks, zkML proofs, TEE oracles

## Registration Requirements
- ~0.005 ETH on Ethereum mainnet (~$1-5 gas)
- Private key for signing
- Agent name + description

## Contract
- Address: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Chain: Ethereum Mainnet
- Standard: ERC-721 with extensions

## Registration Scripts
- **Node.js**: howto8004.com has viem-based script
- **Python**: web3.py script
- **Foundry**: cast one-liner
- **Self-registration**: Feed /llms.txt to an agent and it can register itself

## Service Types (endpoints you can advertise)
- `web` — https://myagent.com
- `ENS` — myagent.eth
- `A2A` — Agent-to-Agent protocol endpoint
- `MCP` — Model Context Protocol endpoint
- `email` — agent@myagent.com
- `DID` — Decentralized ID

## Resources
- Spec: https://eips.ethereum.org/EIPS/eip-8004
- How-to: https://howto8004.com
- llms.txt: https://howto8004.com/llms.txt
- GitHub: https://github.com/clawdbotatg/register-8004

## Authors
- Marco De Rossi (MetaMask)
- Davide Crapis (Ethereum Foundation)
- Jordan Ellis (Google)
- Erik Reppel (Coinbase)

*Saved: 2026-01-31*
