import type { Metadata } from "next";
import { DemoEntry } from "@/components/demo/demo-entry";
import { WalletWorkspace } from "@/components/wallet/workspace";
import "./demo.css";

export const metadata: Metadata = {
  title: "Open the SAMA demo",
  description:
    "Sign in to explore the SAMA testnet round, your demo portfolio, and the marketplace.",
};

export default function DemoPage() {
  return (
    <div className="demo-entry">
      <WalletWorkspace>
        <DemoEntry />
      </WalletWorkspace>
    </div>
  );
}
