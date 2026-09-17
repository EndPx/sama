# Bounded Settlement Gas Evidence

## Scope

`KiranaOfferingTest.testSettlementOf64MarginalBidsStaysWithinGasCeiling` measures only the `offering.settle(ordered)` call. All deployment, eligibility, minting, approval, commitment, and reveal work happens before the `gasleft()` measurement.

The fixture has exactly 64 deterministic, ascending addresses. Every bid reveals a max FDV of 4.8M USDC, so every bid belongs to the marginal tier. Sixty-three bids commit 7,500 USDC and the final bid commits 7,500 USDC plus one base unit. The total demand is one USDC base unit above the 480,000 USDC clearing capacity. Integer division leaves 63 units of dust, which the offering redistributes deterministically to the first 63 addresses in the sorted marginal tier.

## Arbitrum Sepolia constraint evidence

On 2026-09-16T20:20:16Z, `eth_getBlockByNumber("latest", false)` against the official Arbitrum Sepolia RPC endpoint, `https://sepolia-rollup.arbitrum.io/rpc`, returned:

- Arbitrum block: `309606360` (`0x127437d8`)
- Block hash: `0xa4ffca096120a6aa36a467f869c4640890682ddde6d45719ab3524e9e85d3d6d`
- Reported `gasLimit`: `1,125,899,906,842,624` (`0x4000000000000`)

The [official Arbitrum block-gas-limit documentation](https://docs.arbitrum.io/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time) explains that this reported value is deliberately artificial because it includes parent-chain posting costs, and that Arbitrum has an effective execution-gas cap of 32,000,000.

## Regression gate

The dedicated test measured `settle(64)` at **2,120,427 gas** on the local Foundry EVM. Its programmatic `MAX_SETTLE_GAS` ceiling is **2,500,000 gas**, leaving **379,573 gas (17.90%)** of regression margin. The dedicated test remains well below the documented 32,000,000 effective execution-gas cap. Foundry also records the full test transaction in the gas snapshot for visibility, but that number includes fixture setup and is not the regression gate.

Foundry's local EVM gas is a regression proxy, not a claim about final Arbitrum transaction cost. A testnet deployment must still measure the submitted transaction with Arbitrum's current gas model and calldata pricing.
