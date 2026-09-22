# Auction Specification

Status: locked for implementation.

## Objective

Sell a fixed simulated company allocation through sealed maximum-FDV bids and settle every winner at one uniform FDV. The contract must derive the same result regardless of who submits settlement.

## Terms

| Parameter | Value |
|---|---:|
| Payment token | SAMA demoUSDC on Arbitrum Sepolia (six-decimal test currency) |
| Payment decimals | 6 |
| Offered allocation | 10% |
| Offered KIRA supply | 1,000,000 KIRA |
| FDV floor | 4,000,000 USDC |
| FDV ceiling | 6,000,000 USDC |
| Minimum raise | 400,000 USDC |
| Maximum revealed bids | 64, subject to gas measurement |

The project owner approved the dedicated test currency in [ADR 0001](decisions/0001-testnet-demo-currency.md). All USDC-denominated amounts below are demoUSDC units in the public prototype; contract identifiers retain their original names. The token is not Circle USDC and has no monetary value.

## Commitment

```text
commitment = keccak256(
  abi.encode(chainId, offeringAddress, bidder, amountUSDC, maxFDV, nonce)
)
```

`commitBid(commitment, amountUSDC)` escrows the declared amount. The deposit amount and transaction are public. `maxFDV` and `nonce` remain sealed until reveal.

The client must save `{chainId, offeringAddress, bidder, amountUSDC, maxFDV, nonce, transactionHash}` locally and offer a backup. The nonce must not be sent to an application server before reveal.

## Reveal

`revealBid(amountUSDC, maxFDV, nonce)` succeeds exactly once when:

- the reveal window is active;
- the recomputed commitment matches;
- the caller owns the commitment;
- the amount equals the escrowed amount;
- `maxFDV` is inside the allowed range.

An unrevealed commitment is excluded from settlement and becomes fully refundable after finalization or cancellation. The interface must not include it in valid demand.

## Clearing rule

1. Build the distinct revealed `maxFDV` tiers in descending order.
2. At candidate `V`, required capital is `V * offeredAllocation`.
3. Eligible demand is the sum of commitments with `maxFDV >= V`.
4. Select the highest candidate where eligible demand is at least required capital.
5. If no revealed tier clears, test the FDV floor.
6. If demand at the floor is below the 400,000 minimum raise, fail the auction.
7. Fully accept bids above the clearing tier.
8. Allocate the remaining capacity pro rata across bids at the clearing tier.
9. Refund losing, unused, and rounding-dust commitment through pull-based claims.

The caller supplies all revealed bidder addresses sorted by `maxFDV` descending. The contract verifies ordering, uniqueness, completeness, bid status, and the complete calculation. Offchain sorting is an optimization, not a trust assumption.

## Reference result

| Bidder | Commitment | Max FDV |
|---|---:|---:|
| E | 150,000 | 5.4M |
| D | 200,000 | 5.2M |
| C | 100,000 | 5.0M |
| B | 150,000 | 4.8M |
| A | 100,000 | 4.5M |

At 5.0M, 450,000 eligible USDC cannot buy the offered 10%, which costs 500,000. At 4.8M, 600,000 is eligible and the allocation costs 480,000. The result is:

- clearing FDV: 4.8M;
- accepted: E 150,000; D 200,000; C 100,000; B 30,000; A 0;
- refundable: B 120,000; A 100,000;
- total accepted: 480,000;
- KIRA price: 0.48 USDC.

This case is a mandatory unit and integration test and is the authoritative demo fixture.

## Lifecycle

```text
SCHEDULED -> COMMIT -> REVEAL -> SETTLED_SUCCESS | SETTLED_FAILED
```

`PAUSED` temporarily blocks risky writes. `CANCELLED` terminates the offering and enables refunds. Normal phase changes are derived from immutable timestamps and finalization flags rather than arbitrary administrator transitions.

## Claims

- Winners call `claimTokens` once.
- Bidders call `claimRefund` once when a refund is positive.
- The issuer calls `withdrawIssuerProceeds` after successful settlement.
- Settlement never loops over external transfers.

## Required invariants

- escrow covers outstanding refunds plus unwithdrawn proceeds;
- accepted capital plus refunds equals committed capital;
- allocated and claimed KIRA never exceeds offered supply;
- every winner's maximum FDV is at least the clearing FDV;
- losing or unrevealed bids receive no KIRA;
- bidder lists cannot omit, duplicate, or reorder revealed bids;
- reveal, settlement, token claim, refund claim, and proceeds withdrawal cannot execute twice;
- rounding never creates assets or exceeds caps.
