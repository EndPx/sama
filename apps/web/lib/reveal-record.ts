export type RevealRecord = { chainId: number; offeringAddress: `0x${string}`; bidder: `0x${string}`; amountUSDC: string; maxFDV: string; nonce: `0x${string}`; transactionHash: `0x${string}` };
const prefix = "sama:reveal:";
export function generateNonce(): `0x${string}` { const bytes = crypto.getRandomValues(new Uint8Array(32)); return `0x${Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("")}`; }
export function saveReveal(record: RevealRecord) { localStorage.setItem(prefix + record.transactionHash, JSON.stringify(record)); }
export function loadReveal(hash: `0x${string}`): RevealRecord | null { const raw = localStorage.getItem(prefix + hash); return raw ? JSON.parse(raw) as RevealRecord : null; }
export function exportReveal(record: RevealRecord): string { return JSON.stringify(record); }
export function importReveal(serialized: string): RevealRecord { const record = JSON.parse(serialized) as RevealRecord; if (!record.nonce || !record.offeringAddress || !record.transactionHash) throw new Error("Invalid reveal backup"); return record; }
