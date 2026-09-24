# What KIRA represents in the demo

KIRA is the token that records an allocation from Kirana AI's fictional offering. It lets the prototype test claims, eligible transfers, escrowed listings, and purchases after the auction. It does **not** represent a legal share, a claim on a company, voting power, dividends, or a right to sale proceeds.

The supply is capped at 1,000,000 KIRA, the full amount available to the reference offering. In the fictional terms, that supply represents a simulated 10% allocation; it does not imply the existence of other company tokens or real equity. Actual claims follow the auction result and base-unit rounding; an unused fraction is not silently assigned to anyone.

## A token's path

1. The offering settles and records each winning bidder's allocation.
2. A winner claims KIRA from the offering. Losing and unrevealed bids receive none.
3. An eligible holder may list KIRA. The marketplace holds the listed amount in escrow.
4. An eligible buyer can fill all or part of a listing. KIRA and demoUSDC move atomically at the listing's calculated price.

The [marketplace rules](MARKETPLACE_SPEC.md) explain partial-fill rounding and cancellation. A listing needs a willing buyer; it does not create liquidity by itself.

## Who controls access?

The eligibility registry is administered for this testnet simulation. A demo helper lets a wallet enroll itself; this is not identity verification. The administrator also holds role and pause powers. The [architecture](ARCHITECTURE.md) and [threat model](THREAT_MODEL.md) describe those boundaries, including the administrator's ability to change token minter roles.

KIRA is a prototype mechanism for making allocation and transfer records inspectable. Any real security, equity, or investment product would need a separate legal and technical design. See [release status](RELEASE_STATUS.md) for the evidence that exists today.
