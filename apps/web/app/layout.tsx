import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import "./styles.css";
import { DevTools } from "@/components/dev-tools";
import { HeaderScrollFrame } from "@/components/header-scroll-frame";
import { currentNetwork } from "@/lib/network-label";

export const metadata: Metadata = {
  title: {
    default: "SAMA | Startup funding, in the open",
    template: "%s | SAMA",
  },
  description: `Explore a public startup round, place a test bid, and see one shared result on ${currentNetwork.name}. Demo only; no real equity or monetary value.`,
  icons: { icon: "/brand/sama-mark.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" && <DevTools />}
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <HeaderScrollFrame>
          <div className="site-header-inner">
            <Link href="/" className="wordmark" aria-label="SAMA home">
              <Image src="/brand/sama-mark.png" alt="" width={44} height={44} />
              sama<span className="wordmark-dot">.</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/investors">Investors</Link>
              <Link href="/founders">Founders</Link>
              <Link href="/stakeholder-tokens">Stakeholder Tokens</Link>
              <Link href="/auction">Auction</Link>
            </nav>
            <div className="site-header-actions">
              <a
                className="site-header-docs"
                href="https://sama-3.gitbook.io/sama-product-and-protocol/"
              >
                Docs
              </a>
              <Button variant="outline" asChild>
                <Link href="/demo">
                  Open demo <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </HeaderScrollFrame>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="footer-stage">
            <div className="footer-stage-inner page-shell">
              <div className="footer-story">
                <p className="footer-kicker">A clearer way to raise together</p>
                <h2>
                  The next round
                  <br />
                  starts <em>in the open.</em>
                </h2>
                <p className="footer-description">
                  A startup shares its plan. People choose whether to take part.
                  Everyone can see how the round ends. Explore that idea in a
                  working testnet demo.
                </p>
                <div className="footer-actions">
                  <Button asChild className="footer-primary-action">
                    <Link href="/explore">
                      Explore the demo <ArrowUpRight data-icon="inline-end" />
                    </Link>
                  </Button>
                  <a
                    className="footer-secondary-action"
                    href="https://sama-3.gitbook.io/sama-product-and-protocol/"
                  >
                    Read the docs <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="footer-art" aria-hidden="true">
                <span className="footer-art-orbit" />
                <Image
                  src="/brand/sama-confluence-footer.png"
                  alt=""
                  width={1254}
                  height={1254}
                  sizes="(max-width: 767px) 90vw, 46vw"
                />
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-inner page-shell">
              <div className="footer-bottom-main">
                <Link href="/" className="wordmark" aria-label="SAMA home">
                  <Image
                    src="/brand/sama-mark.png"
                    alt=""
                    width={32}
                    height={32}
                  />
                  sama<span className="wordmark-dot">.</span>
                </Link>
                <nav className="footer-links" aria-label="Footer navigation">
                  <Link href="/investors">Investors</Link>
                  <Link href="/founders">Founders</Link>
                  <Link href="/auction">Auction</Link>
                  <Link href="/portfolio">Portfolio</Link>
                  <Link href="/market/kira">Marketplace</Link>
                  <a href="https://github.com/EndPx/sama">GitHub</a>
                </nav>
                <Badge variant="outline">{currentNetwork.badge}</Badge>
              </div>
              <p className="footer-disclaimer">
                Testnet demonstration only. The featured startup is fictional;
                the demo token is simulated, not a legal share or claim to
                returns. demoUSDC has no monetary value.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
