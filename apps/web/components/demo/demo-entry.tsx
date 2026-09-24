"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Gavel,
  LayoutGrid,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { docsUrl } from "@/lib/config";
import {
  formatSampleUsdc,
  sampleListings,
  sampleProfiles,
} from "@/lib/mock-workspace";
import { MockMarketplace, MockPortfolio, MockRound } from "./mock-views";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
  referenceKiraEntitlement,
} from "@/lib/reference-auction";

type DemoView = "overview" | "round" | "portfolio" | "market";
type ReferenceBid = (typeof referenceBids)[number];
type SampleBidder = (typeof sampleProfiles)[number]["bid"]["bidder"];

const views = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "round", label: "Round", icon: Gavel },
  { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
  { id: "market", label: "Marketplace", icon: Store },
] as const;

const viewCopy: Record<
  Exclude<DemoView, "overview">,
  { eyebrow: string; title: string }
> = {
  round: {
    eyebrow: "Sample round / Settled",
    title: "Round details",
  },
  portfolio: {
    eyebrow: "Sample account",
    title: "Portfolio",
  },
  market: {
    eyebrow: "Sample marketplace",
    title: "Marketplace",
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

function Intro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="demo-page-intro">
      <div className="demo-page-intro-copy">
        <p className="demo-overline">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

function formatBid(amount: bigint) {
  return `${formatWholeUnits(amount)} demoUSDC`;
}

function bidOutcome(bid: ReferenceBid) {
  if (bid.accepted === 0n) return "Full refund";
  if (bid.refund > 0n) return "Partial allocation";
  return "Full allocation";
}

function ReferenceRoundDesk({
  initialBidder,
}: {
  initialBidder: SampleBidder;
}) {
  const [selectedBidder, setSelectedBidder] =
    useState<ReferenceBid["bidder"]>(initialBidder);
  const selected =
    referenceBids.find((bid) => bid.bidder === selectedBidder) ??
    referenceBids[3];
  const maxDeposit = 200_000;

  return (
    <section className="demo-reference" aria-labelledby="demo-reference-title">
      <div className="demo-section-heading">
        <div>
          <p className="demo-overline">Five revealed bids</p>
          <h2 id="demo-reference-title">Settlement ledger</h2>
        </div>
        <span className="demo-example-tag">Sample data</span>
      </div>
      <div className="demo-reference-surface">
        <div className="demo-reference-topline">
          <div>
            <span>Clearing value / FDV</span>
            <strong>
              {(Number(referenceAuction.clearingFdv) / 1_000_000).toFixed(1)}M
            </strong>
          </div>
          <div>
            <span>Accepted / demoUSDC</span>
            <strong>{formatWholeUnits(referenceAuction.acceptedTotal)}</strong>
          </div>
          <div>
            <span>Refundable / demoUSDC</span>
            <strong>{formatWholeUnits(referenceAuction.refundTotal)}</strong>
          </div>
        </div>
        <div className="demo-reference-body">
          <div className="demo-reference-ledger">
            <div className="demo-reference-ledger-header">
              <span>Bid</span>
              <span>Allocation</span>
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
            <p className="demo-overline">Bid record</p>
            <div className="demo-bid-detail-title">
              <span>{selected.bidder}</span>
              <div>
                <h3>Bid {selected.bidder}</h3>
                <p>Maximum {selected.maxFdv} FDV</p>
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
      </div>
    </section>
  );
}

function Overview({
  selectedBidder,
  openView,
}: {
  selectedBidder: SampleBidder;
  openView: (view: DemoView) => void;
}) {
  const profile =
    sampleProfiles.find(({ bid }) => bid.bidder === selectedBidder) ??
    sampleProfiles[0];
  const { bid } = profile;
  const tokenAllocation = referenceKiraEntitlement(bid.accepted);
  const listing = sampleListings[0];
  const status =
    bid.accepted === 0n
      ? "Refund only"
      : bid.refund > 0n
        ? "Partially filled"
        : "Filled";

  return (
    <div className="demo-overview demo-view-enter">
      <div className="demo-dashboard-heading">
        <div>
          <p className="demo-overline">Sample account {bid.bidder}</p>
          <h1>Overview</h1>
        </div>
        <span className="demo-preview-label">
          <span aria-hidden="true" />
          Sample data
        </span>
      </div>

      <div className="demo-dashboard-primary">
        <section
          className="demo-position-hero"
          aria-labelledby="demo-allocation-title"
        >
          <div className="demo-position-hero-top">
            <p id="demo-allocation-title">Token allocation</p>
            <span>
              <Check aria-hidden="true" /> Settled
            </span>
          </div>
          <div className="demo-position-amount">
            <strong>{formatWholeUnits(tokenAllocation)}</strong>
            <span>demo tokens</span>
          </div>
          <div className="demo-position-hero-bottom">
            <span>
              Sample bid {bid.bidder} · {status}
            </span>
            <Button type="button" onClick={() => openView("portfolio")}>
              View position <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
          <Image
            className="demo-position-watermark"
            src="/brand/sama-mark.png"
            alt=""
            width={224}
            height={224}
            aria-hidden="true"
          />
        </section>
        <div className="demo-dashboard-side">
          <section
            className="demo-refund-panel"
            aria-labelledby="demo-refund-title"
          >
            <div className="demo-panel-topline">
              <span>Refund</span>
              <span>01 / 02</span>
            </div>
            <h2 id="demo-refund-title">Refundable amount</h2>
            <div className="demo-panel-value">
              <strong>{formatWholeUnits(bid.refund)}</strong>
              <span>demoUSDC</span>
            </div>
            <button type="button" onClick={() => openView("portfolio")}>
              Review refund <ArrowUpRight aria-hidden="true" />
            </button>
          </section>
          <section
            className="demo-round-panel"
            aria-labelledby="demo-round-title"
          >
            <div className="demo-panel-topline">
              <span>Round</span>
              <span>02 / 02</span>
            </div>
            <h2 id="demo-round-title">Settled</h2>
            <p>Cleared at 4.8M FDV</p>
            <button type="button" onClick={() => openView("round")}>
              Review round <ArrowUpRight aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>

      <section className="demo-account-metrics" aria-label="Sample bid summary">
        <div>
          <span>Deposited</span>
          <strong>{formatWholeUnits(bid.deposit)}</strong>
          <small>demoUSDC</small>
        </div>
        <div>
          <span>Accepted</span>
          <strong>{formatWholeUnits(bid.accepted)}</strong>
          <small>demoUSDC</small>
        </div>
        <div>
          <span>Maximum bid</span>
          <strong>{bid.maxFdv}</strong>
          <small>FDV</small>
        </div>
      </section>

      <div className="demo-dashboard-lower">
        <section
          className="demo-activity-panel"
          aria-labelledby="demo-activity-title"
        >
          <div className="demo-panel-heading">
            <div>
              <p className="demo-overline">Sample history</p>
              <h2 id="demo-activity-title">Recent activity</h2>
            </div>
            <button type="button" onClick={() => openView("round")}>
              View ledger <ArrowUpRight aria-hidden="true" />
            </button>
          </div>
          <ol className="demo-activity-list">
            <li>
              <span className="demo-activity-marker" aria-hidden="true" />
              <div>
                <strong>Round settled</strong>
                <span>
                  {formatWholeUnits(bid.accepted)} accepted ·{" "}
                  {formatWholeUnits(bid.refund)} refundable
                </span>
              </div>
            </li>
            <li>
              <span className="demo-activity-marker" aria-hidden="true" />
              <div>
                <strong>Bid revealed</strong>
                <span>Maximum {bid.maxFdv} FDV</span>
              </div>
            </li>
            <li>
              <span className="demo-activity-marker" aria-hidden="true" />
              <div>
                <strong>Deposit recorded</strong>
                <span>{formatWholeUnits(bid.deposit)} demoUSDC</span>
              </div>
            </li>
          </ol>
        </section>
        <section
          className="demo-market-panel"
          aria-labelledby="demo-market-title"
        >
          <div className="demo-panel-heading">
            <div>
              <p className="demo-overline">Sample listing 01</p>
              <h2 id="demo-market-title">Market watch</h2>
            </div>
            <Store aria-hidden="true" />
          </div>
          <div className="demo-market-amount">
            <strong>{formatWholeUnits(listing.remainingTokens)}</strong>
            <span>demo tokens available</span>
          </div>
          <div className="demo-market-meta">
            <span>Full listing price</span>
            <strong>
              {formatSampleUsdc(listing.remainingPriceUsdc)} demoUSDC
            </strong>
          </div>
          <button type="button" onClick={() => openView("market")}>
            Browse listings <ArrowUpRight aria-hidden="true" />
          </button>
        </section>
      </div>
    </div>
  );
}

function SampleView({
  view,
  selectedBidder,
  onSelectBidder,
}: {
  view: Exclude<DemoView, "overview">;
  selectedBidder: SampleBidder;
  onSelectBidder: (bidder: SampleBidder) => void;
}) {
  const copy = viewCopy[view];
  return (
    <div className="demo-transaction-view demo-view-enter">
      <Intro {...copy} />
      {view === "round" && (
        <MockRound
          referenceDesk={<ReferenceRoundDesk initialBidder={selectedBidder} />}
        />
      )}
      {view === "portfolio" && (
        <MockPortfolio
          selectedBidder={selectedBidder}
          onSelectBidder={onSelectBidder}
        />
      )}
      {view === "market" && <MockMarketplace />}
    </div>
  );
}

export function DemoEntry() {
  const [view, setView] = useState<DemoView>("overview");
  const [selectedBidder, setSelectedBidder] = useState<SampleBidder>("B");

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
          <span className="demo-header-title">Workspace</span>
        </div>
        <div className="demo-workspace-header-actions">
          <span className="demo-network-label">Sample data</span>
          <span className="demo-account-pill">
            <UserRound aria-hidden="true" />
            Sample account {selectedBidder}
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
                  <strong>Preview mode</strong>
                  <p>No wallet connected</p>
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
            <span>Sample data</span>
          </div>
          {view === "overview" ? (
            <Overview selectedBidder={selectedBidder} openView={openView} />
          ) : (
            <SampleView
              view={view}
              selectedBidder={selectedBidder}
              onSelectBidder={setSelectedBidder}
            />
          )}
        </div>
      </div>
    </section>
  );
}
