import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";

export const metadata: Metadata = {
  title: "For founders",
  description:
    "See how SAMA's fixed fictional offering terms, transparent auction, and issuer proceeds work in the Arbitrum Sepolia prototype.",
};

export default function FoundersPage() {
  return (
    <>
      <EducationHero
        eyebrow="For founders / 02"
        title={
          <>
            Show your terms. <em>Let demand answer.</em>
          </>
        }
        description="A founder should be able to show the round's terms before anyone bids and explain the outcome afterward. SAMA tests that idea with one fictional startup, a public rulebook, and a price set by independent bids."
        art={<EducationVisual kind="founder" />}
        primary={{ href: "/auction", label: "View the auction" }}
        secondary={{ href: "/explore", label: "Explore the demo" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="founder-mechanism"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The mechanism</p>
          <div>
            <h2 id="founder-mechanism">Make the round explain itself.</h2>
            <p>
              Instead of announcing a winner or negotiating a different price
              for each participant, the demo puts its terms and calculation in
              one place.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Terms</span>
            <h3>Publish the offer before bids arrive</h3>
            <p>
              The example offers 1,000,000 demo tokens. Everyone sees the
              company value range from 4M to 6M, the 400,000 demoUSDC minimum,
              and the bid and reveal deadlines in advance.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Demand</span>
            <h3>Let people set their own ceiling</h3>
            <p>
              Each participant deposits test currency and chooses the highest
              company value they would accept. Once those limits are revealed,
              the same calculation applies to every bid.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Close</span>
            <h3>Give every deposit a clear outcome</h3>
            <p>
              The result states how much went toward the round, what can be
              refunded, and how many demo tokens each winner may claim. The
              issuer can withdraw accepted test currency only after a successful
              settlement.
            </p>
          </div>
        </div>
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="founder-scope"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The current scope</p>
          <div>
            <h2 id="founder-scope">One working case, deliberately narrow.</h2>
            <p>
              The prototype proves a mechanism with one fictional startup; it is
              not a live founder onboarding or legal fundraising service.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">What exists</p>
            <h3>Transparent protocol accounting</h3>
            <p>
              Tests cover the reference round, failed rounds, cancellation,
              unrevealed bids, bounded settlement, and claims. Local fixtures
              make the result reproducible.
            </p>
            <Link href="/auction" className="text-link">
              See the worked round
            </Link>
          </article>
          <article className="education-paper">
            <p className="eyebrow">What comes later</p>
            <h3>A real founder workflow</h3>
            <p>
              A dashboard for issuers to manage their own rounds, issuer
              diligence, legal rights, and a launch involving real money are
              outside this testnet release. Those would require new product,
              legal, and security work.
            </p>
            <a
              href="https://sama-3.gitbook.io/sama-product-and-protocol/"
              className="text-link"
            >
              Read the project docs
            </a>
          </article>
        </div>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="founder-next"
      >
        <div>
          <p className="eyebrow">Next / Price formation</p>
          <h2 id="founder-next">See the result a bidder can audit.</h2>
          <p>
            The fixture clears at 4.8M FDV with exact allocations and refunds.
          </p>
        </div>
        <Link href="/auction" className="text-link">
          Follow the five bids <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
