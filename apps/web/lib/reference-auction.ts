// Whole demoUSDC units from docs/AUCTION_SPEC.md, for explanation only.
export const referenceBids = [
  {
    bidder: "E",
    deposit: 150_000n,
    maxFdv: "5.4M",
    accepted: 150_000n,
    refund: 0n,
  },
  {
    bidder: "D",
    deposit: 200_000n,
    maxFdv: "5.2M",
    accepted: 200_000n,
    refund: 0n,
  },
  {
    bidder: "C",
    deposit: 100_000n,
    maxFdv: "5.0M",
    accepted: 100_000n,
    refund: 0n,
  },
  {
    bidder: "B",
    deposit: 150_000n,
    maxFdv: "4.8M",
    accepted: 30_000n,
    refund: 120_000n,
  },
  {
    bidder: "A",
    deposit: 100_000n,
    maxFdv: "4.5M",
    accepted: 0n,
    refund: 100_000n,
  },
] as const;

export const referenceAuction = {
  offeredKira: 1_000_000n,
  allocationPercent: 10n,
  fdvFloor: 4_000_000n,
  fdvCeiling: 6_000_000n,
  minimumRaise: 400_000n,
  clearingFdv: 4_800_000n,
  depositTotal: 700_000n,
  acceptedTotal: 480_000n,
  refundTotal: 220_000n,
} as const;

export function formatWholeUnits(value: bigint) {
  return value.toLocaleString("en-US");
}

// Mirrors KiranaOffering.tokenEntitlementOf for the published demo fixture.
export function referenceKiraEntitlement(accepted: bigint) {
  if (accepted === 0n) return 0n;
  return (
    (accepted * referenceAuction.offeredKira) / referenceAuction.acceptedTotal
  );
}
