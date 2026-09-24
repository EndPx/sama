import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";

export const metadata: Metadata = {
  title: "Getting started",
  description:
    "Prepare a test wallet, make and reveal a SAMA demo bid, check settlement, and explore a secondary transfer.",
};

export default function GettingStartedPage() {
  return (
    <>
      <EducationHero
        eyebrow="Docs / 05"
        title={
          <>
            Your first visit, <em>step by step.</em>
          </>
        }
        description="This guide takes you from a test wallet to a checked auction result. The public Arbitrum Sepolia deployment is still being prepared; the same journey can be reproduced locally today."
        art={
          <>
            <div className="education-art-kicker">
              <span>The demo route</span>
              <span>S / 05</span>
            </div>
            <div className="education-route-stack" aria-label="Demo stages">
              <span>01 / Prepare</span>
              <span>02 / Commit</span>
              <span>03 / Reveal</span>
              <span>04 / Claim and transfer</span>
            </div>
            <div className="education-art-footer">
              <span>Arbitrum Sepolia</span>
              <span>Testnet only</span>
            </div>
          </>
        }
        primary={{ href: "/explore", label: "Explore the demo" }}
        secondary={{ href: "/auction", label: "Understand the auction" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="getting-steps"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The journey</p>
          <div>
            <h2 id="getting-steps">From setup to a receipt.</h2>
            <p>
              Keep the same wallet, chain, and reveal backup through the round.
              The app should only report success after a confirmed transaction.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Prepare</span>
            <h3>Use a separate test wallet</h3>
            <p>
              Connect to Arbitrum Sepolia (421614) and get test ETH for fees.
              The demo helper can enroll the connected address, and the SAMA
              faucet provides valueless demoUSDC after deployment.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Commit</span>
            <h3>Decide your limit and save it</h3>
            <p>
              Read the demo&apos;s fixed terms. Choose a deposit and maximum FDV from
              4M to 6M, export the private reveal backup, then approve and sign
              the commitment. A bid cannot be edited after it is committed.
            </p>
          </div>
          <div className="education-row">
            <span>03 / Reveal</span>
            <h3>Return before the deadline</h3>
            <p>
              Use the same wallet and backup. Revealing publishes your FDV and
              nonce; an unrevealed bid cannot receive a token allocation. The
              deadline is exclusive, so leave time for transaction inclusion.
            </p>
          </div>
          <div className="education-row">
            <span>04 / Follow through</span>
            <h3>Check, claim, then transfer</h3>
            <p>
              Inspect settlement and claim demo tokens and any refund
              separately. An eligible holder may list tokens; a second eligible
              wallet may buy part or all of it. Each action needs a confirmed
              receipt.
            </p>
          </div>
        </div>
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="getting-ready"
      >
        <div className="education-section-heading">
          <p className="eyebrow">Before signing</p>
          <div>
            <h2 id="getting-ready">A few things to keep close.</h2>
            <p>
              The strongest recovery path is simple: know your network, keep
              your own backup, and check receipts before trying again.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">Your backup</p>
            <h3>Keep reveal material private</h3>
            <p>
              Store the exported file somewhere you control. If browser storage
              is lost, import that file before reveal. Never share its nonce in
              chat or a support form.
            </p>
          </article>
          <article className="education-paper">
            <p className="eyebrow">Your transaction</p>
            <h3>Wait for a confirmed receipt</h3>
            <p>
              Signing and receiving a hash only mean a request was sent. If a
              wallet or RPC reports an uncertain result, inspect the hash before
              signing a replacement.
            </p>
          </article>
        </div>
        <aside className="education-note" aria-label="Public release status">
          <strong>Public release is still being verified.</strong>
          <p>
            The repository has tests, a local lifecycle runner, and frontend
            screens. The public application URL, verified contracts, and full
            two-wallet browser run will appear in the release record when they
            exist.
          </p>
          <a
            className="text-link"
            href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/RELEASE_STATUS.md"
          >
            Check release status
          </a>
        </aside>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="getting-next"
      >
        <div>
          <p className="eyebrow">Next / The worked example</p>
          <h2 id="getting-next">Know what the round should produce.</h2>
          <p>Follow the five deposits, one clearing FDV, and every refund.</p>
        </div>
        <Link href="/auction" className="text-link">
          See the five bids <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
