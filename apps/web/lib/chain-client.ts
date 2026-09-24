import {
  createPublicClient,
  fallback,
  http,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import {
  currencyAbi,
  offeringAbi,
  registryAbi,
  kiraAbi,
  marketplaceAbi,
} from "@sama/chain/abi";
import { chain, contracts, rpcUrls } from "./config";

export const publicClient = createPublicClient({
  chain,
  transport: fallback(
    rpcUrls.map((url) =>
      http(url, { batch: true, timeout: 15_000, retryCount: 1 }),
    ),
  ),
});

type BidResult = readonly [
  Hex,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  boolean,
  boolean,
];
type ListingResult = readonly [Address, bigint, bigint, bigint, bigint, number];
export type ReadResult = {
  currentPhase: number;
  commitStart: bigint;
  commitEnd: bigint;
  revealEnd: bigint;
  totalCommitted: bigint;
  acceptedTotal: bigint;
  clearingFdv: bigint;
  paused: boolean;
  bids: BidResult;
  isEligible: boolean;
  balanceOf: bigint;
  allowance: bigint;
  refundable: bigint;
  nextClaimAt: bigint;
  revealedBidders: Address;
  nextListingId: bigint;
  outstandingKiraEscrow: bigint;
  listings: ListingResult;
};
export type ReadFunction = keyof ReadResult;
type ReadTargetFor<Name extends ReadFunction> = Name extends "isEligible"
  ? "registry"
  : Name extends "allowance" | "nextClaimAt"
    ? "currency"
    : Name extends "nextListingId" | "outstandingKiraEscrow" | "listings"
      ? "marketplace"
      : Name extends "balanceOf"
        ? "currency" | "kira"
        : Name extends "paused"
          ? "offering" | "kira" | "marketplace"
          : "offering";
type ReadArgs = {
  currentPhase: readonly [];
  commitStart: readonly [];
  commitEnd: readonly [];
  revealEnd: readonly [];
  totalCommitted: readonly [];
  acceptedTotal: readonly [];
  clearingFdv: readonly [];
  paused: readonly [];
  bids: readonly [Address];
  isEligible: readonly [Address];
  balanceOf: readonly [Address];
  allowance: readonly [Address, Address];
  refundable: readonly [Address];
  nextClaimAt: readonly [Address];
  revealedBidders: readonly [bigint];
  nextListingId: readonly [];
  outstandingKiraEscrow: readonly [];
  listings: readonly [bigint];
};
type ReadRequest<Name extends ReadFunction> = {
  target: ReadTargetFor<Name>;
  functionName: Name;
  args?: ReadArgs[Name];
  blockNumber?: bigint;
};

/** Narrow, decoded read port so tests never need an RPC or untyped contract values. */
export type ReadPort = {
  getBlock: (parameters?: {
    blockNumber?: bigint;
  }) => Promise<{ number: bigint; timestamp: bigint }>;
  getBalance: (parameters: {
    address: Address;
    blockNumber?: bigint;
  }) => Promise<bigint>;
  readContract: <Name extends ReadFunction>(
    parameters: ReadRequest<Name>,
  ) => Promise<ReadResult[Name]>;
};

const decodedRead = async <Name extends ReadFunction>(
  request: ReadRequest<Name>,
): Promise<ReadResult[Name]> => {
  const { target, functionName, args, blockNumber } = request;
  if (target === "offering") {
    if (functionName === "bids")
      return publicClient.readContract({
        address: contracts.offering!,
        abi: offeringAbi,
        functionName: "bids",
        args: args as readonly [Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "refundable")
      return publicClient.readContract({
        address: contracts.offering!,
        abi: offeringAbi,
        functionName: "refundable",
        args: args as readonly [Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "revealedBidders")
      return publicClient.readContract({
        address: contracts.offering!,
        abi: offeringAbi,
        functionName: "revealedBidders",
        args: args as readonly [bigint],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (
      functionName === "currentPhase" ||
      functionName === "commitStart" ||
      functionName === "commitEnd" ||
      functionName === "revealEnd" ||
      functionName === "totalCommitted" ||
      functionName === "acceptedTotal" ||
      functionName === "clearingFdv" ||
      functionName === "paused"
    )
      return publicClient.readContract({
        address: contracts.offering!,
        abi: offeringAbi,
        functionName,
        blockNumber,
      }) as Promise<ReadResult[Name]>;
  }
  if (target === "registry" && functionName === "isEligible")
    return publicClient.readContract({
      address: contracts.registry!,
      abi: registryAbi,
      functionName: "isEligible",
      args: args as readonly [Address],
      blockNumber,
    }) as Promise<ReadResult[Name]>;
  if (target === "currency") {
    if (functionName === "balanceOf")
      return publicClient.readContract({
        address: contracts.currency!,
        abi: currencyAbi,
        functionName: "balanceOf",
        args: args as readonly [Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "allowance")
      return publicClient.readContract({
        address: contracts.currency!,
        abi: currencyAbi,
        functionName: "allowance",
        args: args as readonly [Address, Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "nextClaimAt")
      return publicClient.readContract({
        address: contracts.currency!,
        abi: currencyAbi,
        functionName: "nextClaimAt",
        args: args as readonly [Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
  }
  if (target === "kira") {
    if (functionName === "balanceOf")
      return publicClient.readContract({
        address: contracts.kira!,
        abi: kiraAbi,
        functionName: "balanceOf",
        args: args as readonly [Address],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "paused")
      return publicClient.readContract({
        address: contracts.kira!,
        abi: kiraAbi,
        functionName: "paused",
        blockNumber,
      }) as Promise<ReadResult[Name]>;
  }
  if (target === "marketplace") {
    if (
      functionName === "nextListingId" ||
      functionName === "outstandingKiraEscrow" ||
      functionName === "paused"
    )
      return publicClient.readContract({
        address: contracts.marketplace!,
        abi: marketplaceAbi,
        functionName,
        blockNumber,
      }) as Promise<ReadResult[Name]>;
    if (functionName === "listings")
      return publicClient.readContract({
        address: contracts.marketplace!,
        abi: marketplaceAbi,
        functionName: "listings",
        args: args as readonly [bigint],
        blockNumber,
      }) as Promise<ReadResult[Name]>;
  }
  throw new Error("Invalid contract read request.");
};
const defaultReadPort: ReadPort = {
  getBlock: (parameters) => publicClient.getBlock(parameters),
  getBalance: (parameters) => publicClient.getBalance(parameters),
  readContract: decodedRead,
};
const snapshot = async (client: ReadPort) => client.getBlock();
const at = (blockNumber: bigint) => ({ blockNumber });

export async function readOffering(
  account?: Address,
  client: ReadPort = defaultReadPort,
) {
  if (
    !contracts.offering ||
    !contracts.registry ||
    !contracts.currency ||
    !contracts.kira
  )
    throw new Error("This deployment is not configured yet.");
  const wallet = account || zeroAddress;
  const block = await snapshot(client);
  const readAt = at(block.number);
  const [
    phase,
    commitStart,
    commitEnd,
    revealEnd,
    totalCommitted,
    acceptedTotal,
    clearingFdv,
    paused,
    bid,
    eligible,
    currencyBalance,
    kiraBalance,
    allowance,
    refund,
    tokenPaused,
    nextClaimAt,
    ethBalance,
  ] = await Promise.all([
    client.readContract({
      target: "offering",
      functionName: "currentPhase",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "commitStart",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "commitEnd",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "revealEnd",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "totalCommitted",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "acceptedTotal",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "clearingFdv",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "paused",
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "bids",
      args: [wallet],
      ...readAt,
    }),
    client.readContract({
      target: "registry",
      functionName: "isEligible",
      args: [wallet],
      ...readAt,
    }),
    client.readContract({
      target: "currency",
      functionName: "balanceOf",
      args: [wallet],
      ...readAt,
    }),
    client.readContract({
      target: "kira",
      functionName: "balanceOf",
      args: [wallet],
      ...readAt,
    }),
    client.readContract({
      target: "currency",
      functionName: "allowance",
      args: [wallet, contracts.offering],
      ...readAt,
    }),
    client.readContract({
      target: "offering",
      functionName: "refundable",
      args: [wallet],
      ...readAt,
    }),
    client.readContract({ target: "kira", functionName: "paused", ...readAt }),
    client.readContract({
      target: "currency",
      functionName: "nextClaimAt",
      args: [wallet],
      ...readAt,
    }),
    client.getBalance({ address: wallet, ...readAt }),
  ]);
  return {
    block: block.number,
    timestamp: block.timestamp,
    phase,
    commitStart,
    commitEnd,
    revealEnd,
    totalCommitted,
    acceptedTotal,
    clearingFdv,
    paused,
    tokenPaused,
    eligible,
    currencyBalance,
    kiraBalance,
    ethBalance,
    allowance,
    nextClaimAt,
    bid: {
      commitment: bid[0],
      amount: bid[1],
      maxFdv: bid[2],
      accepted: bid[3],
      refund: bid[4],
      revealed: bid[5],
      tokenClaimed: bid[6],
      refundClaimed: bid[7],
    },
    refund: phase === 5 && !bid[7] ? bid[1] : refund,
    allocation:
      acceptedTotal > 0n
        ? (bid[3] * 1_000_000n * 10n ** 18n) / acceptedTotal
        : 0n,
  };
}
export type OfferingState = Awaited<ReturnType<typeof readOffering>>;

export function isArrayBoundsPanic(error: unknown): boolean {
  const panic = "0x4e487b71" + "0".repeat(62) + "32";
  const seen = new Set<unknown>();
  const visit = (value: unknown): boolean => {
    if (typeof value === "string") return value.toLowerCase() === panic;
    if (!value || typeof value !== "object" || seen.has(value)) return false;
    seen.add(value);
    return Object.values(value as Record<string, unknown>).some(visit);
  };
  return visit(error);
}

export async function orderedReveals(
  client: ReadPort = defaultReadPort,
): Promise<Address[]> {
  if (!contracts.offering) throw new Error("Offering is not configured.");
  const block = await snapshot(client);
  const readAt = at(block.number);
  const bidders: { address: Address; fdv: bigint }[] = [];
  // Fixed 64-bid protocol bound. Failed index reads terminate only on the Solidity bounds panic.
  for (let i = 0; i < 64; i++) {
    let bidder: Address;
    try {
      bidder = await client.readContract({
        target: "offering",
        functionName: "revealedBidders",
        args: [BigInt(i)],
        ...readAt,
      });
    } catch (error) {
      if (isArrayBoundsPanic(error)) break;
      throw error;
    }
    const bid = await client.readContract({
      target: "offering",
      functionName: "bids",
      args: [bidder],
      ...readAt,
    });
    bidders.push({ address: bidder, fdv: bid[2] });
  }
  bidders.sort((a, b) =>
    a.fdv === b.fdv
      ? BigInt(a.address) < BigInt(b.address)
        ? -1
        : 1
      : a.fdv > b.fdv
        ? -1
        : 1,
  );
  return bidders.map((b) => b.address);
}

export async function readMarket(
  beforeId?: bigint,
  client: ReadPort = defaultReadPort,
) {
  if (!contracts.marketplace) throw new Error("Marketplace is not configured.");
  if (beforeId !== undefined && beforeId < 1n)
    throw new Error("Listing cursor must be positive.");
  const block = await snapshot(client);
  const readAt = at(block.number);
  const [count, paused, escrow] = await Promise.all([
    client.readContract({
      target: "marketplace",
      functionName: "nextListingId",
      ...readAt,
    }),
    client.readContract({
      target: "marketplace",
      functionName: "paused",
      ...readAt,
    }),
    client.readContract({
      target: "marketplace",
      functionName: "outstandingKiraEscrow",
      ...readAt,
    }),
  ]);
  const end =
    beforeId === undefined
      ? count
      : beforeId - 1n < count
        ? beforeId - 1n
        : count;
  const start = end > 50n ? end - 49n : 1n;
  const ids: bigint[] = [];
  for (let id = start; id <= end; id++) ids.push(id);
  const listings = await Promise.all(
    ids.map(async (id) => {
      const l = await client.readContract({
        target: "marketplace",
        functionName: "listings",
        args: [id],
        ...readAt,
      });
      return {
        id,
        seller: l[0],
        originalAmount: l[1],
        originalPrice: l[2],
        remainingAmount: l[3],
        remainingPrice: l[4],
        status: l[5],
      };
    }),
  );
  return {
    block: block.number,
    count,
    paused,
    escrow,
    listings: listings.reverse(),
    nextBeforeId: start > 1n ? start : undefined,
  };
}
export type Listing = Awaited<
  ReturnType<typeof readMarket>
>["listings"][number];
