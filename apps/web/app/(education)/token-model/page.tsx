import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EducationHero } from "@/components/education-hero";
import { EducationVisual } from "@/components/education-visual";

export const metadata: Metadata = {
  title: "The KIRA token model",
  description:
    "Understand the capped KIRA demo token, eligible transfers, claim and listing path, and the rights it does not grant.",
};

export default function TokenModelPage() {
  return (
    <>
      <EducationHero
        eyebrow="The token model / 03"
        title={
          <>
            An allocation you can <em>follow.</em>
          </>
        }
        description="KIRA records a claim from Kirana AI's fictional round and lets the demo test transfers after the auction. It is a capped, eligibility-restricted test token, not a legal claim on a company."
        tone="forest"
        art={<EducationVisual kind="token" />}
        primary={{ href: "/auction", label: "See the allocation" }}
        secondary={{ href: "/market/kira", label: "View marketplace" }}
      />

      <section
        className="education-section page-shell"
        aria-labelledby="token-path"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The token&apos;s path</p>
          <div>
            <h2 id="token-path">From the round to another wallet.</h2>
            <p>
              A token claim and a secondary purchase are separate actions. Each
              leaves a record that can be checked against the contract state.
            </p>
          </div>
        </div>
        <div className="education-rows">
          <div className="education-row">
            <span>01 / Settle</span>
            <h3>Record the allocation</h3>
            <p>
              The successful auction sets accepted deposits and each
              winner&apos;s KIRA entitlement. Losing and unrevealed bidders
              receive none.
            </p>
          </div>
          <div className="education-row">
            <span>02 / Claim</span>
            <h3>Move KIRA to the winner</h3>
            <p>
              Winners claim once. The token cap prevents minting above 1,000,000
              KIRA, while the offering records the exact entitlement.
            </p>
          </div>
          <div className="education-row">
            <span>03 / List</span>
            <h3>Escrow an offered amount</h3>
            <p>
              An eligible holder can list KIRA for a total demoUSDC price. The
              marketplace holds the listed amount until a buyer fills it or the
              seller cancels the unsold remainder.
            </p>
          </div>
          <div className="education-row">
            <span>04 / Transfer</span>
            <h3>Settle a partial or full purchase</h3>
            <p>
              A buyer selects a quantity and maximum cost. The contract rounds
              partial-fill costs upward and moves demoUSDC and KIRA atomically.
            </p>
          </div>
        </div>
      </section>

      <section
        className="education-section page-shell"
        aria-labelledby="token-boundary"
      >
        <div className="education-section-heading">
          <p className="eyebrow">The boundary</p>
          <div>
            <h2 id="token-boundary">A test token with explicit limits.</h2>
            <p>
              The fictional terms call the offered supply a simulated 10%
              allocation. There are no additional company tokens or enforceable
              rights behind that label.
            </p>
          </div>
        </div>
        <div className="education-columns">
          <article className="education-paper">
            <p className="eyebrow">What KIRA does</p>
            <h3>Make mechanics inspectable</h3>
            <p>
              KIRA lets the prototype test a capped claim, eligible transfers,
              marketplace escrow, split purchases, and cancellation. Its ledger
              shows units, not a company cap table.
            </p>
          </article>
          <article className="education-paper">
            <p className="eyebrow">What it does not do</p>
            <h3>Create a share or financial right</h3>
            <p>
              KIRA carries no legal equity, dividend, voting power, exit
              proceeds, or guaranteed resale value. Public demo enrollment is
              not identity verification, and the administrator controls roles
              and pauses.
            </p>
          </article>
        </div>
        <aside className="education-note" aria-label="Token control boundary">
          <strong>Controls are visible, but trust still matters.</strong>
          <p>
            The token administrator can change minter roles. The intended
            offering is the only deployed minter, yet role administration is a
            trust assumption. A KIRA pause temporarily blocks transfers,
            including listing cancellation, until unpaused.
          </p>
          <a
            className="text-link"
            href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/THREAT_MODEL.md"
          >
            Read the trust model
          </a>
        </aside>
      </section>

      <section
        className="education-end page-shell"
        aria-labelledby="token-next"
      >
        <div>
          <p className="eyebrow">Next / Try the flow</p>
          <h2 id="token-next">Follow the complete demo path.</h2>
          <p>
            Start with a test wallet and the reveal backup you can keep safe.
          </p>
        </div>
        <Link href="/docs/getting-started" className="text-link">
          Read getting started <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
