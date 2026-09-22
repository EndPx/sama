import { describe, expect, it, vi } from "vitest";

vi.mock("./config", () => ({
  chain: {
    id: 421_614,
    name: "test",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["http://invalid"] } },
  },
  rpcUrls: ["http://invalid"],
  contracts: {
    offering: "0x00000000000000000000000000000000000000a1",
    marketplace: "0x00000000000000000000000000000000000000a2",
    registry: "0x00000000000000000000000000000000000000a3",
    currency: "0x00000000000000000000000000000000000000a4",
    kira: "0x00000000000000000000000000000000000000a5",
  },
}));

import {
  isArrayBoundsPanic,
  orderedReveals,
  readMarket,
  type ReadPort,
} from "./chain-client";

const panic32 = `0x4e487b71${"0".repeat(62)}32`;
const address = (n: number) =>
  `0x${n.toString(16).padStart(40, "0")}` as `0x${string}`;

function marketPort(count: bigint): ReadPort {
  return {
    getBlock: vi.fn(async () => ({ number: 123n, timestamp: 456n })),
    getBalance: vi.fn(async () => 0n),
    readContract: vi.fn(
      async ({
        functionName,
        args,
      }: {
        functionName: string;
        args?: readonly unknown[];
      }) => {
        if (functionName === "nextListingId") return count;
        if (functionName === "paused") return false;
        if (functionName === "outstandingKiraEscrow") return 99n;
        if (functionName === "listings") {
          const id = (args as readonly bigint[])[0];
          return [address(Number(id)), id, id * 2n, id, id * 2n, 1];
        }
        throw new Error(`unexpected ${String(functionName)}`);
      },
    ) as ReadPort["readContract"],
  };
}

describe("chain reads", () => {
  it("paginates backward from the latest 50 listings at one block", async () => {
    const port = marketPort(120n);
    const newest = await readMarket(undefined, port);
    expect(newest.listings.map((listing) => listing.id)).toEqual([
      120n,
      119n,
      118n,
      117n,
      116n,
      115n,
      114n,
      113n,
      112n,
      111n,
      110n,
      109n,
      108n,
      107n,
      106n,
      105n,
      104n,
      103n,
      102n,
      101n,
      100n,
      99n,
      98n,
      97n,
      96n,
      95n,
      94n,
      93n,
      92n,
      91n,
      90n,
      89n,
      88n,
      87n,
      86n,
      85n,
      84n,
      83n,
      82n,
      81n,
      80n,
      79n,
      78n,
      77n,
      76n,
      75n,
      74n,
      73n,
      72n,
      71n,
    ]);
    expect(newest.nextBeforeId).toBe(71n);
    const older = await readMarket(newest.nextBeforeId, port);
    expect(older.listings[0].id).toBe(70n);
    expect(older.listings.at(-1)?.id).toBe(21n);
    for (const call of (port.readContract as ReturnType<typeof vi.fn>).mock
      .calls)
      expect(call[0].blockNumber).toBe(123n);
  });

  it("does not reinterpret arbitrary RPC text as an array bounds panic", async () => {
    expect(isArrayBoundsPanic({ data: panic32 })).toBe(true);
    expect(isArrayBoundsPanic(new Error("index out of bounds 0x32"))).toBe(
      false,
    );
    const port: ReadPort = {
      getBlock: async () => ({ number: 1n, timestamp: 1n }),
      getBalance: async () => 0n,
      readContract: async () => {
        throw new Error("RPC index out of bounds");
      },
    };
    await expect(orderedReveals(port)).rejects.toThrow(
      "RPC index out of bounds",
    );
  });

  it("stops only on the ABI panic and retains valid revealed bidders", async () => {
    const first = address(1);
    const port: ReadPort = {
      getBlock: async () => ({ number: 9n, timestamp: 9n }),
      getBalance: async () => 0n,
      readContract: (async ({
        functionName,
        args,
      }: {
        functionName: string;
        args?: readonly unknown[];
      }) => {
        if (
          functionName === "revealedBidders" &&
          (args as readonly bigint[])[0] === 0n
        )
          return first;
        if (functionName === "revealedBidders") throw { data: panic32 };
        if (functionName === "bids")
          return ["0x", 1n, 4_000_000_000_000n, 0n, 0n, true, false, false];
        throw new Error("unexpected");
      }) as ReadPort["readContract"],
    };
    await expect(orderedReveals(port)).resolves.toEqual([first]);
  });
});
