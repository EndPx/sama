# Frequently asked questions

## Is this an investment product?

No. SAMA is a testnet prototype. Kirana AI is fictional, demoUSDC is valueless, and KIRA creates no legal ownership or economic entitlement. There is no claim of OJK approval, compliance certification, returns or liquidity.

## Why not use Circle test USDC?

The reference auction requires 700,000 deposited units. The project uses its own reproducible faucet currency without altering the locked auction numbers. demoUSDC is explicitly not Circle USDC; [ADR 0001](decisions/0001-testnet-demo-currency.md) records the decision.

## What does “sealed” mean?

Before reveal, the commitment hides the maximum FDV using a random nonce. The wallet, deposit amount and transaction are public. Reveal publishes the maximum FDV and nonce. This is not complete transaction privacy.

## Do winners pay their maximum valuation?

No. All winners use the same clearing FDV. Higher-tier bids are accepted first; a marginal tier can be partially accepted. The contract derives the result and the exact refund liabilities. See the [worked auction example](AUCTION_SPEC.md).

## What if I never reveal?

The bid cannot win KIRA. The full deposit becomes claimable after finalization or cancellation. It is not immediately withdrawable during the active auction. This behavior also permits economic griefing in a valueless testnet environment.

## Can an administrator take bidder escrow?

The intended role interfaces cannot arbitrarily redirect user escrow. They can manage eligibility and pause actions, and a canceller can terminate an unfinished offering so participants claim refunds. The issuer can withdraw accepted proceeds after successful settlement. These are centralized trust boundaries, not a trustless governance claim; see the [threat model](THREAT_MODEL.md).

## Does the secondary market ensure an exit?

No. A willing eligible buyer must accept a listing. A seller can cancel the unsold remainder to an eligible recipient, subject to KIRA's token pause. There is no AMM, guaranteed liquidity or promised resale price.

## Is the system audited?

No independent audit has been completed. Unit tests, fuzzing, stateful invariants, gas ceilings, static analysis and secret scans provide specific evidence, not a guarantee of safety. The [security evidence](SECURITY_EVIDENCE.md) names the inspected revisions and limitations.

## Are the demo bids evidence of demand?

No. The fixture is seeded, and the faucet and public enrollment are not Sybil-resistant. The product-market-fit thesis still needs user research and real-world validation under an appropriate legal framework.

For a concise review path, open the [judge's guide](JUDGES_GUIDE.md).
