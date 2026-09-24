import { formatUnits } from "viem";
import { referenceBids } from "./reference-auction";

// Illustrative UI data only. These are not wallet positions or onchain listings.
export const sampleProfiles = [
  { label: "Partial allocation", bid: referenceBids[3] },
  { label: "Full allocation", bid: referenceBids[0] },
  { label: "Full refund", bid: referenceBids[4] },
] as const;

export type SampleListing = {
  id: string;
  seller: string;
  originalTokens: bigint;
  originalPriceUsdc: bigint;
  remainingTokens: bigint;
  remainingPriceUsdc: bigint;
};

// KIRA quantities are displayed as whole demo tokens; prices use six-decimal
// demoUSDC base units. The rows illustrate marketplace mechanics, not supply.
export const sampleListings: readonly SampleListing[] = [
  {
    id: "01",
    seller: "Example holder 01",
    originalTokens: 10_000n,
    originalPriceUsdc: 4_800_000_000n,
    remainingTokens: 7_500n,
    remainingPriceUsdc: 3_600_000_000n,
  },
  {
    id: "02",
    seller: "Example holder 02",
    originalTokens: 6_000n,
    originalPriceUsdc: 3_300_000_000n,
    remainingTokens: 6_000n,
    remainingPriceUsdc: 3_300_000_000n,
  },
  {
    id: "03",
    seller: "Example holder 03",
    originalTokens: 3_000n,
    originalPriceUsdc: 1_200_000_000n,
    remainingTokens: 2_000n,
    remainingPriceUsdc: 800_000_000n,
  },
] as const;

/** Matches MARKETPLACE_SPEC: full fill pays remainder; partial fill rounds up. */
export function quoteSamplePurchase(
  listing: SampleListing,
  purchaseTokens: bigint,
): bigint {
  if (purchaseTokens <= 0n || purchaseTokens > listing.remainingTokens) {
    throw new RangeError("Quantity must be within the available amount.");
  }
  if (purchaseTokens === listing.remainingTokens) {
    return listing.remainingPriceUsdc;
  }
  const numerator = listing.remainingPriceUsdc * purchaseTokens;
  const quote =
    numerator / listing.remainingTokens +
    (numerator % listing.remainingTokens === 0n ? 0n : 1n);
  if (quote >= listing.remainingPriceUsdc) {
    throw new RangeError("This quantity would leave an unpriced remainder.");
  }
  return quote;
}

export function formatSampleUsdc(value: bigint) {
  const [whole, fraction] = formatUnits(value, 6).split(".");
  return `${BigInt(whole).toLocaleString("en-US")}${fraction ? `.${fraction}` : ""}`;
}
