import { isAddress, type Address, type Chain } from "viem";
import { arbitrumSepolia, foundry } from "viem/chains";
import deployment from "@sama/chain/deployment";

const LOCAL_RPC_URL = "http://127.0.0.1:8547";
const PUBLISHED_DOCS_URL =
  "https://sama-3.gitbook.io/sama-product-and-protocol/";
const addressKeys = [
  "currency",
  "registry",
  "kira",
  "offering",
  "marketplace",
  "demoAccess",
] as const;
type AddressKey = (typeof addressKeys)[number];
type Environment = Record<string, string | undefined>;
type Deployment = Record<AddressKey, string> & {
  chainId: number;
  deploymentBlock: string;
};

export type AppConfig = {
  localMode: boolean;
  chain: Chain;
  rpcUrls: readonly string[];
  contracts: Record<AddressKey, Address | undefined>;
  configured: boolean;
  configurationError?: string;
  deploymentBlock: bigint;
};

function parsePositiveInteger(value: string | undefined): bigint | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  try {
    const parsed = BigInt(value);
    return parsed <= (1n << 64n) - 1n ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function validAddress(value: string | undefined): Address | undefined {
  return value && isAddress(value) && !/^0x0{40}$/i.test(value)
    ? value
    : undefined;
}

/** Builds public configuration without exposing environment values in errors or logs. */
export function buildConfig(env: Environment, artifact: Deployment): AppConfig {
  const localMode = env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN === "true";
  const chain = localMode
    ? { ...foundry, rpcUrls: { default: { http: [LOCAL_RPC_URL] } } }
    : arbitrumSepolia;
  const configuredChainId = parsePositiveInteger(
    env.NEXT_PUBLIC_CHAIN_ID ?? String(artifact.chainId),
  );
  const contracts = {
    currency: validAddress(env.NEXT_PUBLIC_USDC_ADDRESS || artifact.currency),
    registry: validAddress(
      env.NEXT_PUBLIC_REGISTRY_ADDRESS || artifact.registry,
    ),
    kira: validAddress(env.NEXT_PUBLIC_KIRA_TOKEN_ADDRESS || artifact.kira),
    offering: validAddress(
      env.NEXT_PUBLIC_OFFERING_ADDRESS || artifact.offering,
    ),
    marketplace: validAddress(
      env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || artifact.marketplace,
    ),
    demoAccess: validAddress(
      env.NEXT_PUBLIC_DEMO_ACCESS_ADDRESS || artifact.demoAccess,
    ),
  };
  const deploymentBlock =
    parsePositiveInteger(
      env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || artifact.deploymentBlock,
    ) ?? 0n;
  const correctChain = configuredChainId === BigInt(chain.id);
  const allAddresses = addressKeys.every((key) => contracts[key] !== undefined);
  const configurationError = !correctChain
    ? "Contract configuration is for a different chain."
    : !allAddresses
      ? "All six contract addresses must be valid nonzero addresses."
      : deploymentBlock === 0n
        ? "Deployment block must be a positive uint64 value."
        : undefined;
  return {
    localMode,
    chain,
    rpcUrls: localMode
      ? [LOCAL_RPC_URL]
      : [
          "https://sepolia-rollup.arbitrum.io/rpc",
          "https://arbitrum-sepolia-rpc.publicnode.com",
        ],
    contracts,
    configured: configurationError === undefined,
    configurationError,
    deploymentBlock,
  };
}

const appConfig = buildConfig(
  {
    NEXT_PUBLIC_ENABLE_LOCAL_CHAIN: process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    NEXT_PUBLIC_KIRA_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_KIRA_TOKEN_ADDRESS,
    NEXT_PUBLIC_OFFERING_ADDRESS: process.env.NEXT_PUBLIC_OFFERING_ADDRESS,
    NEXT_PUBLIC_MARKETPLACE_ADDRESS:
      process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
    NEXT_PUBLIC_DEMO_ACCESS_ADDRESS:
      process.env.NEXT_PUBLIC_DEMO_ACCESS_ADDRESS,
    NEXT_PUBLIC_DEPLOYMENT_BLOCK: process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK,
  },
  deployment as Deployment,
);
export const {
  localMode,
  chain,
  rpcUrls,
  contracts,
  configured,
  deploymentBlock,
} = appConfig;
export const configurationError = appConfig.configurationError;
export const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
export const docsUrl = PUBLISHED_DOCS_URL;
export const explorer = localMode ? undefined : "https://sepolia.arbiscan.io";
export const txUrl = (hash: string) =>
  explorer ? `${explorer}/tx/${hash}` : undefined;
export const addressUrl = (value: string) =>
  explorer ? `${explorer}/address/${value}` : undefined;
