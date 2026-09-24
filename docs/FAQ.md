# Frequently asked questions

## Is KIRA a real investment?

No. Kirana AI is fictional, demoUSDC is valueless, and KIRA is a simulated equity-linked token with no legal shares, dividends, voting rights, or claim on a company. SAMA has no OJK approval and offers no guaranteed return or liquidity.

## Why does SAMA use demoUSDC?

The reference auction needs 700,000 deposited units. SAMA provides a dedicated test currency and faucet so the same example can be reproduced on testnet. It is **not Circle USDC**. [ADR 0001](decisions/0001-testnet-demo-currency.md) records the choice.

## What stays hidden when I commit?

Your maximum FDV is hidden behind a hash and random nonce until reveal. Your address, deposit amount, and commitment transaction are public from the start. Reveal makes the FDV and nonce public. This is not complete bid privacy.

## Do winners pay the FDV they bid?

No. Winners settle at one clearing FDV. A higher maximum makes a bid eligible for more price tiers; it does not make that bidder pay its maximum. At the clearing tier, a bid may be partially accepted. See the [five-bid example](AUCTION_WALKTHROUGH.md).

## What if I do not reveal?

The bid cannot receive KIRA. Its full deposit becomes refundable after settlement or cancellation, but it cannot be withdrawn during the active auction.

## Can I change a commitment?

No. The current offering accepts one commitment per address and does not provide bid editing. Save the backup before signing, and check both the amount and FDV limit first.

## Does listing KIRA mean I can sell it?

You can offer KIRA at a stated price, but a willing eligible buyer must fill the listing. You can cancel an active remainder to an eligible recipient. If the KIRA token is paused, transfers wait until it is unpaused. There is no automatic market maker or guaranteed exit.

## Who has administrative powers?

The testnet administrator manages simulated eligibility, pausing and role membership. A canceller can terminate an unfinished offering so deposits become refundable; the issuer can withdraw accepted proceeds after a successful settlement. The administrator can change token minter roles, so its key and configuration remain a trust assumption. [Trust and security](THREAT_MODEL.md) gives the full picture.

## Has SAMA been audited?

No independent audit has been completed. The repository has unit, fuzz, and invariant tests; gas limits, static analysis, and secret scans provide narrower evidence. [Security evidence](SECURITY_EVIDENCE.md) links the results and their limits.

## Are the demo bids proof of demand?

No. The five bidders are seeded fixtures. Public self-enrollment and a test faucet do not prove real interest or prevent one person using several addresses.

Start with [Getting started](USER_GUIDE.md) to try the flow, or [release status](RELEASE_STATUS.md) to see what is publicly available today.
