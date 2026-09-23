import Image from "next/image";
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
import { currentNetwork } from "@/lib/network-label";
import "./home.css";

export default function Home() {
  return (
    <LandingMotion>
      <section className="sama-campus-hero" aria-labelledby="home-title">
        <div className="sama-campus-stage page-shell">
          <div className="sama-campus-intro">
            <p className="sama-kicker">A testnet auction for startup ideas</p>
            <h1 id="home-title">
              A price you
              <br />
              can trace.
            </h1>
            <p className="sama-hero-description">
              Set the highest valuation you would accept. Reveal it later. Check
              the clearing price and your allocation against the rules.
            </p>
            <div className="cluster">
              <Button size="lg" className="marketing-button" asChild>
                <Link href="/explore">
                  Explore the demo <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <a className="sama-quiet-link" href="#how-it-works">
                How it works <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="sama-demo-note">
              {currentNetwork.name} prototype. No real equity or money.
            </p>
          </div>
          <figure className="sama-campus-art">
            <Image
              src="/brand/sama-campus.png"
              alt="An original miniature shared campus: green pavilions meet around an open courtyard, connected by ivory walkways"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 767px) 100vw, 65vw"
            />
          </figure>
          <article
            className="sama-field-note"
            aria-labelledby="field-note-title"
          >
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
          <span>10% offered allocation</span>
          <span>4–6M demoUSDC FDV limits</span>
          <span>64 revealed bids maximum</span>
          <span>One clearing FDV</span>
        </div>
      </div>
      <section
        className="page-shell sama-editorial-section"
        aria-labelledby="problem-title"
      >
        <div className="sama-section-lead" data-reveal>
          <p className="eyebrow">A clearer beginning</p>
          <h2 id="problem-title">
            Conviction should not
            <br />
            require a leap in the dark.
          </h2>
          <p>
            Early-stage participation raises simple questions. What sets the
            price? How is an allocation decided? What happens to the amount that
            is not accepted?
          </p>
        </div>
        <div className="sama-principle-grid">
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>01</span>
              <Scale aria-hidden="true" />
            </div>
            <h3>
              A price discovered.
              <br />
              Not a race won.
            </h3>
            <p>
              Your maximum valuation defines your limit. Eligible bids settle at
              one valuation, rather than competing on who clicks first.
            </p>
            <a href="#price-discovery" className="sama-quiet-link">
              Understand the mechanism{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>02</span>
              <ScanLine aria-hidden="true" />
            </div>
            <h3>
              An allocation.
              <br />
              With a paper trail.
            </h3>
            <p>
              Deposits, settlement, and claims leave onchain records. The
              calculation can be checked against the published protocol rules.
            </p>
            <a href="https://github.com/EndPx/sama" className="sama-quiet-link">
              Inspect the source <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>03</span>
              <ShieldCheck aria-hidden="true" />
            </div>
            <h3>
              A next step.
              <br />
              Not a promise.
            </h3>
            <p>
              Claim tokens and unused deposits separately. Create a listing if
              you choose. A secondary market never guarantees a buyer.
            </p>
            <Link href="/market/kira" className="sama-quiet-link">
              See the marketplace <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
      <section id="price-discovery" className="sama-mechanism-section">
        <div className="page-shell sama-mechanism-grid">
          <div className="stack" data-reveal>
            <p className="eyebrow">A limit, not a blind commitment</p>
            <h2>
              Your conviction.
              <br />
              <em>Your ceiling.</em>
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
      <section className="page-shell sama-closing-section">
        <div className="stack" data-reveal>
          <p className="eyebrow">A place for early conviction</p>
          <h2>
            Your next step
            <br />
            <em>starts with clarity.</em>
          </h2>
          <p className="lede">
            Explore the prototype. Follow the rules.
            <br />
            Make up your own mind.
          </p>
        </div>
        <div className="sama-closing-action" data-reveal>
          <Button size="lg" className="marketing-button" asChild>
            <Link href="/explore">
              Enter SAMA <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
          <p>Testnet only. No real equity or money.</p>
        </div>
      </section>
    </LandingMotion>
  );
}
