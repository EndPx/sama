# Participate in the testnet demo

Status: the complete public application lifecycle is still being built. This guide describes the intended contract-backed path, not a claim that every screen is already available. Check [release status](RELEASE_STATUS.md) before connecting a wallet.

Use an isolated test wallet. demoUSDC has no monetary value, and KIRA is a simulated equity-linked token with no legal or economic rights. Do not send real assets to the demo.

## Prepare

1. Open the official application link listed in release status and connect a wallet. Confirm **Arbitrum Sepolia (421614)**, not Arbitrum One or Ethereum mainnet.
2. Obtain test ETH for gas from a provider listed in the [official Arbitrum faucet guide](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info#faucet-list). Faucet availability and requirements belong to those providers.
3. Enroll the connected address through the demo-access helper and claim demoUSDC from the deployed SAMA faucet. Each address can claim 250,000 units once per 24 hours. Wait for successful receipts before relying on balances or eligibility.

## Commit, back up, then reveal

1. Read Kirana's terms and both deadlines. Choose a deposit and maximum FDV between 4M and 6M demoUSDC. A deposit is not yet accepted capital.
2. Save the reveal material locally and export its backup before submitting the commitment. Approve only the intended spending amount and sign the commitment transaction. One address can commit only once to an offering; the committed bid cannot be edited.
3. Return during the reveal window with the same wallet, chain, offering and backup. Reveal before `revealEnd`: a transaction included at that timestamp is already too late. The backup nonce and maximum FDV become public in the reveal transaction.

The deposit amount and commitment transaction are always public. Keep an unrevealed backup out of chat, Git, issue trackers and shared drives. Clearing browser storage or moving devices without a backup can prevent a reveal. Backups are not wallet recovery phrases; never enter a seed phrase into SAMA.

## After the auction

1. After the reveal deadline, anyone can submit the complete sorted revealed set for settlement. The contract checks it; the submitter cannot choose winners.
2. On success, claim any allocated KIRA and any positive refund separately. On failure or cancellation, claim the refundable deposit. An unrevealed bid receives no KIRA and is fully refundable only after finalization or cancellation.
3. Check confirmed receipts and the updated balances. Signing or receiving a transaction hash is not success; a reverted transaction does not deliver an allocation.

## Secondary listings

Approve KIRA to the marketplace and create a listing with a total KIRA amount and total demoUSDC price. KIRA moves into escrow. An eligible buyer can purchase all or part of the remainder, using a maximum cost to reject an unfavorable stale quote. Rounding uses the [marketplace specification](MARKETPLACE_SPEC.md).

The seller can cancel an active remainder to an eligible recipient. Marketplace pause does not remove this exit, but a KIRA-token pause blocks all token transfers until unpaused. A listing does not guarantee a buyer, liquidity, or future value.

## Recover without guessing

| Situation | Safe next step |
|---|---|
| Wrong network or address | Switch back before importing or submitting bid material |
| Missing local backup | Import the previously exported backup and verify it against the commitment |
| Lost backup or missed reveal | Do not invent a nonce; wait for finalization/cancellation and claim the refund |
| Transaction waiting or RPC failure | Check its hash on the explorer; avoid resubmitting blindly |
| Claim unavailable | Inspect phase, entitlement and existing claim flags; zero entitlement is not an application balance |

Read the [FAQ](FAQ.md) before treating a demo balance as an investment outcome.
