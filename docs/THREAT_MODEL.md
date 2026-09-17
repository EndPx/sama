# Threat Model

Status: required release gate for the testnet prototype.

## Protected assets

- escrowed Circle test USDC;
- KIRA held in active marketplace listings;
- KIRA supply and allocations;
- bidder commitment/reveal integrity;
- settlement determinism;
- eligibility and privileged-role integrity;
- locally stored reveal secrets;
- deployment and infrastructure credentials;
- truthful user-facing transaction state.

## Trust assumptions

- Circle test USDC behaves as the configured ERC-20 test token.
- Arbitrum Sepolia and the selected RPC expose canonical chain state.
- The administrator can update the simulated allowlist and pause contracts but cannot alter settled balances or auction arithmetic.
- Users protect their wallet access and locally stored reveal material.
- Startup and legal information is simulated repository content, not an onchain legal attestation.

## Primary threats and controls

| Threat | Control | Verification |
|---|---|---|
| Reentrancy during claims or purchases | Checks-effects-interactions, pull claims, ReentrancyGuard | Malicious-token/callback tests where applicable |
| False or incomplete settlement input | Verify order, uniqueness, completeness, status, and arithmetic onchain | Mutation and fuzz tests |
| Settlement denial through unbounded work | Hard bidder cap and gas snapshot | Maximum-size settlement test |
| Double reveal, settlement, claim, or withdrawal | Explicit state flags updated before transfers | Unit and invariant tests |
| Insolvent escrow | Fund-conservation accounting | Stateful invariant test |
| Token over-allocation | Fixed cap and allocation conservation | Stateful invariant test |
| Ineligible transfer or purchase | Registry checks at each boundary | Unit/fuzz tests |
| Seller balance race | Marketplace escrows KIRA when listing | Integration test |
| Partial-fill rounding extracts value or leaves free KIRA | Remaining-amount/remaining-price accounting, full-precision ceiling division, and rejection of unpriced remainders | Boundary and split-sequence fuzz tests |
| Buyer pays more than a stale quote | Buyer-supplied maximum cost checked before state changes or transfers | Price-protection unit test |
| Seller eligibility revocation freezes listed KIRA | Seller-authorized cancellation to any eligible recipient | Revocation and alternate-recipient integration test |
| Marketplace KIRA accounting becomes insolvent | Aggregate escrow counter and per-listing conservation checks | Stateful marketplace invariant test |
| Repeated fill or cancellation moves assets twice | Terminal listing status set before external transfers | Unit and invariant tests |
| Observable bid information | Honest copy: maximum FDV sealed, deposit public | UX review and README disclaimer |
| Lost reveal secret | Local persistence, exportable backup, reveal warning | Browser recovery test |
| Privileged-key compromise | Encrypted keystore, role separation, optional multisig | Deployment checklist |
| Secret committed to Git | Ignore rules, Gitleaks CI, GitHub push protection | Clean scan on every push/PR |
| RPC outage or stale response | Primary/fallback providers and receipt verification | Failure rehearsal |
| Misleading transaction success | Wait for canonical receipt and surface reverts | UI integration test |

## Known limitations

- The prototype has not received an independent audit.
- Bid deposit amounts and commit transactions are public.
- Unrevealed bids receive full refunds, so commit griefing is economically possible; the UI does not present commitments as valid demand.
- A 64-bid cap is a prototype scalability constraint and remains subject to measured gas limits.
- Eligibility is admin-controlled simulation rather than KYC/AML.
- Pausing KIRA temporarily blocks listing creation, purchase, and cancellation because every path transfers KIRA; unpausing restores the unchanged escrow state.
- KIRA creates no real legal or economic right.
- Testnet RPCs, faucets, and embedded-wallet vendors remain external availability dependencies.

## Release-blocking findings

Any unresolved issue that can steal or freeze escrow, create KIRA beyond the cap, accept a false settlement, bypass eligibility, expose a credential, or make the interface report a false success blocks deployment and submission claims.
