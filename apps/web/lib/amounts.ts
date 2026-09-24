import {
  encodeAbiParameters,
  isAddress,
  keccak256,
  type Address,
  type Hex,
} from "viem";

export const MAX_UINT128 = (1n << 128n) - 1n;
export const FDV_FLOOR = 4_000_000n * 1_000_000n;
export const FDV_CEILING = 6_000_000n * 1_000_000n;
const MAX_UINT256 = (1n << 256n) - 1n;
const bytes32Pattern = /^0x[0-9a-fA-F]{64}$/;

export function parseAmount(
  value: string,
  decimals: number,
  max = MAX_UINT128,
): bigint {
  if (!Number.isSafeInteger(decimals) || decimals < 0 || max <= 0n)
    throw new Error("Invalid amount configuration.");
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value))
    throw new Error(
      "Enter a positive amount without commas or exponent notation.",
    );
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals)
    throw new Error(`Use at most ${decimals} decimal places.`);
  const amount =
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0");
  if (amount <= 0n || amount > max)
    throw new Error("Amount is outside the supported range.");
  return amount;
}

export function parseFdv(value: string) {
  const amount = parseAmount(value, 6, (1n << 64n) - 1n);
  if (amount < FDV_FLOOR || amount > FDV_CEILING)
    throw new Error(
      "Maximum valuation must be between 4,000,000 and 6,000,000.",
    );
  return amount;
}

export function formatAmount(
  value: bigint | undefined,
  decimals = 6,
  fractionDigits = 2,
) {
  if (value === undefined) return "Not available";
  const scale = 10n ** BigInt(decimals);
  const whole = (value / scale).toLocaleString("en-US");
  const fraction = (value % scale)
    .toString()
    .padStart(decimals, "0")
    .slice(0, fractionDigits)
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function quoteFill(
  remainingAmount: bigint,
  remainingPrice: bigint,
  amount: bigint,
) {
  if (
    remainingAmount <= 0n ||
    remainingPrice <= 0n ||
    amount <= 0n ||
    amount > remainingAmount
  )
    throw new Error("Choose an amount within the listing's available KIRA.");
  if (amount === remainingAmount) return remainingPrice;
  const cost =
    (remainingPrice * amount + remainingAmount - 1n) / remainingAmount;
  if (cost >= remainingPrice)
    throw new Error(
      "This small remainder cannot be priced. Buy the full remaining amount instead.",
    );
  return cost;
}

export function bidCommitment(
  chainId: number,
  offering: Address,
  bidder: Address,
  amount: bigint,
  maxFdv: bigint,
  nonce: Hex,
) {
  if (!Number.isSafeInteger(chainId) || chainId <= 0)
    throw new Error("Invalid chain ID.");
  if (!isAddress(offering) || !isAddress(bidder))
    throw new Error("Invalid commitment address.");
  if (
    amount <= 0n ||
    amount > MAX_UINT256 ||
    maxFdv < FDV_FLOOR ||
    maxFdv > FDV_CEILING ||
    maxFdv > (1n << 64n) - 1n ||
    !bytes32Pattern.test(nonce)
  ) {
    throw new Error("Invalid commitment values.");
  }
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "bytes32" },
      ],
      [BigInt(chainId), offering, bidder, amount, maxFdv, nonce],
    ),
  );
}

export function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function stageOf(phase: number, timestamp: bigint, revealEnd: bigint) {
  if (phase === 2 && timestamp >= revealEnd) return "Ready to settle";
  return (
    [
      "Opening soon",
      "Bidding open",
      "Reveal window",
      "Successfully settled",
      "Fully refundable",
      "Cancelled",
    ][phase] ?? "Unknown phase"
  );
}
