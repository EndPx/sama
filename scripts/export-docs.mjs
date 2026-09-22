import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

// Public documentation only. This output contains no environment or wallet data.
const docs = resolve(import.meta.dirname, "../docs");
const summary = readFileSync(resolve(docs, "SUMMARY.md"), "utf8");
const parents = [];
const pages = [...summary.matchAll(/^(\s*)- \[([^\]]+)\]\(([^)]+)\)/gm)].map(
  ([, indent, title, file]) => {
    const level = indent.replace(/\n/g, "").length / 2;
    if (!Number.isInteger(level)) throw new Error(`Invalid indentation: ${file}`);
    const parent = level > 0 ? parents[level - 1] : null;
    if (level > 0 && !parent) throw new Error(`Missing parent: ${file}`);
    parents[level] = file;
    parents.length = level + 1;
    const markdown = readFileSync(resolve(docs, file), "utf8");
    return {
      title,
      file,
      parent,
      markdown,
      sha256: createHash("sha256").update(markdown).digest("hex"),
    };
  },
);
process.stdout.write(JSON.stringify(pages));
