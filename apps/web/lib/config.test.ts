import { describe, expect, it } from "vitest";
import { buildConfig, docsUrl } from "./config";

const addresses = {
  currency: "0x0000000000000000000000000000000000000001",
  registry: "0x0000000000000000000000000000000000000002",
  kira: "0x0000000000000000000000000000000000000003",
  offering: "0x0000000000000000000000000000000000000004",
  marketplace: "0x0000000000000000000000000000000000000005",
  demoAccess: "0x0000000000000000000000000000000000000006",
};
const artifact = { ...addresses, chainId: 421_614, deploymentBlock: "123" };

describe("public deployment configuration", () => {
  it("always links to the published protocol documentation", () => {
    expect(docsUrl).toBe(
      "https://sama-3.gitbook.io/sama-product-and-protocol/",
    );
  });

  it("accepts only a complete Arbitrum Sepolia deployment", () => {
    const config = buildConfig({}, artifact);
    expect(config.configured).toBe(true);
    expect(config.chain.id).toBe(421_614);
    expect(config.deploymentBlock).toBe(123n);
    expect(config.rpcUrls).toEqual([
      "https://sepolia-rollup.arbitrum.io/rpc",
      "https://arbitrum-sepolia-rpc.publicnode.com",
    ]);
  });

  it("rejects a wrong chain, incomplete/zero addresses, and unsafe blocks", () => {
    expect(
      buildConfig({ NEXT_PUBLIC_CHAIN_ID: "1" }, artifact).configurationError,
    ).toMatch("different chain");
    expect(
      buildConfig(
        {},
        { ...artifact, registry: "0x0000000000000000000000000000000000000000" },
      ).configured,
    ).toBe(false);
    expect(
      buildConfig({}, { ...artifact, deploymentBlock: "0" }).configurationError,
    ).toMatch("Deployment block");
    expect(
      buildConfig({ NEXT_PUBLIC_DEPLOYMENT_BLOCK: "01" }, artifact).configured,
    ).toBe(false);
    expect(
      buildConfig(
        { NEXT_PUBLIC_DEPLOYMENT_BLOCK: "18446744073709551616" },
        artifact,
      ).configured,
    ).toBe(false);
  });

  it("uses a fixed localhost-only RPC in local mode and binds it to Foundry's chain", () => {
    const config = buildConfig(
      {
        NEXT_PUBLIC_ENABLE_LOCAL_CHAIN: "true",
        NEXT_PUBLIC_CHAIN_ID: "31337",
        NEXT_PUBLIC_USDC_ADDRESS: addresses.currency,
        NEXT_PUBLIC_REGISTRY_ADDRESS: addresses.registry,
        NEXT_PUBLIC_KIRA_TOKEN_ADDRESS: addresses.kira,
        NEXT_PUBLIC_OFFERING_ADDRESS: addresses.offering,
        NEXT_PUBLIC_MARKETPLACE_ADDRESS: addresses.marketplace,
        NEXT_PUBLIC_DEMO_ACCESS_ADDRESS: addresses.demoAccess,
        NEXT_PUBLIC_DEPLOYMENT_BLOCK: "1",
      },
      artifact,
    );
    expect(config.configured).toBe(true);
    expect(config.rpcUrls).toEqual(["http://127.0.0.1:8547"]);
    expect(config.chain.id).toBe(31_337);
  });
});
