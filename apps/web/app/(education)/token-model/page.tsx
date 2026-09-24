import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { TokenJourney } from "@/components/token-journey";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
  referenceKiraEntitlement,
} from "@/lib/reference-auction";
import "./token-model.css";

export const metadata: Metadata = {
  title: "Token model | SAMA",
  description:
    "Understand KIRA in one place: how a demo round creates a claim, how tokens reach a wallet, and how a marketplace sale works.",
};

const exampleBid = referenceBids[3];
const exampleKira = referenceKiraEntitlement(exampleBid.accepted);

const outcomes = [
  {
    question: "Only part of my bid counts?",
    answer:
      "You can claim KIRA for the accepted part and reclaim the unused demoUSDC. They are separate claims.",
  },
  {
    question: "My bid loses—or I never reveal it?",
    answer:
      "You receive no KIRA. After settlement or cancellation, the committed demoUSDC is refundable in full.",
  },
  {
    question: "My listing sells in pieces?",
    answer:
      "Each buyer receives only what they bought. The unsold KIRA stays in marketplace escrow until another purchase or your cancellation.",
  },
  {
    question: "A contract is paused?",
    answer:
      "A marketplace pause stops new listings and buys but still permits cancellation. A KIRA token pause temporarily blocks every KIRA transfer, including cancellation, until unpaused.",
  },
] as const;

const rules = [
  {
    label: "Supply",
    title: "One million is the ceiling.",
    description:
      "KIRA cannot exceed 1,000,000 tokens. The offering is intended to be the only minter, but an administrator can manage minter roles; that role configuration remains a trust assumption.",
  },
  {
    label: "Access",
    title: "Wallet eligibility is checked.",
    description:
      "Ordinary transfers require eligible sender and recipient wallets. Public enrollment helps people try this testnet demo; it is not identity verification or regulatory screening.",
  },
  {
    label: "Custody",
    title: "Listed tokens are actually held.",
    description:
      "A listing moves KIRA into marketplace escrow. The seller can cancel and recover the unsold amount to an eligible recipient, even while the marketplace is paused—unless KIRA transfers themselves are paused.",
  },
  {
    label: "Pricing",
    title: "A partial sale still has a price.",
    description:
      "Each partial fill is priced from the listing's remaining tokens and remaining price, rounded up in the smallest demoUSDC unit. A buyer sets a maximum cost; a fill that would leave free KIRA is rejected.",
  },
] as const;

export default function TokenModelPage() {
  return (
    <article className="token-model">
      <header className="page-shell token-intro">
        <div className="token-intro-copy">
          <span className="token-kicker">The token model</span>
          <h1>KIRA shows where a round goes next.</h1>
          <p>
            A startup round ends. Some bids are accepted, others are returned.
            KIRA is the demo token a winner can claim for their accepted amount.
            If its holder later lists it, another eligible wallet can buy it.
            Here is that whole journey, in one place.
          </p>
          <div className="token-intro-actions">
            <a href="#example-round" className="token-primary-link">
              Follow the example <ArrowDown size={16} aria-hidden="true" />
            </a>
            <Link href="/auction" className="token-text-link">
              Explore the round <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div
          className="token-hero-picture"
          aria-label="KIRA token moves from a round to a wallet and then a buyer"
        >
          <div className="token-hero-picture-top">
            <span>SAMA / KIRA</span>
            <span>ARBITRUM SEPOLIA</span>
          </div>
          <div className="token-hero-stage">
            <div className="token-hero-ring token-hero-ring-outer" />
            <div className="token-hero-ring token-hero-ring-inner" />
            <div className="token-hero-coin">K</div>
            <div className="token-hero-connector token-hero-connector-left" />
            <div className="token-hero-connector token-hero-connector-right" />
            <span className="token-hero-label token-hero-label-left">
              Round result
            </span>
            <span className="token-hero-label token-hero-label-right">
              Eligible wallets
            </span>
          </div>
          <div className="token-hero-picture-bottom">
            <strong>1,000,000</strong>
            <span>Maximum demo KIRA. Created only when winners claim.</span>
          </div>
        </div>
      </header>

      <div className="page-shell token-body">
        <section
          className="token-example"
          id="example-round"
          aria-labelledby="token-example-title"
        >
          <div className="token-section-lead">
            <span className="token-kicker">
              A real example from the demo rules
            </span>
            <h2 id="token-example-title">One bid can have two outcomes.</h2>
            <p>
              Imagine bidder B joins the five-bid reference round. They put in{" "}
              {formatWholeUnits(exampleBid.deposit)} demoUSDC. The round settles
              at one shared company-value figure of{" "}
              {formatWholeUnits(referenceAuction.clearingFdv)} demoUSDC. Only a
              part of B&apos;s bid is needed.
            </p>
          </div>
          <div
            className="token-ledger"
            aria-label="Bidder B example allocation"
          >
            <div className="token-ledger-heading">
              <span>Bidder B / round result</span>
              <span>DEMO FIGURES</span>
            </div>
            <div className="token-ledger-deposit">
              <span>Bid placed</span>
              <strong>{formatWholeUnits(exampleBid.deposit)}</strong>
              <small>demoUSDC</small>
            </div>
            <div
              className="token-ledger-bar"
              role="img"
              aria-label={`${formatWholeUnits(exampleBid.accepted)} demoUSDC accepted and ${formatWholeUnits(exampleBid.refund)} demoUSDC refundable`}
            >
              <span style={{ flexGrow: Number(exampleBid.accepted) }} />
              <span style={{ flexGrow: Number(exampleBid.refund) }} />
            </div>
            <div className="token-ledger-results">
              <div>
                <span className="token-ledger-dot token-ledger-dot-accepted" />
                <span>Accepted</span>
                <strong>{formatWholeUnits(exampleBid.accepted)}</strong>
                <small>demoUSDC goes toward the round</small>
              </div>
              <div>
                <span className="token-ledger-dot token-ledger-dot-refund" />
                <span>Refundable</span>
                <strong>{formatWholeUnits(exampleBid.refund)}</strong>
                <small>demoUSDC can be claimed back</small>
              </div>
              <div>
                <span className="token-ledger-dot token-ledger-dot-kira" />
                <span>Token claim</span>
                <strong>{formatWholeUnits(exampleKira)}</strong>
                <small>KIRA can be claimed separately</small>
              </div>
            </div>
            <p className="token-ledger-note">
              The refund and KIRA require separate transactions. This is a
              fictional testnet round using valueless demo assets.
            </p>
          </div>
        </section>

        <TokenJourney />

        <section
          className="token-outcomes"
          aria-labelledby="token-outcomes-title"
        >
          <div className="token-section-lead">
            <span className="token-kicker">When the path changes</span>
            <h2 id="token-outcomes-title">
              Not every bid or listing ends the same way.
            </h2>
            <p>These are the common cases, without the contract jargon.</p>
          </div>
          <div className="token-outcome-list">
            {outcomes.map((outcome) => (
              <div className="token-outcome" key={outcome.question}>
                <h3>{outcome.question}</h3>
                <p>{outcome.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="token-rules" aria-labelledby="token-rules-title">
          <div className="token-section-lead">
            <span className="token-kicker">The boundaries</span>
            <h2 id="token-rules-title">
              What the system enforces—and what it doesn&apos;t.
            </h2>
            <p>
              These rules make the demo easier to inspect. They do not remove
              every dependency on administrators, wallets, or the testnet.
            </p>
          </div>
          <div className="token-rule-list">
            {rules.map((rule) => (
              <div className="token-rule" key={rule.label}>
                <span>{rule.label}</span>
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>
            ))}
          </div>
          <a
            className="token-text-link token-trust-link"
            href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/THREAT_MODEL.md"
          >
            Read the full trust model{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>

        <section className="token-close" aria-labelledby="token-close-title">
          <div>
            <span className="token-kicker">One important distinction</span>
            <h2 id="token-close-title">The token is not the company.</h2>
          </div>
          <div>
            <p>
              KIRA can move between eligible wallets in this fictional demo.
              Holding it does not give you legal shares, dividends, votes, exit
              proceeds, or a guaranteed buyer.
            </p>
            <div className="token-close-actions">
              <Link href="/market/kira">
                Visit the marketplace{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <a href="https://sama-3.gitbook.io/sama-product-and-protocol/">
                Read the docs <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
