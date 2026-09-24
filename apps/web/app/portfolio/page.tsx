import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { OfferingPanel } from "@/components/offering-panel";
import { PageIntro } from "@/components/page-intro";
import { WalletWorkspace } from "@/components/wallet/workspace";
import { currentNetwork } from "@/lib/network-label";
export const metadata: Metadata = { title: "Your demo portfolio" };
export default function Portfolio() {
  return (
    <section className="page-shell page-section space-y-10">
      <PageIntro eyebrow="Wallet view" title="Your onchain demo position.">
        <span className="block">
          Connect an eligible {currentNetwork.name} wallet to read bids, claims,
          KIRA balances, and activity confirmed by transaction receipts.
        </span>
        <Badge variant="outline" className="mt-4">
          Unavailable data is never shown as zero
        </Badge>
      </PageIntro>
      <WalletWorkspace>
        <OfferingPanel portfolio />
      </WalletWorkspace>
    </section>
  );
}
