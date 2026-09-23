"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { formatWholeUnits, referenceBids } from "@/lib/reference-auction";

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
          <p className="eyebrow">Five-bid settlement / visual ledger</p>
          <h3 id="trace-title">Every bid, accounted for.</h3>
        </div>
        <div className="settlement-trace-legend" aria-hidden="true">
          <span>
            <i className="trace-key-accepted" /> Accepted
          </span>
          <span>
            <i className="trace-key-refund" /> Refundable
          </span>
        </div>
      </div>
      <ol className="settlement-trace-rows">
        {referenceBids.map((bid) => {
          const accepted = Number((bid.accepted * 100n) / bid.deposit);
          const width = Number((bid.deposit * 100n) / 200_000n);
          return (
            <li key={bid.bidder}>
              <div className="trace-label">
                <strong>{bid.bidder}</strong>
                <span>≤ {bid.maxFdv} FDV</span>
              </div>
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
            </li>
          );
        })}
      </ol>
      <div className="settlement-trace-total">
        <span>700,000 in escrow</span>
        <span>480,000 accepted</span>
        <span>220,000 refundable</span>
      </div>
      <p className="settlement-trace-note">
        B is the marginal bid: only 30,000 of its 150,000 deposit is accepted. A
        is below the clearing FDV and receives no KIRA.
      </p>
    </section>
  );
}
