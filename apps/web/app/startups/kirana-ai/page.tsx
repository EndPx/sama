import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfferingPanel } from "@/components/offering-panel";
import { PageIntro } from "@/components/page-intro";
import { WalletWorkspace } from "@/components/wallet/workspace";
import { currentNetwork } from "@/lib/network-label";

export const metadata: Metadata = { title: "Kirana AI demo auction" };
const terms = [
  ["Offered allocation", "10%"],
  ["KIRA offered", "1,000,000 KIRA"],
  ["Maximum FDV range", "4,000,000 to 6,000,000 demoUSDC"],
  ["Minimum raise", "400,000 demoUSDC"],
  ["Maximum revealed bids", "64 bids"],
];
export default function Kirana() {
  return (
    <section className="page-shell page-section space-y-10">
      <PageIntro
        eyebrow={`Fictional startup · ${currentNetwork.name}`}
        title="Kirana AI auction demo."
      >
        An auction with sealed maximum FDV bids that settles eligible revealed
        bids at one uniform clearing price. KIRA and demoUSDC are test assets
        with no monetary value.
      </PageIntro>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader className="gap-3">
              <Badge variant="secondary">Fixed demo terms</Badge>
              <CardTitle>A small, reproducible auction</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="terms">
                {terms.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Before you commit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your deposit amount and commitment transaction are public; your
                maximum FDV stays sealed until reveal.
              </p>
              <p>
                Save and export the reveal backup before signing. The backup
                contains a private nonce needed for reveal. Do not share it.
              </p>
              <p>
                Transactions are only shown as confirmed after a successful
                receipt.
              </p>
            </CardContent>
          </Card>
        </div>
        <section
          id="participate"
          aria-label="Participate in the Kirana AI demo auction"
        >
          <WalletWorkspace>
            <OfferingPanel />
          </WalletWorkspace>
        </section>
      </div>
    </section>
  );
}
