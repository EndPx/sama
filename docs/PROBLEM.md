# The problem

Finding an early startup is only the beginning. If you decide to participate, you still need answers to three practical questions: **What valuation am I willing to accept? How will my allocation be decided? What can I verify afterwards?**

SAMA explores a workflow that connects those answers. It does not claim that access to private companies is impossible today. Indonesia already has a securities crowdfunding framework, including [OJK's POJK 17/2025](https://ojk.go.id/id/regulasi/Pages/POJK-17-Tahun-2025-Penawaran-Efek-Melalui-Layanan-Urun-Dana-Berbasis-Teknologi-Informasi.aspx). SAMA is not an authorized operator under that framework.

## Where the experience breaks down

A startup profile can explain a company, but it cannot show how a price was reached. A token balance can show units, but it cannot prove a legal ownership claim. A listing can offer tokens for sale, but it cannot promise a buyer.

We built one small testnet journey around the parts software can make inspectable: fixed offering terms, valuation-limited bids, deterministic allocation, exact refunds, and transfers with visible receipts.

## The question behind the prototype

Can someone follow a simulated bid from their first deposit through the clearing result, a refund, a KIRA claim, and a secondary purchase—then check the accounting without relying on a screenshot?

The five-bid [auction walkthrough](AUCTION_WALKTHROUGH.md) makes that question concrete. The [product guide](PRODUCT.md) shows the whole journey.

## What we still need to learn

We have not claimed user traction, signed startup partners, or completed customer research. After the wallet journey works end to end, we can run task-based sessions with prospective backers and founders. A useful first measure is whether people can explain their FDV limit, recover a reveal backup, and tell a deposit apart from an accepted allocation.

A real-money product would require its own legal, issuer-diligence, investor-protection, and security work. This demo does not establish those prerequisites.
