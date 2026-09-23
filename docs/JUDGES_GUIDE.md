# Review SAMA

SAMA is a testnet prototype for startup-offering price discovery. The reviewable question is whether its auction and marketplace produce the stated results, and whether a participant can follow those results through the app. Kirana AI and the bidding activity are fictional fixtures.

## A short route through the project

1. Read [the problem](PROBLEM.md) and [how SAMA works](PRODUCT.md) for the product idea.
2. Walk through the [five-bid auction](AUCTION_WALKTHROUGH.md). Check why 5.0M fails and 4.8M clears, including B's partial acceptance and A's full refund.
3. Open [release status](RELEASE_STATUS.md). It links passing checks and identifies which public proof is still missing.

If you want to run the tests, the [developer guide](DEVELOPER_GUIDE.md) starts with a clean clone and pinned toolchain.

## How it maps to the buildathon

The [official buildathon](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon) asks for Arbitrum deployment and evaluates contract quality, product-market fit, innovation, and problem solving. SAMA's evidence for those areas is concrete but uneven: contract behavior and local reproduction are testable now; the product thesis still needs user research; and public deployment remains outstanding. This is the project's self-assessment, not an organizer endorsement.

## Three checks worth making

**Challenge the bidder list.** Settlement accepts only the complete revealed set in the required order. Tests try omissions, duplicates, unrevealed addresses, wrong order, early settlement, and repeat settlement. The [auction rules](AUCTION_SPEC.md) explain the verification.

**Trace every unit.** The reference round deposits 700,000 demoUSDC: 480,000 is accepted and 220,000 is refundable. Claims and issuer withdrawal reduce outstanding liabilities until the offering escrow is empty. The marketplace tests follow KIRA and demoUSDC through partial purchases and cancellation.

**Check the bounds.** The protocol permits at most 64 revealed bids. The isolated 64-bid settlement test measured 2,120,427 gas against a 2,500,000 regression ceiling. [Gas evidence](GAS_EVIDENCE.md) explains the measurement; [security evidence](SECURITY_EVIDENCE.md) records tests, Slither findings, and limits. No independent audit is claimed.

## What is ready, and what is still a gate?

The repository has contract tests, fuzz and invariant coverage, a local five-bid lifecycle runner, frontend tests, and a production build. A public Arbitrum Sepolia deployment, verified source links, a hosted application, and a wallet-driven acceptance run are separate gates. [Release status](RELEASE_STATUS.md) is the current record; a green unit-test run does not stand in for a public transaction.

The project owner will submit through the hackathon portal. The [demo runbook](DEMO_RUNBOOK.md) lays out the intended three-minute presentation; it is a rehearsal script until public receipts exist.

[Source repository](https://github.com/EndPx/sama) · [Implementation PR](https://github.com/EndPx/sama/pull/3) · [Official buildathon](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon)
