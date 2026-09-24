# Getting started with SAMA

SAMA is a testnet walkthrough of one fictional Kirana AI offering. The public application is still a release gate; [release status](RELEASE_STATUS.md) will carry its URL and contract addresses when they have been verified. Developers can [run the local version](DEVELOPER_GUIDE.md) now.

Use a separate test wallet. Everything in this flow is simulated: demoUSDC has no monetary value, and KIRA gives no legal or economic rights.

## 1. Prepare your wallet

Connect on **Arbitrum Sepolia (chain ID 421614)**. You need test ETH for transaction fees; the [Arbitrum faucet guide](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info#faucet-list) lists available providers. Once the deployed app is available, enroll the wallet with SAMA's demo-access helper and use the SAMA faucet for demoUSDC. The faucet permits 250,000 units per address per 24 hours.

Wait for confirmed transactions before trusting the displayed eligibility or balance. Public enrollment is a simulation convenience, not identity verification.

## 2. Make a bid you can reveal

Read Kirana's fixed terms and the commit and reveal deadlines. Choose a demoUSDC deposit and a maximum FDV between 4M and 6M. The deposit goes into escrow; it is not yet an accepted allocation.

SAMA creates a reveal record for your wallet, chain, offering, amount, FDV and nonce. **Export the backup before signing the commitment.** Keep it private and somewhere you can retrieve it. You cannot edit a bid once committed, and one address can commit only once.

During the reveal window, return with the same wallet and backup. Reveal **before** the deadline; a transaction included exactly at `revealEnd` is too late. The reveal transaction publishes your FDV and nonce. Your deposit amount was already public at commitment time.

## 3. Check the outcome

After reveal closes, anyone can submit settlement with the complete sorted list of revealed bidders. The contract checks the list and math. On a successful round, claim any KIRA and any positive refund separately. On a failed or cancelled round, claim the refundable deposit. An unrevealed bid cannot receive KIRA; its deposit becomes refundable only after finalization or cancellation.

A signed request or transaction hash is not a completed action. Check the confirmed receipt and your updated balance. The [five-bid walkthrough](AUCTION_WALKTHROUGH.md) explains the reference result.

## 4. Try a secondary transfer

If you hold KIRA, approve and create a listing with a KIRA amount and a total demoUSDC price. The listed KIRA moves into marketplace escrow. An eligible buyer can fill part or all of it with a maximum-cost limit. The seller can cancel the unsold remainder to an eligible recipient. A token pause temporarily blocks transfers, including cancellation, until KIRA is unpaused.

The [marketplace rules](MARKETPLACE_SPEC.md) show how a partial purchase is priced and rounded. A listing does not guarantee a buyer.

## If something goes wrong

| What you see                     | What to do                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Wrong network or wallet          | Switch back before importing or submitting reveal material.                         |
| Missing browser record           | Import your exported backup and check it against the onchain commitment.            |
| Lost backup or missed reveal     | Do not guess a nonce. Wait for finalization or cancellation, then claim the refund. |
| Pending transaction or RPC error | Check the transaction hash before signing another request.                          |
| No claim available               | Check the auction phase, your entitlement and whether that claim already happened.  |

Do not paste reveal backups or wallet recovery phrases into chats or support forms. The [FAQ](FAQ.md) answers the most common questions about the demo.
