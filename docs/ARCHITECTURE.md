# Architecture and Trust Boundaries

## Goal

Deliver one verifiable Arbitrum Sepolia lifecycle with the smallest contract and infrastructure surface that can support the judged story.

## Components

### EligibilityRegistry

Stores the simulated eligibility status used by the offering, token, and marketplace. Registrar and pause powers are explicit and tested. This registry is not KYC and creates no regulatory status.

### KiranaOffering

Owns bid escrow and auction accounting. Terms and timestamps are immutable. Anyone can submit settlement after reveal, but the contract accepts the result only when the complete revealed set and arithmetic are valid.

### EquityLinkedToken

Represents the simulated offering allocation as capped KIRA units. Minting is restricted to the offering. Non-mint/burn transfers require eligible endpoints and respect pause state.

### SecondaryMarketplace

Escrows KIRA at listing creation. A purchase transfers Circle test USDC to the seller and KIRA to the buyer atomically. Cancellation returns unsold KIRA. The MVP charges no fee.

### Web application

Next.js renders startup content and transaction flows. Privy handles authentication and embedded/external wallets. wagmi and viem perform reads, simulations, writes, receipt tracking, and explorer linking.

### Read model

P0 reads bounded state and logs directly through Viem. Ponder and Postgres are added only after the deployed lifecycle passes, because a database must not become a dependency for settlement truth.

## Sources of truth

| Data | Authority |
|---|---|
| Auction phases and terms | KiranaOffering |
| Commitments, reveals, settlement, claims | KiranaOffering |
| Eligibility | EligibilityRegistry |
| KIRA balances and cap | EquityLinkedToken |
| Listings and trades | SecondaryMarketplace |
| Startup narrative and imagery | Versioned repository content |
| Activity/portfolio projections | Reconstructible onchain read model |

## Privileged roles

| Role | Capability | Constraint |
|---|---|---|
| Default admin | Manage role membership | Testnet multisig or secured deployment account before submission |
| Registrar | Update simulated eligibility | Cannot settle auctions or move user funds |
| Pauser | Pause risky writes | Cannot seize assets; refund/cancel path remains defined |
| Issuer | Withdraw accepted proceeds | Only after successful finalization and only once |

No role may rewrite bids, clearing results, balances, timestamps, or completed claims.

## Deployment boundary

- Chain: Arbitrum Sepolia, chain ID 421614.
- Payment asset: Circle test USDC at `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`.
- Primary RPC: authenticated third-party endpoint.
- Fallback RPC: official public endpoint.
- Explorer evidence: Arbiscan verified source and transaction links.

