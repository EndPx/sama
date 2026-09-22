// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Address, Hash } from "viem";

const account = "0x00000000000000000000000000000000000000a1" as Address;
const hash =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as Hash;

const fixture = vi.hoisted(() => ({
  address: undefined as Address | undefined,
  chainId: undefined as number | undefined,
  wallet: undefined as
    | {
        getChainId: ReturnType<typeof vi.fn>;
        getAddresses: ReturnType<typeof vi.fn>;
        writeContract: ReturnType<typeof vi.fn>;
        account: { address: Address };
      }
    | undefined,
  simulate: vi.fn(),
  wait: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: fixture.address, chainId: fixture.chainId }),
  useWalletClient: () => ({ data: fixture.wallet }),
}));

vi.mock("../lib/chain-client", () => ({
  publicClient: {
    simulateContract: fixture.simulate,
    waitForTransactionReceipt: fixture.wait,
  },
}));

import { chain } from "../lib/config";
import { useTransaction } from "./use-transaction";

const write = {
  address: "0x00000000000000000000000000000000000000b1" as Address,
  abi: [
    {
      type: "function",
      name: "noop",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ] as const,
  functionName: "noop",
};

function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    children,
  );
}

beforeEach(() => {
  fixture.address = account;
  fixture.chainId = chain.id;
  fixture.wallet = {
    getChainId: vi.fn().mockResolvedValue(chain.id),
    getAddresses: vi.fn().mockResolvedValue([account]),
    writeContract: vi.fn().mockResolvedValue(hash),
    account: { address: account },
  };
  fixture.simulate.mockReset().mockResolvedValue({ request: write });
  fixture.wait
    .mockReset()
    .mockResolvedValue({ status: "success", transactionHash: hash });
});

describe("useTransaction", () => {
  it("locks concurrent submissions while the first simulation is pending", async () => {
    let release: ((value: { request: typeof write }) => void) | undefined;
    fixture.simulate.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const { result } = renderHook(() => useTransaction(), { wrapper });

    const first = result.current.execute({ simulation: write });
    await vi.waitFor(() => expect(fixture.simulate).toHaveBeenCalledOnce());
    const second = await result.current.execute({ simulation: write });
    expect(second.stage).toBe("rejected");
    expect(fixture.simulate).toHaveBeenCalledOnce();

    await act(async () => release?.({ request: write }));
    await expect(first).resolves.toMatchObject({ stage: "confirmed", hash });
  });

  it("keeps an unknown hash execution-locked until reset explicitly acknowledges it", async () => {
    fixture.wait.mockRejectedValue(new Error("receipt timeout"));
    const { result } = renderHook(() => useTransaction(), { wrapper });

    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    expect(result.current.state).toMatchObject({ stage: "unknown", hash });
    const blocked = await result.current.execute({ simulation: write });
    expect(blocked).toMatchObject({ stage: "unknown", hash });
    expect(fixture.wallet?.writeContract).toHaveBeenCalledOnce();
    act(() => expect(result.current.reset()).toBe(true));
    expect(result.current.state.stage).toBe("idle");
  });

  it("uses the provider's current identity after simulation and rejects a chain change", async () => {
    fixture.wallet?.getChainId
      .mockResolvedValueOnce(chain.id)
      .mockResolvedValueOnce(1);
    const { result } = renderHook(() => useTransaction(), { wrapper });

    const outcome = await result.current.execute({ simulation: write });
    expect(outcome).toMatchObject({
      stage: "rejected",
      message: "Wallet changed to the wrong chain before signing.",
    });
    expect(fixture.wallet?.writeContract).not.toHaveBeenCalled();
    expect(fixture.simulate).toHaveBeenCalledWith(
      expect.objectContaining({ account, chain }),
    );
  });

  it("rejects a multi-account provider when its active account is not the Wagmi account", async () => {
    const other = "0x00000000000000000000000000000000000000a2" as Address;
    fixture.wallet!.getAddresses.mockResolvedValue([other, account]);
    fixture.wallet!.account = { address: other };
    const { result } = renderHook(() => useTransaction(), { wrapper });

    const outcome = await result.current.execute({ simulation: write });
    expect(outcome.stage).toBe("rejected");
    expect(fixture.simulate).not.toHaveBeenCalled();
    expect(fixture.wallet?.writeContract).not.toHaveBeenCalled();
  });

  it("rechecks an unknown receipt without another simulation or wallet write", async () => {
    fixture.wait
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({ status: "success", transactionHash: hash });
    const { result } = renderHook(() => useTransaction(), { wrapper });
    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    fixture.simulate.mockClear();
    fixture.wallet?.writeContract.mockClear();

    await act(async () => {
      await result.current.recheckUnknown();
    });
    expect(result.current.state).toMatchObject({ stage: "confirmed", hash });
    expect(fixture.simulate).not.toHaveBeenCalled();
    expect(fixture.wallet?.writeContract).not.toHaveBeenCalled();
  });

  it("locks concurrent receipt rechecks and preserves the hash on another RPC error", async () => {
    let rejectWait: ((reason?: unknown) => void) | undefined;
    fixture.wait
      .mockRejectedValueOnce(new Error("timeout"))
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectWait = reject;
          }),
      );
    const { result } = renderHook(() => useTransaction(), { wrapper });
    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    const first = result.current.recheckUnknown();
    const second = await result.current.recheckUnknown();
    expect(second.stage).toBe("rejected");
    await act(async () => rejectWait?.(new Error("timeout again")));
    await expect(first).resolves.toMatchObject({ stage: "unknown", hash });
    expect(fixture.wallet?.writeContract).toHaveBeenCalledOnce();
  });

  it("does not confirm an unknown hash when viem reports changed call data replacement", async () => {
    fixture.wait
      .mockRejectedValueOnce(new Error("timeout"))
      .mockImplementationOnce(async ({ onReplaced }) => {
        onReplaced({
          reason: "replaced",
          replacedTransaction: { hash },
          transaction: {
            hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          },
          transactionReceipt: { status: "success" },
        });
        return { status: "success" };
      });
    const { result } = renderHook(() => useTransaction(), { wrapper });
    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    await act(async () => {
      await result.current.recheckUnknown();
    });
    expect(result.current.state).toMatchObject({
      stage: "rejected",
      hash,
      replacementHash:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
    });
  });

  it("follows a repriced replacement to its canonical receipt hash", async () => {
    const repricedHash =
      "0x3333333333333333333333333333333333333333333333333333333333333333" as Hash;
    fixture.wait
      .mockRejectedValueOnce(new Error("timeout"))
      .mockImplementationOnce(async ({ onReplaced }) => {
        onReplaced({
          reason: "repriced",
          replacedTransaction: { hash },
          transaction: { hash: repricedHash },
          transactionReceipt: {
            status: "success",
            transactionHash: repricedHash,
          },
        });
        return { status: "success", transactionHash: repricedHash };
      });
    const { result } = renderHook(() => useTransaction(), { wrapper });
    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    await act(async () => {
      await result.current.recheckUnknown();
    });
    expect(result.current.state).toMatchObject({
      stage: "confirmed",
      hash: repricedHash,
    });
  });

  it("treats a cancellation replacement as rejected, never confirmed", async () => {
    fixture.wait
      .mockRejectedValueOnce(new Error("timeout"))
      .mockImplementationOnce(async ({ onReplaced }) => {
        onReplaced({
          reason: "cancelled",
          replacedTransaction: { hash },
          transaction: {
            hash: "0x4444444444444444444444444444444444444444444444444444444444444444",
          },
          transactionReceipt: { status: "success" },
        });
        return { status: "success" };
      });
    const { result } = renderHook(() => useTransaction(), { wrapper });
    await act(async () => {
      await result.current.execute({ simulation: write });
    });
    await act(async () => {
      await result.current.recheckUnknown();
    });
    expect(result.current.state.stage).toBe("rejected");
  });
});
