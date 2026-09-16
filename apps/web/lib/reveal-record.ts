export type RevealRecord = {
  chainId: number;
  offeringAddress: `0x${string}`;
  bidder: `0x${string}`;
  amountUSDC: string;
  maxFDV: string;
  nonce: `0x${string}`;
  transactionHash: `0x${string}`;
};

const prefix = "sama:reveal:";

function parseReveal(serialized: string): RevealRecord {
  const record: unknown = JSON.parse(serialized);
  if (
    typeof record !== "object" ||
    record === null ||
    !("nonce" in record) ||
    !("offeringAddress" in record) ||
    !("bidder" in record) ||
    !("chainId" in record) ||
    !("amountUSDC" in record) ||
    !("maxFDV" in record) ||
    !("transactionHash" in record) ||
    typeof record.nonce !== "string" ||
    typeof record.offeringAddress !== "string" ||
    typeof record.bidder !== "string" ||
    typeof record.chainId !== "number" ||
    typeof record.amountUSDC !== "string" ||
    typeof record.maxFDV !== "string" ||
    typeof record.transactionHash !== "string"
  ) {
    throw new Error("Invalid reveal backup");
  }
  return record as RevealRecord;
}

export function generateNonce(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function saveReveal(record: RevealRecord) {
  localStorage.setItem(prefix + record.transactionHash, JSON.stringify(record));
}

export function loadReveal(hash: `0x${string}`): RevealRecord | null {
  const raw = localStorage.getItem(prefix + hash);
  if (!raw) return null;
  try {
    return parseReveal(raw);
  } catch {
    return null;
  }
}

export function exportReveal(record: RevealRecord): string {
  return JSON.stringify(record);
}

export function importReveal(serialized: string): RevealRecord {
  try {
    return parseReveal(serialized);
  } catch {
    throw new Error("Invalid reveal backup");
  }
}
