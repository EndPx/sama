import Link from "next/link";
import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "SAMA — Kirana AI",
  description: "Testnet-only simulated startup offering.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header>
          <Link href="/">SAMA</Link>
          <nav>
            <Link href="/explore">Explore</Link>
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/market/kira">KIRA market</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          Testnet only. KIRA is a simulated equity-linked demo token and creates
          no legal or economic right.
        </footer>
      </body>
    </html>
  );
}
