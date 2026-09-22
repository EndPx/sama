import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { MarketplacePanel } from "@/components/marketplace-panel";
import { PageIntro } from "@/components/page-intro";
export const metadata: Metadata = { title: "KIRA testnet marketplace" };
export default function Market() {
  return (
    <section className="page-shell page-section space-y-10">
      <PageIntro
        eyebrow="Secondary demo market"
        title="Escrowed KIRA, exact quotes."
      >
        Eligible wallets can create and fill partial KIRA listings with SAMA
        demoUSDC. The displayed quote uses the current onchain remainder and is
        protected by a maximum cost.
        <Badge variant="outline" className="mt-4">
          Testnet only · demo assets
        </Badge>
      </PageIntro>
      <MarketplacePanel />
    </section>
  );
}
