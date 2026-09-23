import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";

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
            A round with <em>readable rules.</em>
          </>
        }
        description="Founders should be able to explain the terms before the first bid and the result after the last reveal. Kirana AI is the fixed fictional case SAMA uses to test that idea."
        art={
          <>
            <div className="education-art-kicker">
              <span>The issuer&apos;s view</span>
              <span>S / 02</span>
            </div>
            <div>
              <p className="education-art-number">10%</p>
              <p className="education-art-caption">
                A simulated allocation represented by up to 1,000,000 KIRA.
                Neither number establishes real company equity.
              </p>
            </div>
            <div className="education-art-footer">
              <span>Fixed terms</span>
              <span>Verifiable settlement</span>
            </div>
          </>
        }
        primary={{ href: "/auction", label: "View the auction" }}
        secondary={{ href: "/explore", label: "Explore Kirana AI" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="founder-mechanism"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The mechanism</p>
          <div>
            <h2 id="founder-mechanism">Terms first. Demand next.</h2>
            <p>
              SAMA fixes the example offering in a contract, then lets bids
              determine the clearing FDV within the published range.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Terms</span>
            <h3>Make the boundaries visible</h3>
            <p>
              The demo offers 1,000,000 KIRA, with a 4M–6M FDV range, a 400,000
              demoUSDC minimum raise, and fixed commit and reveal deadlines.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Demand</span>
            <h3>Let bidders state a limit</h3>
            <p>
              Each participant escrows a public deposit and later reveals a
              maximum FDV. Their willingness to pay sets the demand curve; the
              contract applies the same rule to every address.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Close</span>
            <h3>Account for every deposit</h3>
            <p>
              Successful settlement records accepted capital, individual
              refunds, and token allocations. Issuer proceeds can be withdrawn
              once; bidders claim their own assets.
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
              The prototype proves a mechanism with Kirana AI; it is not a live
              founder onboarding or legal fundraising service.
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
              A self-service issuer dashboard, issuer diligence, legal rights,
              and a real-money launch are outside this testnet release. Those
              would require new product, legal, and security work.
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
