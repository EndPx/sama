/**
 * Reproduces the locked five-bid auction fixture and a two-buyer marketplace
 * fill on a local, unlocked Anvil only. It never accepts a testnet RPC.
 *
 * Usage: node apps/web/scripts/local-acceptance.mjs [http://127.0.0.1:8547] [--prepare-only]
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";

const root = resolve(import.meta.dirname, "..", "..", "..");
const contractsRoot = resolve(root, "packages/contracts");
const arguments_ = process.argv.slice(2);
const prepareOnly = arguments_.includes("--prepare-only");
const rpcArguments = arguments_.filter(
  (argument) => argument !== "--prepare-only",
);
if (rpcArguments.length > 1)
  throw new Error(
    "Usage: node apps/web/scripts/local-acceptance.mjs [rpc-url] [--prepare-only]",
  );
const rpcUrl = rpcArguments[0] ?? "http://127.0.0.1:8547";
const forge = process.env.FORGE_BIN ?? "forge";
const acceptanceDir = resolve(root, ".omc", "local-acceptance");
const manifestPath = resolve(acceptanceDir, "deployment-31337.json");
const evidencePath = resolve(acceptanceDir, "evidence.json");
const temporaryManifest = resolve(contractsRoot, "deployments", "31337.json");
const broadcastPath = resolve(
  contractsRoot,
  "broadcast",
  "Deploy.s.sol",
  "31337",
  "run-latest.json",
);
const chain = {
  id: 31337,
  name: "local-anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
};
const USDC = 1_000_000n;
const KIRA = 1_000_000_000_000_000_000n;

const erc20 = parseAbi([
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function cap() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
]);
const registryAbi = parseAbi([
  "function REGISTRAR_ROLE() view returns (bytes32)",
  "function isEligible(address) view returns (bool)",
  "function hasRole(bytes32,address) view returns (bool)",
]);
const kiraAbi = [
  ...erc20,
  ...parseAbi([
    "function MINTER_ROLE() view returns (bytes32)",
    "function hasRole(bytes32,address) view returns (bool)",
  ]),
];
const accessAbi = parseAbi(["function join()"]);
const offeringAbi = parseAbi([
  "function commitmentFor(address,uint256,uint256,bytes32) view returns (bytes32)",
  "function commitBid(bytes32,uint128)",
  "function revealBid(uint128,uint64,bytes32)",
  "function settle(address[])",
  "function claimTokens()",
  "function claimRefund()",
  "function withdrawIssuerProceeds()",
  "function clearingFdv() view returns (uint256)",
  "function acceptedTotal() view returns (uint256)",
  "function acceptedOf(address) view returns (uint256)",
  "function refundable(address) view returns (uint256)",
  "function tokenAllocation(address) view returns (uint256)",
  "function phase() view returns (uint8)",
  "function offeredSupply() view returns (uint128)",
  "function totalCommitted() view returns (uint256)",
]);
const marketplaceAbi = parseAbi([
  "function createListing(uint128,uint128) returns (uint256)",
  "function quotePurchase(uint256,uint128) view returns (uint256)",
  "function buy(uint256,uint128,uint128)",
  "function outstandingKiraEscrow() view returns (uint256)",
  "function listings(uint256) view returns (address,uint128,uint128,uint128,uint128,uint8)",
]);

function assert(condition, message) {
  if (!condition) throw new Error(`Acceptance assertion failed: ${message}`);
}
function hexNonce(index) {
  return `0x${index.toString(16).padStart(64, "0")}`;
}
async function receipt(client, hash, label) {
  const value = await client.waitForTransactionReceipt({ hash });
  assert(value.status === "success", `${label} transaction reverted`);
  return value;
}
function assertLoopbackHttp(url) {
  const parsed = new URL(url);
  assert(
    parsed.protocol === "http:",
    "local acceptance requires an http RPC URL",
  );
  assert(
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname),
    "local acceptance requires a loopback RPC hostname",
  );
}

async function main() {
  assertLoopbackHttp(rpcUrl);
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
  const chainId = await publicClient.getChainId();
  assert(
    chainId === 31337,
    `refusing RPC chain ${chainId}; local Anvil (31337) is required`,
  );
  const accounts = await publicClient.request({ method: "eth_accounts" });
  assert(
    accounts.length >= 8,
    "Anvil must expose at least eight unlocked accounts",
  );
  const [admin, a, b, c, d, e, buyerOne, buyerTwo] = accounts;
  const wallet = (account) =>
    createWalletClient({ account, chain, transport: http(rpcUrl) });
  const block = await publicClient.getBlock();
  const commitStart = Number(block.timestamp);
  const commitDuration = 15 * 60;
  const deployEnv = {
    ...process.env,
    DEPLOYER_ADDRESS: admin,
    COMMIT_START: String(commitStart),
    COMMIT_END: String(commitStart + commitDuration),
    REVEAL_END: String(commitStart + commitDuration + 60),
  };
  const previousManifest = existsSync(temporaryManifest)
    ? readFileSync(temporaryManifest)
    : undefined;
  let manifest;
  let deploymentBlock;
  try {
    execFileSync(
      forge,
      [
        "script",
        "script/Deploy.s.sol:Deploy",
        "--root",
        contractsRoot,
        "--rpc-url",
        rpcUrl,
        "--broadcast",
        "--unlocked",
        "--sender",
        admin,
      ],
      { cwd: contractsRoot, env: deployEnv, stdio: "inherit" },
    );
    assert(
      existsSync(temporaryManifest),
      "deployment script did not export its manifest",
    );
    manifest = JSON.parse(readFileSync(temporaryManifest, "utf8"));
    const broadcast = JSON.parse(readFileSync(broadcastPath, "utf8"));
    assert(
      broadcast.transactions?.[0]?.hash,
      "deployment broadcast has no first transaction hash",
    );
    deploymentBlock = (
      await publicClient.getTransactionReceipt({
        hash: broadcast.transactions[0].hash,
      })
    ).blockNumber;
  } finally {
    if (previousManifest) writeFileSync(temporaryManifest, previousManifest);
    else if (existsSync(temporaryManifest)) rmSync(temporaryManifest);
  }
  mkdirSync(acceptanceDir, { recursive: true });
  assert(manifest.chainId === 31337, "manifest is not local Anvil");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  // Role, asset, cap, and local-only deployment checks.
  const [
    currencyDecimals,
    kiraDecimals,
    cap,
    offeredSupply,
    registrarRole,
    minterRole,
  ] = await Promise.all([
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "decimals",
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "decimals",
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "cap",
    }),
    publicClient.readContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "offeredSupply",
    }),
    publicClient.readContract({
      address: manifest.registry,
      abi: registryAbi,
      functionName: "REGISTRAR_ROLE",
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: kiraAbi,
      functionName: "MINTER_ROLE",
    }),
  ]);
  assert(
    currencyDecimals === 6 && kiraDecimals === 18,
    "token decimals mismatch",
  );
  assert(
    cap === 1_000_000n * KIRA && offeredSupply === 1_000_000n * KIRA,
    "KIRA cap or offering supply mismatch",
  );
  assert(
    await publicClient.readContract({
      address: manifest.registry,
      abi: registryAbi,
      functionName: "hasRole",
      args: [registrarRole, manifest.demoAccess],
    }),
    "demo access is not registrar",
  );
  assert(
    await publicClient.readContract({
      address: manifest.kira,
      abi: kiraAbi,
      functionName: "hasRole",
      args: [minterRole, manifest.offering],
    }),
    "offering is not KIRA minter",
  );
  assert(
    await publicClient.readContract({
      address: manifest.registry,
      abi: registryAbi,
      functionName: "isEligible",
      args: [manifest.marketplace],
    }),
    "marketplace is not eligible",
  );
  if (prepareOnly) {
    assert(
      (await publicClient.readContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "phase",
      })) === 1,
      "prepared offering is not in COMMIT phase",
    );
    execFileSync(
      process.execPath,
      [
        resolve(root, "scripts", "import-deployment.mjs"),
        manifestPath,
        deploymentBlock.toString(),
        "--local-env",
        ".omc/local-acceptance/web.env",
      ],
      { cwd: root, stdio: "inherit" },
    );
    const evidence = {
      chainId,
      rpcUrl,
      generatedAt: new Date().toISOString(),
      mode: "prepare-only",
      offeringPhase: "COMMIT",
      deploymentBlock: deploymentBlock.toString(),
      manifest,
      helpers: {
        rpcUrl,
        manifestPath: ".omc/local-acceptance/deployment-31337.json",
        localEnvPath: ".omc/local-acceptance/web.env",
        localEnvCommand: `node scripts/import-deployment.mjs .omc/local-acceptance/deployment-31337.json ${deploymentBlock} --local-env .omc/local-acceptance/web.env`,
      },
    };
    writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(
      JSON.stringify(
        {
          mode: "prepare-only",
          evidencePath,
          manifestPath,
          contracts: manifest,
        },
        null,
        2,
      ),
    );
    return;
  }

  const bidders = [a, b, c, d, e];
  for (const account of [...bidders, buyerOne, buyerTwo]) {
    await receipt(
      publicClient,
      await wallet(account).writeContract({
        address: manifest.demoAccess,
        abi: accessAbi,
        functionName: "join",
      }),
      `join ${account}`,
    );
    await receipt(
      publicClient,
      await wallet(account).writeContract({
        address: manifest.currency,
        abi: parseAbi(["function claim()"]),
        functionName: "claim",
      }),
      `faucet ${account}`,
    );
  }
  const fixture = [
    {
      account: a,
      amount: 100_000n * USDC,
      fdv: 4_500_000n * USDC,
      nonce: hexNonce(1),
      name: "A",
    },
    {
      account: b,
      amount: 150_000n * USDC,
      fdv: 4_800_000n * USDC,
      nonce: hexNonce(2),
      name: "B",
    },
    {
      account: c,
      amount: 100_000n * USDC,
      fdv: 5_000_000n * USDC,
      nonce: hexNonce(3),
      name: "C",
    },
    {
      account: d,
      amount: 200_000n * USDC,
      fdv: 5_200_000n * USDC,
      nonce: hexNonce(4),
      name: "D",
    },
    {
      account: e,
      amount: 150_000n * USDC,
      fdv: 5_400_000n * USDC,
      nonce: hexNonce(5),
      name: "E",
    },
  ];
  for (const bid of fixture) {
    const commitment = await publicClient.readContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "commitmentFor",
      args: [bid.account, bid.amount, bid.fdv, bid.nonce],
    });
    bid.commitment = commitment;
    await receipt(
      publicClient,
      await wallet(bid.account).writeContract({
        address: manifest.currency,
        abi: erc20,
        functionName: "approve",
        args: [manifest.offering, bid.amount],
      }),
      `${bid.name} approve`,
    );
    await receipt(
      publicClient,
      await wallet(bid.account).writeContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "commitBid",
        args: [commitment, bid.amount],
      }),
      `${bid.name} commit`,
    );
  }
  const beforeReveal = await publicClient.getBlock();
  await publicClient.request({
    method: "evm_increaseTime",
    params: [Number(manifest.commitEnd) - Number(beforeReveal.timestamp) + 1],
  });
  await publicClient.request({ method: "evm_mine" });
  for (const bid of fixture)
    await receipt(
      publicClient,
      await wallet(bid.account).writeContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "revealBid",
        args: [bid.amount, bid.fdv, bid.nonce],
      }),
      `${bid.name} reveal`,
    );
  const beforeSettlement = await publicClient.getBlock();
  await publicClient.request({
    method: "evm_increaseTime",
    params: [
      Number(manifest.revealEnd) - Number(beforeSettlement.timestamp) + 1,
    ],
  });
  await publicClient.request({ method: "evm_mine" });
  const ordered = [e, d, c, b, a];
  await receipt(
    publicClient,
    await wallet(admin).writeContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "settle",
      args: [ordered],
    }),
    "settle reference auction",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "clearingFdv",
    })) ===
      4_800_000n * USDC,
    "clearing FDV is not 4.8m",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "acceptedTotal",
    })) ===
      480_000n * USDC,
    "accepted total is not 480k",
  );
  const expectedAccepted = [0n, 30_000n, 100_000n, 200_000n, 150_000n].map(
    (v) => v * USDC,
  );
  const expectedRefund = [100_000n, 120_000n, 0n, 0n, 0n].map((v) => v * USDC);
  for (let index = 0; index < fixture.length; index += 1) {
    assert(
      (await publicClient.readContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "acceptedOf",
        args: [fixture[index].account],
      })) === expectedAccepted[index],
      `${fixture[index].name} accepted amount`,
    );
    assert(
      (await publicClient.readContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "refundable",
        args: [fixture[index].account],
      })) === expectedRefund[index],
      `${fixture[index].name} refund amount`,
    );
  }
  for (const bid of [b, c, d, e])
    await receipt(
      publicClient,
      await wallet(bid).writeContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "claimTokens",
      }),
      `claim KIRA ${bid}`,
    );
  for (const bid of [a, b])
    await receipt(
      publicClient,
      await wallet(bid).writeContract({
        address: manifest.offering,
        abi: offeringAbi,
        functionName: "claimRefund",
      }),
      `claim refund ${bid}`,
    );
  await receipt(
    publicClient,
    await wallet(admin).writeContract({
      address: manifest.offering,
      abi: offeringAbi,
      functionName: "withdrawIssuerProceeds",
    }),
    "withdraw issuer proceeds",
  );
  const claimedSupply = await publicClient.readContract({
    address: manifest.kira,
    abi: erc20,
    functionName: "totalSupply",
  });
  assert(
    claimedSupply <= 1_000_000n * KIRA &&
      1_000_000n * KIRA - claimedSupply < fixture.length,
    "claimed KIRA exceeds the offering or leaves more than allocation-rounding dust",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [manifest.offering],
    })) === 0n,
    "offering USDC escrow did not clear after claims and issuer withdrawal",
  );

  // A 200k KIRA / 100k demoUSDC listing: buyer one fills 50k, buyer two fills the exact remainder.
  const listed = 200_000n * KIRA;
  const price = 100_000n * USDC;
  const [
    sellerKiraBefore,
    sellerUsdcBefore,
    buyerOneKiraBefore,
    buyerOneUsdcBefore,
    buyerTwoKiraBefore,
    buyerTwoUsdcBefore,
  ] = await Promise.all([
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [e],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [e],
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerOne],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerOne],
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerTwo],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerTwo],
    }),
  ]);
  await receipt(
    publicClient,
    await wallet(e).writeContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "approve",
      args: [manifest.marketplace, listed],
    }),
    "seller approve listing",
  );
  await receipt(
    publicClient,
    await wallet(e).writeContract({
      address: manifest.marketplace,
      abi: marketplaceAbi,
      functionName: "createListing",
      args: [listed, price],
    }),
    "create listing",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [manifest.marketplace],
    })) === listed,
    "marketplace KIRA balance does not cover newly listed escrow",
  );
  const firstFill = 50_000n * KIRA;
  const firstCost = await publicClient.readContract({
    address: manifest.marketplace,
    abi: marketplaceAbi,
    functionName: "quotePurchase",
    args: [1n, firstFill],
  });
  assert(firstCost === 25_000n * USDC, "partial-fill quote mismatch");
  await receipt(
    publicClient,
    await wallet(buyerOne).writeContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "approve",
      args: [manifest.marketplace, firstCost],
    }),
    "buyer one approve",
  );
  await receipt(
    publicClient,
    await wallet(buyerOne).writeContract({
      address: manifest.marketplace,
      abi: marketplaceAbi,
      functionName: "buy",
      args: [1n, firstFill, firstCost],
    }),
    "partial fill",
  );
  const partial = await publicClient.readContract({
    address: manifest.marketplace,
    abi: marketplaceAbi,
    functionName: "listings",
    args: [1n],
  });
  assert(
    partial[3] === 150_000n * KIRA &&
      partial[4] === 75_000n * USDC &&
      partial[5] === 1,
    "partial listing accounting mismatch",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerOne],
    })) ===
      buyerOneKiraBefore + firstFill &&
      (await publicClient.readContract({
        address: manifest.currency,
        abi: erc20,
        functionName: "balanceOf",
        args: [buyerOne],
      })) ===
        buyerOneUsdcBefore - firstCost &&
      (await publicClient.readContract({
        address: manifest.currency,
        abi: erc20,
        functionName: "balanceOf",
        args: [e],
      })) ===
        sellerUsdcBefore + firstCost,
    "partial-fill buyer or seller balance delta mismatch",
  );
  const finalCost = await publicClient.readContract({
    address: manifest.marketplace,
    abi: marketplaceAbi,
    functionName: "quotePurchase",
    args: [1n, partial[3]],
  });
  assert(finalCost === 75_000n * USDC, "final-fill quote mismatch");
  await receipt(
    publicClient,
    await wallet(buyerTwo).writeContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "approve",
      args: [manifest.marketplace, finalCost],
    }),
    "buyer two approve",
  );
  await receipt(
    publicClient,
    await wallet(buyerTwo).writeContract({
      address: manifest.marketplace,
      abi: marketplaceAbi,
      functionName: "buy",
      args: [1n, partial[3], finalCost],
    }),
    "final fill",
  );
  const finalListing = await publicClient.readContract({
    address: manifest.marketplace,
    abi: marketplaceAbi,
    functionName: "listings",
    args: [1n],
  });
  assert(
    finalListing[3] === 0n && finalListing[4] === 0n && finalListing[5] === 2,
    "listing did not close cleanly",
  );
  assert(
    (await publicClient.readContract({
      address: manifest.marketplace,
      abi: marketplaceAbi,
      functionName: "outstandingKiraEscrow",
    })) === 0n,
    "marketplace escrow did not return to zero",
  );
  const [
    sellerKiraAfter,
    sellerUsdcAfter,
    buyerOneKiraAfter,
    buyerTwoKiraAfter,
    buyerTwoUsdcAfter,
    marketKiraAfter,
    marketUsdcAfter,
  ] = await Promise.all([
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [e],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [e],
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerOne],
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerTwo],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [buyerTwo],
    }),
    publicClient.readContract({
      address: manifest.kira,
      abi: erc20,
      functionName: "balanceOf",
      args: [manifest.marketplace],
    }),
    publicClient.readContract({
      address: manifest.currency,
      abi: erc20,
      functionName: "balanceOf",
      args: [manifest.marketplace],
    }),
  ]);
  assert(
    sellerKiraAfter === sellerKiraBefore - listed &&
      sellerUsdcAfter === sellerUsdcBefore + price,
    "seller final listing deltas mismatch",
  );
  assert(
    buyerOneKiraAfter === buyerOneKiraBefore + firstFill &&
      buyerTwoKiraAfter === buyerTwoKiraBefore + listed - firstFill &&
      buyerTwoUsdcAfter === buyerTwoUsdcBefore - finalCost,
    "buyer final listing deltas mismatch",
  );
  assert(
    marketKiraAfter === 0n && marketUsdcAfter === 0n,
    "marketplace retained protocol-accounted assets",
  );
  const evidence = {
    chainId,
    rpcUrl,
    generatedAt: new Date().toISOString(),
    manifest,
    fixture: {
      clearingFdv: "4800000000000",
      acceptedTotal: "480000000000",
      claimedKiraSupply: claimedSupply.toString(),
      refunds: { A: "100000000000", B: "120000000000" },
    },
    marketplace: {
      listingId: "1",
      originalKira: listed.toString(),
      originalUsdc: price.toString(),
      firstFillKira: firstFill.toString(),
      firstCostUsdc: firstCost.toString(),
      finalCostUsdc: finalCost.toString(),
      outstandingKiraEscrow: "0",
    },
    helpers: {
      rpcUrl,
      manifestPath: ".omc/local-acceptance/deployment-31337.json",
      browserEnvCommand: `node scripts/import-deployment.mjs .omc/local-acceptance/deployment-31337.json ${deploymentBlock} --local-env .omc/local-acceptance/web.env`,
    },
  };
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { evidencePath, manifestPath, contracts: manifest },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
