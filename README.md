<div align="center">

<img src="apps/web/public/brand/sama-mark.png" alt="SAMA" width="88" />

# SAMA

### Invest in what comes next.

A testnet startup marketplace for explicit valuation preferences, uniform-price allocation, and verifiable settlement on Arbitrum.

[Documentation source](docs/README.md) · [GitBook](https://sama-3.gitbook.io/sama-product-and-protocol/) · [Judge's guide](docs/JUDGES_GUIDE.md) · [Release status](docs/RELEASE_STATUS.md) · [Implementation PR](https://github.com/EndPx/sama/pull/3)

[![CI](https://github.com/EndPx/sama/actions/workflows/ci.yml/badge.svg?branch=feat%2Fp0-vertical-slice)](https://github.com/EndPx/sama/actions/workflows/ci.yml)
[![Security](https://github.com/EndPx/sama/actions/workflows/security.yml/badge.svg?branch=feat%2Fp0-vertical-slice)](https://github.com/EndPx/sama/actions/workflows/security.yml)
[![Arbitrum Sepolia](https://img.shields.io/badge/Arbitrum-Sepolia-213147)](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info)
[![License: MIT](https://img.shields.io/badge/license-MIT-173F35.svg)](LICENSE)

</div>

![SAMA's imagined innovation campus — original generated artwork, not a real company facility](apps/web/public/brand/sama-campus.png)

> [!IMPORTANT]
> In-development, testnet-only prototype. Kirana AI is fictional. SAMA demoUSDC is valueless and is **not Circle USDC**. KIRA is a simulated equity-linked demo token with no legal or economic rights. No regulatory approval, returns, liquidity, independent audit, or production readiness is claimed.

## The problem

Discovering a startup is only the beginning. A prospective backer still needs to understand the terms, express a valuation limit, and verify how allocation and subsequent transfers happen. SAMA explores that connected workflow—without claiming that Indonesia lacks existing crowdfunding access.

[The problem](docs/PROBLEM.md) · [How SAMA works](docs/PRODUCT.md) · [Five-bid walkthrough](docs/AUCTION_WALKTHROUGH.md)

## One startup. One complete path.

```text
Discover → Evaluate → Commit → Reveal → Settle → Claim → List → Buy
```

The auction commits each bidder's deposit and sealed maximum fully diluted valuation (FDV). After reveal, the contract selects one clearing FDV, checks the complete bidder set, records accepted capital and refunds, and enables pull-based claims. Deposit amounts are public; maximum FDV is sealed only until reveal.

The marketplace escrows KIRA, supports deterministic partial fills, protects a buyer's maximum cost, and returns unsold tokens through seller-controlled cancellation. It does not guarantee a buyer or liquidity.

## The reference round

| Term | Locked value |
|---|---:|
| Startup | Kirana AI — fictional Indonesian AI infrastructure company |
| Network | Arbitrum Sepolia, 421614 |
| Payment asset | SAMA demoUSDC, 6 decimals, no monetary value |
| Simulated allocation / KIRA supply | 10% / 1,000,000 KIRA |
| FDV range / minimum raise | 4M–6M / 400,000 demoUSDC |
| Five-bid fixture | 700,000 deposited → 480,000 accepted + 220,000 refundable |
| Clearing FDV / price | 4.8M / 0.48 demoUSDC per KIRA |

The [auction specification](docs/AUCTION_SPEC.md) is authoritative for economics. The [marketplace specification](docs/MARKETPLACE_SPEC.md) is authoritative for partial fills and rounding.

## Evidence, with limits

- **47 contract tests** pass locally, including reference-model fuzzing and **six stateful invariants**. The local lifecycle runner reproduces the five-bid round and secondary purchases.
- **51 frontend tests** pass, and the production build includes five original explanatory pages for participants, founders, the KIRA token model, the auction, and getting started.
- **64-bid settlement:** 2,120,427 isolated execution gas against a 2,500,000 ceiling. This is a local regression measurement, not an Arbitrum fee quote.
- **Static analysis:** 14 reviewed Slither findings, none High; lower-severity findings and assumptions remain documented.
- **CI:** format, lint, type checks, frontend/contract tests, build, deterministic snapshots, Slither and secret scanning. Inspect the run SHA before treating a badge as release evidence.
- **Still open:** full interactive wallet acceptance, verified public deployment, a hosted application, and production two-wallet proof.

[Security evidence](docs/SECURITY_EVIDENCE.md) · [Gas methodology](docs/GAS_EVIDENCE.md) · [Threat model](docs/THREAT_MODEL.md) · [Current release status](docs/RELEASE_STATUS.md)

## Architecture

The four protocol contracts are `EligibilityRegistry`, `KiranaOffering`, `EquityLinkedToken` and `SecondaryMarketplace`. Testnet-only `DemoUSDC` and `DemoAccess` provide valueless faucet funds and self-enrollment. Open enrollment is not identity verification.

Solidity / Foundry / OpenZeppelin form the tested core. The investor application is being built with Next.js, TypeScript, shadcn/ui, Privy, wagmi and viem. There is no database or trusted offchain settlement service on the P0 financial path.

[Architecture and role boundaries](docs/ARCHITECTURE.md) · [Why Arbitrum](docs/WHY_ARBITRUM.md) · [demoUSDC decision](docs/decisions/0001-testnet-demo-currency.md)

## Reproduce and review

Use the [clean-clone developer guide](docs/DEVELOPER_GUIDE.md). Initialize only the two direct submodules, use the pinned toolchain, and run the verification gates against the exact commit under review.

Read [SECURITY.md](SECURITY.md) before configuring credentials. Browser configuration is public; signing keys belong in an isolated Foundry keystore, never a repository env file.

## Hackathon

Built for the [Arbitrum Open House Singapore Online Buildathon](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon). The [judge's guide](docs/JUDGES_GUIDE.md) maps the story to inspectable evidence. The [demo runbook](docs/DEMO_RUNBOOK.md) preserves the reference arithmetic and labels seeded activity honestly.

The project owner handles the submission portal. SAMA's working name has not completed trademark clearance. Original generated artwork is documented in the [brand notes](docs/BRAND.md).

## License

[MIT](LICENSE) for source code. Third-party names identify integrations, not endorsement.
