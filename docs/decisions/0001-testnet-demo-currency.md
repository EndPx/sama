# ADR 0001: use a dedicated demo currency on Arbitrum Sepolia

Status: accepted by the project owner on 23 September 2026.

## Decision

The public hackathon deployment uses SAMA demoUSDC, a six-decimal, faucet-issued ERC-20 with no monetary value. It is not Circle USDC and is not redeemable. The interface, deployment manifest, and guides must identify it as **demoUSDC**.

The original auction economics stay unchanged: a 4M–6M valuation range, a 400,000 minimum raise, and the five-bid reference case with 700,000 deposited and 480,000 accepted. Here these values are denominated in demoUSDC. Internal contract names such as `usdc` and `amountUSDC` remain compatibility identifiers, not claims about the issuer of the configured asset.

## Reason

The available deployment wallet held 20 Circle test USDC when checked. Reproducing the mandatory reference lifecycle requires 700,000 units. A dedicated faucet makes the complete lifecycle reproducible without changing the economics or waiting for a third-party faucet to supply those amounts.

## Scope and trust boundary

The demo token and enrollment helper may be deployed only on Arbitrum Sepolia or local chain 31337. Participants can claim a fixed demo balance and enroll their own address in the simulated registry. The helper has registrar authority solely to enroll its caller; it cannot enroll a different address, revoke eligibility, withdraw escrow, or mint KIRA.

Faucet identities are not Sybil-resistant. Bids and balances demonstrate execution, not real investment demand. The original Circle token address must never be labelled as the deployed demo currency.

## Verification

Deployment must check chain ID, token decimals, registry roles, KIRA minter, and published addresses. Unit and property tests must cover faucet limits, enrollment scope, and conservation. The full five-bid lifecycle must still clear at 4.8M, accept 480,000, and return 220,000 in refunds.

Continue with the [auction specification](../AUCTION_SPEC.md).
