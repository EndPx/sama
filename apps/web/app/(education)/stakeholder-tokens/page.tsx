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
import "./stakeholder-tokens.css";

export const metadata: Metadata = {
  title: "Stakeholder Tokens",
  description:
    "Follow SAMA's stakeholder-token prototype from a public demo round to a wallet and an optional marketplace sale.",
};

const exampleBid = referenceBids[3];
const exampleKira = referenceKiraEntitlement(exampleBid.accepted);

const participants = [
  {
    role: "The bidder",
    action: "Chooses a limit, commits test currency, then reveals the bid.",
    after: "Claims any allocation and refund after settlement.",
  },
  {
    role: "The issuer",
    action: "Runs one fixed example round with published terms.",
    after:
      "Can withdraw only the accepted test currency after a successful result.",
  },
  {
    role: "The holder",
    action: "Keeps their claimed demo tokens or lists some for sale.",
    after:
      "Can cancel and recover the unsold portion, subject to token transfer rules.",
  },
  {
    role: "The buyer",
    action: "Chooses a token amount and the most demoUSDC they will pay.",
    after:
      "Receives the purchased tokens in the same transaction that pays the seller.",
  },
  {
    role: "The administrator",
    action: "Manages wallet eligibility and privileged token roles.",
    after:
      "Can pause parts of the system; this is a disclosed trust assumption.",
  },
] as const;

const outcomes = [
  {
    question: "Only part of my bid counts?",
    answer:
      "You can claim demo tokens for the accepted part and reclaim the unused demoUSDC. They are separate claims.",
  },
  {
    question: "My bid loses—or I never reveal it?",
    answer:
      "You receive no tokens. After settlement or cancellation, the committed demoUSDC is refundable in full.",
  },
  {
    question: "My listing sells in pieces?",
    answer:
      "Each buyer receives only what they bought. The unsold tokens stay in marketplace escrow until another purchase or your cancellation.",
  },
  {
    question: "A contract is paused?",
    answer:
      "A marketplace pause stops new listings and buys but still permits cancellation. A token pause temporarily blocks every token transfer, including cancellation, until unpaused.",
  },
] as const;

const rules = [
  {
    label: "Supply",
    title: "One million is the ceiling.",
    description:
      "The demo supply cannot exceed 1,000,000 tokens. The offering is intended to be the only minter, but an administrator can manage minter roles; that role configuration remains a trust assumption.",
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
      "A listing moves tokens into marketplace escrow. The seller can cancel and recover the unsold amount to an eligible recipient, even while the marketplace is paused—unless token transfers themselves are paused.",
  },
  {
    label: "Pricing",
    title: "A partial sale still has a price.",
    description:
      "Each partial fill is priced from the listing's remaining tokens and remaining price, rounded up in the smallest demoUSDC unit. A buyer sets a maximum cost; a fill that would leave free tokens is rejected.",
  },
] as const;

export default function StakeholderTokensPage() {
  return (
    <article className="token-model">
      <header className="page-shell token-intro">
        <div className="token-intro-copy">
          <span className="token-kicker">
            Stakeholder Tokens / the demo model
          </span>
          <h1>From a public round to a token you can hold.</h1>
          <p>
            A startup opens a round to the public. People place test bids under
            the same rules. When the round ends, winners can claim demo tokens
            for the part of their bid that counts. Those tokens can be held or
            offered to another eligible wallet. Here is the whole path.
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
          aria-label="Demo token moves from a round to a wallet and then a buyer"
        >
          <div className="token-hero-picture-top">
            <span>SAMA / STAKEHOLDER TOKENS</span>
            <span>ARBITRUM SEPOLIA</span>
          </div>
          <div className="token-hero-stage">
            <div className="token-hero-ring token-hero-ring-outer" />
            <div className="token-hero-ring token-hero-ring-inner" />
            <div className="token-hero-coin">S</div>
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
            <span>Maximum demo tokens. Created only when winners claim.</span>
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
                <small>demo tokens can be claimed separately</small>
              </div>
            </div>
            <p className="token-ledger-note">
              The refund and token claim require separate transactions. The
              token used in this fictional testnet round is named KIRA; it has
              no legal or monetary value.
            </p>
          </div>
        </section>

        <TokenJourney />

        <section className="token-people" aria-labelledby="token-people-title">
          <div className="token-section-lead">
            <span className="token-kicker">Who does what</span>
            <h2 id="token-people-title">
              One round. Different responsibilities.
            </h2>
            <p>
              The token does not replace the people around a raise. It makes the
              demo&apos;s allocation and later transfers visible, while each
              participant still has a distinct action to take.
            </p>
          </div>
          <div className="token-person-list">
            {participants.map((participant) => (
              <div className="token-person" key={participant.role}>
                <h3>{participant.role}</h3>
                <p>{participant.action}</p>
                <p>{participant.after}</p>
              </div>
            ))}
          </div>
        </section>

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
              The demo token can move between eligible wallets. Holding it does
              not give you legal shares, dividends, votes, exit proceeds, or a
              guaranteed buyer. This prototype has no SPV or SAFE backing.
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
