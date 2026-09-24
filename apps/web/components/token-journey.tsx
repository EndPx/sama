import * as React from "react";

const steps = [
  {
    number: "01",
    moment: "The round ends",
    title: "First, everyone gets the same result.",
    description:
      "The round decides which bids count. Accepted test currency goes toward the round; unused deposits can be claimed back. Token amounts are calculated for winners, but no tokens have moved yet.",
    from: "Bids",
    to: "One result",
    detail: "Allocation and refund are recorded separately",
  },
  {
    number: "02",
    moment: "A winner claims",
    title: "Then the token enters a wallet.",
    description:
      "A winner claims once. The offering creates only the tokens earned by that accepted bid, within the cap of one million tokens. An eligible wallet receives them.",
    from: "Claimable tokens",
    to: "Winner's wallet",
    detail: "Nothing is minted before the claim",
  },
  {
    number: "03",
    moment: "A holder lists",
    title: "A listing puts tokens aside.",
    description:
      "An eligible holder sets an amount and a total demoUSDC price. The marketplace holds those tokens while the listing is open. The holder can cancel and recover any unsold amount.",
    from: "Holder's wallet",
    to: "Marketplace escrow",
    detail: "Unsold tokens remain accounted for",
  },
  {
    number: "04",
    moment: "A buyer purchases",
    title: "The exchange happens together.",
    description:
      "An eligible buyer chooses how much to buy and approves a maximum cost. In one transaction, the seller receives the exact demoUSDC price and the buyer receives the purchased tokens.",
    from: "Marketplace escrow",
    to: "Buyer's wallet",
    detail: "A partial sale leaves a priced remainder",
  },
] as const;

export function TokenJourney() {
  return (
    <section className="token-journey" aria-labelledby="token-journey-title">
      <div className="token-journey-intro">
        <span className="token-kicker">The complete path</span>
        <h2 id="token-journey-title">From a round result to another wallet.</h2>
        <p>
          The token does not appear all at once. Follow the record, the claim,
          and the token itself through four distinct moments.
        </p>
      </div>
      <ol className="token-path">
        {steps.map((step) => (
          <li
            className={`token-path-step token-path-step-${step.number}`}
            key={step.number}
          >
            <span className="token-path-marker" aria-hidden="true">
              {step.number}
            </span>
            <div className="token-path-copy">
              <span className="token-path-moment">{step.moment}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <div
              className="token-path-picture"
              aria-label={`${step.from} to ${step.to}`}
            >
              <div className="token-path-picture-top">
                <span>SAMA / TOKEN PATH</span>
                <span>{step.number} / 04</span>
              </div>
              <div className="token-path-objects" aria-hidden="true">
                <span className="token-path-object token-path-object-from" />
                <span className="token-path-line" />
                <span className="token-path-object token-path-object-to" />
              </div>
              <div className="token-path-labels">
                <strong>{step.from}</strong>
                <strong>{step.to}</strong>
              </div>
              <span className="token-path-detail">{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
