import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";
import { SettlementTrace } from "@/components/settlement-trace";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
} from "@/lib/reference-auction";

export const metadata: Metadata = {
  title: "How the auction works",
  description:
    "Follow SAMA's five-bid reference auction: 700,000 demoUSDC deposited, 4.8M FDV clearing, 480,000 accepted, and 220,000 refundable.",
};

export default function AuctionPage() {
  return (
    <>
      <EducationHero
        eyebrow="The auction / 04"
        title={
          <>
            Five bids. <em>One clearing price.</em>
          </>
        }
        description="Each bidder names the highest valuation they would accept. After reveal, the contract finds the highest FDV at which the offered allocation can be filled. Every accepted bid uses that same FDV."
        tone="forest"
        art={<EducationVisual kind="auction" />}
        primary={{ href: "#auction-result", label: "See the result" }}
        secondary={{ href: "/docs/getting-started", label: "Learn the steps" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="auction-process"
      >
        <div className="education-section-heading">
          <p className="eyebrow">How it moves</p>
          <div>
            <h2 id="auction-process">Commit. Reveal. Verify.</h2>
            <p>
              The bid deposit is public. The maximum FDV stays hidden behind a
              hash and random nonce until the bidder reveals it. The contract
              verifies the full settlement input and exact accounting.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Commit</span>
            <h3>Escrow a deposit</h3>
            <p>
              Save the reveal backup before signing. One wallet can make one
              commitment to this offering; it cannot edit that bid later.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Reveal</span>
            <h3>Publish your limit</h3>
            <p>
              Return before the exclusive reveal deadline. The transaction
              publishes the maximum FDV and nonce, making the bid eligible for
              the calculation.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Settle</span>
            <h3>Check every bidder</h3>
            <p>
              Anyone can submit the sorted revealed set. The contract rejects
              omissions, duplicates, wrong order, and an invalid calculation. It
              records accepted amounts and refunds without paying them out in a
              settlement loop.
            </p>
          </div>
        </div>
      </section>

      <section
        id="auction-result"
        className="education-section page-shell"
        aria-labelledby="auction-result-title"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The reference result</p>
          <div>
            <h2 id="auction-result-title">Where each deposit lands.</h2>
            <p>
              These are the fixed test bids, in descending maximum FDV order.
              Amounts are whole demoUSDC units for readability; the contracts
              account in six-decimal base units.
            </p>
          </div>
        </div>
        <SettlementTrace />
        <table className="education-table">
          <caption className="sr-only">
            Five-bid reference auction: deposit, maximum FDV, accepted amount,
            and refund for each bidder
          </caption>
          <thead>
            <tr>
              <th scope="col">Bidder</th>
              <th scope="col">Deposit</th>
              <th scope="col">Max FDV</th>
              <th scope="col">Accepted</th>
              <th scope="col">Refund</th>
            </tr>
          </thead>
          <tbody>
            {referenceBids.map((bid) => (
              <tr key={bid.bidder}>
                <th scope="row" data-label="Bidder">
                  {bid.bidder}
                </th>
                <td data-label="Deposit">{formatWholeUnits(bid.deposit)}</td>
                <td data-label="Max FDV">{bid.maxFdv}</td>
                <td data-label="Accepted">{formatWholeUnits(bid.accepted)}</td>
                <td data-label="Refund">{formatWholeUnits(bid.refund)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row" data-label="Bidder">
                Total
              </th>
              <td data-label="Deposit">
                {formatWholeUnits(referenceAuction.depositTotal)}
              </td>
              <td data-label="Max FDV">—</td>
              <td data-label="Accepted">
                {formatWholeUnits(referenceAuction.acceptedTotal)}
              </td>
              <td data-label="Refund">
                {formatWholeUnits(referenceAuction.refundTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="auction-why"
      >
        <div className="education-section-heading">
          <p className="eyebrow">Why 4.8M?</p>
          <div>
            <h2 id="auction-why">The first tier that can fill the offer.</h2>
            <p>
              The offering sells a simulated 10% allocation. The required
              capital at a candidate FDV is 10% of that valuation.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">At 5.0M / No clear</p>
            <h3>450,000 offered. 500,000 required.</h3>
            <p>
              E, D, and C are willing to participate at 5.0M, but their deposits
              do not fill the available allocation.
            </p>
          </article>
          <article className="education-paper">
            <p className="eyebrow">At 4.8M / Clears</p>
            <h3>600,000 offered. 480,000 required.</h3>
            <p>
              E, D, and C use 450,000 of capacity. B receives the remaining
              30,000 and can reclaim 120,000. A is below the clearing FDV and
              can reclaim the full 100,000.
            </p>
          </article>
        </div>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="auction-next"
      >
        <div>
          <p className="eyebrow">Next / After settlement</p>
          <h2 id="auction-next">What does a winner claim?</h2>
          <p>See what KIRA can do in this demo and what it cannot represent.</p>
        </div>
        <Link href="/stakeholder-tokens" className="text-link">
          Understand KIRA <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
