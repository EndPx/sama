# Secondary Marketplace Specification

Status: locked for implementation.

## Objective

Allow eligible holders to sell the simulated equity-linked KIRA demo token for test USDC through escrowed, partially fillable listings. Every fill must have a deterministic price, protect the buyer from quote changes, and conserve the listing's KIRA and USDC totals.

This specification is authoritative for P0 marketplace accounting. `docs/AUCTION_SPEC.md` remains authoritative for offering economics.

In the public prototype, every USDC-denominated amount in this document means the valueless SAMA demoUSDC asset accepted in [ADR 0001](decisions/0001-testnet-demo-currency.md), not Circle USDC or real money.

## Units and listing state

- KIRA amounts use ERC-20 base units with 18 decimals.
- USDC prices use ERC-20 base units with 6 decimals.
- A listing records its seller, original KIRA amount, original USDC price, remaining KIRA amount, remaining USDC price, and status.
- Listing status is one of `NONE`, `ACTIVE`, `FILLED`, or `CANCELLED`.
- An active listing is partially filled when its remaining KIRA amount is below its original amount.
- The contract tracks aggregate outstanding KIRA escrow so solvency is observable without enumerating listings.

`createListing(totalAmount, totalPriceUsdc)` succeeds only when both values are positive and the seller is eligible. It escrows exactly `totalAmount` KIRA and initializes both remaining values to their corresponding original values.

Completion criterion: after creation, the listing is active, its original and remaining values match the inputs, and aggregate outstanding KIRA escrow increased by the listed amount.

## Quote and rounding rule

`quotePurchase(id, purchaseAmount)` returns the exact USDC cost that `buy` must charge against the same listing state.

For a full fill:

```text
costUsdc = remainingPriceUsdc
```

For a partial fill:

```text
costUsdc = ceil(
  remainingPriceUsdc * purchaseAmount / remainingAmount
)
```

The calculation must use full-precision multiplication and round toward positive infinity. A partial fill is invalid when its cost would consume the complete remaining USDC price, because that would leave KIRA with a zero price. The buyer can still purchase the complete remainder.

This rule intentionally updates both remaining values after every fill. Therefore any sequence that eventually fills the listing transfers exactly the original KIRA amount for exactly the original USDC price; rounding cannot create an unpaid remainder or collect more than the declared total.

Example without token decimals:

| Action | KIRA purchased | USDC paid | KIRA remaining | USDC remaining |
|---|---:|---:|---:|---:|
| Create | — | — | 100 | 500 |
| Fill 1 | 30 | 150 | 70 | 350 |
| Fill 2 | 20 | 100 | 50 | 250 |
| Final fill | 50 | 250 | 0 | 0 |

Granularity example: a listing with 3 KIRA units and 2 USDC base units can sell 1 unit for 1 base unit. A second one-unit partial fill must fail because it would leave 1 KIRA unit and zero price; buying the final 2 units for the remaining 1 base unit succeeds.

Completion criterion: an implementation produces the same quote onchain and in tests, rejects an unpriced remainder, and ends every full-fill sequence at zero remaining KIRA and zero remaining USDC price.

## Purchase

`buy(id, purchaseAmount, maxCostUsdc)` must:

1. Require an active listing, an eligible buyer, and `0 < purchaseAmount <= remainingAmount`.
2. Calculate the cost using `quotePurchase` semantics.
3. Revert when the cost exceeds `maxCostUsdc`; this makes a stale frontend quote safe against intervening fills.
4. Update the listing, status, and aggregate KIRA escrow before external token transfers.
5. Transfer the quoted USDC directly from buyer to seller.
6. Transfer exactly `purchaseAmount` KIRA from marketplace escrow to buyer.
7. Mark the listing `FILLED` only when both remaining values reach zero.

The marketplace does not intentionally custody USDC. In normal protocol executions its USDC balance delta is zero; unsolicited ERC-20 transfers are outside marketplace accounting and cannot be prevented.

Completion criterion: the buyer's KIRA increase equals `purchaseAmount`, the seller's USDC increase equals the quote, aggregate KIRA escrow decreases by `purchaseAmount`, and no completed or cancelled listing can be purchased.

## Cancellation and eligibility

`cancelListing(id, recipient)` may be called only by the listing seller while the listing is active. It must:

1. Require a nonzero eligible recipient.
2. Capture the remaining KIRA amount and unfilled USDC price.
3. Set both remaining values to zero, mark the listing `CANCELLED`, and reduce aggregate KIRA escrow before transferring tokens.
4. Return exactly the unsold KIRA to the chosen recipient.

The seller normally selects their own address. If the seller's address becomes ineligible while KIRA is escrowed, the seller may select another eligible address. This preserves an ownership-controlled exit without bypassing KIRA's eligible-recipient restriction or granting an administrator asset-transfer authority.

Marketplace pause blocks listing creation and purchases but does not block cancellation. Registry pause preserves stored eligibility, so it does not change cancellation eligibility. A KIRA token pause necessarily blocks every KIRA transfer, including cancellation, until the token is unpaused; the pauser cannot redirect assets or change escrow accounting.

Completion criterion: cancellation after any number of fills returns the exact unsold KIRA, leaves zero remaining values, decrements aggregate escrow by the returned amount, and works during marketplace or registry pause when the recipient remains eligible.

## Interface contract

The implementation must expose behavior equivalent to:

```solidity
function createListing(uint128 totalAmount, uint128 totalPriceUsdc) external returns (uint256 id);
function quotePurchase(uint256 id, uint128 purchaseAmount) external view returns (uint256 costUsdc);
function buy(uint256 id, uint128 purchaseAmount, uint128 maxCostUsdc) external;
function cancelListing(uint256 id, address recipient) external;
```

Errors must distinguish at least:

- zero or excessive purchase amounts;
- inactive listings;
- ineligible sellers, buyers, or cancellation recipients;
- unauthorized cancellation;
- quoted cost above the buyer's maximum;
- partial fills that would leave an unpriced KIRA remainder.

Events must make the complete history reconstructible:

- creation includes listing ID, seller, original KIRA amount, and original USDC price;
- purchase includes listing ID, buyer, purchased KIRA, paid USDC, remaining KIRA, and remaining USDC price;
- cancellation includes listing ID, seller, recipient, returned KIRA, and abandoned USDC price.

Field names and custom error names may vary, but the observable distinctions and event data may not.

## Required invariants

- Aggregate outstanding KIRA escrow equals the sum of active listing remainders.
- The marketplace KIRA balance covers aggregate outstanding KIRA escrow.
- For each listing, sold KIRA plus remaining or cancelled KIRA equals the original KIRA amount.
- For a completely filled listing, accumulated seller proceeds equal the original USDC price.
- Each purchase transfers exactly its quote and never more than the buyer's maximum.
- A partial fill leaves positive KIRA and positive USDC price.
- A filled or cancelled listing has zero remaining KIRA, zero remaining USDC price, and cannot transition again.
- Cancellation is seller-authorized and cannot redirect KIRA to an ineligible recipient.
- Marketplace and registry pause do not remove the seller-controlled cancellation path.
- Checks-effects-interactions and reentrancy protection apply to every asset-moving entry point.

## Required test matrix

| Scenario | Required evidence |
|---|---|
| Full purchase | Exact KIRA and USDC deltas; listing filled; escrow returns to zero |
| One partial purchase | Exact quote and both remaining values |
| Multiple partial purchases | Every intermediate state and final conservation |
| Two buyers in either order | Same final KIRA and USDC totals |
| Final fill | Charges the exact remaining price and closes the listing |
| Partial fill then cancellation | Buyer retains purchased KIRA; recipient receives exact unsold KIRA |
| Zero amount and overfill | Both revert without state or balance changes |
| Maximum-cost protection | Stale or insufficient maximum reverts without transfers |
| Rounding boundary | Ceiling behavior and unpriced-remainder rejection match this specification |
| Ineligible buyer or recipient | Reverts without changing escrow |
| Seller becomes ineligible | Seller can cancel to a different eligible recipient |
| Marketplace or registry pause | Purchases stop; eligible cancellation remains available |
| KIRA token pause | Transfer operations revert; unpause restores the unchanged listing |
| Repeated purchase or cancellation | Terminal listing cannot execute another transition |
| Fuzzed split sequence | Sum of fills and final fill equals original KIRA and USDC totals |
| Escrow accounting | Marketplace KIRA covers aggregate active remainders after every action |

The milestone is complete only when unit, fuzz, and stateful conservation coverage pass and two local buyers can partially and fully fill a listing without stranded protocol-accounted assets.
