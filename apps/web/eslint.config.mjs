import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  ...compat.config(nextVitals),
  ...compat.config(nextTs),
  globalIgnores([
    ".next/**",
    ".next-dev/**",
    ".next-acceptance/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
