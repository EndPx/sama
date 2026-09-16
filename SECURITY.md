# Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or leaked credential. Use GitHub's private vulnerability reporting feature for this repository. Include the affected component, reproduction steps, impact, and any proposed remediation.

This is a testnet prototype and has no bug bounty. Reports will still be acknowledged and triaged before the hackathon submission is considered complete.

## Secret handling

Follow these controls because repository history and public build logs are difficult to remediate after exposure:

1. Copy `.env.example` to `.env.local`; completion means Git reports no env file as tracked.
2. Store only public browser values under `NEXT_PUBLIC_*`; completion means no privileged RPC, API, or wallet credential uses that prefix.
3. Use a Foundry encrypted keystore for local deployments; completion means no raw private key exists in the workspace or shell history.
4. Store CI credentials in a protected GitHub Environment named `testnet`; completion means deployment jobs require environment approval and repository secrets are not printed.
5. Run the repository secret scan before every push; completion means the scan reports no findings.
6. Rotate any credential immediately if it appears in a terminal transcript, commit, pull request, artifact, screenshot, or demo recording.

Deleting a leaked value from the latest commit is not sufficient. Revoke it first, then remove it from history and audit forks, Actions logs, caches, and deployment providers.

## Required security gates

A testnet deployment is release-eligible only when:

- unit, fuzz, invariant, and integration tests pass;
- Slither has no unresolved critical or high-severity finding;
- fund and KIRA conservation invariants pass;
- all privileged functions have an explicit role and test;
- all deployed contracts are verified and match the reviewed commit;
- the two-wallet testnet lifecycle passes from the production interface;
- known limitations are recorded in `docs/THREAT_MODEL.md`.

## Prototype limitations

SAMA is not audited, production-ready, regulated, or suitable for real assets. Commit-reveal hides the maximum FDV during the commit phase, but the USDC deposit amount remains observable onchain. The eligibility registry is a simulated allowlist, not KYC or regulatory verification.

