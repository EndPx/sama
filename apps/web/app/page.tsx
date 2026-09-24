import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Fingerprint,
  LockKeyhole,
  Scale,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingMotion } from "@/components/landing-motion";
import { AssemblyStory } from "@/components/assembly-story";
import { RoundPreview } from "@/components/round-preview";
import { currentNetwork } from "@/lib/network-label";
import "./home.css";

export default function Home() {
  return (
    <LandingMotion>
      <section className="sama-campus-hero" aria-labelledby="home-title">
        <div className="sama-campus-stage page-shell">
          <div className="sama-campus-intro">
            <p className="sama-kicker">
              <span aria-hidden="true" /> A transparent startup auction, on
              testnet
            </p>
            <h1 id="home-title">
              A price you
              <br />
              <span>can trace.</span>
            </h1>
            <p className="sama-hero-description">
              Set your valuation ceiling in a sealed bid. Reveal it when the
              window opens. Then see one clearing price and exactly what was
              accepted or returned.
            </p>
            <div className="cluster sama-hero-actions">
              <Button size="lg" className="marketing-button" asChild>
                <Link href="/explore">
                  Explore Kirana AI <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <a className="sama-quiet-link" href="#price-discovery">
                Understand the auction{" "}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="sama-demo-note">
              {currentNetwork.name} prototype · simulated tokens · no real money
            </p>
          </div>
          <div className="sama-campus-art">
            <RoundPreview />
          </div>
          <article
            className="sama-field-note"
            aria-labelledby="field-note-title"
          >
            <p className="sama-field-note-label">
              What stays private—and what does not
            </p>
            <h2 id="field-note-title">
              A sealed limit.
              <br />A public result.
            </h2>
            <p>
              Your deposit is visible from the start. Your maximum valuation
              stays sealed until you reveal it.
            </p>
            <dl className="sama-disclosure">
              <div>
                <dt>Commit</dt>
                <dd>Deposit and commitment are public.</dd>
              </div>
              <div>
                <dt>Reveal</dt>
                <dd>Your maximum FDV becomes public.</dd>
              </div>
              <div>
                <dt>Settle</dt>
                <dd>
                  One price for accepted bids; unused deposits refundable.
                </dd>
              </div>
            </dl>
            <Link href="/auction" className="sama-quiet-link">
              Read the auction rules{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
      <div className="sama-principles-band">
        <div className="page-shell">
          <span>
            <strong>10%</strong> offered allocation
          </span>
          <span>
            <strong>4–6M</strong> demoUSDC FDV limits
          </span>
          <span>
            <strong>64</strong> revealed bids maximum
          </span>
          <span>
            <strong>1</strong> clearing FDV
          </span>
        </div>
      </div>
      <section
        className="page-shell sama-editorial-section"
        aria-labelledby="problem-title"
      >
        <div className="sama-section-lead" data-reveal>
          <p className="eyebrow">How SAMA changes the experience</p>
          <h2 id="problem-title">
            A round you can inspect,
            <br />
            not just join.
          </h2>
          <p>
            The contract, not an offchain allocation desk, decides the result.
            You can follow your deposit from commitment through settlement and
            claim.
          </p>
        </div>
        <div className="sama-principle-grid">
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>Price discovery</span>
              <Scale aria-hidden="true" />
            </div>
            <h3>
              A limit you choose.
              <br />
              One price you share.
            </h3>
            <p>
              Name your maximum FDV before reveal. Every accepted bid settles at
              the same clearing FDV, not at the speed of a click.
            </p>
            <a href="#price-discovery" className="sama-quiet-link">
              See the mechanism <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>Settlement</span>
              <ScanLine aria-hidden="true" />
            </div>
            <h3>
              An allocation
              <br />
              with a paper trail.
            </h3>
            <p>
              The result is derived onchain. Accepted capital, refunds, and
              claims are visible against a published rule set.
            </p>
            <a href="https://github.com/EndPx/sama" className="sama-quiet-link">
              Inspect the code <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>After the round</span>
              <ShieldCheck aria-hidden="true" />
            </div>
            <h3>
              Claim what is yours.
              <br />
              Decide what follows.
            </h3>
            <p>
              Claim KIRA and unused deposits separately. A listing is optional;
              a buyer and liquidity are never guaranteed.
            </p>
            <Link href="/market/kira" className="sama-quiet-link">
              Explore the marketplace{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
      <section id="price-discovery" className="sama-mechanism-section">
        <div className="page-shell sama-mechanism-grid">
          <div className="stack" data-reveal>
            <p className="eyebrow">The bid, explained</p>
            <h2>
              Your ceiling.
              <br />
              <em>Your terms.</em>
            </h2>
            <p className="lede">
              Decide the highest company valuation you are comfortable with.
              Reveal that limit when the window opens. Let a fixed set of rules
              do the rest.
            </p>
            <ul className="sama-check-list">
              <li>
                <Check aria-hidden="true" />
                One clearing valuation for accepted bids
              </li>
              <li>
                <Check aria-hidden="true" />
                Deterministic partial allocation at the margin
              </li>
              <li>
                <Check aria-hidden="true" />
                Pull-based refunds for unused deposits
              </li>
            </ul>
            <a
              className="sama-quiet-link"
              href="https://sama-3.gitbook.io/sama-product-and-protocol/"
            >
              Read the auction specification{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="sama-limit-visual" data-reveal>
            <div className="sama-limit-top">
              <LockKeyhole size={20} />
              <span>Sealed-bid auction</span>
              <span className="sama-visual-index">S / 01</span>
            </div>
            <div className="sama-limit-rows">
              <div>
                <span>Your deposit</span>
                <strong>Public</strong>
              </div>
              <div>
                <span>Your valuation limit</span>
                <strong>Sealed until reveal</strong>
              </div>
              <div>
                <span>Your allocation</span>
                <strong>Verified onchain</strong>
              </div>
            </div>
            <div className="sama-limit-seal">
              <Fingerprint size={48} strokeWidth={1} />
              <p>
                No hidden allocation formula.
                <br />
                No claim of complete bid privacy.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="sama-assembly-approach" aria-hidden="true" />
      <AssemblyStory />
      <section id="how-it-works" className="page-shell sama-editorial-section">
        <div className="sama-section-lead" data-reveal>
          <p className="eyebrow">From intent to evidence</p>
          <h2>
            A journey you can follow.
            <br />A result you can check.
          </h2>
        </div>
        <ol className="sama-journey">
          <li data-reveal>
            <span className="sama-journey-number">01</span>
            <h3>Explore</h3>
            <p>
              Read the terms, understand the risks, and connect your testnet
              wallet.
            </p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">02</span>
            <h3>Commit</h3>
            <p>
              Set your deposit and limit. Save your private reveal backup before
              signing.
            </p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">03</span>
            <h3>Reveal</h3>
            <p>
              Return within the reveal window to make your valuation eligible.
            </p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">04</span>
            <h3>Settle & claim</h3>
            <p>
              Verify the clearing result, then claim eligible tokens and
              refunds.
            </p>
          </li>
        </ol>
      </section>
      <section className="sama-proof-section">
        <div className="page-shell sama-proof-grid">
          <div className="stack" data-reveal>
            <p className="eyebrow">Ambition, with boundaries</p>
            <h2>
              Open by design.
              <br />
              Honest by default.
            </h2>
            <p>
              SAMA is a testnet prototype for transparent startup price
              discovery. Its contracts, accounting tests, and limitations are
              available to inspect.
            </p>
            <p>
              Simulated equity-linked tokens carry no legal or economic rights.
              The protocol has not received an independent audit. There are no
              guaranteed returns or liquidity.
            </p>
            <div className="cluster">
              <Button variant="secondary" className="marketing-button" asChild>
                <a href="https://sama-3.gitbook.io/sama-product-and-protocol/">
                  Read the product & protocol{" "}
                  <ArrowUpRight data-icon="inline-end" />
                </a>
              </Button>
              <a
                className="sama-proof-link"
                href="https://github.com/EndPx/sama"
              >
                View GitHub
              </a>
            </div>
          </div>
          <div className="sama-proof-index" data-reveal>
            <a href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/AUCTION_SPEC.md">
              <span>01 / Published economics</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="https://github.com/EndPx/sama/blob/feat/p0-vertical-slice/docs/THREAT_MODEL.md">
              <span>02 / Explicit trust assumptions</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="https://github.com/EndPx/sama/actions">
              <span>03 / Reproducible verification</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <p>Evidence over adjectives.</p>
          </div>
        </div>
      </section>
    </LandingMotion>
  );
}
