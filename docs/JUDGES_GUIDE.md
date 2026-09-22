# Judge's guide

**SAMA explores a more legible startup-offering lifecycle: explicit valuation preferences, one clearing price, auditable claims, and subsequent token transfers.** It is a testnet experiment, not a regulated fundraising launch.

## The two-minute read

1. Read [the problem](PROBLEM.md): access is not the only issue; valuation, allocation and post-offering verification should form a coherent journey.
2. Read [the product](PRODUCT.md) and its five-bid example. The technical question is whether the complete financial lifecycle is reproducible, not whether a dashboard looks funded.
3. Check [release status](RELEASE_STATUS.md). Follow only the links with actual evidence; deployment, hosting and browser acceptance are still pending at this documentation revision.

## Assessment map

The [official buildathon page](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon) lists smart-contract quality, product-market fit, innovation/creativity and real problem solving, and requires deployment on an Arbitrum chain. SAMA's self-assessment is below; it is not an organizer endorsement or eligibility determination.

| Review lens | Design choice | Evidence to inspect | Honest limit |
|---|---|---|---|
| Contract quality | Verified bounded settlement, pull claims, escrow conservation | [Auction](AUCTION_SPEC.md), [marketplace](MARKETPLACE_SPEC.md), [security results](SECURITY_EVIDENCE.md) | No independent audit |
| Product-market fit | Indonesia-first, startup-focused journey | [Problem and validation plan](PROBLEM.md) | No claimed user traction or completed research |
| Innovation | Connected price discovery, restricted allocation and partial secondary settlement | [Product lifecycle](PRODUCT.md) | Existing auction primitives, not a new cryptographic protocol |
| Real problem solving | Transparent allocation and refund rules | Reference fixture and failure/recovery scenarios | Does not solve legal issuance or guarantee access/liquidity |
| Arbitrum execution | Solidity protocol targeting Arbitrum Sepolia | [Chain rationale](WHY_ARBITRUM.md), then the release manifest | Public deployment proof remains a release gate |

## Three technical checks worth making

**Recalculate the round.** In the reference fixture, 450,000 eligible units at 5M cannot buy a 10% allocation costing 500,000. At 4.8M, eligible demand is 600,000 and capacity is 480,000. Inspect B's 30,000 acceptance and 120,000 refund, and A's full 100,000 refund.

**Challenge the settlement input.** The tests mutate omission, duplication, unrevealed insertion, ordering, early and repeated settlement. The caller supplies a proposal; onchain verification decides whether it is valid.

**Follow a partial listing to zero.** Split purchases must deliver exactly the original KIRA for exactly the declared total price. Cancellation must return only the unsold remainder. The 3-unit / 2-base-unit fixture checks ceiling rounding and rejects a free remainder.

## What to expect from the final demo

One fictional startup, clearly identified seeded bidders, real testnet receipts and a two-wallet secondary transfer. Edited-out waiting periods must be disclosed. The [demo runbook](DEMO_RUNBOOK.md) and [submission checklist](SUBMISSION_CHECKLIST.md) define the remaining evidence; the owner handles the portal entry.

Start a reproducible technical review with the [developer guide](DEVELOPER_GUIDE.md).
