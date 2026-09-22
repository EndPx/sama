import { describe, expect, it } from "vitest";
import { encodeAbiParameters, keccak256 } from "viem";
import {
  bidCommitment,
  FDV_CEILING,
  FDV_FLOOR,
  parseAmount,
  parseFdv,
  quoteFill,
} from "./amounts";

const offering = "0x00000000000000000000000000000000000000a1" as const;
const bidder = "0x00000000000000000000000000000000000000b1" as const;
const nonce = `0x${"ab".repeat(32)}` as const;

describe("amount boundaries", () => {
  it("parses exact decimal base units and rejects ambiguous input", () => {
    expect(parseAmount("12.34", 6)).toBe(12_340_000n);
    for (const value of ["", "01", ".1", "1.", "1e6", "1,000", "-1", "0"]) {
      expect(() => parseAmount(value, 6)).toThrow();
    }
    expect(() => parseAmount("1.0000001", 6)).toThrow("at most");
    expect(() => parseAmount("1", -1)).toThrow("configuration");
  });

  it("enforces the locked FDV range", () => {
    expect(parseFdv("4000000")).toBe(FDV_FLOOR);
    expect(parseFdv("6000000")).toBe(FDV_CEILING);
    expect(() => parseFdv("3999999.999999")).toThrow();
    expect(() => parseFdv("6000000.000001")).toThrow();
  });

  it("uses marketplace ceiling quotes and protects an unpriced remainder", () => {
    expect(quoteFill(3n, 2n, 1n)).toBe(1n);
    expect(() => quoteFill(2n, 1n, 1n)).toThrow("cannot be priced");
    expect(quoteFill(2n, 1n, 2n)).toBe(1n);
    expect(() => quoteFill(0n, 1n, 1n)).toThrow();
  });

  it("matches Solidity abi.encode commitment bytes and validates its domain", () => {
    const expected = keccak256(
      encodeAbiParameters(
        [
          { type: "uint256" },
          { type: "address" },
          { type: "address" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "bytes32" },
        ],
        [421_614n, offering, bidder, 100_000_000n, FDV_FLOOR, nonce],
      ),
    );
    expect(
      bidCommitment(421_614, offering, bidder, 100_000_000n, FDV_FLOOR, nonce),
    ).toBe(expected);
    expect(() =>
      bidCommitment(0, offering, bidder, 1n, FDV_FLOOR, nonce),
    ).toThrow("chain");
    expect(() =>
      bidCommitment(1, offering, bidder, 1n, FDV_FLOOR - 1n, nonce),
    ).toThrow("values");
  });
});
