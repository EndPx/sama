# Architecture and Trust Boundaries

## Goal

Deliver one verifiable Arbitrum Sepolia lifecycle with the smallest contract and infrastructure surface that can support the judged story.

## Components

### EligibilityRegistry

Stores the simulated eligibility status used by the offering, token, and marketplace. Registrar and pause powers are explicit and tested. This registry is not KYC and creates no regulatory status.

### KiranaOffering

Owns bid escrow and auction accounting. Terms and timestamps are immutable. Anyone can submit settlement after reveal, but the contract accepts the result only when the complete revealed set and arithmetic are valid.

### EquityLinkedToken

Represents the simulated offering allocation as capped KIRA units. Deployment assigns minting to the offering, but the role administrator can grant or revoke minters. Non-mint/burn transfers require eligible endpoints and respect pause state.

### SecondaryMarketplace

Escrows KIRA at listing creation and tracks aggregate outstanding escrow. Partial and full purchases transfer test USDC directly to the seller and KIRA to the buyer atomically. A seller may cancel the active remainder to an eligible recipient, preserving an ownership-controlled exit if the seller address becomes ineligible. The MVP charges no fee. `docs/MARKETPLACE_SPEC.md` is authoritative for listing state, proportional pricing, rounding, and terminal transitions.

### Web application

The investor application is under construction. Its target architecture uses Next.js for startup content and transaction flows, Privy for authentication and embedded/external wallets, and wagmi/viem for reads, simulations, writes, receipt tracking, and explorer linking. These integration choices are not evidence of a completed browser lifecycle.

### Testnet access and currency

`DemoUSDC` provides six-decimal, valueless test currency. Its public faucet grants 250,000 units per address per 24-hour cooldown. `DemoAccess` can enroll only its caller through a registrar role; it cannot move escrow or mint KIRA. Both helpers restrict deployment to Arbitrum Sepolia or local chain 31337. They are simulation utilities, not stablecoin issuance or identity verification. See [ADR 0001](decisions/0001-testnet-demo-currency.md).

### Read model

P0 reads bounded state and logs directly through Viem. Ponder and Postgres are added only after the deployed lifecycle passes, because a database must not become a dependency for settlement truth.

## Sources of truth

| Data | Authority |
|---|---|
| Auction phases and terms | KiranaOffering |
| Commitments, reveals, settlement, claims | KiranaOffering |
| Eligibility | EligibilityRegistry |
| KIRA balances and cap | EquityLinkedToken |
| Listing state and trades | SecondaryMarketplace |
| Marketplace accounting rules | `docs/MARKETPLACE_SPEC.md` |
| Startup narrative and imagery | Versioned repository content |
| Activity/portfolio projections | Reconstructible onchain read model |

## Privileged roles

| Role | Capability | Constraint |
|---|---|---|
| Default admin | Manage role membership | Testnet multisig or secured deployment account before submission |
| Registrar | Update simulated eligibility | Cannot settle auctions or move user funds |
| Pauser | Pause risky writes | Cannot redirect assets; marketplace cancellation remains available unless the KIRA token itself is paused |
| Issuer | Withdraw accepted proceeds | Only after successful finalization and only once |

The role interfaces cannot rewrite existing bids, timestamps, finalized settlement accounting, or completed claim flags. The role administrator remains trusted to preserve the intended minter configuration: an extra minter could consume the fixed KIRA cap and obstruct later winner claims. The supply cap itself is always enforced.

## Deployment boundary

- Chain: Arbitrum Sepolia, chain ID 421614.
- Payment asset: dedicated SAMA demoUSDC; the release manifest will identify its deployed address. It is not Circle USDC.
- RPC: public Arbitrum Sepolia endpoints; availability is not guaranteed.
- Signing: dedicated local Foundry keystore, never a private key in a browser or repository file.
- Release gate: verified source, addresses, deployment block, and transaction evidence. No deployment is claimed until those records exist.
