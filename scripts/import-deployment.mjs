import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const isOutside = (base, candidate) => {
  const value = relative(base, candidate);
  return !value || isAbsolute(value) || value === ".." || value.startsWith(`..${String.fromCharCode(92)}`) || value.startsWith("../");
};

function statIfPresent(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === "ENOENT") return undefined; throw error; }
}

function canonicalTarget(target) {
  const parts = [];
  let ancestor = target;
  let stat = statIfPresent(ancestor);
  if (stat?.isSymbolicLink()) throw new Error("Local env output cannot be a symlink.");
  while (!stat) {
    const parent = dirname(ancestor);
    if (parent === ancestor) throw new Error("Local env output has no existing ancestor.");
    parts.unshift(basename(ancestor));
    ancestor = parent;
    stat = statIfPresent(ancestor);
  }
  return resolve(realpathSync.native(ancestor), ...parts);
}

function assertSafeLocalOutput(target, underOmc) {
  const realRoot = realpathSync.native(root);
  const realTarget = canonicalTarget(target);
  if (isOutside(realRoot, realTarget)) throw new Error("Local env output resolves outside the repository.");
  if (underOmc) {
    // .omc may not exist yet; canonicalTarget resolves its nearest existing parent
    // without creating it, preserving the validation-before-mkdir ordering.
    const realOmc = canonicalTarget(resolve(root, ".omc"));
    if (isOutside(realOmc, realTarget)) throw new Error("Local .omc output must not traverse a symlink.");
  }
}
const source = process.argv[2];
const block = process.argv[3];
const localEnvArgument = process.argv[4] === "--local-env" ? process.argv[5] : undefined;
if (!source || !block || !/^(?:[1-9][0-9]*)$/.test(block) || BigInt(block) > 18_446_744_073_709_551_615n || (process.argv.length !== 4 && (process.argv.length !== 6 || !localEnvArgument))) {
  throw new Error("Usage: node scripts/import-deployment.mjs <manifest.json> <deployment-block> [--local-env <repo-relative-path>]");
}
const manifest = JSON.parse(readFileSync(resolve(source), "utf8"));
const manifestKeys = ["chainId", "admin", "currency", "registry", "kira", "offering", "marketplace", "demoAccess", "commitStart", "commitEnd", "revealEnd"];
if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("Manifest must be an object.");
for (const key of Object.keys(manifest)) if (!manifestKeys.includes(key)) throw new Error(`Unknown manifest field: ${key}`);
if (![31337, 421614].includes(manifest.chainId)) throw new Error("Only local Anvil or Arbitrum Sepolia allowed.");
for (const key of ["admin", "currency", "registry", "kira", "offering", "marketplace", "demoAccess"]) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(manifest[key])) throw new Error(`Invalid ${key} address`);
  if (manifest[key].toLowerCase() === "0x0000000000000000000000000000000000000000") throw new Error(`Zero ${key} address`);
}
const addressValues = ["admin", "currency", "registry", "kira", "offering", "marketplace", "demoAccess"].map((key) => manifest[key].toLowerCase());
if (new Set(addressValues).size !== addressValues.length) throw new Error("Deployment addresses must be unique.");
for (const key of ["commitStart", "commitEnd", "revealEnd"]) if (!Number.isSafeInteger(manifest[key]) || manifest[key] < 0) throw new Error(`Invalid ${key}`);
if (!(manifest.commitStart < manifest.commitEnd && manifest.commitEnd < manifest.revealEnd)) throw new Error("Invalid offering schedule.");
if (manifest.chainId === 421614 && localEnvArgument) throw new Error("An Arbitrum Sepolia manifest cannot be imported into a local environment file.");
const destination = manifest.chainId === 31337 ? (localEnvArgument ?? "apps/web/.env.local") : "packages/chain/src/deployment.json";
if (manifest.chainId === 31337) {
  const target = resolve(root, destination);
  const targetRelative = relative(root, target);
  if (isOutside(root, target)) throw new Error("Local env output must stay inside the repository.");
  const targetName = basename(target);
  const underOmc = targetRelative === ".omc" || targetRelative.startsWith(`.omc${String.fromCharCode(92)}`) || targetRelative.startsWith(".omc/");
  if (!underOmc && targetName !== ".env" && targetName !== ".env.local") throw new Error("Local env output must be an ignored .env path or be under .omc.");
  // Resolve an existing ancestor before creating directories: a junction must never
  // turn a lexical in-repository path into an external write.
  assertSafeLocalOutput(target, underOmc);
  mkdirSync(dirname(target), { recursive: true });
  // Recheck after mkdir in case an existing path changed while directories were made.
  assertSafeLocalOutput(target, underOmc);
  // Local configuration has only public addresses and a loopback URL; no wallet keys.
  const mapping = {currency:"USDC", registry:"REGISTRY", kira:"KIRA_TOKEN", offering:"OFFERING", marketplace:"MARKETPLACE", demoAccess:"DEMO_ACCESS"};
  const updates = Object.fromEntries([
    ["NEXT_PUBLIC_ENABLE_LOCAL_CHAIN", "true"],
    ["NEXT_PUBLIC_CHAIN_ID", "31337"],
    ["NEXT_PUBLIC_RPC_URL", "http://127.0.0.1:8547"],
    ["NEXT_PUBLIC_DEPLOYMENT_BLOCK", block],
    ...Object.entries(mapping).map(([key, env]) => [`NEXT_PUBLIC_${env}_ADDRESS`, manifest[key]]),
  ]);
  let lines = [];
  try { lines = readFileSync(target, "utf8").split(/\r?\n/); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const seen = new Set();
  lines = lines.map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=.*/);
    if (!match || !(match[1] in updates)) return line;
    seen.add(match[1]);
    return `${match[1]}=${updates[match[1]]}`;
  });
  for (const [key, value] of Object.entries(updates)) if (!seen.has(key)) lines.push(`${key}=${value}`);
  writeFileSync(target, `${lines.filter((line, index, all) => line || index < all.length - 1).join("\n")}\n`);
} else {
  const target = resolve(root, destination);
  if (statIfPresent(target)?.isSymbolicLink()) throw new Error("Public deployment output cannot be a symlink.");
  writeFileSync(target, JSON.stringify({...manifest, status:"deployed", assetLabel:"demoUSDC", deploymentBlock:block}, null, 2) + "\n");
}
console.log(`Imported chain ${manifest.chainId} public configuration into ${destination}.`);
