# SAMA — from conviction to verifiable allocation

**A startup-marketplace prototype built around transparent price formation and settlement on Arbitrum.**

![An original architectural illustration of SAMA's imagined innovation campus](https://raw.githubusercontent.com/EndPx/sama/dca39c9453d887f92a771ee63449ab1b187b75f5/apps/web/public/brand/sama-campus.png)

You discover a startup you believe in. What valuation would you accept? How should your allocation be decided? What can you verify afterwards?

SAMA explores those questions through one fictional Indonesian startup, Kirana AI. A commit–reveal auction turns explicit maximum-FDV bids into a uniform clearing price, followed by independently claimable KIRA allocations, refunds and secondary transfers.

> **Testnet only.** Kirana AI is fictional. demoUSDC has no monetary value and is not Circle USDC. KIRA is a simulated equity-linked demo token with no legal or economic rights. SAMA is not independently audited, a regulated offering, or a promise of returns or liquidity.

## Choose your route

| You want to… | Start here |
|---|---|
| Evaluate the hackathon project | [Judge's guide](JUDGES_GUIDE.md) |
| Understand the problem and approach | [Problem statement](PROBLEM.md) → [Product](PRODUCT.md) |
| Understand the participant journey | [Demo participation guide](USER_GUIDE.md) |
| Review the protocol | [Architecture](ARCHITECTURE.md) → [Auction](AUCTION_SPEC.md) → [Marketplace](MARKETPLACE_SPEC.md) |
| Check what is actually proven | [Release status](RELEASE_STATUS.md) → [Security evidence](SECURITY_EVIDENCE.md) |
| Reproduce the implementation | [Developer guide](DEVELOPER_GUIDE.md) |

## The reviewable core

The reference round deposits 700,000 demoUSDC, clears at 4.8M FDV, accepts 480,000 and makes 220,000 refundable. All winners share one clearing price. The contract verifies the submitted bidder set and accounting; a settlement caller cannot simply declare a result.

The marketplace then demonstrates explicit, partially fillable listings with ceiling-rounded prices and conservation of both assets. This is an executable mechanism, not evidence of actual investment demand or continuous liquidity.

## Where the project stands

The contract test suite, fuzz/invariant coverage, bounded settlement and security tooling have executable evidence. The investor application and public deployment are still in progress. See [release status](RELEASE_STATUS.md) for the precise boundary; these docs do not substitute for missing deployment or production-UI proof.

[Source repository](https://github.com/EndPx/sama) · [Active implementation PR](https://github.com/EndPx/sama/pull/3) · [Official buildathon](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon)
