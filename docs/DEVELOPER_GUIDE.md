# Reproduce the protocol

Start with the current implementation branch, not an assumed deployed release. CI pins Node 22, pnpm 10.19.0 and Foundry 1.5.1; Solidity 0.8.28 and dependency gitlinks are checked into the repository. Do not recursively initialize OpenZeppelin's own test dependencies: SAMA needs only its two direct submodules.

## Clean-clone verification

1. Clone the implementation branch and initialize its direct dependencies:

   ```sh
   git clone --branch feat/p0-vertical-slice https://github.com/EndPx/sama.git
   cd sama
   git submodule update --init packages/contracts/lib/forge-std packages/contracts/lib/openzeppelin-contracts
   pnpm install --frozen-lockfile
   ```

2. With the pinned Foundry version on `PATH`, run the same verification gates as CI:

   ```sh
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   pnpm contracts:invariant
   pnpm contracts:gas
   ```

3. Install the pinned Python security dependency and scan both code and history:

   ```sh
   python -m pip install -r packages/contracts/requirements-slither.txt
   pnpm security:slither
   gitleaks git --redact --no-banner
   ```

Completion means the commands pass on the exact checkout being reviewed. Prior green runs are not evidence for an untested local diff. Gitleaks requires a separate installation; local helper verification used version 8.30.1. The application and testnet gates remain distinct from contract-test success.

## Local deployment lifecycle

Start a dedicated development chain in one terminal:

```sh
anvil --port 8547 --chain-id 31337
```

In another terminal, deploy and execute the five-bid reference lifecycle plus partial and full secondary purchases:

```sh
node --test scripts/import-deployment.test.mjs
node apps/web/scripts/local-acceptance.mjs
```

The runner checks the loopback host and chain before writing. It uses disposable Anvil accounts, not a keystore or private production credentials. Evidence is written to ignored `.omc/local-acceptance/`, including exact accepted capital, refund conservation, token allocation, and final protocol escrow balances. Allocation rounding may leave bounded unminted KIRA dust; it must not be hidden by a rounded assertion.

To prepare a fresh interactive fixture without automatically completing it:

```sh
node apps/web/scripts/local-acceptance.mjs --prepare-only
```

This produces an ignored `web.env` containing only local public configuration. It does not overwrite `apps/web/.env.local`. Import the prepared manifest using the deployment block recorded in the output when you are ready to configure the local UI:

```sh
node scripts/import-deployment.mjs .omc/local-acceptance/deployment-31337.json <deployment-block>
pnpm --filter @sama/web dev --port 3017
```

When another development server is already using this checkout, set `SAMA_ISOLATED_PREVIEW=1` for the second process and choose another port. The isolated preview uses its own Next build directory, so the two servers do not overwrite each other's compiled files.

Run the preparation close to browser testing: its commit window is fifteen minutes, followed by a sixty-second reveal window. A full acceptance run ends with a settled offering; it is not a reusable open auction. Restart the Next development process after changing public environment configuration.

The importer validates chain, addresses, uniqueness, schedule, and block number. It keeps local output in ignored environment paths and refuses traversal. Only an Arbitrum Sepolia manifest can populate the tracked public deployment artifact. No local address belongs in a public release manifest.

## Where protocol changes belong

Read the [auction specification](AUCTION_SPEC.md), [marketplace specification](MARKETPLACE_SPEC.md), and [threat model](THREAT_MODEL.md) before modifying financial behavior. Every changed financial value or state transition needs a corresponding test. An asset-moving entry point also needs property coverage.

The gas snapshot deliberately excludes `*Property.t.sol`. Fuzz aggregate gas statistics vary across platforms and are not deterministic regressions. Property tests still run in the full contract suite; the isolated 64-bid settlement ceiling remains enforced independently.

## Configuration and credentials

Browser environment variables are public build inputs. Only public App IDs, chain IDs, RPC URLs without credentials, contract addresses and public documentation links belong under `NEXT_PUBLIC_*`. A Privy app secret is not required by the client wallet integration.

Use ignored `.env.local` files for local configuration and an isolated Foundry keystore for signing. Never paste private keys or API secrets into build commands, screenshots, issue trackers or docs. `.env.example` must contain placeholders only. Credentials already shared outside Git are not protected by a clean repository secret scan.

Do not broadcast a deployment merely to reproduce tests. Public testnet deployment is a separate release operation that must record source verification, contract addresses, deployment block, roles and receipt evidence. Refer to [release status](RELEASE_STATUS.md) for what has actually been completed.
