"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const WalletProviders = dynamic(() => import("./providers"), {
  ssr: false,
  loading: () => (
    <div role="status" aria-label="Preparing wallet tools" className="stack">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-48 w-full" />
      <span className="sr-only">Preparing wallet tools</span>
    </div>
  ),
});

export function WalletWorkspace({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
