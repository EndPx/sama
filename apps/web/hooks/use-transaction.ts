"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import type {
  Abi,
  Address,
  SimulateContractParameters,
  WriteContractParameters,
} from "viem";

import { publicClient } from "../lib/chain-client";
import { chain } from "../lib/config";
import {
  runTransaction,
  type TransactionInput,
  type TransactionPorts,
  type TransactionResult,
  type TransactionState,
} from "../lib/transaction";

type ExecuteInput = Omit<
  TransactionInput,
  "expectedChainId" | "expectedAccount" | "onState"
>;

const initialState: TransactionState = { stage: "idle" };

function safeState(state: TransactionState): TransactionState {
  if (
    state.stage === "confirmed" ||
    state.stage === "idle" ||
    state.stage === "pending"
  )
    return state;
  if (state.stage === "reverted")
    return { ...state, message: "The transaction reverted onchain." };
  if (state.stage === "unknown")
    return {
      ...state,
      message:
        "Transaction status is unknown. Recheck the transaction hash before trying again.",
    };
  if (state.hash && state.replacementHash) {
    return {
      ...state,
      message:
        "The transaction was replaced. Confirm its status in your wallet.",
    };
  }
  return {
    ...state,
    message: state.message?.startsWith("Wallet ")
      ? state.message
      : "Transaction was not submitted. Check your wallet and try again.",
  };
}

/**
 * Wallet-bound write runner. The only terminal success is a canonical success
 * receipt; unknown hashes remain visible until the caller explicitly resets.
 */
export function useTransaction() {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const [state, setState] = useState<TransactionState>(initialState);
  const submissionRef = useRef(false);
  const stateRef = useRef<TransactionState>(initialState);
  const reactAccountRef = useRef(address);
  const reactChainIdRef = useRef(chainId);
  const walletClientRef = useRef(walletClient);
  useEffect(() => {
    reactAccountRef.current = address;
  }, [address]);
  useEffect(() => {
    reactChainIdRef.current = chainId;
  }, [chainId]);
  useEffect(() => {
    walletClientRef.current = walletClient;
  }, [walletClient]);
  const setSafeState = useCallback((next: TransactionState) => {
    const safe = safeState(next);
    stateRef.current = safe;
    setState(safe);
    return safe;
  }, []);

  const execute = useCallback(
    async (input: ExecuteInput): Promise<TransactionResult> => {
      if (submissionRef.current) {
        return {
          stage: "rejected",
          message: "A transaction is already in progress.",
        };
      }
      if (stateRef.current.stage === "unknown") return stateRef.current;
      const expectedAccount = address;
      if (!expectedAccount || !walletClient) {
        const result = setSafeState({
          stage: "rejected",
          message: "Wallet is not connected.",
        });
        return result;
      }

      submissionRef.current = true;
      const ports: TransactionPorts = {
        // These query the provider, not React's last rendered account/chain.
        getChainId: async () => {
          if (walletClientRef.current !== walletClient) return -1;
          if (
            reactChainIdRef.current !== undefined &&
            reactChainIdRef.current !== chain.id
          )
            return -1;
          return walletClient.getChainId();
        },
        getAccount: async () => {
          const addresses = await walletClient.getAddresses();
          const active = walletClient.account?.address;
          const matchesExpected = (value: string | undefined) =>
            value?.toLowerCase() === expectedAccount.toLowerCase();
          return walletClientRef.current === walletClient &&
            matchesExpected(reactAccountRef.current) &&
            matchesExpected(active) &&
            addresses.some(matchesExpected)
            ? expectedAccount
            : undefined;
        },
        simulateContract: async (parameters) => {
          const simulation = await publicClient.simulateContract(
            parameters as SimulateContractParameters<
              Abi,
              string,
              readonly unknown[],
              typeof chain,
              typeof chain,
              Address
            >,
          );
          const request = simulation.request;
          return {
            request: {
              address: request.address,
              abi: request.abi,
              functionName: request.functionName,
              args: request.args,
              account: expectedAccount,
              chain,
              value: request.value,
            },
          };
        },
        writeContract: (request) =>
          walletClient.writeContract(request as WriteContractParameters),
        waitForTransactionReceipt: async (parameters) => {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: parameters.hash,
            onReplaced: (replacement) => parameters.onReplaced(replacement),
          });
          return {
            status: receipt.status,
            transactionHash: receipt.transactionHash,
          };
        },
      };

      try {
        const result = await runTransaction(ports, {
          ...input,
          simulation: { ...input.simulation, account: expectedAccount, chain },
          expectedChainId: chain.id,
          expectedAccount,
          onState: setSafeState,
        });
        const safeResult = setSafeState(result);
        if (
          result.stage === "confirmed" ||
          result.stage === "reverted" ||
          result.replacementHash
        ) {
          await queryClient.invalidateQueries({
            predicate: (query) => {
              const scope = query.queryKey[0];
              return (
                scope === "offering" ||
                scope === "market" ||
                scope === "allowance"
              );
            },
          });
        }
        return safeResult;
      } finally {
        submissionRef.current = false;
      }
    },
    [address, queryClient, setSafeState, walletClient],
  );

  /** Calling reset is the explicit acknowledgement required to clear an unknown hash. */
  const reset = useCallback(() => {
    if (submissionRef.current) return false;
    stateRef.current = initialState;
    setState(initialState);
    return true;
  }, []);
  /** Rechecks an uncertain broadcast without preparing, simulating, or signing. */
  const recheckUnknown = useCallback(async (): Promise<TransactionResult> => {
    if (submissionRef.current) {
      return {
        stage: "rejected",
        message: "A transaction check is already in progress.",
      };
    }
    const uncertain = stateRef.current;
    if (uncertain.stage !== "unknown" || !uncertain.hash) {
      return {
        stage: "rejected",
        message: "There is no unknown transaction to recheck.",
      };
    }

    submissionRef.current = true;
    let hash = uncertain.hash;
    let replacement:
      | {
          reason: "replaced" | "repriced" | "cancelled";
          transaction: { hash: typeof hash };
        }
      | undefined;
    setSafeState({ stage: "pending", hash });
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        onReplaced: (event) => {
          replacement = event;
          if (event.reason === "repriced") {
            hash = event.transaction.hash;
            setSafeState({ stage: "pending", hash, replacementHash: hash });
          }
        },
      });
      if (replacement && replacement.reason !== "repriced") {
        const result = setSafeState({
          stage: "rejected",
          hash,
          replacementHash: replacement.transaction.hash,
          message:
            replacement.reason === "cancelled"
              ? "Transaction was cancelled by a replacement transaction."
              : "Transaction was replaced with different call data.",
        });
        return result;
      }
      const result = setSafeState({
        stage: receipt.status === "success" ? "confirmed" : "reverted",
        hash: receipt.transactionHash ?? hash,
      });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          ["offering", "market", "allowance"].includes(
            String(query.queryKey[0]),
          ),
      });
      return result;
    } catch {
      return setSafeState({ stage: "unknown", hash });
    } finally {
      submissionRef.current = false;
    }
  }, [queryClient, setSafeState]);
  const busy =
    state.stage === "preparing" ||
    state.stage === "signing" ||
    state.stage === "pending";

  return { state, busy, execute, reset, recheckUnknown };
}
