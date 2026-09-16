# Contributing

## Before starting

1. Read `README.md`, `docs/AUCTION_SPEC.md`, and `docs/THREAT_MODEL.md`; completion means the proposed change preserves the documented economics and trust boundaries.
2. Open or reference an issue with an acceptance criterion; completion means reviewers can decide pass or fail without interpreting intent.
3. Keep the change inside P0/P1 scope in `docs/IMPLEMENTATION_PLAN.md`; changes outside that scope require an explicit architecture decision.

## Pull requests

A pull request is reviewable when it:

- explains the user or protocol outcome;
- names the threat-model assumptions it changes;
- includes tests for every changed state transition or financial calculation;
- keeps UI, test fixtures, and demo numbers consistent;
- contains no generated secrets, deployment keys, personal data, or real investment data;
- passes formatting, build, test, static-analysis, and secret-scanning checks.

Contract changes must include an invariant impact statement. Frontend changes that initiate transactions must cover ready, approval, submitted, confirming, confirmed, rejected, and failed states.

## Commit style

Use concise imperative subjects, for example:

```text
feat(auction): verify complete sorted bidder set
test(auction): cover marginal pro-rata allocation
docs(security): document observable bid deposits
```

