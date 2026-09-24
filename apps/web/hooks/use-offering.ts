"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { readOffering } from "../lib/chain-client";
import { chain, configured, contracts } from "../lib/config";

/** Includes every deployment identity so cached state cannot cross deployments. */
export function offeringQueryKey(account?: string) {
  return [
    "offering",
    chain.id,
    contracts.currency ?? null,
    contracts.registry ?? null,
    contracts.kira ?? null,
    contracts.offering ?? null,
    contracts.marketplace ?? null,
    contracts.demoAccess ?? null,
    account ?? null,
  ] as const;
}

/** Live offering state. Errors are exposed by React Query; no stale fallback is fabricated. */
export function useOffering() {
  const { address } = useAccount();
  return useQuery({
    queryKey: offeringQueryKey(address),
    queryFn: () => readOffering(address),
    enabled: configured,
    refetchInterval: 15_000,
  });
}
