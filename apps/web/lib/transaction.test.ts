import { describe, expect, it, vi } from "vitest";
import type { Address, Chain, Hash } from "viem";

import {
  runTransaction,
  type TransactionPorts,
  type TransactionState,
} from "./transaction";

const account = "0x00000000000000000000000000000000000000a1" as Address;
const hash =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as Hash;
const repricedHash =
  "0x2222222222222222222222222222222222222222222222222222222222222222" as Hash;
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
const testChain = { id: 421_614 } as Chain;

function ports(overrides: Partial<TransactionPorts> = {}): TransactionPorts {
  return {
    getChainId: vi.fn().mockResolvedValue(421_614),
    getAccount: vi.fn().mockResolvedValue(account),
    simulateContract: vi.fn().mockResolvedValue({ request: write }),
    writeContract: vi.fn().mockResolvedValue(hash),
    waitForTransactionReceipt: vi.fn().mockResolvedValue({ status: "success" }),
    ...overrides,
  };
}

function input(states: TransactionState[] = []) {
  return {
    expectedChainId: 421_614,
    expectedAccount: account,
    simulation: write,
    onState: (state: TransactionState) => states.push(state),
  };
}

describe("runTransaction", () => {
  it("simulates, signs, waits for a successful receipt, then confirms", async () => {
    const state: TransactionState[] = [];
    const adapter = ports();
    const result = await runTransaction(adapter, input(state));
    expect(result).toMatchObject({ stage: "confirmed", hash, account });
    expect(adapter.simulateContract).toHaveBeenCalledBefore(
      adapter.writeContract as ReturnType<typeof vi.fn>,
    );
    expect(adapter.writeContract).toHaveBeenCalledWith({
      ...write,
      account,
    });
    expect(state.map((item) => item.stage)).toEqual([
      "idle",
      "preparing",
      "signing",
      "pending",
      "confirmed",
    ]);
  });

  it("stops before simulation when chain or account is invalid", async () => {
    const adapter = ports({ getChainId: vi.fn().mockResolvedValue(1) });
    const result = await runTransaction(adapter, input());
    expect(result.stage).toBe("rejected");
    expect(adapter.simulateContract).not.toHaveBeenCalled();
    expect(adapter.writeContract).not.toHaveBeenCalled();
  });

  it("rejects a simulation explicitly bound to another account or chain", async () => {
    const wrongAccount =
      "0x00000000000000000000000000000000000000a2" as Address;
    const accountResult = await runTransaction(ports(), {
      ...input(),
      simulation: { ...write, account: wrongAccount },
    });
    expect(accountResult).toMatchObject({
      stage: "rejected",
      message: "Simulation account does not match this transaction.",
    });

    const chainResult = await runTransaction(ports(), {
      ...input(),
      simulation: { ...write, chain: { ...testChain, id: 1 } },
    });
    expect(chainResult).toMatchObject({
      stage: "rejected",
      message: "Simulation chain does not match this transaction.",
    });
  });

  it("writes the validated original intent, not adapter-provided replacement fields", async () => {
    const substituted = {
      ...write,
      address: "0x00000000000000000000000000000000000000c1" as Address,
      functionName: "other",
      args: ["unexpected"],
      account,
      chain: testChain,
    };
    const adapter = ports({
      simulateContract: vi.fn().mockResolvedValue({ request: substituted }),
    });
    await runTransaction(adapter, {
      ...input(),
      simulation: { ...write, chain: testChain },
    });
    expect(adapter.writeContract).toHaveBeenCalledWith({
      ...write,
      chain: testChain,
      account,
    });
  });

  it("rejects a simulated request with a conflicting account or configured chain", async () => {
    const wrongAccount =
      "0x00000000000000000000000000000000000000a2" as Address;
    const accountAdapter = ports({
      simulateContract: vi
        .fn()
        .mockResolvedValue({ request: { ...write, account: wrongAccount } }),
    });
    const accountResult = await runTransaction(accountAdapter, input());
    expect(accountResult).toMatchObject({
      stage: "rejected",
      message: "Simulation returned a different account.",
    });
    expect(accountAdapter.writeContract).not.toHaveBeenCalled();

    const chainAdapter = ports({
      simulateContract: vi.fn().mockResolvedValue({
        request: { ...write, account, chain: { ...testChain, id: 1 } },
      }),
    });
    const chainResult = await runTransaction(chainAdapter, {
      ...input(),
      simulation: { ...write, chain: testChain },
    });
    expect(chainResult).toMatchObject({
      stage: "rejected",
      message: "Simulation returned a different chain.",
    });
    expect(chainAdapter.writeContract).not.toHaveBeenCalled();
  });

  it("does not sign if simulation fails", async () => {
    const adapter = ports({
      simulateContract: vi
        .fn()
        .mockRejectedValue(new Error("execution reverted")),
    });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({
      stage: "rejected",
      message: "execution reverted",
    });
    expect(adapter.writeContract).not.toHaveBeenCalled();
  });

  it("re-checks the wallet after simulation and before requesting a signature", async () => {
    const getChainId = vi
      .fn()
      .mockResolvedValueOnce(421_614)
      .mockResolvedValueOnce(1);
    const adapter = ports({ getChainId });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({
      stage: "rejected",
      message: "Wallet changed to the wrong chain before signing.",
    });
    expect(adapter.simulateContract).toHaveBeenCalledOnce();
    expect(adapter.writeContract).not.toHaveBeenCalled();
  });

  it("reports a reverted receipt without claiming success", async () => {
    const adapter = ports({
      waitForTransactionReceipt: vi
        .fn()
        .mockResolvedValue({ status: "reverted" }),
    });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({ stage: "reverted", hash });
  });

  it("keeps a broadcast transaction unknown when receipt lookup times out", async () => {
    const adapter = ports({
      waitForTransactionReceipt: vi
        .fn()
        .mockRejectedValue(new Error("RPC timeout")),
    });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({
      stage: "unknown",
      hash,
      message: "RPC timeout",
    });
  });

  it("follows viem's repriced replacement callback and propagates its hash", async () => {
    const state: TransactionState[] = [];
    const adapter = ports({
      waitForTransactionReceipt: vi
        .fn()
        .mockImplementation(async ({ onReplaced }) => {
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
        }),
    });
    const result = await runTransaction(adapter, input(state));
    expect(result).toMatchObject({ stage: "confirmed", hash: repricedHash });
    expect(adapter.waitForTransactionReceipt).toHaveBeenCalledOnce();
    expect(
      state.filter((item) => item.stage === "pending").at(-1),
    ).toMatchObject({ hash: repricedHash });
  });

  it("does not report success when viem reports a cancelled replacement", async () => {
    const adapter = ports({
      waitForTransactionReceipt: vi
        .fn()
        .mockImplementation(async ({ onReplaced }) => {
          onReplaced({
            reason: "cancelled",
            replacedTransaction: { hash },
            transaction: { hash: repricedHash },
            transactionReceipt: { status: "success" },
          });
          return { status: "success" };
        }),
    });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({
      stage: "rejected",
      hash,
      replacementHash: repricedHash,
    });
  });

  it("does not report the original action as successful after unrelated replacement", async () => {
    const adapter = ports({
      waitForTransactionReceipt: vi
        .fn()
        .mockImplementation(async ({ onReplaced }) => {
          onReplaced({
            reason: "replaced",
            replacedTransaction: { hash },
            transaction: { hash: repricedHash },
            transactionReceipt: { status: "success" },
          });
          return { status: "success" };
        }),
    });
    const result = await runTransaction(adapter, input());
    expect(result).toMatchObject({
      stage: "rejected",
      hash,
      replacementHash: repricedHash,
    });
  });
});
