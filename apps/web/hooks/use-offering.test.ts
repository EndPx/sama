import { describe, expect, it } from "vitest";

import { chain, contracts } from "../lib/config";
import { offeringQueryKey } from "./use-offering";

describe("offeringQueryKey", () => {
  it("scopes cached reads to chain, every configured contract, and account", () => {
    const account = "0x00000000000000000000000000000000000000a1";
    expect(offeringQueryKey(account)).toEqual([
      "offering",
      chain.id,
      contracts.currency ?? null,
      contracts.registry ?? null,
      contracts.kira ?? null,
      contracts.offering ?? null,
      contracts.marketplace ?? null,
      contracts.demoAccess ?? null,
      account,
    ]);
  });
});
