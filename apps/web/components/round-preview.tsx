import React from "react";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
} from "../lib/reference-auction";

const maxDeposit = Math.max(...referenceBids.map((bid) => Number(bid.deposit)));

/** The fixed auction spec fixture, displayed as a product surface rather than live demand. */
export function RoundPreview() {
  return (
    <div
      className="round-preview"
      aria-label="Reference round preview with five bids"
    >
      <div className="round-preview-bar">
        <span className="round-preview-brand">
          <span className="round-preview-mark">S</span> sama / round explorer
        </span>
        <span className="round-preview-environment">Simulated round</span>
      </div>
      <div className="round-preview-body">
        <div className="round-preview-heading">
          <div>
            <span className="round-preview-overline">
              Fictional startup · example round
            </span>
            <h2>Five test bids. One outcome.</h2>
          </div>
          <span className="round-preview-chain">Arbitrum Sepolia</span>
        </div>
        <div className="round-preview-metrics">
          <div>
            <span>Company value</span>
            <strong>
              {(Number(referenceAuction.clearingFdv) / 1_000_000).toFixed(1)}M
            </strong>
            <small>used to price the demo round</small>
          </div>
          <div>
            <span>Goes into the round</span>
            <strong>{Number(referenceAuction.acceptedTotal) / 1_000}K</strong>
            <small>
              of {Number(referenceAuction.depositTotal) / 1_000}K in test bids
            </small>
          </div>
          <div>
            <span>Can be claimed back</span>
            <strong>{Number(referenceAuction.refundTotal) / 1_000}K</strong>
            <small>unused test currency</small>
          </div>
        </div>
        <div className="round-preview-ledger">
          <div className="round-preview-ledger-heading">
            <span>Where each bid went</span>
            <span>demoUSDC · thousands</span>
          </div>
          <ol className="round-preview-bids">
            {referenceBids.map((bid) => (
              <li key={bid.bidder}>
                <span className="round-preview-bidder">{bid.bidder}</span>
                <div className="round-preview-track" aria-hidden="true">
                  <span
                    className="round-preview-accepted"
                    style={{
                      width: `${(Number(bid.accepted) / maxDeposit) * 100}%`,
                    }}
                  />
                  <span
                    className="round-preview-refundable"
                    style={{
                      width: `${(Number(bid.refund) / maxDeposit) * 100}%`,
                    }}
                  />
                </div>
                <span className="round-preview-amount">
                  {Number(bid.accepted) / 1_000} / {Number(bid.refund) / 1_000}
                </span>
                <span className="sr-only">
                  {`Bidder ${bid.bidder}: ${formatWholeUnits(bid.deposit)} deposited; ${formatWholeUnits(bid.accepted)} accepted; ${formatWholeUnits(bid.refund)} refundable.`}
                </span>
              </li>
            ))}
          </ol>
          <div className="round-preview-legend" aria-hidden="true">
            <span>
              <i className="round-preview-key-accepted" /> Accepted
            </span>
            <span>
              <i className="round-preview-key-refundable" /> Refundable
            </span>
          </div>
        </div>
      </div>
      <div className="round-preview-foot">
        <span>{formatWholeUnits(referenceAuction.depositTotal)} deposited</span>
        <span>
          {formatWholeUnits(referenceAuction.acceptedTotal)} accepted +{" "}
          {formatWholeUnits(referenceAuction.refundTotal)} refundable
        </span>
      </div>
    </div>
  );
}
