# Why Arbitrum

SAMA uses Arbitrum as the execution and public verification layer for a multi-transaction startup-offering prototype. The selected environment is **Arbitrum Sepolia, chain ID 421614**; it keeps the experiment away from real funds.

## A practical fit for the protocol

The auction, restricted token, and marketplace are Solidity contracts built with Foundry and OpenZeppelin. Arbitrum's EVM environment lets SAMA test those contracts locally and deploy the same application logic to its testnet. Wallet transactions and public receipts connect the product interface to independently inspectable state. Network parameters and endpoints come from the [official chain information](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info).

The product makes several deliberate transactions—approval, commit, reveal, claims and marketplace actions—rather than hiding them behind a privileged settlement server. This is a reason to investigate an Ethereum rollup, not a claim that every transaction has a fixed fee or instant finality.

## What is actually Arbitrum-native here?

Escrow, commitment checks, allocation, refund liabilities, KIRA issuance and secondary settlement execute on the selected Arbitrum test chain. The frontend cannot invent a clearing result or settle an invalid bidder list. No application database is needed to authorize a claim.

SAMA does not claim to use Stylus, cross-chain messaging, a custom Orbit chain, or an Arbitrum-only auction primitive. The Solidity protocol is portable. The current contribution is a verifiable product lifecycle deployed on Arbitrum, once the deployment gate is complete.

## Execution evidence and finality

The maximum-size local settlement test measures 2,120,427 execution gas for 64 revealed bids, below its 2,500,000 regression ceiling. That number excludes the cost of creating the fixture and is not an Arbitrum transaction-fee quote. [Gas evidence](GAS_EVIDENCE.md) records the methodology.

A successful L2 receipt establishes execution in the observed L2 chain; it is not equivalent to Ethereum finality. Network and sequencer assumptions remain external dependencies. The UI must say what was confirmed and link the actual receipt rather than imply a stronger guarantee. See [Arbitrum's transaction lifecycle](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/transaction-lifecycle).

Start the technical review with [architecture and trust boundaries](ARCHITECTURE.md).
