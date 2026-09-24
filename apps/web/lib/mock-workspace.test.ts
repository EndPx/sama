import { describe, expect, it } from "vitest";
import {
  formatSampleUsdc,
  quoteSamplePurchase,
  sampleListings,
  sampleProfiles,
  type SampleListing,
} from "./mock-workspace";
import {
  referenceAuction,
  referenceKiraEntitlement,
} from "./reference-auction";

describe("mock-only workspace data", () => {
  it("uses exact published bid outcomes for the example profiles", () => {
    expect(sampleProfiles.map(({ bid }) => bid.bidder)).toEqual([
      "B",
      "E",
      "A",
    ]);
    for (const { bid } of sampleProfiles) {
      expect(bid.accepted + bid.refund).toBe(bid.deposit);
      expect(referenceKiraEntitlement(bid.accepted)).toBeLessThanOrEqual(
        referenceAuction.offeredKira,
      );
    }
    expect(referenceKiraEntitlement(sampleProfiles[0].bid.accepted)).toBe(
      62_500n,
    );
    expect(referenceKiraEntitlement(sampleProfiles[1].bid.accepted)).toBe(
      312_500n,
    );
    expect(referenceKiraEntitlement(sampleProfiles[2].bid.accepted)).toBe(0n);
  });

  it("keeps illustrative listing remainders and prices bounded", () => {
    for (const listing of sampleListings) {
      expect(listing.remainingTokens).toBeGreaterThan(0n);
      expect(listing.remainingTokens).toBeLessThanOrEqual(
        listing.originalTokens,
      );
      expect(listing.remainingPriceUsdc).toBeGreaterThan(0n);
      expect(listing.remainingPriceUsdc).toBeLessThanOrEqual(
        listing.originalPriceUsdc,
      );
      expect(quoteSamplePurchase(listing, listing.remainingTokens)).toBe(
        listing.remainingPriceUsdc,
      );
      const previouslySold = listing.originalTokens - listing.remainingTokens;
      if (previouslySold > 0n) {
        expect(
          quoteSamplePurchase(
            {
              ...listing,
              remainingTokens: listing.originalTokens,
              remainingPriceUsdc: listing.originalPriceUsdc,
            },
            previouslySold,
          ),
        ).toBe(listing.originalPriceUsdc - listing.remainingPriceUsdc);
      }
    }
  });

  it("conserves the listing price across partial fills and the final fill", () => {
    const original = sampleListings[0];
    const firstCost = quoteSamplePurchase(original, 1_000n);
    const afterFirst = {
      ...original,
      remainingTokens: original.remainingTokens - 1_000n,
      remainingPriceUsdc: original.remainingPriceUsdc - firstCost,
    };
    const secondCost = quoteSamplePurchase(afterFirst, 500n);
    const afterSecond = {
      ...afterFirst,
      remainingTokens: afterFirst.remainingTokens - 500n,
      remainingPriceUsdc: afterFirst.remainingPriceUsdc - secondCost,
    };
    const finalCost = quoteSamplePurchase(
      afterSecond,
      afterSecond.remainingTokens,
    );

    expect(firstCost + secondCost + finalCost).toBe(
      original.remainingPriceUsdc,
    );
    expect(1_000n + 500n + afterSecond.remainingTokens).toBe(
      original.remainingTokens,
    );
  });

  it("uses exact ceiling quotes and rejects an unpriced remainder", () => {
    const microListing: SampleListing = {
      id: "micro",
      seller: "Example",
      originalTokens: 3n,
      originalPriceUsdc: 2n,
      remainingTokens: 3n,
      remainingPriceUsdc: 2n,
    };
    expect(quoteSamplePurchase(microListing, 1n)).toBe(1n);
    expect(() =>
      quoteSamplePurchase(
        { ...microListing, remainingTokens: 2n, remainingPriceUsdc: 1n },
        1n,
      ),
    ).toThrow(/unpriced remainder/i);
    expect(quoteSamplePurchase(microListing, 3n)).toBe(2n);
    expect(() => quoteSamplePurchase(microListing, 0n)).toThrow(/quantity/i);
    expect(() => quoteSamplePurchase(microListing, 4n)).toThrow(/quantity/i);
  });

  it("formats six-decimal test currency without rounding away micro units", () => {
    expect(formatSampleUsdc(3_600_000_000n)).toBe("3,600");
    expect(formatSampleUsdc(1n)).toBe("0.000001");
  });
});
