import { describe, expect, it } from "vitest";
import { referenceAuction, referenceBids } from "./reference-auction";
import {
  AUCTION_FLOOR,
  DEMO_USDC,
  formatDemoUnits,
  simulateAuction,
} from "./auction-simulator";

const fixture = referenceBids.map((bid) => ({
  bidder: bid.bidder,
  deposit: bid.deposit * DEMO_USDC,
  maxFdv:
    BigInt(bid.maxFdv.replace(".", "").replace("M", "")) * 100_000n * DEMO_USDC,
}));

describe("browser-only auction simulator", () => {
  it("matches the published five-bid result and every bidder allocation", () => {
    const result = simulateAuction(fixture);
    expect(result.successful).toBe(true);
    expect(result.clearingFdv).toBe(referenceAuction.clearingFdv * DEMO_USDC);
    expect(result.acceptedTotal).toBe(
      referenceAuction.acceptedTotal * DEMO_USDC,
    );
    expect(result.refundTotal).toBe(referenceAuction.refundTotal * DEMO_USDC);
    for (const [index, bid] of result.bids.entries()) {
      expect(bid.accepted).toBe(referenceBids[index].accepted * DEMO_USDC);
      expect(bid.refund).toBe(referenceBids[index].refund * DEMO_USDC);
    }
  });

  it("falls back to the 4M floor and shares its capacity", () => {
    const result = simulateAuction([
      {
        bidder: "A",
        deposit: 450_000n * DEMO_USDC,
        maxFdv: 6_000_000n * DEMO_USDC,
      },
    ]);
    expect(result.floorFallback).toBe(true);
    expect(result.clearingFdv).toBe(AUCTION_FLOOR);
    expect(result.acceptedTotal).toBe(400_000n * DEMO_USDC);
    expect(result.refundTotal).toBe(50_000n * DEMO_USDC);
  });

  it("refunds every deposit if floor demand misses the minimum", () => {
    const result = simulateAuction(
      fixture.map((bid) => ({ ...bid, deposit: 20_000n * DEMO_USDC })),
    );
    expect(result.successful).toBe(false);
    expect(result.clearingFdv).toBeNull();
    expect(result.acceptedTotal).toBe(0n);
    expect(result.refundTotal).toBe(100_000n * DEMO_USDC);
    expect(result.bids.every((bid) => bid.refund === bid.deposit)).toBe(true);
  });

  it("assigns base-unit dust in deterministic tier order", () => {
    const result = simulateAuction([
      {
        bidder: "A",
        deposit: 479_999_999_999n,
        maxFdv: 5_000_000n * DEMO_USDC,
      },
      { bidder: "B", deposit: 1n, maxFdv: 4_800_000n * DEMO_USDC },
      { bidder: "C", deposit: 1n, maxFdv: 4_800_000n * DEMO_USDC },
    ]);
    expect(result.acceptedTotal).toBe(480_000n * DEMO_USDC);
    expect(result.bids.find((bid) => bid.bidder === "B")?.accepted).toBe(1n);
    expect(result.bids.find((bid) => bid.bidder === "C")?.accepted).toBe(0n);
    expect(
      result.bids.reduce((sum, bid) => sum + bid.accepted + bid.refund, 0n),
    ).toBe(result.depositedTotal);
    expect(formatDemoUnits(1n)).toBe("0.000001");
  });

  it("distinguishes a genuine floor-tier clear from floor fallback", () => {
    const result = simulateAuction([
      {
        bidder: "A",
        deposit: 400_000n * DEMO_USDC,
        maxFdv: AUCTION_FLOOR,
      },
    ]);
    expect(result.successful).toBe(true);
    expect(result.floorFallback).toBe(false);
    expect(result.acceptedTotal).toBe(400_000n * DEMO_USDC);
  });

  it("conserves every slider-sized bid across a varied demand sweep", () => {
    for (let seed = 0; seed < 100; seed++) {
      const bids = fixture.map((bid, index) => ({
        ...bid,
        deposit: BigInt(((seed * 37 + index * 53) % 31) * 10_000) * DEMO_USDC,
      }));
      const result = simulateAuction(bids);
      expect(result.acceptedTotal + result.refundTotal).toBe(
        result.depositedTotal,
      );
      expect(
        result.bids.every((bid) => bid.accepted + bid.refund === bid.deposit),
      ).toBe(true);
      if (result.successful) {
        expect(result.acceptedTotal).toBe(result.clearingFdv! / 10n);
      } else {
        expect(result.acceptedTotal).toBe(0n);
      }
    }
  });
});
