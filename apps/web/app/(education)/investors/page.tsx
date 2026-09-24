import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";
import { ParticipantPath } from "@/components/participant-path";

export const metadata: Metadata = {
  title: "For participants",
  description:
    "Explore a fictional startup round, make a valuation-limited testnet bid, and follow the result, claims, and refunds.",
};

export default function InvestorsPage() {
  return (
    <>
      <EducationHero
        eyebrow="For participants / 01"
        title={
          <>
            Know the terms. <em>Choose your limit.</em>
          </>
        }
        description="SAMA turns a valuation preference into a bid you can trace. Read the fixed terms, decide your maximum FDV, and see how the contract treats your deposit after settlement."
        art={<EducationVisual kind="investor" />}
        primary={{ href: "/auction", label: "See the auction" }}
        secondary={{ href: "/docs/getting-started", label: "How to take part" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="investor-path"
      >
        <div className="education-section-heading">
          <p className="eyebrow">Your path</p>
          <div>
            <h2 id="investor-path">Four decisions. A visible outcome.</h2>
            <p>
              Follow fixed terms, a sealed limit, a public reveal, and a settled
              claim without losing track of your deposit.
            </p>
          </div>
        </div>
        <ParticipantPath />
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="investor-proof"
      >
        <div className="education-section-heading">
          <p className="eyebrow">What you can check</p>
          <div>
            <h2 id="investor-proof">An answer beyond a balance.</h2>
            <p>
              The reference auction is an executable fixture. Its deposits,
              accepted capital, and refunds add up without an offchain judge
              choosing winners.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">Auction record</p>
            <h3>Where did the deposit go?</h3>
            <p>
              Compare your maximum FDV with the clearing FDV, then inspect the
              accepted amount and refundable remainder. The five-bid example
              accepts 480,000 of 700,000 deposited demoUSDC.
            </p>
            <Link href="/auction" className="text-link">
              Walk through the numbers
            </Link>
          </article>
          <article className="education-paper">
            <p className="eyebrow">After the round</p>
            <h3>What happens to the token?</h3>
            <p>
              A winner may claim and transfer demo tokens under the eligibility
              rules. A listing can be filled in parts, but it still needs a
              willing buyer.
            </p>
            <Link href="/stakeholder-tokens" className="text-link">
              Understand the token
            </Link>
          </article>
        </div>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="investor-next"
      >
        <div>
          <p className="eyebrow">Next / The method</p>
          <h2 id="investor-next">See how one price emerges.</h2>
          <p>Five bids, one clearing FDV, and a refund you can account for.</p>
        </div>
        <Link href="/auction" className="text-link">
          Explore the auction <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
