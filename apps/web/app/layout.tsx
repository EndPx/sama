import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "SAMA — Kirana AI", description: "Testnet-only simulated startup offering." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header><a href="/">SAMA</a><nav><a href="/explore">Explore</a><a href="/portfolio">Portfolio</a><a href="/market/kira">KIRA market</a></nav></header><main>{children}</main><footer>Testnet only. KIRA is a simulated equity-linked demo token and creates no legal or economic right.</footer></body></html>; }
