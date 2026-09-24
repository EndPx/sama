"use client";

import React, { useState, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
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

export function MockRound({ referenceDesk }: { referenceDesk: ReactNode }) {
  return (
    <div className="demo-mock-round">
      <section className="demo-offer-brief" aria-label="Reference offer terms">
        <div>
          <p className="demo-overline">Round terms</p>
          <h2>Published terms</h2>
          <span className="demo-round-status">
            <Check aria-hidden="true" /> Settled
          </span>
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

      {referenceDesk}
    </div>
  );
}

export function MockPortfolio({
  selectedBidder,
  onSelectBidder,
}: {
  selectedBidder: (typeof sampleProfiles)[number]["bid"]["bidder"];
  onSelectBidder: (
    bidder: (typeof sampleProfiles)[number]["bid"]["bidder"],
  ) => void;
}) {
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
          <p className="demo-overline">Selected position</p>
          <h2>Sample account {bid.bidder}</h2>
        </div>
        <label className="demo-account-select">
          <span>Switch sample account</span>
          <select
            value={selectedBidder}
            aria-label="Sample account"
            onChange={(event) =>
              onSelectBidder(
                event.target
                  .value as (typeof sampleProfiles)[number]["bid"]["bidder"],
              )
            }
          >
            {sampleProfiles.map((item) => (
              <option key={item.bid.bidder} value={item.bid.bidder}>
                Bid {item.bid.bidder} · {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="demo-portfolio-surface" aria-live="polite">
        <div className="demo-portfolio-topline">
          <span>Sample account / Bid {bid.bidder}</span>
          <span>Settled</span>
        </div>
        <div className="demo-portfolio-feature">
          <div>
            <p className="demo-overline">Token allocation</p>
            <strong>{formatWholeUnits(tokenAllocation)}</strong>
            <p>
              demo tokens · {formatWholeUnits(bid.accepted)} demoUSDC accepted
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
            <span>Refundable</span>
            <strong>{formatWholeUnits(bid.refund)}</strong>
            <small>demoUSDC</small>
          </div>
        </div>
        <div className="demo-portfolio-allocation">
          <div>
            <strong>Deposit breakdown</strong>
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
              ? "Full refund"
              : bid.refund > 0n
                ? "Partial allocation"
                : "Full allocation"}
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
          <p className="demo-overline">Market inventory</p>
          <h2>Listings</h2>
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
          <p className="demo-overline">Listing {listing.id} / Quote</p>
          <h3>Order preview</h3>
          <p>
            {listing.seller} · {formatWholeUnits(listing.remainingTokens)} demo
            tokens available
          </p>
          <div className="demo-quote-rule">
            <span>Full listing price</span>
            <strong>
              {formatSampleUsdc(listing.remainingPriceUsdc)} demoUSDC
            </strong>
          </div>
        </div>
        <div className="demo-quote-calculator">
          <label htmlFor="demo-quote-quantity">Demo tokens</label>
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
            <span>Estimated total</span>
            {quoteError ? (
              <p role="alert">{quoteError}</p>
            ) : (
              <strong>
                {formatSampleUsdc(quote ?? 0n)} <small>demoUSDC</small>
              </strong>
            )}
          </div>
          <p className="demo-quote-disclaimer">
            Sample quote only. No order submitted.
          </p>
        </div>
      </div>
    </section>
  );
}
