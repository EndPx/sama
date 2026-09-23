import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  backupCommitment,
  createBackup,
  loadBackup,
  loadBackupState,
  parseBackup,
  persistBackup,
  isSubmittedCommitment,
  isSubmissionProvenFailed,
  restoreBackup,
  validateBackupContext,
} from "./bid-backup";
import { FDV_FLOOR } from "./amounts";

const entries = new Map<string, string>();
const storage = {
  getItem: vi.fn((key: string) => entries.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
};
const offering = "0x00000000000000000000000000000000000000a1" as const;
const bidder = "0x00000000000000000000000000000000000000b1" as const;
const raw = {
  version: 1,
  chainId: 421_614,
  offeringAddress: offering,
  bidder,
  amountUSDC: "100000000",
  maxFDV: FDV_FLOOR.toString(),
  nonce: `0x${"ab".repeat(32)}`,
};

beforeAll(() =>
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  }),
);
beforeEach(() => {
  entries.clear();
  vi.clearAllMocks();
});

describe("bid backup", () => {
  it("unlocks only the matching submission after a proven terminal failure", () => {
    const submitted =
      "0x1111111111111111111111111111111111111111111111111111111111111111" as const;
    expect(
      isSubmissionProvenFailed(submitted, {
        stage: "reverted",
        hash: submitted,
      }),
    ).toBe(true);
    expect(
      isSubmissionProvenFailed(submitted, {
        stage: "rejected",
        hash: submitted,
        replacementHash:
          "0x2222222222222222222222222222222222222222222222222222222222222222",
      }),
    ).toBe(true);
    expect(
      isSubmissionProvenFailed(submitted, {
        stage: "unknown",
        hash: submitted,
      }),
    ).toBe(false);
    expect(
      isSubmissionProvenFailed(submitted, {
        stage: "confirmed",
        hash: submitted,
      }),
    ).toBe(false);
    expect(
      isSubmissionProvenFailed(submitted, {
        stage: "reverted",
        hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
      }),
    ).toBe(false);
  });
  it("requires a complete canonical schema and returns an immutable copy", () => {
    const parsed = parseBackup(JSON.stringify(raw));
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(() =>
      parseBackup(JSON.stringify({ ...raw, amountUSDC: "0" })),
    ).toThrow("Invalid reveal backup");
    expect(() => parseBackup(JSON.stringify({ ...raw, maxFDV: "01" }))).toThrow(
      "Invalid reveal backup",
    );
    expect(() => parseBackup(JSON.stringify({ ...raw, chainId: 1.1 }))).toThrow(
      "Invalid reveal backup",
    );
  });

  it("binds backups to wallet, chain, offering, and onchain commitment", () => {
    const parsed = parseBackup(JSON.stringify(raw));
    expect(
      validateBackupContext(
        parsed,
        421_614,
        offering,
        bidder,
        backupCommitment(parsed),
      ),
    ).toBe(parsed);
    expect(() => validateBackupContext(parsed, 1, offering, bidder)).toThrow(
      "different wallet",
    );
    expect(() =>
      validateBackupContext(
        parsed,
        421_614,
        offering,
        bidder,
        `0x${"cd".repeat(32)}`,
      ),
    ).toThrow("onchain commitment");
  });

  it("verifies storage writes and never loads a malformed stored value", () => {
    const parsed = parseBackup(JSON.stringify(raw));
    persistBackup(parsed);
    expect(loadBackup(421_614, offering, bidder)).toEqual(parsed);
    entries.set(
      "sama:bid:421614:0x00000000000000000000000000000000000000a1:0x00000000000000000000000000000000000000b1",
      "bad",
    );
    expect(loadBackup(421_614, offering, bidder)).toBeNull();
    expect(loadBackupState(421_614, offering, bidder)).toEqual({
      backup: null,
      corrupted: true,
    });
    storage.setItem.mockImplementationOnce(() => {
      throw new Error("quota");
    });
    expect(() => persistBackup(parsed)).toThrow("could not save");
  });

  it("restores a corrupt local draft only from a matching exported backup", () => {
    const storageKey =
      "sama:bid:421614:0x00000000000000000000000000000000000000a1:0x00000000000000000000000000000000000000b1";
    entries.set(storageKey, "corrupt draft");
    const valid = JSON.stringify(raw);

    expect(() => restoreBackup(valid, 1, offering, bidder)).toThrow(
      "different wallet",
    );
    expect(() =>
      restoreBackup(valid, 421_614, offering, bidder, `0x${"cd".repeat(32)}`),
    ).toThrow("onchain commitment");
    expect(entries.get(storageKey)).toBe("corrupt draft");

    const restored = restoreBackup(
      valid,
      421_614,
      offering,
      bidder,
      backupCommitment(parseBackup(valid)),
    );
    expect(loadBackupState(421_614, offering, bidder)).toEqual({
      backup: restored,
      corrupted: false,
    });
  });

  it("creates a schema-valid draft with a fresh nonce", () => {
    const draft = createBackup(
      421_614,
      offering,
      bidder,
      100_000_000n,
      FDV_FLOOR,
    );
    expect(parseBackup(JSON.stringify(draft))).toEqual(draft);
  });

  it("distinguishes an absent backup from corrupted storage and locks only a submitted draft", () => {
    expect(loadBackupState(421_614, offering, bidder)).toEqual({
      backup: null,
      corrupted: false,
    });
    const backup = parseBackup(JSON.stringify(raw));
    expect(isSubmittedCommitment(backup, backupCommitment(backup))).toBe(true);
    expect(isSubmittedCommitment(backup, `0x${"cd".repeat(32)}`)).toBe(false);
    expect(isSubmittedCommitment(null, backupCommitment(backup))).toBe(false);
  });
});
