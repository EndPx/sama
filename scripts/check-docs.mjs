import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const summary = readFileSync(resolve(root, "docs/SUMMARY.md"), "utf8");
const pages = [...summary.matchAll(/^\s*- \[([^\]]+)\]\(([^)]+)\)/gm)].map(
  ([, title, file]) => ({ title, file }),
);
if (!pages.length) throw new Error("GitBook navigation is empty.");
const seen = new Set();
for (const { file } of pages) {
  if (seen.has(file)) throw new Error(`Duplicate navigation entry: ${file}`);
  seen.add(file);
  const path = resolve(root, "docs", file);
  const content = readFileSync(path, "utf8");
  if (!/^# .+/m.test(content)) throw new Error(`Missing page title: ${file}`);
  for (const [, raw] of content.matchAll(/\]\(([^)]+)\)/g)) {
    const link = raw.split("#")[0];
    if (!link || /^(https?:|mailto:)/.test(link)) continue;
    if (!existsSync(resolve(dirname(path), link))) {
      throw new Error(`Broken local link in ${file}: ${link}`);
    }
  }
}
console.log(`Checked ${pages.length} GitBook pages and all local Markdown links.`);
