import { describe, expect, it } from "vitest";
import {
  referenceAuction,
  referenceBids,
  referenceKiraEntitlement,
} from "./reference-auction";

describe("public reference auction", () => {
  it("conserves all five deposits and the published 4.8M result", () => {
    expect(referenceAuction.allocationPercent).toBe(10n);
    expect(referenceAuction.fdvFloor).toBe(4_000_000n);
    expect(referenceAuction.fdvCeiling).toBe(6_000_000n);
    expect(referenceAuction.minimumRaise).toBe(400_000n);
    expect(referenceBids.map((bid) => bid.bidder)).toEqual([
      "E",
      "D",
      "C",
      "B",
      "A",
    ]);
    expect(referenceBids.reduce((sum, bid) => sum + bid.deposit, 0n)).toBe(
      referenceAuction.depositTotal,
    );
    expect(referenceBids.reduce((sum, bid) => sum + bid.accepted, 0n)).toBe(
      referenceAuction.acceptedTotal,
    );
    expect(referenceBids.reduce((sum, bid) => sum + bid.refund, 0n)).toBe(
      referenceAuction.refundTotal,
    );
    for (const bid of referenceBids)
      expect(bid.accepted + bid.refund).toBe(bid.deposit);
    expect(
      (referenceAuction.clearingFdv * referenceAuction.allocationPercent) /
        100n,
    ).toBe(referenceAuction.acceptedTotal);
    expect(referenceBids[3]).toMatchObject({
      bidder: "B",
      accepted: 30_000n,
      refund: 120_000n,
    });
    expect(referenceBids[4]).toMatchObject({
      bidder: "A",
      accepted: 0n,
      refund: 100_000n,
    });
  });

  it("derives the token example from accepted capital, not the full deposit", () => {
    const marginalBid = referenceBids[3];
    const losingBid = referenceBids[4];

    expect(referenceKiraEntitlement(marginalBid.accepted)).toBe(62_500n);
    expect(referenceKiraEntitlement(losingBid.accepted)).toBe(0n);
    expect(
      referenceBids.reduce(
        (sum, bid) => sum + referenceKiraEntitlement(bid.accepted),
        0n,
      ),
    ).toBeLessThanOrEqual(referenceAuction.offeredKira);
  });
});
