# Implementation Plan

Status: contract and marketplace baselines reviewed; security tooling passes at `af34ea7`. Investor application, deployment, and public documentation are in progress. The project owner handles the submission portal.

## P0 outcome

A reviewer can use the deployed application to connect, inspect Kirana AI, commit and reveal a bid, settle the auction, claim KIRA and a refund, create a listing, buy it from a second eligible wallet, and verify every transaction on Arbiscan.

## Milestones

### 1. Economics and interfaces

- Convert `docs/AUCTION_SPEC.md` into executable reference tests.
- Define events, errors, roles, units, rounding direction, and contract interfaces.

Exit gate: the five-bid reference case and every failure branch have expected results.

### 2. Repository and harness

- Add the pnpm workspace, Next.js application, Foundry package, shared ABI/address package, and CI.
- Add mock USDC and five-wallet Anvil fixtures.

Exit gate: clean web build, contract build, local deployment, and CI run.

### 3. Offering kernel

- Implement eligibility, commit/reveal escrow, bounded verified settlement, claims, refunds, proceeds, pause, and cancellation.
- Add unit, fuzz, invariant, and integration tests.

Exit gate: all conservation properties pass and the reference case clears at 4.8M.

### 4. KIRA and marketplace

- Add capped restricted KIRA.
- Implement `docs/MARKETPLACE_SPEC.md`: escrowed listings, seller-controlled cancellation, deterministic partial/full purchase, and atomic settlement.

Exit gate: unit, fuzz, and stateful marketplace conservation tests pass, and two local buyers end with the expected USDC and KIRA balances with no stranded protocol-accounted assets.

### 5. Security gate

Baseline exit gate passed: 39 contract tests, Slither with no High findings, secret scan, and bounded settlement gas. See [security evidence](SECURITY_EVIDENCE.md). Repeat this gate whenever contracts or trust boundaries change.

- Run Slither, coverage review, gas snapshots, and maximum-bid settlement.
- Update `docs/THREAT_MODEL.md` with every accepted limitation.

Exit gate: no unresolved critical/high finding and settlement fits safely within the measured block limit.

### 6. Investor application

- Build landing, Explore, Kirana detail, Privy onboarding, network/faucet guidance, approve/commit/reveal, settlement/claim, portfolio, and explorer flows.
- Persist and export reveal material without sending the nonce to a server.

Current implementation: original landing and shadcn primitives; wallet-bound receipt handling; block-coherent contract reads; exact-unit forms; persisted/exported reveal backups; offering, portfolio, and marketplace screens. Local frontend tests pass 50 cases. The scripted Anvil fixture and safe manifest importer are available, but they do not satisfy the interactive browser exit gate. Public deployment remains gated on that acceptance.

Exit gate: a user completes the local lifecycle without developer tools and every transaction has honest intermediate states.

### 7. Testnet proof

Use the owner-approved test currency described in [ADR 0001](decisions/0001-testnet-demo-currency.md), the existing dedicated deployment keystore, and chain ID 421614. Keep public deployment addresses separate from local fixture addresses.

- Deploy and verify on Arbitrum Sepolia.
- Fund and prepare two interactive wallets plus five seeded bidders.
- Execute the full lifecycle from the production URL.

Exit gate: all acceptance transactions and verified contracts are publicly linked.

### 8. Submission

- Record the three-minute demo, finalize the pitch deck and README evidence, rehearse failure recovery, and complete the portal checklist.

Exit gate: an uninvolved reviewer can understand, reproduce, and verify the submission.

## P1 after P0

- compact founder/admin views;
- Ponder/Postgres activity read model;
- reveal notifications;
- gas sponsorship;
- lightweight analytics.

P1 work stops immediately if it risks the P0 path, security evidence, or submission deadline.
