import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const importer = resolve(root, "scripts", "import-deployment.mjs");
const addresses = ["11", "22", "33", "44", "55", "66", "77"].map((part) => `0x${part.repeat(20)}`);
const fixture = () => ({
  chainId: 31337,
  admin: addresses[0], currency: addresses[1], registry: addresses[2], kira: addresses[3],
  offering: addresses[4], marketplace: addresses[5], demoAccess: addresses[6],
  commitStart: 100, commitEnd: 200, revealEnd: 300,
});

function workspace() { return mkdtempSync(resolve(root, "scripts", ".tmp-import-deployment-")); }
function run(directory, manifest, ...arguments_) {
  const source = resolve(directory, "manifest.json");
  writeFileSync(source, manifest);
  return execFileSync(process.execPath, [importer, source, "123", ...arguments_], { cwd: root, encoding: "utf8", stdio: "pipe" });
}

test("rejects a malformed manifest before writing configuration", () => {
  const directory = workspace();
  try {
    assert.throws(() => run(directory, "{not-json", "--local-env", ".omc/unused.env"), /SyntaxError/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("rejects unknown manifest fields and malformed addresses", () => {
  const directory = workspace();
  try {
    assert.throws(() => run(directory, JSON.stringify({ ...fixture(), attacker: addresses[0] }), "--local-env", ".omc/unused.env"), /Unknown manifest field/);
    assert.throws(() => run(directory, JSON.stringify({ ...fixture(), marketplace: "not-an-address" }), "--local-env", ".omc/unused.env"), /Invalid marketplace address/);
    assert.throws(() => run(directory, JSON.stringify({ ...fixture(), admin: "0x0000000000000000000000000000000000000000" }), "--local-env", ".omc/unused.env"), /Zero admin address/);
    assert.throws(() => run(directory, JSON.stringify({ ...fixture(), registry: addresses[0] }), "--local-env", ".omc/unused.env"), /addresses must be unique/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("preserves unrelated local env values and comments while replacing known public fields", () => {
  const directory = workspace();
  const output = `.omc/import-deployment-test-${Date.now()}-${Math.random().toString(16).slice(2)}.env`;
  const target = resolve(root, output);
  try {
    mkdirSync(resolve(root, ".omc"), { recursive: true });
    writeFileSync(target, "# Keep this comment\nUNRELATED_VALUE=preserved\nNEXT_PUBLIC_CHAIN_ID=999\nNEXT_PUBLIC_RPC_URL=http://old.invalid\n");
    run(directory, JSON.stringify(fixture()), "--local-env", output);
    const content = readFileSync(target, "utf8");
    assert.match(content, /^# Keep this comment$/m);
    assert.match(content, /^UNRELATED_VALUE=preserved$/m);
    assert.match(content, /^NEXT_PUBLIC_CHAIN_ID=31337$/m);
    assert.match(content, /^NEXT_PUBLIC_RPC_URL=http:\/\/127\.0\.0\.1:8547$/m);
    assert.match(content, new RegExp(`^NEXT_PUBLIC_MARKETPLACE_ADDRESS=${fixture().marketplace}$`, "m"));
  } finally {
    rmSync(target, { force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects noncanonical blocks and paths that escape or overwrite tracked files", () => {
  const directory = workspace();
  try {
    const source = resolve(directory, "manifest.json");
    writeFileSync(source, JSON.stringify(fixture()));
    const invoke = (block, output) => execFileSync(process.execPath, [importer, source, block, "--local-env", output], { cwd: root, encoding: "utf8", stdio: "pipe" });
    assert.throws(() => invoke("0", ".omc/unused.env"), /Usage/);
    assert.throws(() => invoke("001", ".omc/unused.env"), /Usage/);
    assert.throws(() => invoke("18446744073709551616", ".omc/unused.env"), /Usage/);
    assert.throws(() => invoke("123", "../README.md"), /stay inside the repository/);
    assert.throws(() => invoke("123", "README.md"), /ignored .env path/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("rejects an .omc output that traverses a directory symlink", () => {
  const directory = workspace();
  const link = resolve(root, ".omc", `import-link-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  try {
    mkdirSync(resolve(root, ".omc"), { recursive: true });
    symlinkSync(directory, link, "junction");
    assert.throws(() => run(directory, JSON.stringify(fixture()), "--local-env", `${relative(root, link)}/new-dir/output.env`), /must not traverse a symlink/);
    assert.equal(existsSync(resolve(directory, "new-dir")), false, "must reject before mkdir can write through the junction");
  } finally {
    rmSync(link, { recursive: true, force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});

test("refuses an existing local env path whose parent is a junction", () => {
  const directory = workspace();
  const link = resolve(root, ".omc", `import-output-link-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const victim = resolve(directory, ".env.local");
  try {
    writeFileSync(victim, "do not overwrite\n");
    mkdirSync(resolve(root, ".omc"), { recursive: true });
    symlinkSync(directory, link, "junction");
    assert.throws(() => run(directory, JSON.stringify(fixture()), "--local-env", `${relative(root, link)}/.env.local`), /must not traverse a symlink/);
    assert.equal(readFileSync(victim, "utf8"), "do not overwrite\n");
  } finally {
    rmSync(link, { recursive: true, force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});

test("rejects a public-chain manifest directed at a local environment file", () => {
  const directory = workspace();
  try {
    assert.throws(() => run(directory, JSON.stringify({ ...fixture(), chainId: 421614 }), "--local-env", ".omc/unused.env"), /cannot be imported into a local environment file/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
