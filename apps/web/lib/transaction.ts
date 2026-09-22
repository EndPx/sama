import type { Address, Abi, Chain, Hash } from "viem";

/** The only states a transaction UI may present as authoritative. */
export type TransactionStage =
  | "idle"
  | "preparing"
  | "signing"
  | "pending"
  | "confirmed"
  | "reverted"
  | "rejected"
  | "unknown";

export type TransactionState = {
  stage: TransactionStage;
  hash?: Hash;
  replacementHash?: Hash;
  message?: string;
};

/**
 * An intentionally small contract-write shape.  A UI can derive this from a
 * typed viem contract config, while the lifecycle runner stays usable with
 * wagmi, Privy, and test doubles without holding duplicate clients.
 */
/**
 * Deliberately permit only call intent. Gas, nonce, fees, and raw calldata
 * overrides are provider-owned and cannot be smuggled through this UI port.
 */
export type ContractWrite = {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  account?: Address;
  chain?: Chain;
  value?: bigint;
};

export type SimulatedWrite = {
  request: ContractWrite;
};

export type TransactionReceipt = {
  status: "success" | "reverted";
  transactionHash?: Hash;
};

/** Mirrors viem's waitForTransactionReceipt `onReplaced` event shape. */
export type TransactionReplacement = {
  reason: "replaced" | "repriced" | "cancelled";
  transaction: { hash: Hash };
  replacedTransaction: { hash: Hash };
  transactionReceipt: TransactionReceipt;
};

export type TransactionPorts = {
  getChainId: () => Promise<number>;
  getAccount: () => Promise<Address | undefined>;
  /** Implement with publicClient.simulateContract(parameters). */
  simulateContract: (parameters: ContractWrite) => Promise<SimulatedWrite>;
  /** Implement with walletClient.writeContract(simulation.request). */
  writeContract: (request: ContractWrite) => Promise<Hash>;
  waitForTransactionReceipt: (parameters: {
    hash: Hash;
    onReplaced: (replacement: TransactionReplacement) => void;
  }) => Promise<TransactionReceipt>;
};

export type TransactionInput = {
  expectedChainId: number;
  expectedAccount: Address;
  simulation: ContractWrite;
  onState?: (state: TransactionState) => void;
};

export type TransactionResult = TransactionState & {
  account?: Address;
};

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unexpected transaction error.";
}

function sameAddress(left: Address, right: Address): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function bindSimulation(
  input: TransactionInput,
): ContractWrite | TransactionState {
  const supplied = input.simulation;
  if (
    supplied.account &&
    !sameAddress(supplied.account, input.expectedAccount)
  ) {
    return {
      stage: "rejected",
      message: "Simulation account does not match this transaction.",
    };
  }
  if (supplied.chain && supplied.chain.id !== input.expectedChainId) {
    return {
      stage: "rejected",
      message: "Simulation chain does not match this transaction.",
    };
  }
  return { ...supplied, account: input.expectedAccount };
}

function validateSimulatedBinding(
  simulated: SimulatedWrite,
  intended: ContractWrite,
): TransactionState | undefined {
  if (
    simulated.request.account &&
    !sameAddress(simulated.request.account, intended.account!)
  ) {
    return {
      stage: "rejected",
      message: "Simulation returned a different account.",
    };
  }
  if (
    intended.chain &&
    simulated.request.chain &&
    simulated.request.chain.id !== intended.chain.id
  ) {
    return {
      stage: "rejected",
      message: "Simulation returned a different chain.",
    };
  }
  return undefined;
}

/**
 * Runs one write through simulation, wallet signing, and canonical receipt
 * verification.  It never reports confirmed until a successful receipt is
 * observed.  Any receipt outage after broadcast is deliberately "unknown".
 */
export async function runTransaction(
  ports: TransactionPorts,
  input: TransactionInput,
): Promise<TransactionResult> {
  const publish = (state: TransactionState): TransactionState => {
    input.onState?.(state);
    return state;
  };
  const finish = (
    state: TransactionState,
    account?: Address,
  ): TransactionResult => ({
    ...publish(state),
    account,
  });

  publish({ stage: "idle" });
  publish({ stage: "preparing" });

  const boundSimulation = bindSimulation(input);
  if ("stage" in boundSimulation) return finish(boundSimulation);

  let account: Address | undefined;
  try {
    const [chainId, connectedAccount] = await Promise.all([
      ports.getChainId(),
      ports.getAccount(),
    ]);
    account = connectedAccount;
    if (chainId !== input.expectedChainId) {
      return finish(
        {
          stage: "rejected",
          message: "Wallet is connected to the wrong chain.",
        },
        account,
      );
    }
    if (!account || !sameAddress(account, input.expectedAccount)) {
      return finish(
        {
          stage: "rejected",
          message: "Wallet account does not match this transaction.",
        },
        account,
      );
    }
  } catch (error) {
    return finish({ stage: "rejected", message: errorMessage(error) }, account);
  }

  try {
    const simulated = await ports.simulateContract(boundSimulation);
    const invalidBinding = validateSimulatedBinding(simulated, boundSimulation);
    if (invalidBinding) return finish(invalidBinding, account);
  } catch (error) {
    return finish({ stage: "rejected", message: errorMessage(error) }, account);
  }

  // Simulation is a read. Re-check wallet identity immediately before asking
  // it to sign because the provider may have changed in the meantime.
  try {
    const [chainId, connectedAccount] = await Promise.all([
      ports.getChainId(),
      ports.getAccount(),
    ]);
    account = connectedAccount;
    if (chainId !== input.expectedChainId) {
      return finish(
        {
          stage: "rejected",
          message: "Wallet changed to the wrong chain before signing.",
        },
        account,
      );
    }
    if (!account || !sameAddress(account, input.expectedAccount)) {
      return finish(
        {
          stage: "rejected",
          message: "Wallet account changed before signing.",
        },
        account,
      );
    }
  } catch (error) {
    return finish({ stage: "rejected", message: errorMessage(error) }, account);
  }

  publish({ stage: "signing" });
  let hash: Hash;
  try {
    // A simulation proves the supplied intent is executable. It must not be
    // allowed to replace the address, function, arguments, value, account, or chain.
    hash = await ports.writeContract(boundSimulation);
  } catch (error) {
    return finish(
      {
        stage: "rejected",
        message: errorMessage(error),
      },
      account,
    );
  }

  publish({ stage: "pending", hash });
  let replacement: TransactionReplacement | undefined;
  try {
    const receipt = await ports.waitForTransactionReceipt({
      hash,
      onReplaced: (event) => {
        replacement = event;
        if (event.reason === "repriced") {
          hash = event.transaction.hash;
          publish({ stage: "pending", hash, replacementHash: hash });
        }
      },
    });
    if (replacement && replacement.reason !== "repriced") {
      return finish(
        {
          stage: "rejected",
          hash,
          replacementHash: replacement.transaction.hash,
          message:
            replacement.reason === "cancelled"
              ? "Transaction was cancelled by a replacement transaction."
              : "Transaction was replaced with different call data.",
        },
        account,
      );
    }
    if (receipt.status === "success") {
      return finish(
        { stage: "confirmed", hash: receipt.transactionHash ?? hash },
        account,
      );
    }
    return finish(
      { stage: "reverted", hash: receipt.transactionHash ?? hash },
      account,
    );
  } catch (error) {
    return finish(
      { stage: "unknown", hash, message: errorMessage(error) },
      account,
    );
  }
}
