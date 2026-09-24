# The five-bid auction

Five people commit a total of 700,000 demoUSDC to Kirana AI's fictional round. The round offers 1,000,000 KIRA, representing a simulated 10% allocation. Each bidder names the highest fully diluted valuation (FDV) they would accept. Their deposit amount is public; their FDV stays hidden until they reveal it.

| Bidder    |     Deposit | Maximum FDV |    Accepted |      Refund |
| --------- | ----------: | ----------: | ----------: | ----------: |
| E         |     150,000 |        5.4M |     150,000 |           0 |
| D         |     200,000 |        5.2M |     200,000 |           0 |
| C         |     100,000 |        5.0M |     100,000 |           0 |
| B         |     150,000 |        4.8M |      30,000 |     120,000 |
| A         |     100,000 |        4.5M |           0 |     100,000 |
| **Total** | **700,000** |             | **480,000** | **220,000** |

## Why 4.8M?

At a 5.0M FDV, the offered 10% costs 500,000. E, D, and C are willing to bid at least that high, but together they commit only 450,000. That tier cannot clear.

At 4.8M, the offered allocation costs 480,000. E, D, C, and B together offer 600,000. The first three bids use 450,000 of capacity, leaving 30,000 for B. A's 4.5M ceiling is below the clearing valuation, so A gets a full refund. Every accepted unit uses the same 4.8M clearing FDV; E does not pay 5.4M.

This is a fixed reference example, not live demand. The [auction specification](AUCTION_SPEC.md) defines the exact base-unit math, floor fallback, dust handling, and unsuccessful-round behavior. The tests assert this result and try malformed settlement lists, altered ordering, and repeated claims.

## What you do as a bidder

1. **Commit:** escrow demoUSDC and save your reveal backup. A commitment cannot be edited.
2. **Reveal:** return before the reveal deadline and submit the saved FDV and nonce. The FDV becomes public then.
3. **Settle and claim:** after settlement, claim any KIRA allocation and any refund in separate transactions.

An unrevealed bid cannot receive KIRA. After finalization or cancellation, its deposit is refundable. [Getting started](USER_GUIDE.md) covers the full wallet journey and recovery steps.
