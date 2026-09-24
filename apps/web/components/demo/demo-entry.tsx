"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Gavel,
  LayoutGrid,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { docsUrl } from "@/lib/config";
import { MockMarketplace, MockPortfolio, MockRound } from "./mock-views";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
} from "@/lib/reference-auction";

type DemoView = "overview" | "round" | "portfolio" | "market";
type ReferenceBid = (typeof referenceBids)[number];

const views = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "round", label: "The round", icon: Gavel },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "market", label: "Marketplace", icon: Store },
] as const;

const viewCopy: Record<
  Exclude<DemoView, "overview">,
  { eyebrow: string; title: string; description: string }
> = {
  round: {
    eyebrow: "Round / Sample data",
    title: "Follow a round from bid to outcome.",
    description:
      "Explore the exact five bid example behind SAMA. Every number is illustrative, but the rules and outcome match the published auction specification.",
  },
  portfolio: {
    eyebrow: "Portfolio / Sample data",
    title: "See what each bid becomes.",
    description:
      "Switch between example bidders to see their accepted deposit, refund, and demo token allocation. None of these positions belongs to this browser.",
  },
  market: {
    eyebrow: "Marketplace / Sample data",
    title: "A place to trade after the round.",
    description:
      "Once a round ends, holders can offer demo tokens to others. Explore example listings and see a price without buying anything.",
  },
};

function Wordmark() {
  return (
    <Link href="/" className="demo-wordmark" aria-label="SAMA home">
      <Image src="/brand/sama-mark.png" alt="" width={37} height={37} />
      <span>
        sama<span className="demo-wordmark-dot">.</span>
      </span>
    </Link>
  );
}

function Intro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="demo-page-intro">
      <div className="demo-page-intro-copy">
        <p className="demo-overline">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="demo-preview-label">
        <span aria-hidden="true" />
        Sample data
      </span>
    </div>
  );
}

function formatBid(amount: bigint) {
  return `${formatWholeUnits(amount)} demoUSDC`;
}

function bidOutcome(bid: ReferenceBid) {
  if (bid.accepted === 0n)
    return "This bid was below the clearing value. The full deposit can be claimed back.";
  if (bid.refund > 0n)
    return "This bid met the clearing value. Part was accepted, and the unused deposit can be claimed back.";
  return "This bid met the clearing value. The full deposit was accepted at the same price as every other winning bid.";
}

function ReferenceRoundDesk() {
  const [selectedBidder, setSelectedBidder] =
    useState<ReferenceBid["bidder"]>("B");
  const selected =
    referenceBids.find((bid) => bid.bidder === selectedBidder) ??
    referenceBids[3];
  const maxDeposit = 200_000;

  return (
    <section className="demo-reference" aria-labelledby="demo-reference-title">
      <div className="demo-section-heading">
        <div>
          <p className="demo-overline">The reference round</p>
          <h2 id="demo-reference-title">One price. Every bid accounted for.</h2>
          <p>
            Five independent test bids meet at one clearing value. Select a bid
            to see where its deposit goes.
          </p>
        </div>
        <span className="demo-example-tag">
          Fixed example, not live activity
        </span>
      </div>
      <div className="demo-reference-surface">
        <div className="demo-reference-topline">
          <div>
            <span>Clearing company value</span>
            <strong>
              {(Number(referenceAuction.clearingFdv) / 1_000_000).toFixed(1)}M
            </strong>
          </div>
          <div>
            <span>Accepted for the round</span>
            <strong>{formatWholeUnits(referenceAuction.acceptedTotal)}</strong>
          </div>
          <div>
            <span>Available to refund</span>
            <strong>{formatWholeUnits(referenceAuction.refundTotal)}</strong>
          </div>
        </div>
        <div className="demo-reference-body">
          <div className="demo-reference-ledger">
            <div className="demo-reference-ledger-header">
              <span>Bid</span>
              <span>Deposit outcome</span>
              <span>Accepted / refund</span>
            </div>
            <div className="demo-bid-list" aria-label="Reference bids">
              {referenceBids.map((bid) => (
                <button
                  key={bid.bidder}
                  type="button"
                  aria-pressed={selectedBidder === bid.bidder}
                  aria-label={`Bid ${bid.bidder}: ${formatBid(bid.deposit)} deposited; ${formatBid(bid.accepted)} accepted; ${formatBid(bid.refund)} refundable.`}
                  onClick={() => setSelectedBidder(bid.bidder)}
                  className="demo-bid-row"
                >
                  <span className="demo-bid-identity">
                    <span className="demo-bid-avatar" aria-hidden="true">
                      {bid.bidder}
                    </span>
                    <span>Bid {bid.bidder}</span>
                  </span>
                  <span className="demo-bid-bar" aria-hidden="true">
                    <span
                      className="demo-bid-accepted"
                      style={{
                        width: `${(Number(bid.accepted) / maxDeposit) * 100}%`,
                      }}
                    />
                    <span
                      className="demo-bid-refund"
                      style={{
                        width: `${(Number(bid.refund) / maxDeposit) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="demo-bid-values">
                    {Number(bid.accepted) / 1_000}k /{" "}
                    {Number(bid.refund) / 1_000}k
                  </span>
                </button>
              ))}
            </div>
            <div className="demo-reference-legend">
              <span>
                <i className="demo-legend-accepted" aria-hidden="true" />
                Accepted
              </span>
              <span>
                <i className="demo-legend-refund" aria-hidden="true" />
                Refundable
              </span>
            </div>
          </div>
          <aside
            className="demo-bid-detail"
            aria-label="Selected reference bid"
            aria-live="polite"
          >
            <p className="demo-overline">Selected bid</p>
            <div className="demo-bid-detail-title">
              <span>{selected.bidder}</span>
              <div>
                <h3>Bid {selected.bidder}</h3>
                <p>Willing to participate up to {selected.maxFdv}</p>
              </div>
            </div>
            <dl>
              <div>
                <dt>Deposited</dt>
                <dd>{formatBid(selected.deposit)}</dd>
              </div>
              <div>
                <dt>Accepted</dt>
                <dd>{formatBid(selected.accepted)}</dd>
              </div>
              <div>
                <dt>Refundable</dt>
                <dd>{formatBid(selected.refund)}</dd>
              </div>
            </dl>
            <p className="demo-bid-explanation">{bidOutcome(selected)}</p>
          </aside>
        </div>
        <p className="demo-reference-footnote">
          {formatWholeUnits(referenceAuction.depositTotal)} demoUSDC deposited
          in this illustration. All figures are from the published test fixture.
        </p>
      </div>
    </section>
  );
}

function Overview({ openRound }: { openRound: () => void }) {
  return (
    <div className="demo-overview demo-view-enter">
      <Intro
        eyebrow="SAMA workspace / Overview"
        title="A clearer way to join a public round."
        description="Explore how a startup can invite the public to take part, then give everyone one understandable outcome. This workspace lets you inspect the example before connecting a wallet."
      />
      <section className="demo-feature" aria-label="What SAMA does">
        <div className="demo-feature-copy">
          <p className="demo-overline">From interest to outcome</p>
          <h2>One place for the whole round.</h2>
          <p>
            A startup shares its plan. People place test bids at values they
            believe in. When bidding ends, the rules produce one clearing value
            and make unused deposits claimable.
          </p>
          <Button type="button" onClick={openRound}>
            Explore the round <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
        <div className="demo-feature-art" aria-hidden="true">
          <span className="demo-feature-orbit" />
          <Image
            src="/brand/sama-confluence-footer.png"
            alt=""
            width={1254}
            height={1254}
            priority
            sizes="(max-width: 767px) 80vw, 38vw"
          />
        </div>
      </section>
      <ReferenceRoundDesk />
      <section className="demo-journey" aria-labelledby="demo-journey-title">
        <div className="demo-section-heading">
          <div>
            <p className="demo-overline">Your path</p>
            <h2 id="demo-journey-title">Know what happens next.</h2>
          </div>
        </div>
        <ol>
          <li>
            <span>01</span>
            <h3>Choose your limit</h3>
            <p>
              Pick a test deposit and the highest company value you would
              accept.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>Reveal your bid</h3>
            <p>
              Keep your backup safe, then reveal when the round enters its
              reveal window.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>See your result</h3>
            <p>
              One value settles the round. Claim a demo allocation or any unused
              deposit.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

function SampleView({ view }: { view: Exclude<DemoView, "overview"> }) {
  const copy = viewCopy[view];
  return (
    <div className="demo-transaction-view demo-view-enter">
      <Intro {...copy} />
      {view === "round" && <MockRound referenceDesk={<ReferenceRoundDesk />} />}
      {view === "portfolio" && <MockPortfolio />}
      {view === "market" && <MockMarketplace />}
    </div>
  );
}

export function DemoEntry() {
  const [view, setView] = useState<DemoView>("overview");

  function openView(next: DemoView) {
    setView(next);
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <section className="demo-workspace" aria-label="SAMA demo workspace">
      <header className="demo-workspace-header">
        <div className="demo-workspace-header-start">
          <Wordmark />
          <span className="demo-header-divider" aria-hidden="true" />
          <span className="demo-header-title">Round workspace</span>
        </div>
        <div className="demo-workspace-header-actions">
          <span className="demo-network-label">Mock workspace</span>
          <span className="demo-account-pill">
            <UserRound aria-hidden="true" />
            Example profile
          </span>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            <BookOpen aria-hidden="true" /> Docs
          </a>
        </div>
      </header>
      <div className="demo-workspace-body">
        <aside className="demo-workspace-rail">
          <div className="demo-rail-inner">
            <div className="demo-rail-group">
              <p className="demo-rail-label">Workspace</p>
              <nav className="demo-view-nav" aria-label="Demo views">
                {views.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={view === id}
                    onClick={() => openView(id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    {view === id && (
                      <span className="demo-nav-current" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <div className="demo-rail-bottom">
              <div className="demo-rail-status">
                <span className="demo-rail-status-dot" aria-hidden="true" />
                <div>
                  <strong>Sample data</strong>
                  <p>
                    Illustrative screens only. No wallet or transaction is
                    connected.
                  </p>
                </div>
              </div>
              <Link href="/" className="demo-site-link">
                Back to SAMA <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
        <div className="demo-workspace-main" id="demo-content">
          <div className="demo-main-topline">
            <span>
              Workspace / {views.find((item) => item.id === view)?.label}
            </span>
            <span>Sample data / No live activity</span>
          </div>
          {view === "overview" ? (
            <Overview openRound={() => openView("round")} />
          ) : (
            <SampleView view={view} />
          )}
          <div className="demo-main-bottomline">
            <span>Mock product preview · No transactions</span>
            <a href={docsUrl} target="_blank" rel="noopener noreferrer">
              How SAMA works <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
