"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import {
  createConfig as createPrivyConfig,
  WagmiProvider as PrivyWagmiProvider,
} from "@privy-io/wagmi";
import { createConfig, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { fallback, http } from "viem";
import { chain, localMode, privyAppId, rpcUrls } from "@/lib/config";

export const usePrivyOnboarding = Boolean(privyAppId) && !localMode;
const transport = () =>
  fallback(rpcUrls.map((url) => http(url, { timeout: 15_000, retryCount: 1 })));
const externalConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: { [chain.id]: transport() },
  ssr: true,
});
const privyConfig = createPrivyConfig({
  chains: [chain],
  transports: { [chain.id]: transport() },
  ssr: true,
});

export default function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 10_000 },
        },
      }),
  );
  if (!usePrivyOnboarding)
    return (
      <WagmiProvider config={externalConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        supportedChains: [chain],
        defaultChain: chain,
        loginMethods: ["email", "google", "apple", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#173f35",
          logo: "/brand/sama-mark.png",
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={privyConfig}>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
