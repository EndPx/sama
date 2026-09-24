"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { referenceBids } from "@/lib/reference-auction";
import {
  AUCTION_CEILING,
  AUCTION_FLOOR,
  DEMO_USDC,
  formatDemoUnits,
  formatFdv,
  simulateAuction,
} from "@/lib/auction-simulator";

const baseline = Object.fromEntries(
  referenceBids.map((bid) => [bid.bidder, Number(bid.deposit)]),
) as Record<string, number>;
const fixedBids = referenceBids.map((bid) => ({
  bidder: bid.bidder,
  maxFdv:
    BigInt(bid.maxFdv.replace(".", "").replace("M", "")) * 100_000n * DEMO_USDC,
}));

function compact(value: bigint) {
  return `${Number(value / DEMO_USDC / 1_000n).toLocaleString("en-US")}K`;
}

export function AuctionLab() {
  const [deposits, setDeposits] = useState(baseline);
  const result = useMemo(
    () =>
      simulateAuction(
        fixedBids.map((bid) => ({
          ...bid,
          deposit: BigInt(deposits[bid.bidder]) * DEMO_USDC,
        })),
      ),
    [deposits],
  );
  const candidates = [...result.candidates].reverse();
  const chartMax = Math.max(
    900_000,
    Math.ceil(Number(result.depositedTotal / DEMO_USDC) / 100_000) * 100_000,
  );
  const x = (fdv: bigint) =>
    68 + (Number((fdv - AUCTION_FLOOR) / DEMO_USDC) / 2_000_000) * 666;
  const y = (amount: bigint) =>
    278 - (Number(amount / DEMO_USDC) / chartMax) * 220;
  const demandPoints = candidates.concat({
    fdv: AUCTION_CEILING,
    demand: 0n,
    required: AUCTION_CEILING / 10n,
  });
  const demandPath = demandPoints.reduce((path, point, index) => {
    if (index === 0) return `M ${x(point.fdv)} ${y(point.demand)}`;
    const previous = demandPoints[index - 1];
    return `${path} L ${x(point.fdv)} ${y(previous.demand)} L ${x(point.fdv)} ${y(point.demand)}`;
  }, "");
  const supplyPath = `M ${x(AUCTION_FLOOR)} ${y(AUCTION_FLOOR / 10n)} L ${x(AUCTION_CEILING)} ${y(AUCTION_CEILING / 10n)}`;
  const maxBar = Math.max(
    ...candidates.map((candidate) =>
      Number(
        (candidate.demand > candidate.required
          ? candidate.demand
          : candidate.required) / DEMO_USDC,
      ),
    ),
    1,
  );

  return (
    <section className="auction-lab" aria-labelledby="auction-lab-title">
      <div className="auction-lab-heading">
        <div>
          <p className="eyebrow">Interactive / price discovery</p>
          <h3 id="auction-lab-title">
            Change a deposit. Watch the result move.
          </h3>
          <p>
            Try a different mix of test bids. The five maximum company values
            stay fixed, so you can see what changing demand alone does.
          </p>
        </div>
        <span className="auction-lab-stamp">
          Browser simulation · no wallet transaction
        </span>
      </div>

      <div className="auction-lab-grid">
        <div className="auction-chart-panel">
          <div className="auction-panel-label">
            <span>01 / The crossing</span>
            <span>demoUSDC</span>
          </div>
          <svg
            viewBox="0 0 800 345"
            role="img"
            aria-labelledby="chart-title chart-description"
            className="auction-chart"
          >
            <title id="chart-title">
              Demand and required funding by company value
            </title>
            <desc id="chart-description">
              {result.successful
                ? `The round clears at ${formatFdv(result.clearingFdv!)} company value, accepting ${formatDemoUnits(result.acceptedTotal)} demoUSDC.`
                : "Demand is below the minimum raise. The round fails and all deposits are refundable."}
            </desc>
            {[0, 0.5, 1].map((tick) => (
              <g key={tick}>
                <line
                  x1="68"
                  x2="734"
                  y1={278 - tick * 220}
                  y2={278 - tick * 220}
                  className="auction-chart-grid"
                />
                <text
                  x="58"
                  y={282 - tick * 220}
                  textAnchor="end"
                  className="auction-chart-tick"
                >
                  {Math.round((chartMax * tick) / 1_000)}K
                </text>
              </g>
            ))}
            {[AUCTION_FLOOR, 5_000_000n * DEMO_USDC, AUCTION_CEILING].map(
              (fdv) => (
                <text
                  key={fdv.toString()}
                  x={x(fdv)}
                  y="306"
                  textAnchor="middle"
                  className="auction-chart-tick"
                >
                  {formatFdv(fdv)}
                </text>
              ),
            )}
            {result.clearingFdv && (
              <>
                <line
                  x1={x(result.clearingFdv)}
                  x2={x(result.clearingFdv)}
                  y1="58"
                  y2="278"
                  className="auction-chart-marker"
                />
                <circle
                  cx={x(result.clearingFdv)}
                  cy={y(result.acceptedTotal)}
                  r="7"
                  className="auction-chart-point"
                />
              </>
            )}
            <path d={demandPath} className="auction-chart-demand" />
            <path d={supplyPath} className="auction-chart-supply" />
            <text
              x="400"
              y="337"
              textAnchor="middle"
              className="auction-chart-axis"
            >
              Maximum company value (FDV)
            </text>
          </svg>
          <div className="auction-chart-legend">
            <span>
              <i className="auction-demand-key" /> Deposits willing at each
              value
            </span>
            <span>
              <i className="auction-supply-key" /> Funding needed for 10%
              allocation
            </span>
          </div>
        </div>
        <aside className="auction-result-panel" aria-live="polite">
          <p className="eyebrow">02 / The outcome</p>
          <strong className="auction-result-value">
            {result.clearingFdv ? formatFdv(result.clearingFdv) : "No clear"}
          </strong>
          <span className="auction-result-caption">
            {result.floorFallback
              ? "Floor-price fallback"
              : result.successful
                ? "Highest value that fills the offer"
                : "Minimum raise not met"}
          </span>
          <div className="auction-result-metrics">
            <div>
              <span>Accepted</span>
              <strong>{compact(result.acceptedTotal)}</strong>
            </div>
            <div>
              <span>Refundable</span>
              <strong>{compact(result.refundTotal)}</strong>
            </div>
          </div>
          <p className="auction-result-explain">
            {result.successful
              ? `${compact(result.depositedTotal)} deposited. The offered 10% is filled at ${formatFdv(result.clearingFdv!)}; unused deposits remain refundable.`
              : `${compact(result.depositedTotal)} deposited, below the 400K minimum at the 4M floor. No demo tokens are allocated.`}
          </p>
          <button
            className="auction-reset"
            type="button"
            onClick={() => setDeposits({ ...baseline })}
          >
            <RotateCcw size={15} aria-hidden="true" /> Reset five bids
          </button>
        </aside>
      </div>

      <div className="auction-control-panel">
        <div className="auction-panel-label">
          <span>03 / Change the test bids</span>
          <span>0 means no bid</span>
        </div>
        <div className="auction-controls">
          {fixedBids.map((bid) => (
            <label key={bid.bidder} className="auction-control">
              <span className="auction-control-top">
                <strong>Bidder {bid.bidder}</strong>
                <span>
                  {deposits[bid.bidder].toLocaleString("en-US")} demoUSDC
                </span>
              </span>
              <input
                type="range"
                min="0"
                max="300000"
                step="10000"
                value={deposits[bid.bidder]}
                onChange={(event) =>
                  setDeposits((current) => ({
                    ...current,
                    [bid.bidder]: Number(event.target.value),
                  }))
                }
                aria-label={`Bidder ${bid.bidder} deposit, maximum FDV ${formatFdv(bid.maxFdv)}`}
              />
              <span className="auction-control-limit">
                Accepts up to {formatFdv(bid.maxFdv)} FDV
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="auction-candidate-panel">
        <div className="auction-panel-label">
          <span>04 / Check each possible price</span>
          <span>Demand vs. required funding</span>
        </div>
        <div className="auction-candidate-key">
          <span>
            <i className="auction-demand-key" /> Willing deposits
          </span>
          <span>
            <i className="auction-supply-key" /> Required for 10%
          </span>
        </div>
        <ol>
          {[...result.candidates].map((candidate) => {
            const chosen = result.clearingFdv === candidate.fdv;
            const enough = candidate.demand >= candidate.required;
            return (
              <li
                key={candidate.fdv.toString()}
                className={chosen ? "is-clearing" : undefined}
              >
                <strong>{formatFdv(candidate.fdv)}</strong>
                <div
                  className="auction-candidate-bars"
                  aria-label={`${compact(candidate.demand)} willing deposits; ${compact(candidate.required)} required`}
                >
                  <span
                    style={{
                      width: `${(Number(candidate.demand / DEMO_USDC) / maxBar) * 100}%`,
                    }}
                    className="auction-candidate-demand"
                  />
                  <span
                    style={{
                      width: `${(Number(candidate.required / DEMO_USDC) / maxBar) * 100}%`,
                    }}
                    className="auction-candidate-supply"
                  />
                </div>
                <span className="auction-candidate-amounts">
                  {compact(candidate.demand)} / {compact(candidate.required)}
                </span>
                <span className="auction-candidate-status">
                  {chosen
                    ? "Clears here"
                    : enough
                      ? "Also fills"
                      : "Not enough"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="auction-lab-footnote">
        This illustration treats every nonzero test bid as revealed and uses the
        demo rules with six-decimal accounting. It does not create, edit, or
        submit a bid.{" "}
        <a href="https://sama-3.gitbook.io/sama-product-and-protocol/">
          Read the auction rules <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </p>
    </section>
  );
}
