export function networkDisplay(localMode: boolean) {
  return localMode
    ? { name: "Local Anvil", badge: "Local Anvil · disposable fixture" }
    : { name: "Arbitrum Sepolia", badge: "Arbitrum Sepolia · Testnet" };
}

export const currentNetwork = networkDisplay(
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN === "true",
);
