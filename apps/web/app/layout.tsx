import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import "./styles.css";
import { DevTools } from "@/components/dev-tools";
import { currentNetwork } from "@/lib/network-label";

export const metadata: Metadata = {
  title: {
    default: "SAMA — A place for early conviction",
    template: "%s | SAMA",
  },
  description: `Discover a simulated startup offering, set your valuation limit, and follow every allocation on ${currentNetwork.name}. Demo only; no real equity or monetary value.`,
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
        <header className="site-header page-shell">
          <Link href="/" className="wordmark" aria-label="SAMA home">
            <Image src="/brand/sama-mark.png" alt="" width={44} height={44} />
            sama<span className="wordmark-dot">.</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/investors">Investors</Link>
            <Link href="/founders">Founders</Link>
            <Link href="/token-model">Token model</Link>
            <Link href="/auction">Auction</Link>
            <Link href="/docs/getting-started">Start here</Link>
          </nav>
          <Button variant="outline" asChild>
            <Link href="/startups/kirana-ai#participate">
              Open demo <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer page-shell">
          <div className="footer-top">
            <Link href="/" className="wordmark">
              sama.
            </Link>
            <Badge variant="outline">{currentNetwork.badge}</Badge>
            <a className="text-link" href="https://github.com/EndPx/sama">
              Built in the open
            </a>
          </div>
          <nav
            className="footer-links"
            aria-label="Prototype and documentation"
          >
            <Link href="/explore">Explore Kirana AI</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/market/kira">Marketplace</Link>
            <a href="https://sama-3.gitbook.io/sama-product-and-protocol/">
              GitBook docs
            </a>
          </nav>
          <p>
            Kirana AI is fictional. KIRA is a simulated equity-linked demo token
            with no legal or economic rights. demoUSDC has no monetary value. No
            guaranteed returns or liquidity.
          </p>
          <p>
            Made for the next generation of builders. A prototype, not an
            investment offering.
          </p>
        </footer>
      </body>
    </html>
  );
}
