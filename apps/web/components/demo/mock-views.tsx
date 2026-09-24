"use client";

import React, { useState, type ReactNode } from "react";
import { ArrowUpRight, Check, Info } from "lucide-react";
import {
  formatSampleUsdc,
  quoteSamplePurchase,
  sampleListings,
  sampleProfiles,
} from "@/lib/mock-workspace";
import {
  formatWholeUnits,
  referenceAuction,
  referenceKiraEntitlement,
} from "@/lib/reference-auction";

const roundPhases = [
  {
    number: "01",
    name: "Commit",
    title: "Five people chose their limits.",
    description:
      "The example bidders deposited 700,000 demoUSDC in total. Each maximum company value stayed sealed until reveal; deposit amounts were public.",
    metric: "700,000",
    metricLabel: "example deposits",
  },
  {
    number: "02",
    name: "Reveal",
    title: "Every example bid was revealed.",
    description:
      "Five maximum values became available for settlement, ranging from 4.5M to 5.4M. The contract excludes bids that are not revealed.",
    metric: "5 of 5",
    metricLabel: "example bids revealed",
  },
  {
    number: "03",
    name: "Clear",
    title: "One value made the round work.",
    description:
      "At 4.8M company value, the offered 10% costs 480,000 demoUSDC. Higher bids pay this same value, while the marginal bid is only partly accepted.",
    metric: "4.8M",
    metricLabel: "clearing company value",
  },
  {
    number: "04",
    name: "Outcome",
    title: "Every deposit has an outcome.",
    description:
      "The example accepts 480,000 demoUSDC and leaves 220,000 refundable. Token allocations and refunds belong to the respective example bids, not to this browser.",
    metric: "220,000",
    metricLabel: "example refunds",
  },
] as const;

export function MockRound({ referenceDesk }: { referenceDesk: ReactNode }) {
  const [phaseIndex, setPhaseIndex] = useState(2);
  const phase = roundPhases[phaseIndex];

  return (
    <div className="demo-mock-round">
      <section className="demo-offer-brief" aria-label="Reference offer terms">
        <div>
          <p className="demo-overline">Published example</p>
          <h2>One offer. One set of rules.</h2>
          <p>
            A fictional round, using the exact numbers in the published auction
            specification.
          </p>
        </div>
        <dl>
          <div>
            <dt>Company allocation</dt>
            <dd>{referenceAuction.allocationPercent.toString()}%</dd>
          </div>
          <div>
            <dt>Company value range</dt>
            <dd>
              {Number(referenceAuction.fdvFloor) / 1_000_000}M to{" "}
              {Number(referenceAuction.fdvCeiling) / 1_000_000}M
            </dd>
          </div>
          <div>
            <dt>Minimum for success</dt>
            <dd>{formatWholeUnits(referenceAuction.minimumRaise)}</dd>
          </div>
        </dl>
      </section>

      <section
        className="demo-round-story"
        aria-labelledby="demo-round-story-title"
      >
        <div className="demo-round-story-top">
          <div>
            <p className="demo-overline">Example round / settled</p>
            <h2 id="demo-round-story-title">
              Four moments. One shared result.
            </h2>
          </div>
          <span className="demo-round-status">
            <Check aria-hidden="true" /> Settled in the example
          </span>
        </div>
        <div
          className="demo-round-phase-list"
          aria-label="Explore round phases"
        >
          {roundPhases.map((item, index) => (
            <button
              key={item.number}
              type="button"
              aria-label={`Step ${item.number}: ${item.name}`}
              aria-pressed={phaseIndex === index}
              onClick={() => setPhaseIndex(index)}
            >
              <span>{item.number}</span>
              {item.name}
            </button>
          ))}
        </div>
        <div className="demo-round-phase-detail" aria-live="polite">
          <div>
            <p className="demo-overline">
              {phase.number} / {phase.name}
            </p>
            <h3>{phase.title}</h3>
            <p>{phase.description}</p>
          </div>
          <div className="demo-round-phase-metric">
            <strong>{phase.metric}</strong>
            <span>{phase.metricLabel}</span>
          </div>
        </div>
      </section>

      {referenceDesk}
    </div>
  );
}

export function MockPortfolio() {
  const [selectedBidder, setSelectedBidder] =
    useState<(typeof sampleProfiles)[number]["bid"]["bidder"]>("B");
  const profile =
    sampleProfiles.find(({ bid }) => bid.bidder === selectedBidder) ??
    sampleProfiles[0];
  const { bid } = profile;
  const tokenAllocation = referenceKiraEntitlement(bid.accepted);
  const acceptedPercent = (Number(bid.accepted) / Number(bid.deposit)) * 100;

  return (
    <section className="demo-sample-portfolio" aria-label="Sample portfolio">
      <div className="demo-sample-section-head">
        <div>
          <p className="demo-overline">Illustrative portfolio</p>
          <h2>Three example outcomes.</h2>
          <p>
            Compare a full allocation, a partial allocation, and a full refund.
            These are not wallet balances.
          </p>
        </div>
        <span className="demo-example-tag">Based on the five bid fixture</span>
      </div>

      <div
        className="demo-profile-switcher"
        aria-label="Example bidder profiles"
      >
        {sampleProfiles.map((item) => (
          <button
            key={item.bid.bidder}
            type="button"
            aria-pressed={selectedBidder === item.bid.bidder}
            onClick={() => setSelectedBidder(item.bid.bidder)}
          >
            <span className="demo-profile-monogram">{item.bid.bidder}</span>
            <span>
              <strong>Bid {item.bid.bidder}</strong>
              <small>{item.label}</small>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="demo-portfolio-surface" aria-live="polite">
        <div className="demo-portfolio-topline">
          <span>Example profile / Bid {bid.bidder}</span>
          <span>Settled in sample</span>
        </div>
        <div className="demo-portfolio-feature">
          <div>
            <p className="demo-overline">Illustrative token allocation</p>
            <strong>{formatWholeUnits(tokenAllocation)}</strong>
            <p>
              demo tokens from {formatWholeUnits(bid.accepted)} accepted
              demoUSDC at the shared 4.8M value.
            </p>
          </div>
          <span className="demo-portfolio-watermark" aria-hidden="true">
            {bid.bidder}
          </span>
        </div>
        <div className="demo-portfolio-metrics">
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
            <span>Refund in example</span>
            <strong>{formatWholeUnits(bid.refund)}</strong>
            <small>demoUSDC</small>
          </div>
        </div>
        <div className="demo-portfolio-allocation">
          <div>
            <strong>Where this deposit went</strong>
            <span>Accepted + refund = {formatWholeUnits(bid.deposit)}</span>
          </div>
          <div
            className="demo-portfolio-track"
            role="progressbar"
            aria-label="Portion accepted in the example"
            aria-valuenow={acceptedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${acceptedPercent}%` }} />
          </div>
          <p>
            {bid.accepted === 0n
              ? "This example bid is below the clearing value, so its full deposit is refundable."
              : bid.refund > 0n
                ? "Only part of this example bid is accepted. The unused deposit is refundable."
                : "This example bid is fully accepted at the same clearing value as every winner."}
          </p>
        </div>
      </div>
    </section>
  );
}

export function MockMarketplace() {
  const [selectedId, setSelectedId] = useState(sampleListings[0].id);
  const [quantity, setQuantity] = useState("500");
  const listing =
    sampleListings.find((item) => item.id === selectedId) ?? sampleListings[0];
  let quote: bigint | undefined;
  let quoteError: string | undefined;
  if (!/^[1-9]\d{0,11}$/.test(quantity)) {
    quoteError = "Enter a whole token quantity greater than zero.";
  } else {
    try {
      quote = quoteSamplePurchase(listing, BigInt(quantity));
    } catch (error) {
      quoteError =
        error instanceof RangeError ? error.message : "Quote unavailable.";
    }
  }

  return (
    <section className="demo-sample-market" aria-label="Sample marketplace">
      <div className="demo-sample-section-head">
        <div>
          <p className="demo-overline">Illustrative marketplace</p>
          <h2>What would this amount cost?</h2>
          <p>
            Choose a sample listing, then change the quantity. The calculator
            previews a quote without creating an order.
          </p>
        </div>
        <span className="demo-example-tag">No live listings</span>
      </div>

      <div className="demo-listing-grid" aria-label="Illustrative listings">
        {sampleListings.map((item) => {
          const sold = item.originalTokens - item.remainingTokens;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedId === item.id}
              onClick={() => {
                setSelectedId(item.id);
                setQuantity("500");
              }}
            >
              <span className="demo-listing-topline">
                <span>Listing {item.id}</span>
                <span>{sold > 0n ? "Partly filled" : "Available"}</span>
              </span>
              <strong>{formatWholeUnits(item.remainingTokens)}</strong>
              <span className="demo-listing-unit">demo tokens remaining</span>
              <span className="demo-listing-bottomline">
                <span>
                  {formatSampleUsdc(
                    quoteSamplePurchase(item, item.remainingTokens),
                  )}{" "}
                  demoUSDC
                </span>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="demo-quote-surface">
        <div className="demo-quote-copy">
          <p className="demo-overline">Quote preview / Listing {listing.id}</p>
          <h3>Choose an amount.</h3>
          <p>
            {listing.seller} has {formatWholeUnits(listing.remainingTokens)}{" "}
            demo tokens remaining in this example. A full purchase costs{" "}
            {formatSampleUsdc(listing.remainingPriceUsdc)} demoUSDC.
          </p>
          <div className="demo-quote-rule">
            <Info aria-hidden="true" />
            <span>
              Partial quotes round up to the nearest demoUSDC base unit. The
              last fill pays the exact remaining price.
            </span>
          </div>
        </div>
        <div className="demo-quote-calculator">
          <label htmlFor="demo-quote-quantity">Demo tokens to preview</label>
          <div className="demo-quote-input-wrap">
            <input
              id="demo-quote-quantity"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={quantity}
              aria-invalid={Boolean(quoteError)}
              aria-describedby="demo-quote-feedback"
              onChange={(event) => setQuantity(event.target.value)}
            />
            <span>tokens</span>
          </div>
          <div className="demo-quote-presets">
            <button type="button" onClick={() => setQuantity("500")}>
              500
            </button>
            <button
              type="button"
              onClick={() => setQuantity(String(listing.remainingTokens / 2n))}
            >
              Half
            </button>
            <button
              type="button"
              onClick={() => setQuantity(String(listing.remainingTokens))}
            >
              All remaining
            </button>
          </div>
          <div
            className="demo-quote-result"
            id="demo-quote-feedback"
            aria-live="polite"
          >
            <span>Illustrative cost</span>
            {quoteError ? (
              <p role="alert">{quoteError}</p>
            ) : (
              <strong>
                {formatSampleUsdc(quote ?? 0n)} <small>demoUSDC</small>
              </strong>
            )}
          </div>
          <p className="demo-quote-disclaimer">
            Preview only. No wallet action, order, or listing change occurs.
          </p>
        </div>
      </div>
    </section>
  );
}
