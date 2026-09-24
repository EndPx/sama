# SAMA Implementation Instructions

## Start here

1. Read `docs/AUCTION_SPEC.md`; completion means every changed financial value or state transition has a matching test.
2. For marketplace work, read `docs/MARKETPLACE_SPEC.md`; completion means partial fills, rounding, cancellation, and escrow conservation match it exactly.
3. Read `docs/THREAT_MODEL.md`; completion means the change names any trust-boundary or attack-surface impact.
4. Select the next incomplete milestone in `docs/IMPLEMENTATION_PLAN.md`; completion means its exit gate passes before later milestones begin.
5. Run the relevant build, tests, static analysis, and secret scan before handoff; completion means results are reported with commands and no known failure is hidden.

## Product boundary

The P0 product is one real testnet lifecycle for Kirana AI. Preserve this boundary because additional protocols, chains, assets, governance, compliance systems, or startup catalogs reduce the probability that the judged path is complete.

Implementation must remain testnet-only and must describe KIRA as a simulated equity-linked demo token. It must not claim OJK approval, legal shares, guaranteed returns, guaranteed liquidity, or complete bid privacy.

## Protocol authority

`docs/AUCTION_SPEC.md` is the single source of truth for auction economics and settlement. If code, fixtures, interface copy, or demo material disagrees with it, update the conflicting artifact or write an explicit architecture decision before changing the specification.

`docs/MARKETPLACE_SPEC.md` is the single source of truth for listing state, partial-fill pricing, rounding, cancellation, and marketplace escrow accounting. A marketplace implementation is incomplete when any required invariant or test-matrix row lacks executable coverage.

`docs/THREAT_MODEL.md` is the single source of truth for security assumptions and known limitations. Every new privileged action, external call, custody path, or offchain dependency must update that document in the same change.

## Completion rules

- A contract function that moves assets is incomplete without unit and property coverage.
- A financial state transition is incomplete when conservation invariants do not cover it.
- A transaction interface is incomplete when it reports success before a confirmed receipt.
- A deployment is incomplete when source verification, addresses, deployment block, and explorer evidence are missing.
- A submission claim is incomplete when a reviewer cannot reproduce or verify it.

## Secret boundary

Use `.env.example` only for placeholders and public configuration. Use `.env.local` for local values, an encrypted Foundry keystore for deployment signing, and protected GitHub Environment secrets for CI. Stop and rotate credentials if any secret appears in Git history, logs, artifacts, screenshots, or chat transcripts.
