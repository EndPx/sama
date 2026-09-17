import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  exportReveal,
  generateNonce,
  importReveal,
  loadReveal,
  saveReveal,
  type RevealRecord,
} from "./reveal-record";

const entries = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => entries.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
  removeItem: vi.fn((key: string) => entries.delete(key)),
  clear: vi.fn(() => entries.clear()),
};

const primaryRecord: RevealRecord = {
  chainId: 421_614,
  offeringAddress: "0x00000000000000000000000000000000000000a1",
  bidder: "0x00000000000000000000000000000000000000b1",
  amountUSDC: "450000000000",
  maxFDV: "4000000000000",
  nonce: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  transactionHash:
    "0x1111111111111111111111111111111111111111111111111111111111111111",
};

beforeAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageMock,
  });
});

beforeEach(() => {
  entries.clear();
  vi.clearAllMocks();
});

describe("reveal record storage", () => {
  it("saves and loads a reveal record", () => {
    saveReveal(primaryRecord);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `sama:reveal:${primaryRecord.transactionHash}`,
      JSON.stringify(primaryRecord),
    );
    expect(loadReveal(primaryRecord.transactionHash)).toEqual(primaryRecord);
  });

  it("keeps records isolated by transaction hash", () => {
    const secondaryRecord: RevealRecord = {
      ...primaryRecord,
      chainId: 111_551_11,
      offeringAddress: "0x00000000000000000000000000000000000000a2",
      bidder: "0x00000000000000000000000000000000000000b2",
      transactionHash:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
    };
    saveReveal(primaryRecord);
    saveReveal(secondaryRecord);

    expect(loadReveal(primaryRecord.transactionHash)).toEqual(primaryRecord);
    expect(loadReveal(secondaryRecord.transactionHash)).toEqual(
      secondaryRecord,
    );
  });

  it("overwrites a record when its transaction identity is updated", () => {
    saveReveal(primaryRecord);
    const updatedRecord = { ...primaryRecord, maxFDV: "4800000000000" };
    saveReveal(updatedRecord);

    expect(loadReveal(primaryRecord.transactionHash)).toEqual(updatedRecord);
  });

  it("returns null for missing or malformed local storage data", () => {
    expect(loadReveal(primaryRecord.transactionHash)).toBeNull();
    entries.set(`sama:reveal:${primaryRecord.transactionHash}`, "not-json");

    expect(loadReveal(primaryRecord.transactionHash)).toBeNull();
    entries.set(
      `sama:reveal:${primaryRecord.transactionHash}`,
      JSON.stringify({ nonce: "0x1" }),
    );
    expect(loadReveal(primaryRecord.transactionHash)).toBeNull();
  });

  it("rejects invalid chain IDs without coercion", () => {
    for (const chainId of [-1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() =>
        importReveal(JSON.stringify({ ...primaryRecord, chainId })),
      ).toThrow("Invalid reveal backup");
    }
  });

  it("rejects malformed, short, and overlong addresses", () => {
    for (const value of [
      "0x1234",
      `0x${"a".repeat(42)}`,
      "0x00000000000000000000000000000000000000g1",
    ]) {
      expect(() =>
        importReveal(
          JSON.stringify({ ...primaryRecord, offeringAddress: value }),
        ),
      ).toThrow("Invalid reveal backup");
      expect(() =>
        importReveal(JSON.stringify({ ...primaryRecord, bidder: value })),
      ).toThrow("Invalid reveal backup");
    }
  });

  it("rejects malformed nonce and transaction hash values", () => {
    for (const value of [
      "0x1234",
      `0x${"a".repeat(66)}`,
      `0x${"g".repeat(64)}`,
    ]) {
      expect(() =>
        importReveal(JSON.stringify({ ...primaryRecord, nonce: value })),
      ).toThrow("Invalid reveal backup");
      expect(() =>
        importReveal(
          JSON.stringify({ ...primaryRecord, transactionHash: value }),
        ),
      ).toThrow("Invalid reveal backup");
    }
  });

  it("rejects non-canonical and non-positive amount and FDV strings", () => {
    for (const value of ["0", "-1", "1.5", "1e6", "", "not-a-number", "01"]) {
      expect(() =>
        importReveal(JSON.stringify({ ...primaryRecord, amountUSDC: value })),
      ).toThrow("Invalid reveal backup");
      expect(() =>
        importReveal(JSON.stringify({ ...primaryRecord, maxFDV: value })),
      ).toThrow("Invalid reveal backup");
    }
  });

  it("preserves a valid mixed-case hexadecimal record", () => {
    const mixedCaseRecord: RevealRecord = {
      ...primaryRecord,
      offeringAddress: "0xAbCdEf0123456789aBcDeF0123456789abCDef01",
      bidder: "0x0123456789ABCdef0123456789abCDef01234567",
      nonce:
        "0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa",
      transactionHash:
        "0xBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBb",
    };

    expect(importReveal(exportReveal(mixedCaseRecord))).toEqual(
      mixedCaseRecord,
    );
  });

  it("generates a 32-byte hexadecimal nonce", () => {
    expect(generateNonce()).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("exports and imports valid backups and rejects malformed backups", () => {
    const backup = exportReveal(primaryRecord);

    expect(importReveal(backup)).toEqual(primaryRecord);
    expect(() => importReveal("not-json")).toThrow("Invalid reveal backup");
    expect(() => importReveal(JSON.stringify({ nonce: "0x1" }))).toThrow(
      "Invalid reveal backup",
    );
  });
});
