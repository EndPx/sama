"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const steps = [
  {
    id: "settle",
    number: "01",
    tab: "Round settles",
    title: "The result comes first.",
    description:
      "The auction records how much of each bid counts and how much can be claimed back. A winner's KIRA amount is calculated here, but no KIRA is minted yet.",
    from: "Revealed bids",
    to: "Claimable allocation",
    receipt: "One clearing value for every accepted bid",
    mark: "✓",
  },
  {
    id: "claim",
    number: "02",
    tab: "Winner claims",
    title: "A winner claims KIRA once.",
    description:
      "After a successful settlement, a winner claims the amount earned by their accepted bid. The offering mints KIRA to that wallet within the fixed token cap.",
    from: "Claimable allocation",
    to: "Eligible wallet",
    receipt: "Claim recorded onchain; no second claim",
    mark: "K",
  },
  {
    id: "list",
    number: "03",
    tab: "Holder lists",
    title: "A listing puts KIRA in escrow.",
    description:
      "An eligible holder chooses an amount and total test-currency price. The marketplace holds that KIRA until buyers purchase it or the seller cancels the unsold part.",
    from: "Holder wallet",
    to: "Marketplace escrow",
    receipt: "Unsold KIRA remains accounted for",
    mark: "K",
  },
  {
    id: "buy",
    number: "04",
    tab: "Buyer receives",
    title: "A purchase moves both sides together.",
    description:
      "An eligible buyer selects an amount and a maximum cost. The contract sends the exact test-currency cost to the seller and the purchased KIRA to the buyer in one transaction.",
    from: "Marketplace escrow",
    to: "Eligible buyer",
    receipt: "Partial fills leave a priced remainder",
    mark: "K",
  },
] as const;

export function TokenJourney() {
  return (
    <section
      className="token-journey page-shell"
      aria-labelledby="token-journey-title"
    >
      <div className="token-section-head">
        <div>
          <h2 id="token-journey-title">Follow one token through the demo.</h2>
          <p>
            The round determines who can claim KIRA. A separate marketplace lets
            eligible wallets transfer it later. Choose a step to see where the
            record—or the token—moves.
          </p>
        </div>
        <span className="token-section-index" aria-hidden="true">
          01 / 04
        </span>
      </div>

      <Tabs defaultValue="settle" className="token-tabs">
        <TabsList className="token-step-list" aria-label="KIRA journey">
          {steps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="token-step-trigger"
            >
              <span className="token-step-number">{step.number}</span>
              <span>{step.tab}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id} className="token-stage">
            <div className="token-stage-copy">
              <span className="token-stage-count">
                Step {step.number} of 04
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <div
              className="token-transfer"
              aria-label={`${step.from} to ${step.to}`}
            >
              <div className="token-transfer-topline">
                <span>SAMA / KIRA route</span>
                <span>{step.number} — 04</span>
              </div>
              <div className="token-transfer-nodes">
                <div className="token-transfer-node">
                  <span className="token-node-symbol">S</span>
                  <span className="token-node-caption">From</span>
                  <strong>{step.from}</strong>
                </div>
                <div className="token-transfer-rail" aria-hidden="true">
                  <span className="token-transfer-marker">{step.mark}</span>
                </div>
                <div className="token-transfer-node token-transfer-node-end">
                  <span className="token-node-symbol">K</span>
                  <span className="token-node-caption">To</span>
                  <strong>{step.to}</strong>
                </div>
              </div>
              <div className="token-transfer-receipt">
                <span>Recorded outcome</span>
                <strong>{step.receipt}</strong>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
