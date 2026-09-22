# Threat Model

Status: required release gate for the testnet prototype.

## Protected assets

- escrowed SAMA demoUSDC (a test currency with no monetary value);
- KIRA held in active marketplace listings;
- KIRA supply and allocations;
- bidder commitment/reveal integrity;
- settlement determinism;
- eligibility and privileged-role integrity;
- locally stored reveal secrets;
- deployment and infrastructure credentials;
- truthful user-facing transaction state.

## Trust assumptions

- SAMA demoUSDC is a standard, six-decimal ERC-20 without transfer fees, callbacks, or rebasing. It is not Circle USDC.
- Arbitrum Sepolia and the selected RPC expose canonical chain state.
- The administrator can update the simulated allowlist and pause contracts but cannot alter settled balances or auction arithmetic.
- Role administration remains centralized. An administrator can add or revoke KIRA minters; an unauthorized configuration can consume the fixed cap or prevent winner claims. Deployment must assign the offering as the sole intended minter, and role integrity is a trust assumption rather than an immutable restriction.
- Users protect their wallet access and locally stored reveal material.
- Startup and legal information is simulated repository content, not an onchain legal attestation.
- The testnet-only enrollment helper holds registrar authority to enroll its caller. Public enrollment is simulation access, not identity verification.
- The public faucet creates valueless demoUSDC. Multiple identities can bypass per-address limits; demo demand is not evidence of product traction or financial interest.
- While the enrollment helper retains its registrar role, an address whose eligibility was revoked can enroll again. The administrator must revoke the helper's registrar role to stop public enrollment; individual revocation is not a durable access restriction in this simulation.

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
| Demo helper used on a live-money chain | Constructor chain restriction to 421614 or 31337 | Wrong-chain deployment tests |
| Enrollment helper redirects authority | Enroll only the caller; no role-management or arbitrary-call functions | Caller-scope and unauthorized-role tests |

## Known limitations

- The prototype has not received an independent audit.
- Bid deposit amounts and commit transactions are public.
- Unrevealed bids receive full refunds, so commit griefing is economically possible; the UI does not present commitments as valid demand.
- A 64-bid cap is a prototype scalability constraint and remains subject to measured gas limits.
- Eligibility is admin-controlled simulation rather than KYC/AML.
- Pausing KIRA temporarily blocks listing creation, purchase, and cancellation because every path transfers KIRA; unpausing restores the unchanged escrow state.
- KIRA creates no real legal or economic right.
- Testnet RPCs, faucets, and embedded-wallet vendors remain external availability dependencies.
- Public RPC endpoints have no availability guarantee. The client retries reads against a fallback and reports errors instead of presenting empty balances as confirmed data.
- Privy authenticates and connects wallets; the web client needs only its public App ID. No Privy app secret or deployment signing key belongs in the browser bundle.

## Browser transaction boundaries

- Wallet onboarding introduces Privy as an external authentication and wallet-availability dependency. Local development can use an injected wallet without Privy. Every signing request is bound to the selected account and chain, with provider identity checked again after simulation.
- A simulated call is not proof of execution. The transaction runner distinguishes signing, pending, confirmed, reverted, rejected, and unknown outcomes. Repricing follows the replacement receipt; a cancellation or a different-call replacement cannot confirm the original action. An unknown hash blocks resubmission and supports explicit receipt rechecking without a new signature.
- Offering and listing reads share a fixed block tag within each snapshot. A failed refresh must be presented as unavailable or stale data, not a zero balance. Transactions that depend on those reads fail closed; `maxCost` still protects a purchase against movement after a successful read.
- Reveal backups are unencrypted browser-local JSON and private downloadable files. Validation binds them to chain, offering, wallet, and the onchain commitment. Persisting and exporting a backup precede commitment signing. A corrupt stored draft is not silently overwritten. Browser extensions, compromised dependencies, XSS, a shared computer, and insecure backup storage remain threats; local storage is not a secure enclave.
- The nonce is never included in application telemetry or a server-side form. The reveal action necessarily sends its calldata, including the nonce, to the RPC and then publishes it onchain. Users must not share backups with support services.

These controls have unit and integration coverage in the repository. A complete interactive browser lifecycle and public deployment acceptance are separate release gates; this section does not claim either is finished.

## Static-analysis disposition

The baseline at `af34ea7` passed Slither 0.11.6 with no High findings. Adding the testnet helpers produces fourteen findings across the same five detector categories, including the faucet's intended timestamp-based cooldown; see [security evidence](SECURITY_EVIDENCE.md). Static analysis and passing tests are not an independent audit.

## Release-blocking findings

Any unresolved issue that can steal or freeze escrow, create KIRA beyond the cap, accept a false settlement, bypass eligibility, expose a credential, or make the interface report a false success blocks deployment and submission claims.
