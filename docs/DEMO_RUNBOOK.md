# Demo Runbook

## Before recording or presenting

1. Confirm the production URL, RPC, contract addresses, and explorer links; completion means every link opens in a logged-out browser.
2. Confirm the five fixture bidders include the interactive bidder and each has enough test ETH and SAMA demoUSDC; completion means their deposits match the authoritative fixture exactly. Prepare an additional eligible secondary buyer if needed.
3. Confirm the offering phase and prepared transactions; completion means no live waiting period can exceed the presentation window.
4. Run the production smoke test and capture a fallback recording; completion means the demo survives an RPC, faucet, or conference-network failure.

## Three-minute story

- **0:00-0:20** — “The next big startup shouldn't be for VCs only.” Explain the access and pricing problem.
- **0:20-0:40** — Open Kirana AI and show the simulated terms and disclaimer.
- **0:40-1:10** — As fixture bidder B, commit 150,000 demoUSDC at a maximum 4.8M FDV. Export the reveal backup and show the confirmed Arbiscan transaction. A, C, D, and E use the exact [reference fixture](AUCTION_SPEC.md); do not add a sixth bid and still claim the reference result.
- **1:10-1:35** — Reveal the bid and show the prepared aggregate demand.
- **1:35-1:55** — Settle at 4.8M FDV. Show allocation and refundable USDC.
- **1:55-2:20** — Claim KIRA and open the portfolio.
- **2:20-2:40** — List KIRA and purchase it from the second wallet atomically.
- **2:40-2:52** — Show verified contracts and transaction evidence.
- **2:52-3:00** — “SAMA — Invest in what comes next.”

## Integrity rules

- Use real testnet receipts and identify edited-out waiting time.
- Never imply that the five seeded bidders are organic users.
- Never call demoUSDC real money, Circle USDC, or KIRA a legal share.
- Keep the maximum-FDV privacy claim separate from the observable deposit.
- If a live transaction fails, show the prepared verified transaction instead of reporting a false success.

Public testnet deadlines cannot be advanced with local time-warp tooling. Use real scheduled windows and clearly identify cuts or previously confirmed evidence in a recording. A rehearsed narrative is not a completed acceptance run; [release status](RELEASE_STATUS.md) tracks the missing proof.
