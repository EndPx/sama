"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const deposits = [
  { bidder: "E", amount: "150K", fdv: "5.4M" },
  { bidder: "D", amount: "200K", fdv: "5.2M" },
  { bidder: "C", amount: "100K", fdv: "5.0M" },
  { bidder: "B", amount: "150K", fdv: "4.8M" },
  { bidder: "A", amount: "100K", fdv: "4.5M" },
];

export function AssemblyStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const section = root.current;
        const approach = section?.previousElementSibling;
        const inner = section?.querySelector<HTMLElement>(
          ".sama-assembly-inner",
        );
        if (!approach?.classList.contains("sama-assembly-approach") || !inner)
          return;
        gsap.fromTo(
          inner,
          { y: 32, opacity: 0.7 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: approach,
              start: "top 85%",
              end: "bottom 15%",
              scrub: 1,
            },
          },
        );
      });
      media.add(
        "(min-width: 1024px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = root.current;
          if (!section) return;
          const blocks = gsap.utils.toArray<HTMLElement>(
            "[data-assembly-brick]",
            section,
          );
          const copied = gsap.utils.toArray<HTMLElement>(
            "[data-assembly-step]",
            section,
          );
          const line = section.querySelector<HTMLElement>(".assembly-line");
          const accepted =
            section.querySelector<HTMLElement>(".assembly-accepted");
          const refunded =
            section.querySelector<HTMLElement>(".assembly-refunded");
          const clearing =
            section.querySelector<HTMLElement>(".assembly-clearing");
          if (!line || !accepted || !refunded || !clearing) return;

          gsap.set(blocks, { y: -85, autoAlpha: 0, rotate: -3 });
          gsap.set([line, accepted, refunded, clearing], { autoAlpha: 0 });
          gsap.set(copied.slice(1), { opacity: 0.34 });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top 88px",
              end: () => `+=${window.innerHeight * 1.6}`,
              pin: true,
              scrub: 1,
              refreshPriority: -1,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(blocks, {
              y: 0,
              autoAlpha: 1,
              rotate: 0,
              stagger: 0.1,
              duration: 0.65,
              ease: "back.out(1.4)",
            })
            .to(copied[0], { opacity: 0.34, duration: 0.16 }, 0.6)
            .to(copied[1], { opacity: 1, duration: 0.16 }, 0.6)
            .fromTo(
              line,
              { scaleX: 0, autoAlpha: 1 },
              { scaleX: 1, autoAlpha: 1, duration: 0.3 },
              0.65,
            )
            .fromTo(
              clearing,
              { y: 30, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.22 },
              0.78,
            )
            .to(copied[1], { opacity: 0.34, duration: 0.15 }, 1)
            .to(copied[2], { opacity: 1, duration: 0.15 }, 1)
            .fromTo(
              [accepted, refunded],
              { y: 44, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.3 },
              1.05,
            )
            .to({}, { duration: 0.25 });
          return () => {
            timeline.kill();
            gsap.set(
              [...blocks, ...copied, line, accepted, refunded, clearing],
              {
                clearProps: "all",
              },
            );
          };
        },
      );
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="sama-assembly"
      aria-labelledby="assembly-title"
    >
      <div className="page-shell sama-assembly-inner">
        <div className="sama-assembly-copy">
          <p className="eyebrow">The reference round / assembled</p>
          <h2 id="assembly-title">
            Every deposit has <em>a destination.</em>
          </h2>
          <p>
            Five fictional bids enter one contract. The published rule, not a
            private allocation decision, determines what is accepted and what
            can be refunded.
          </p>
          <ol className="assembly-steps">
            <li data-assembly-step>
              <span>01 / Commit</span>
              <strong>700,000 demoUSDC enters escrow</strong>
            </li>
            <li data-assembly-step>
              <span>02 / Clear</span>
              <strong>One 4.8M FDV for accepted bids</strong>
            </li>
            <li data-assembly-step>
              <span>03 / Account</span>
              <strong>480,000 accepted + 220,000 refundable</strong>
            </li>
          </ol>
          <Link href="/auction" className="sama-assembly-link">
            Inspect the five bids <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div
          className="assembly-board"
          aria-label="Five deposits totaling 700,000 demoUSDC split into 480,000 accepted and 220,000 refundable at 4.8M FDV"
        >
          <div className="assembly-board-heading">
            <span>SETTLEMENT STUDY / 001</span>
            <span>ARBITRUM SEPOLIA · DEMO</span>
          </div>
          <div className="assembly-deposits" aria-hidden="true">
            {deposits.map((bid) => (
              <div
                className="assembly-brick"
                data-assembly-brick
                key={bid.bidder}
              >
                <span className="assembly-brick-stud" />
                <span className="assembly-brick-id">{bid.bidder}</span>
                <strong>{bid.amount}</strong>
                <small>{bid.fdv} MAX</small>
              </div>
            ))}
          </div>
          <div className="assembly-track" aria-hidden="true">
            <span className="assembly-line" />
            <span className="assembly-clearing">4.8M FDV / ONE PRICE</span>
          </div>
          <div className="assembly-results" aria-hidden="true">
            <div className="assembly-result assembly-accepted">
              <span>ACCEPTED</span>
              <strong>480K</strong>
              <small>demoUSDC</small>
            </div>
            <div className="assembly-result assembly-refunded">
              <span>REFUNDABLE</span>
              <strong>220K</strong>
              <small>demoUSDC</small>
            </div>
          </div>
          <div className="assembly-board-foot">
            <span>700K = 480K + 220K</span>
            <span>NO REAL MONEY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
