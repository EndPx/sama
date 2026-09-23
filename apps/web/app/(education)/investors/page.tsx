import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";

export const metadata: Metadata = {
  title: "For participants",
  description:
    "Understand the fictional Kirana AI offering, make a valuation-limited testnet bid, and follow settlement, claims, and refunds.",
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
        art={
          <>
            <div className="education-art-kicker">
              <span>The bidder&apos;s view</span>
              <span>S / 01</span>
            </div>
            <div>
              <p className="education-art-caption">Reference clearing FDV</p>
              <p className="education-art-number">4.8M</p>
              <p className="education-art-caption">
                All accepted bids in the five-bid example settle at this FDV,
                even when their maximum was higher.
              </p>
            </div>
            <div className="education-art-footer">
              <span>One clearing rule</span>
              <span>Five seeded bids</span>
            </div>
          </>
        }
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
              The demo keeps the journey small enough to inspect without
              pretending a test token is an investment.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Read</span>
            <h3>Understand the offering</h3>
            <p>
              Kirana AI is fictional. Its offered allocation, FDV range, minimum
              raise, and deadlines are fixed before anyone bids.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Commit</span>
            <h3>Set your ceiling</h3>
            <p>
              Escrow demoUSDC and commit a maximum FDV. Your deposit is public;
              the FDV is hidden by a nonce until you reveal it. Export the
              backup before signing.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Reveal</span>
            <h3>Bring your bid into the calculation</h3>
            <p>
              Return before the reveal deadline. A bid that is never revealed
              cannot win KIRA and becomes fully refundable only after the round
              is finalized or cancelled.
            </p>
          </div>
          <div className="education-row">
            <span>04 / Claim</span>
            <h3>Check what is yours</h3>
            <p>
              Inspect the clearing result, then claim any KIRA and positive
              refund separately. The app waits for a confirmed receipt before
              reporting success.
            </p>
          </div>
        </div>
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
            <h3>What happens to KIRA?</h3>
            <p>
              A winner may claim and transfer KIRA under the demo eligibility
              rules. A listing can be filled in parts, but it still needs a
              willing buyer.
            </p>
            <Link href="/token-model" className="text-link">
              Understand the token
            </Link>
          </article>
        </div>
        <aside className="education-note" aria-label="Prototype boundary">
          <strong>A testnet experiment, not an investment account.</strong>
          <p>
            demoUSDC has no monetary value. KIRA grants no shares, dividends,
            governance rights, or guaranteed liquidity. The public deployment
            and complete wallet acceptance run are still release gates.
          </p>
        </aside>
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
