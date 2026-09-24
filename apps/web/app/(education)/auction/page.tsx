import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";
import { SettlementTrace } from "@/components/settlement-trace";
import { AuctionLab } from "@/components/auction-lab";
import "./auction.css";

export const metadata: Metadata = {
  title: "How the auction works",
  description:
    "Follow SAMA's reference auction with five bids: 700,000 demoUSDC deposited, 4.8M FDV clearing, 480,000 accepted, and 220,000 refundable.",
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
        description="Choose the highest company value you would accept, then reveal your bid when the window opens. The contract checks all revealed bids and finds the highest value that fills the offered allocation. Every accepted bid uses that same result."
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
            <h2 id="auction-process">
              Choose a limit. Reveal it. See the result.
            </h2>
            <p>
              Your deposited amount is public from the start. Your maximum
              company value stays sealed until reveal. The contract then checks
              the complete set of revealed bids before recording one result.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Commit</span>
            <h3>Put test currency behind your bid</h3>
            <p>
              Choose your deposit and maximum company value. Save the private
              reveal backup before signing. You can make one commitment per
              wallet, and you cannot change it afterward.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Reveal</span>
            <h3>Return to reveal your limit</h3>
            <p>
              Before the reveal deadline, use your saved backup to show the
              limit you chose. That transaction makes your bid count toward
              demand; a bid left unrevealed does not count.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Settle</span>
            <h3>Calculate one result for everyone</h3>
            <p>
              Anyone can submit the revealed bids in order. The contract rejects
              missing or repeated bidders and wrong calculations, then records
              each accepted amount and refund. Bidders claim afterward.
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
              account in base units with six decimal places.
            </p>
          </div>
        </div>
        <SettlementTrace />
      </section>

      <section
        className="education-section page-shell"
        aria-label="Interactive auction illustration"
      >
        <AuctionLab />
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="auction-questions"
      >
        <div className="education-section-heading">
          <p className="eyebrow">Before you place a test bid</p>
          <div>
            <h2 id="auction-questions">The questions worth asking.</h2>
            <p>
              The demo is intentionally simpler than a live investment round.
              These answers describe what the contracts do today.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Visibility</span>
            <h3>Is my whole bid private?</h3>
            <p>
              No. Your deposit and wallet address are public. Your maximum
              company value remains sealed only until you reveal it; the reveal
              transaction makes that value public.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Changes</span>
            <h3>Can I edit or cancel after committing?</h3>
            <p>
              No. This prototype accepts one fixed commitment per wallet. Check
              the amount and limit, and save your reveal backup, before you
              sign.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Price</span>
            <h3>Does my limit set my own price?</h3>
            <p>
              No. Every accepted bid uses the same clearing company value, not
              its own limit. Your limit can affect whether your bid is accepted
              and how much of it counts. A bid at the clearing tier can be
              accepted only in part.
            </p>
          </div>
          <div className="education-row">
            <span>04 / Missed reveal</span>
            <h3>What if I do not reveal?</h3>
            <p>
              Your bid does not count toward demand and earns no tokens. After
              the round is finalized or cancelled, the committed demoUSDC can be
              claimed back in full.
            </p>
          </div>
          <div className="education-row">
            <span>05 / Low demand</span>
            <h3>What if the round cannot meet its minimum?</h3>
            <p>
              The round fails when demand at the 4M floor is below the 400,000
              demoUSDC minimum. No tokens are allocated, and every deposit is
              refundable.
            </p>
          </div>
          <div className="education-row">
            <span>06 / Your limit</span>
            <h3>Can I just accept the market price?</h3>
            <p>
              Not in this demo. You choose a maximum company value within the
              published range from 4M to 6M. The interface does not offer an
              automatic “accept market” bid.
            </p>
          </div>
        </div>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="auction-next"
      >
        <div>
          <p className="eyebrow">Next / After settlement</p>
          <h2 id="auction-next">What does a winner claim?</h2>
          <p>See what a winner can claim, transfer, or list in this demo.</p>
        </div>
        <Link href="/stakeholder-tokens" className="text-link">
          Explore stakeholder tokens{" "}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
