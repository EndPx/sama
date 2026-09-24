"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  formatWholeUnits,
  referenceAuction,
  referenceBids,
} from "@/lib/reference-auction";

const bidNotes: Record<string, string> = {
  E: "Highest limit. Fully accepted at the shared result.",
  D: "Strong conviction. Fully accepted.",
  C: "Still above the clearing line. Fully accepted.",
  B: "At the clearing line. Only the remaining 30,000 fits.",
  A: "Below the clearing line. Full deposit refundable.",
};

export function SettlementTrace() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-trace-bar]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="settlement-trace"
      aria-labelledby="trace-title"
    >
      <div className="settlement-trace-intro">
        <div>
          <p className="eyebrow">A simulated startup round</p>
          <h3 id="trace-title">700,000 in. One shared result.</h3>
        </div>
        <div className="trace-terms">
          <span>
            Simulated allocation <strong>10%</strong>
          </span>
          <span>
            Company value range <strong>4M–6M</strong>
          </span>
          <span>
            Test bidders <strong>5</strong>
          </span>
        </div>
      </div>
      <div className="settlement-trace-legend" aria-hidden="true">
        <span>
          <i className="trace-key-accepted" /> Accepted
        </span>
        <span>
          <i className="trace-key-refund" /> Refundable
        </span>
      </div>
      <ol className="settlement-trace-rows">
        {referenceBids.map((bid) => {
          const accepted = Number((bid.accepted * 100n) / bid.deposit);
          const width = Number((bid.deposit * 100n) / 200_000n);
          return (
            <li
              key={bid.bidder}
              className={bid.bidder === "A" ? "trace-loser" : undefined}
            >
              <div className="trace-label">
                <strong>Bidder {bid.bidder}</strong>
                <span>Up to {bid.maxFdv}</span>
              </div>
              <p className="trace-bid-note">{bidNotes[bid.bidder]}</p>
              <div
                className="trace-bars"
                aria-label={`${formatWholeUnits(bid.deposit)} demoUSDC deposited: ${formatWholeUnits(bid.accepted)} accepted and ${formatWholeUnits(bid.refund)} refundable`}
              >
                <div
                  className="trace-bar"
                  data-trace-bar
                  style={{ width: `${width}%` }}
                >
                  <span
                    className="trace-accepted"
                    style={{ width: `${accepted}%` }}
                  />
                  <span
                    className="trace-refund"
                    style={{ width: `${100 - accepted}%` }}
                  />
                </div>
              </div>
              <strong className="trace-deposit">
                {formatWholeUnits(bid.deposit)}
              </strong>
              <span className="trace-outcome">
                {bid.refund === 0n
                  ? "Fully accepted"
                  : bid.accepted === 0n
                    ? "Full refund"
                    : "Partial fill"}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="settlement-trace-total">
        <div>
          <span>Clearing value</span>
          <strong>4.8M FDV</strong>
        </div>
        <div>
          <span>Accepted into round</span>
          <strong>{formatWholeUnits(referenceAuction.acceptedTotal)}</strong>
        </div>
        <div>
          <span>Available to reclaim</span>
          <strong>{formatWholeUnits(referenceAuction.refundTotal)}</strong>
        </div>
      </div>
      <p className="settlement-trace-note">
        Why 4.8M? At 5.0M, the first three bidders offer 450,000 against 500,000
        needed. At 4.8M, B joins them and demand reaches 600,000 against 480,000
        needed. The first three bids fill completely; B fills the final 30,000.
        A is below the line and gets its whole deposit back.
      </p>
    </section>
  );
}
