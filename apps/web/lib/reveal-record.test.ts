import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  exportReveal,
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

  it("keeps records isolated by their chain, offering, bidder, and transaction identity", () => {
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

  it("exports and imports valid backups and rejects malformed backups", () => {
    const backup = exportReveal(primaryRecord);

    expect(importReveal(backup)).toEqual(primaryRecord);
    expect(() => importReveal("not-json")).toThrow("Invalid reveal backup");
    expect(() => importReveal(JSON.stringify({ nonce: "0x1" }))).toThrow(
      "Invalid reveal backup",
    );
  });
});
