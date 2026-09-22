# Release status and evidence

Last reviewed: 23 September 2026. **The tested protocol is not yet a completed public application release.** This page separates executable evidence from pending work.

| Area | Current evidence | Remaining release gate |
|---|---|---|
| Auction and marketplace | Unit, reference-model fuzz, mutation and stateful invariant suites in the repository | Repeat verification on the final release commit |
| Testnet helpers | Added in `9aea9fa`; local full suite passes 44 tests, including six invariants; [CI passes at `7eeb5f1`](https://github.com/EndPx/sama/actions/runs/35766120786) | Confirm deployment roles and rerun gates on the release revision |
| Settlement bound | `settle(64)` measures 2,120,427 gas below a 2,500,000 ceiling | Preserve the bound on the release revision |
| Static analysis | Helper revision reviewed with Slither 0.11.6: 14 findings, none High | Rerun on every changed trust boundary |
| Investor application | Implementation in progress | Complete wallet-driven local acceptance, including failure recovery |
| Arbitrum Sepolia deployment | No verified release manifest published yet | Verified source, addresses, block, role checks and public receipts |
| Hosted application | No accepted production URL published yet | Logged-out and two-wallet production acceptance |
| Submission portal | Project owner is responsible | Owner verifies rules, fields and submission confirmation |

## Inspect the evidence

- [Implementation branch](https://github.com/EndPx/sama/tree/feat/p0-vertical-slice) and [review PR #3](https://github.com/EndPx/sama/pull/3).
- [Verification workflow](https://github.com/EndPx/sama/actions/workflows/ci.yml) and [Slither / secret-scan workflow](https://github.com/EndPx/sama/actions/workflows/security.yml). Match a run's head SHA to the revision under review.
- [Security evidence and finding dispositions](SECURITY_EVIDENCE.md), [gas methodology](GAS_EVIDENCE.md), and [reproduction guide](DEVELOPER_GUIDE.md).

## Required public transaction record

The deployment package must identify the chain ID, payment asset, six contract addresses, deployment transaction/block, verified source links, source commit, compiler settings and privileged roles. Acceptance evidence must then link the commitment, reveal, settlement, KIRA claim, refund, issuer withdrawal, listing and secondary purchase receipts.

No placeholder explorer URL counts as evidence. A contract-test transaction on Anvil is not a public Arbitrum receipt. A testnet receipt alone does not prove the production UI completed the flow.

Begin with the [judge's guide](JUDGES_GUIDE.md), or use the [implementation plan](IMPLEMENTATION_PLAN.md) to locate the next open gate.
