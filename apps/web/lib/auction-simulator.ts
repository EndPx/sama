// Browser-only mirror of the published five-bid auction. Amounts use demoUSDC base units.
export const DEMO_USDC = 1_000_000n;
export const AUCTION_FLOOR = 4_000_000n * DEMO_USDC;
export const AUCTION_CEILING = 6_000_000n * DEMO_USDC;
export const MINIMUM_RAISE = 400_000n * DEMO_USDC;
const ALLOCATION_BPS = 1_000n;
const BPS = 10_000n;

export type SimBid = {
  bidder: string;
  deposit: bigint;
  maxFdv: bigint;
};

export type Candidate = {
  fdv: bigint;
  demand: bigint;
  required: bigint;
};

export type SimResult = {
  successful: boolean;
  floorFallback: boolean;
  clearingFdv: bigint | null;
  acceptedTotal: bigint;
  refundTotal: bigint;
  depositedTotal: bigint;
  candidates: Candidate[];
  bids: (SimBid & { accepted: bigint; refund: bigint })[];
};

export function simulateAuction(input: SimBid[]): SimResult {
  const bids = input
    .filter((bid) => bid.deposit > 0n)
    .sort((a, b) =>
      a.maxFdv === b.maxFdv
        ? a.bidder.localeCompare(b.bidder)
        : a.maxFdv > b.maxFdv
          ? -1
          : 1,
    );
  const depositedTotal = bids.reduce((sum, bid) => sum + bid.deposit, 0n);
  const bidTiers = [...new Set(bids.map((bid) => bid.maxFdv.toString()))]
    .map(BigInt)
    .filter((fdv) => fdv >= AUCTION_FLOOR && fdv <= AUCTION_CEILING);
  const tiers = [...bidTiers];
  if (!tiers.includes(AUCTION_FLOOR)) tiers.push(AUCTION_FLOOR);
  tiers.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
  const candidates = tiers.map((fdv) => ({
    fdv,
    demand: bids.reduce(
      (sum, bid) => sum + (bid.maxFdv >= fdv ? bid.deposit : 0n),
      0n,
    ),
    required: (fdv * ALLOCATION_BPS) / BPS,
  }));
  const clearing = candidates.find(
    (candidate) =>
      bidTiers.includes(candidate.fdv) &&
      candidate.demand >= candidate.required,
  );
  const successful = Boolean(clearing) || depositedTotal >= MINIMUM_RAISE;
  const clearingFdv = successful ? (clearing?.fdv ?? AUCTION_FLOOR) : null;
  const floorFallback = successful && !clearing;
  if (!successful || clearingFdv === null) {
    return {
      successful: false,
      floorFallback: false,
      clearingFdv: null,
      acceptedTotal: 0n,
      refundTotal: depositedTotal,
      depositedTotal,
      candidates,
      bids: bids.map((bid) => ({ ...bid, accepted: 0n, refund: bid.deposit })),
    };
  }
  const capacity = (clearingFdv * ALLOCATION_BPS) / BPS;
  const above = floorFallback
    ? 0n
    : bids.reduce(
        (sum, bid) => sum + (bid.maxFdv > clearingFdv ? bid.deposit : 0n),
        0n,
      );
  const atTier = bids.reduce(
    (sum, bid) =>
      sum + (floorFallback || bid.maxFdv === clearingFdv ? bid.deposit : 0n),
    0n,
  );
  const remaining = capacity - above;
  const accounted = bids.map((bid) => {
    const accepted =
      !floorFallback && bid.maxFdv > clearingFdv
        ? bid.deposit
        : floorFallback || bid.maxFdv === clearingFdv
          ? (bid.deposit * remaining) / atTier
          : 0n;
    return { ...bid, accepted, refund: bid.deposit - accepted };
  });
  let allocated = accounted.reduce((sum, bid) => sum + bid.accepted, 0n);
  let dust = capacity - allocated;
  for (const bid of accounted) {
    if (dust === 0n) break;
    if ((floorFallback || bid.maxFdv === clearingFdv) && bid.refund > 0n) {
      bid.accepted += 1n;
      bid.refund -= 1n;
      allocated += 1n;
      dust -= 1n;
    }
  }
  return {
    successful: true,
    floorFallback,
    clearingFdv,
    acceptedTotal: allocated,
    refundTotal: depositedTotal - allocated,
    depositedTotal,
    candidates,
    bids: accounted,
  };
}

export function formatDemoUnits(value: bigint) {
  const whole = value / DEMO_USDC;
  const fractional = value % DEMO_USDC;
  return fractional === 0n
    ? whole.toLocaleString("en-US")
    : `${whole.toLocaleString("en-US")}.${fractional.toString().padStart(6, "0").replace(/0+$/, "")}`;
}

export function formatFdv(value: bigint) {
  return `${Number(value / DEMO_USDC / 100_000n) / 10}M`;
}
