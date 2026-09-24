import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";
import { ParticipantPath } from "@/components/participant-path";

export const metadata: Metadata = {
  title: "For participants",
  description:
    "Choose the highest company value you would accept in a public testnet round, then follow your bid to an allocation or refund.",
};

export default function InvestorsPage() {
  return (
    <>
      <EducationHero
        eyebrow="For participants / 01"
        title={
          <>
            Join a round. <em>Keep your own limit.</em>
          </>
        }
        description="See the startup's published terms, choose the highest company value you would accept, and place a test bid. When bidding ends, every accepted bid uses one shared result—and you can see exactly what happened to your deposit."
        art={<EducationVisual kind="investor" />}
        primary={{ href: "/auction", label: "Explore the example round" }}
        secondary={{
          href: "/docs/getting-started",
          label: "See how to take part",
        }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="investor-path"
      >
        <div className="education-section-heading">
          <p className="eyebrow">Your path</p>
          <div>
            <h2 id="investor-path">
              Your bid, from first look to final result.
            </h2>
            <p>
              You do not need a private allocation or a conversation behind
              closed doors. The same steps and result are open for every demo
              participant.
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
            <h2 id="investor-proof">Know what you got—and why.</h2>
            <p>
              You can inspect the published terms, one clearing value, and the
              amount each bidder can claim back. The five-bid example makes the
              arithmetic easy to follow.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">Auction record</p>
            <h3>See where your deposit went.</h3>
            <p>
              Compare your limit with the round&apos;s result. The example accepts
              480,000 of 700,000 deposited demoUSDC; the rest is claimable back.
              No bidder needs to guess where their test currency went.
            </p>
            <Link href="/auction" className="text-link">
              Walk through the numbers
            </Link>
          </article>
          <article className="education-paper">
            <p className="eyebrow">After the round</p>
            <h3>Carry your result beyond the round.</h3>
            <p>
              A winner can claim demo tokens, hold them, or offer them to
              another eligible wallet. A listing can sell in parts; a sale still
              needs a willing buyer.
            </p>
            <Link href="/stakeholder-tokens" className="text-link">
              Follow the token path
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
