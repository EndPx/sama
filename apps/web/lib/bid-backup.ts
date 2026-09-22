import { type Address, type Hex } from "viem";
import type { TransactionState } from "./transaction";
import { bidCommitment, MAX_UINT128, FDV_FLOOR, FDV_CEILING } from "./amounts";
import { generateNonce } from "./reveal-record";

export type BidBackup = {
  version: 1;
  chainId: number;
  offeringAddress: Address;
  bidder: Address;
  amountUSDC: string;
  maxFDV: string;
  nonce: Hex;
  transactionHash?: Hex;
};
export type BackupLoadResult = {
  backup: BidBackup | null;
  corrupted: boolean;
};
const addressPattern = /^0x[0-9a-fA-F]{40}$/;
const hex32 = /^0x[0-9a-fA-F]{64}$/;
const decimal = /^[1-9][0-9]*$/;
export function parseBackup(raw: string): BidBackup {
  try {
    const b = JSON.parse(raw);
    if (
      !b ||
      typeof b !== "object" ||
      !Number.isSafeInteger(b.chainId) ||
      b.chainId <= 0 ||
      (b.version !== undefined && b.version !== 1) ||
      typeof b.offeringAddress !== "string" ||
      !addressPattern.test(b.offeringAddress) ||
      typeof b.bidder !== "string" ||
      !addressPattern.test(b.bidder) ||
      typeof b.nonce !== "string" ||
      !hex32.test(b.nonce) ||
      typeof b.amountUSDC !== "string" ||
      !decimal.test(b.amountUSDC) ||
      b.amountUSDC.length > 39 ||
      BigInt(b.amountUSDC) > MAX_UINT128 ||
      typeof b.maxFDV !== "string" ||
      !decimal.test(b.maxFDV) ||
      b.maxFDV.length > 20 ||
      BigInt(b.maxFDV) < FDV_FLOOR ||
      BigInt(b.maxFDV) > FDV_CEILING ||
      (b.transactionHash !== undefined &&
        (typeof b.transactionHash !== "string" ||
          !hex32.test(b.transactionHash)))
    )
      throw new Error();
    return Object.freeze({
      version: 1 as const,
      chainId: b.chainId,
      offeringAddress: b.offeringAddress as Address,
      bidder: b.bidder as Address,
      amountUSDC: b.amountUSDC,
      maxFDV: b.maxFDV,
      nonce: b.nonce as Hex,
      ...(b.transactionHash
        ? { transactionHash: b.transactionHash as Hex }
        : {}),
    });
  } catch {
    throw new Error("Invalid reveal backup.");
  }
}
const key = (chainId: number, offering: Address, bidder: Address) =>
  `sama:bid:${chainId}:${offering.toLowerCase()}:${bidder.toLowerCase()}`;
export function createBackup(
  chainId: number,
  offeringAddress: Address,
  bidder: Address,
  amount: bigint,
  maxFdv: bigint,
): BidBackup {
  return parseBackup(
    JSON.stringify({
      version: 1,
      chainId,
      offeringAddress,
      bidder,
      amountUSDC: amount.toString(),
      maxFDV: maxFdv.toString(),
      nonce: generateNonce(),
    }),
  );
}
export function persistBackup(backup: BidBackup) {
  const safe = parseBackup(JSON.stringify(backup));
  const serialized = JSON.stringify(safe);
  const k = key(safe.chainId, safe.offeringAddress, safe.bidder);
  try {
    localStorage.setItem(k, serialized);
    if (localStorage.getItem(k) !== serialized) throw new Error();
  } catch {
    throw new Error(
      "Your browser could not save your reveal backup. No bid was sent.",
    );
  }
}
export function loadBackup(
  chainId: number,
  offering: Address,
  bidder: Address,
): BidBackup | null {
  return loadBackupState(chainId, offering, bidder).backup;
}
export function loadBackupState(
  chainId: number,
  offering: Address,
  bidder: Address,
): BackupLoadResult {
  try {
    const raw = localStorage.getItem(key(chainId, offering, bidder));
    return raw
      ? { backup: parseBackup(raw), corrupted: false }
      : { backup: null, corrupted: false };
  } catch {
    return { backup: null, corrupted: true };
  }
}
export function validateBackupContext(
  b: BidBackup,
  chainId: number,
  offering: Address,
  bidder: Address,
  commitment?: Hex,
) {
  if (
    b.chainId !== chainId ||
    b.offeringAddress.toLowerCase() !== offering.toLowerCase() ||
    b.bidder.toLowerCase() !== bidder.toLowerCase()
  )
    throw new Error(
      "This backup belongs to a different wallet, network, or offering.",
    );
  if (
    commitment &&
    backupCommitment(b).toLowerCase() !== commitment.toLowerCase()
  )
    throw new Error("This backup does not match your onchain commitment.");
  return b;
}
export const backupCommitment = (b: BidBackup) =>
  bidCommitment(
    b.chainId,
    b.offeringAddress,
    b.bidder,
    BigInt(b.amountUSDC),
    BigInt(b.maxFDV),
    b.nonce,
  );
/** A confirmed or unknown submission locks only its exact draft, never a reverted/rejected retry. */
export function isSubmittedCommitment(
  backup: BidBackup | null,
  submitted?: Hex,
) {
  return (
    !!backup &&
    !!submitted &&
    backupCommitment(backup).toLowerCase() === submitted.toLowerCase()
  );
}

/** Only the exact broadcast that locked a draft may prove it safe to retry. */
export function isSubmissionProvenFailed(
  submittedHash: Hex | undefined,
  state: TransactionState,
) {
  if (!submittedHash || state.hash?.toLowerCase() !== submittedHash.toLowerCase()) return false;
  return state.stage === "reverted" || (state.stage === "rejected" && !!state.replacementHash);
}
export function downloadBackup(backup: BidBackup) {
  const safe = parseBackup(JSON.stringify(backup));
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `sama-reveal-${safe.bidder.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
