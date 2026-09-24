import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";
import { TokenJourney } from "@/components/token-journey";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
  referenceKiraEntitlement,
} from "@/lib/reference-auction";
import "./token-model.css";

export const metadata: Metadata = {
  title: "What is KIRA?",
  description:
    "Follow KIRA from a testnet startup round into a wallet and marketplace, with clear boundaries on what this demo token does and does not represent.",
};

const marginalBid = referenceBids[3];
const marginalKira = referenceKiraEntitlement(marginalBid.accepted);

const scenarios = [
  {
    label: "Your bid is accepted in part",
    outcome:
      "You can claim KIRA for the accepted amount and claim the unused test currency back separately.",
    note: "One bid can have both a token claim and a refund.",
  },
  {
    label: "Your bid loses—or stays unrevealed",
    outcome:
      "No KIRA is allocated. After finalization or cancellation, the full committed amount is refundable.",
    note: "An unrevealed bid never counts as demand.",
  },
  {
    label: "Your listing sells in pieces",
    outcome:
      "Buyers keep the KIRA they purchased. The unsold amount stays in marketplace escrow until another fill or a seller cancellation.",
    note: "Every partial fill keeps a positive price on the remainder.",
  },
  {
    label: "A contract is paused",
    outcome:
      "A marketplace pause stops new listings and buys but still allows cancellation. A KIRA token pause blocks all KIRA transfers, including cancellation, until unpaused.",
    note: "A pause is not a transfer of ownership.",
  },
] as const;

const controls = [
  {
    title: "A fixed upper limit",
    answer:
      "KIRA has a 1,000,000-token cap. The offering is intended to be the only minter in this deployment, but the administrator can manage minter roles. The cap is enforced by the token contract; role configuration remains a trust assumption.",
  },
  {
    title: "Eligible wallets only",
    answer:
      "Ordinary KIRA transfers require eligible sender and recipient addresses. Public enrollment in this testnet demo is only an access helper, not identity verification or regulatory screening.",
  },
  {
    title: "Listed KIRA is held in escrow",
    answer:
      "Creating a listing moves the offered KIRA into the marketplace. A purchase moves only the bought portion to an eligible buyer. The seller can cancel and recover the unsold portion to an eligible recipient, even when the marketplace itself is paused.",
  },
  {
    title: "Buyers approve a maximum cost",
    answer:
      "The contract quotes each partial fill from the listing's remaining KIRA and remaining price, rounding up in the smallest test-currency unit. It rejects a partial fill that would leave unpriced KIRA. A buyer's maximum cost protects against a changed quote.",
  },
] as const;

export default function TokenModelPage() {
  return (
    <>
      <EducationHero
        eyebrow="KIRA, explained"
        title={<>A test token with a traceable path.</>}
        description="KIRA lets you see what happens after a public startup round: who can claim tokens, where listed tokens sit, and how a buyer receives them. It is part of a fictional testnet demo—not a company share."
        tone="forest"
        art={<EducationVisual kind="token" />}
        primary={{ href: "/auction", label: "See the demo round" }}
        secondary={{ href: "/market/kira", label: "Open the marketplace" }}
      />

      <section className="token-example" aria-labelledby="token-example-title">
        <div className="page-shell token-example-inner">
          <div className="token-example-intro">
            <span className="token-example-label">
              From the five-bid demo round
            </span>
            <h2 id="token-example-title">One bid. Two things to claim.</h2>
            <p>
              Take bidder B. They placed {formatWholeUnits(marginalBid.deposit)}{" "}
              demoUSDC in the example round. Only part of that bid was accepted
              at the shared result of{" "}
              {formatWholeUnits(referenceAuction.clearingFdv)} demoUSDC company
              value.
            </p>
          </div>
          <div
            className="token-example-ledger"
            aria-label="Example bidder B result"
          >
            <div className="token-ledger-topline">
              <span>Bidder B / example outcome</span>
              <span>Arbitrum Sepolia demo</span>
            </div>
            <div
              className="token-ledger-bar"
              role="img"
              aria-label={`${formatWholeUnits(marginalBid.accepted)} accepted and ${formatWholeUnits(marginalBid.refund)} refundable from ${formatWholeUnits(marginalBid.deposit)} demoUSDC deposited`}
            >
              <span style={{ flexGrow: Number(marginalBid.accepted) }} />
              <span style={{ flexGrow: Number(marginalBid.refund) }} />
            </div>
            <div className="token-ledger-columns">
              <div>
                <span>Counts toward the round</span>
                <strong>{formatWholeUnits(marginalBid.accepted)}</strong>
                <small>demoUSDC</small>
              </div>
              <div>
                <span>Can be claimed back</span>
                <strong>{formatWholeUnits(marginalBid.refund)}</strong>
                <small>demoUSDC</small>
              </div>
              <div className="token-ledger-kira">
                <span>Can be claimed as tokens</span>
                <strong>{formatWholeUnits(marginalKira)}</strong>
                <small>KIRA</small>
              </div>
            </div>
            <p>
              The refund and KIRA claim are separate transactions. These are
              valueless test assets, not an investment return.
            </p>
          </div>
        </div>
      </section>

      <TokenJourney />

      <section
        className="token-scenarios page-shell"
        aria-labelledby="token-scenarios-title"
      >
        <div className="token-section-head">
          <div>
            <h2 id="token-scenarios-title">
              What happens if the path changes?
            </h2>
            <p>
              You do not need to read contract code to understand the common
              outcomes. These are the cases the demo handles today.
            </p>
          </div>
          <span className="token-section-index" aria-hidden="true">
            02 / 04
          </span>
        </div>
        <div className="token-scenario-grid">
          {scenarios.map((scenario, index) => (
            <article className="token-scenario" key={scenario.label}>
              <span className="token-scenario-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{scenario.label}</h3>
              <p>{scenario.outcome}</p>
              <small>{scenario.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section
        className="token-controls"
        aria-labelledby="token-controls-title"
      >
        <div className="page-shell token-controls-inner">
          <div className="token-controls-intro">
            <span className="token-section-index" aria-hidden="true">
              03 / 04
            </span>
            <h2 id="token-controls-title">What keeps the demo bounded?</h2>
            <p>
              A few rules are built into the contracts. Others still depend on
              the administrator or the testnet. Open each note for the real
              boundary—not a promise the prototype cannot make.
            </p>
            <a
              href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/THREAT_MODEL.md"
              className="token-controls-link"
            >
              Read the trust model <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="token-control-list">
            {controls.map((control, index) => (
              <details key={control.title} className="token-control">
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{control.title}</strong>
                  <span className="token-control-plus" aria-hidden="true" />
                </summary>
                <p>{control.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="token-boundary page-shell"
        aria-labelledby="token-boundary-title"
      >
        <div>
          <span className="token-section-index" aria-hidden="true">
            04 / 04
          </span>
          <h2 id="token-boundary-title">The token is not the company.</h2>
        </div>
        <div className="token-boundary-copy">
          <p>
            KIRA tracks units in this fictional round. It can be claimed,
            transferred between eligible wallets, and listed for demoUSDC. It
            does not give its holder legal equity, dividends, votes, exit
            proceeds, or a guaranteed buyer.
          </p>
          <div className="token-boundary-links">
            <Link href="/market/kira">
              See the marketplace <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <a href="https://sama-3.gitbook.io/sama-product-and-protocol/">
              Read the docs <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
