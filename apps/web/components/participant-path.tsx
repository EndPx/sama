"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const decisions = [
  {
    number: "01",
    phase: "Read",
    title: "Understand the offering",
    description:
      "The demo startup is fictional. Its token allocation, company-value range, minimum raise, and deadlines are fixed before anyone bids.",
  },
  {
    number: "02",
    phase: "Commit",
    title: "Set your ceiling",
    description:
      "Deposit demoUSDC and choose the highest company value you would accept. Your deposit is public; your limit stays sealed until reveal. Export the backup before signing.",
  },
  {
    number: "03",
    phase: "Reveal",
    title: "Bring your bid into the calculation",
    description:
      "Return before the reveal deadline. A bid that is never revealed cannot earn demo tokens and becomes fully refundable after the round is finalized or cancelled.",
  },
  {
    number: "04",
    phase: "Claim",
    title: "Check what is yours",
    description:
      "Inspect the round's result, then claim any demo tokens and refund separately. The app waits for a confirmed receipt before reporting success.",
  },
] as const;

function DecisionPicture({
  phase,
}: {
  phase: (typeof decisions)[number]["phase"];
}) {
  if (phase === "Read")
    return (
      <div className="decision-picture decision-read" aria-hidden="true">
        <div className="decision-term-sheet" data-path-piece>
          <span>DEMO STARTUP / FIXED TERMS</span>
          <div>
            <small>Allocation</small>
            <strong>10%</strong>
          </div>
          <div>
            <small>Value range</small>
            <strong>4–6M</strong>
          </div>
          <div>
            <small>Minimum raise</small>
            <strong>400K</strong>
          </div>
        </div>
        <span className="decision-seal" data-path-piece>
          SET BEFORE BIDDING
        </span>
      </div>
    );
  if (phase === "Commit")
    return (
      <div className="decision-picture decision-commit" aria-hidden="true">
        <div className="decision-commit-line" data-path-piece />
        <div className="decision-commit-tile" data-path-piece>
          <small>DEPOSIT</small>
          <strong>PUBLIC</strong>
        </div>
        <div className="decision-commit-vault" data-path-piece>
          <span className="decision-vault-stud" />
          <small>MAX VALUE</small>
          <strong>SEALED</strong>
        </div>
        <span className="decision-backup" data-path-piece>
          PRIVATE BACKUP SAVED
        </span>
      </div>
    );
  if (phase === "Reveal")
    return (
      <div className="decision-picture decision-reveal" aria-hidden="true">
        <div className="decision-reveal-lock" data-path-piece>
          COMMITMENT
          <br />
          HASH
        </div>
        <div className="decision-reveal-route" data-path-piece />
        <div className="decision-reveal-sheet" data-path-piece>
          <small>REVEAL TRANSACTION</small>
          <strong>MAX VALUE</strong>
          <span>+ NONCE / PUBLIC</span>
        </div>
      </div>
    );
  return (
    <div className="decision-picture decision-claim" aria-hidden="true">
      <span className="decision-claim-result" data-path-piece>
        SETTLED RESULT
      </span>
      <div className="decision-claim-stem" data-path-piece />
      <div className="decision-claim-branches">
        <div data-path-piece>
          <small>IF ALLOCATED</small>
          <strong>TOKEN</strong>
        </div>
        <div data-path-piece>
          <small>IF POSITIVE</small>
          <strong>REFUND</strong>
        </div>
      </div>
    </div>
  );
}

export function ParticipantPath() {
  const root = useRef<HTMLOListElement>(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const frames = gsap.utils.toArray<HTMLElement>(
          "[data-path-frame]",
          root.current,
        );
        frames.forEach((frame) => {
          const pieces = gsap.utils.toArray<HTMLElement>(
            "[data-path-piece]",
            frame,
          );
          gsap.from(pieces, {
            y: (index) => (index % 2 === 0 ? 26 : -20),
            x: (index) => (index % 2 === 0 ? -15 : 15),
            rotation: (index) => (index % 2 === 0 ? -2 : 2),
            opacity: 0,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top 85%",
              end: "top 38%",
              scrub: 0.6,
            },
          });
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="participant-path">
      {decisions.map((decision) => (
        <li key={decision.number} className="participant-decision">
          <div className="participant-decision-index">
            <span>{decision.number}</span>
            <small>{decision.phase}</small>
          </div>
          <div data-path-frame>
            <DecisionPicture phase={decision.phase} />
          </div>
          <h3>{decision.title}</h3>
          <p>{decision.description}</p>
        </li>
      ))}
    </ol>
  );
}
