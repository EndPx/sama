# SAMA: a clearer way to explore startup offerings

What happens between finding a startup you like and receiving an allocation? SAMA lets you follow that journey, step by step, on Arbitrum Sepolia.

In our demo, five people make valuation-limited bids for a fictional startup called Kirana AI. The auction finds one price for everyone who gets an allocation. Each person can then check the result, claim their KIRA, and take back any unused deposit. A simple marketplace shows what happens when a holder lists some of those tokens and another person buys them.

> SAMA is a testnet prototype. Kirana AI is fictional. demoUSDC has no monetary value and is not Circle USDC. KIRA is a simulated equity-linked demo token; it is not a legal share and gives no economic rights. The contracts have not been independently audited.

## Start with the story

- [Why we built SAMA](PROBLEM.md) explains the gap we are exploring.
- [How SAMA works](PRODUCT.md) follows a bid from deposit to allocation and refund.
- [The five-bid walkthrough](AUCTION_WALKTHROUGH.md) shows the actual numbers behind the demo.

## Choose your path

**Trying the app?** Read [Getting started](USER_GUIDE.md). [Release status](RELEASE_STATUS.md) will link the public application when it is ready; developers can [run the local prototype](DEVELOPER_GUIDE.md) now.

**Reviewing the hackathon project?** Start with the [reviewer's guide](JUDGES_GUIDE.md). It points to the working code, the tests, and the remaining release gates.

**Checking the implementation?** See the [architecture](ARCHITECTURE.md), the [auction rules](AUCTION_SPEC.md), the [marketplace rules](MARKETPLACE_SPEC.md), and [how to reproduce the tests](DEVELOPER_GUIDE.md).

## One result you can check

The reference round starts with **700,000 demoUSDC in deposits**. It clears at a **4.8M FDV**, accepts **480,000**, and leaves **220,000 refundable**. The contract checks the complete bidder list and the calculation onchain. The [walkthrough](AUCTION_WALKTHROUGH.md) shows who receives what.

The code and test results are available now. A public Arbitrum Sepolia deployment and a full wallet-driven browser run are still release gates. [Release status](RELEASE_STATUS.md) separates completed proof from planned work.

[Source code](https://github.com/EndPx/sama) · [Implementation PR](https://github.com/EndPx/sama/pull/3) · [Buildathon](https://www.hackquest.io/hackathons/Arbitrum-Open-House-Singapore-Online-Buildathon)
