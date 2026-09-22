import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Explore the demo" };

export default function Explore() {
  return (
    <section className="page-shell page-section space-y-10">
      <PageIntro
        eyebrow="Testnet catalogue"
        title="One lifecycle, clearly shown."
      >
        Explore the single fictional startup used to demonstrate SAMA&apos;s
        sealed-bid auction on Arbitrum Sepolia.
      </PageIntro>
      <Card className="max-w-3xl">
        <CardHeader className="gap-4">
          <Badge variant="secondary">Fictional startup · simulated token</Badge>
          <CardTitle className="text-2xl">Kirana AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-muted-foreground">
            A focused testnet walkthrough: commit a public demoUSDC deposit,
            reveal a sealed maximum FDV, then follow settlement and claims
            onchain.
          </p>
          <Button asChild>
            <Link href="/startups/kirana-ai">
              Review the auction <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
