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
              <span aria-hidden="true" /> A testnet prototype for public startup
              rounds
            </p>
            <h1 id="home-title">
              Startup funding,
              <br />
              <span>in the open.</span>
            </h1>
            <p className="sama-hero-description">
              SAMA explores a simple idea: a startup shares its story and round
              with the public. People can learn about it, place a test bid, and
              see the result together.
            </p>
            <div className="cluster sama-hero-actions">
              <Button size="lg" className="marketing-button" asChild>
                <Link href="/explore">
                  Meet the demo startup <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <a className="sama-quiet-link" href="#how-sama-works">
                How SAMA works <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="sama-demo-note">
              The startup in the demo is fictional. All bids use valueless test
              tokens on {currentNetwork.name}.
            </p>
          </div>
          <div className="sama-campus-art">
            <RoundPreview />
          </div>
          <article
            className="sama-field-note"
            aria-labelledby="field-note-title"
          >
            <p className="sama-field-note-label">The idea behind SAMA</p>
            <h2 id="field-note-title">
              From startup story
              <br />
              to shared outcome.
            </h2>
            <p>
              A round should be easy to explore before anyone joins. Its result
              should be just as easy to understand. You can try that journey in
              our testnet demo.
            </p>
            <dl className="sama-disclosure">
              <div>
                <dt>Startup</dt>
                <dd>Shares its story and round terms.</dd>
              </div>
              <div>
                <dt>People</dt>
                <dd>Choose how much to put into a test bid.</dd>
              </div>
              <div>
                <dt>Everyone</dt>
                <dd>Sees one result and what can be claimed back.</dd>
              </div>
            </dl>
            <Link href="/auction" className="sama-quiet-link">
              See how a round works{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
      <div className="sama-principles-band">
        <div className="page-shell">
          <span>
            <strong>01</strong> Meet the startup
          </span>
          <span>
            <strong>02</strong> Choose a test bid
          </span>
          <span>
            <strong>03</strong> See the shared result
          </span>
        </div>
      </div>
      <section
        id="how-sama-works"
        className="page-shell sama-editorial-section"
        aria-labelledby="problem-title"
      >
        <div className="sama-section-lead" data-reveal>
          <p className="eyebrow">Why SAMA exists</p>
          <h2 id="problem-title">
            One round. Clear for
            <br />
            both sides.
          </h2>
          <p>
            Startups need a way to reach beyond closed circles. People need to
            know what they are joining. SAMA brings the startup, the terms, and
            the outcome into one place.
          </p>
        </div>
        <div className="sama-principle-grid">
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>For startups</span>
              <Scale aria-hidden="true" />
            </div>
            <h3>
              Bring your story
              <br />
              to more people.
            </h3>
            <p>
              The vision is a public round where a founder can share what they
              are building and invite support on clear terms. Today&apos;s demo
              uses one fictional startup to show how that could work.
            </p>
            <Link href="/founders" className="sama-quiet-link">
              See the founder view <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>For the public</span>
              <ScanLine aria-hidden="true" />
            </div>
            <h3>
              Decide with more
              <br />
              than a headline.
            </h3>
            <p>
              Explore the startup and the round before choosing a test bid. You
              set the amount and the highest company value you would accept.
            </p>
            <Link href="/explore" className="sama-quiet-link">
              Explore the demo startup{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
          <article className="sama-principle" data-reveal>
            <div className="sama-principle-top">
              <span>For everyone</span>
              <ShieldCheck aria-hidden="true" />
            </div>
            <h3>
              See one result,
              <br />
              not a mystery.
            </h3>
            <p>
              Accepted bids use the same final company value. The result shows
              what went into the round and what each person can claim back.
            </p>
            <Link href="/auction" className="sama-quiet-link">
              See an example round <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>
      <section id="price-discovery" className="sama-mechanism-section">
        <div className="page-shell sama-mechanism-grid">
          <div className="stack" data-reveal>
            <p className="eyebrow">Your choice in the round</p>
            <h2>
              Choose your limit.
              <br />
              <em>See what happens.</em>
            </h2>
            <p className="lede">
              You choose how much test currency to put in and the highest
              company value you would accept. When the round ends, the same
              published rules decide everyone&apos;s result.
            </p>
            <ul className="sama-check-list">
              <li>
                <Check aria-hidden="true" />
                One shared company value for accepted bids
              </li>
              <li>
                <Check aria-hidden="true" />A clear answer even when demand
                exceeds the amount offered
              </li>
              <li>
                <Check aria-hidden="true" />
                Unused test currency can be claimed back
              </li>
            </ul>
            <a
              className="sama-quiet-link"
              href="https://sama-3.gitbook.io/sama-product-and-protocol/"
            >
              Read the detailed rules{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="sama-limit-visual" data-reveal>
            <div className="sama-limit-top">
              <LockKeyhole size={20} />
              <span>A bid with your own limit</span>
              <span className="sama-visual-index">S / 01</span>
            </div>
            <div className="sama-limit-rows">
              <div>
                <span>The amount you put in</span>
                <strong>Visible</strong>
              </div>
              <div>
                <span>Your highest acceptable value</span>
                <strong>Hidden until you reveal it</strong>
              </div>
              <div>
                <span>Your result</span>
                <strong>Open to check</strong>
              </div>
            </div>
            <div className="sama-limit-seal">
              <Fingerprint size={48} strokeWidth={1} />
              <p>
                The amount you put in is public.
                <br />
                Your limit is not fully private forever.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="sama-assembly-approach" aria-hidden="true" />
      <AssemblyStory />
      <section id="how-it-works" className="page-shell sama-editorial-section">
        <div className="sama-section-lead" data-reveal>
          <p className="eyebrow">Try the demo</p>
          <h2>
            From first look
            <br />
            to final result.
          </h2>
        </div>
        <ol className="sama-journey">
          <li data-reveal>
            <span className="sama-journey-number">01</span>
            <h3>Explore the startup</h3>
            <p>
              Meet the fictional company, read the round terms, and connect a
              testnet wallet.
            </p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">02</span>
            <h3>Choose a test bid</h3>
            <p>
              Pick an amount and your highest acceptable value. Save the backup
              before confirming.
            </p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">03</span>
            <h3>Reveal your choice</h3>
            <p>Come back during the reveal window so your bid can count.</p>
          </li>
          <li data-reveal>
            <span className="sama-journey-number">04</span>
            <h3>See your result</h3>
            <p>
              Check the shared outcome, then claim any demo tokens or unused
              test currency.
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
              Simulated stakeholder tokens carry no legal or economic rights.
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
