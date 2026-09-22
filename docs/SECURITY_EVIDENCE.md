# Security evidence

Baseline reviewed: `af34ea7f638c84a470b3ac1cb12a555e50ae1128`. Evidence applies to this revision; later releases must repeat the checks.

## Automated checks

[GitHub Verify](https://github.com/EndPx/sama/actions/runs/35210651916) and [Slither plus secret scan](https://github.com/EndPx/sama/actions/runs/35210651946) passed on the baseline. The contract suite contains 39 passing tests, including five stateful invariants. Each invariant runs 256 sequences at depth 64 with `fail_on_revert = true`.

The deterministic 64-bid settlement fixture measures 2,120,427 execution gas against a 2,500,000 ceiling. This local regression measurement is not a prediction of the Arbitrum fee; see [gas evidence](GAS_EVIDENCE.md).

## Slither review

Slither 0.11.6 analyzed 26 contracts with 102 detectors and reported 13 results. The configuration filters dependency, test, script, and build paths; production detectors remain enabled. CI fails on High findings and prints lower severities.

| Detector | Disposition | Reason and remaining limitation |
|---|---|---|
| `uninitialized-local` | Reviewed; intended zero initialization | Settlement's numeric accumulators start at Solidity's defined zero value. Reference-model fuzzing checks settlement outputs independently. |
| `timestamp` | Accepted scheduling dependency | Commit, reveal, and settlement depend on chain timestamps. Exclusive reveal-boundary tests prevent overlapping windows. Timestamp use does not create randomness. Sequencer timing and user inclusion remain external risks. |
| `costly-loop` | Accepted bounded work | Per-bid refund accounting writes storage. Settlement rejects more than 64 revealed bids and a maximum-size gas test enforces the ceiling. |
| `cyclomatic-complexity` | Accepted maintenance risk | Settlement combines tier selection, floor fallback, allocation, and dust handling. Independent-model, mutation, boundary, and conservation tests cover these branches; changes require rerunning them. |
| `missing-inheritance` | Informational interface conformance | The registry and KIRA implement the small interfaces used by callers without explicitly inheriting those declarations. Integration tests exercise the deployed ABI. |

These dispositions apply to the inspected implementation. They do not authorize suppressing future findings with the same detector name.

## Coverage review

A Windows Foundry 1.5.1 coverage run on 23 September 2026 passed all 39 tests. Reported source line coverage was 100% for the registry, 92.86% for KIRA, 93.87% for the offering, and 100% for the marketplace. Foundry also emitted coverage-anchor warnings; these percentages are diagnostic, not a certification. In particular, source-level branch coverage does not establish that every access-control or callback scenario is covered.

Claims rely on executable scenarios and invariants, not a coverage percentage. A release must rerun security checks against its own revision and include the new demo-access boundary.

## Testnet-helper verification — 23 September 2026

The demo-currency and self-enrollment change adds three deterministic tests, one transfer-conservation fuzz test, and one stateful currency-conservation invariant. Local Foundry 1.5.1 passes the complete 44-test suite; 33 deterministic gas snapshots remain separate from randomized aggregates. The original four protocol contracts are unchanged.

Slither 0.11.6 reports fourteen findings: six Medium `uninitialized-local`, four Low `timestamp`, and four Informational results across the other categories above. There are no High findings. The additional timestamp finding is the per-address faucet cooldown; it limits convenience access, not economic value or Sybil identities. Enrollment scope, registry pause, revoked registrar authority, and wrong-chain construction are tested.

Gitleaks 8.30.1 reports no leaks in the inspected 22-commit baseline history. This is not a guarantee about credentials shared outside Git, and each pushed revision still needs its own CI checks. The deployment and browser acceptance gates remain open.

## Release criteria

1. Run contract unit/property tests, deterministic gas checks, and Slither against the release revision. Resolve any finding that can violate the [threat model](THREAT_MODEL.md).
2. Run the frontend tests, build, and local wallet lifecycle. Every success message must follow a successful receipt on the configured chain.
3. Scan tracked content and Git history for credentials. Keep generated secret-bearing material outside version control and public artifacts.
4. Publish the actual deployment manifest and transaction evidence after testnet verification.

Follow the current release work in the [implementation plan](IMPLEMENTATION_PLAN.md).
