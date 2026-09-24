import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Keep an open local preview intact while a production build is verified.
  distDir:
    process.env.NODE_ENV === "development"
      ? process.env.SAMA_ISOLATED_PREVIEW === "1"
        ? ".next-acceptance"
        : ".next-dev"
      : ".next",
  typescript: {
    tsconfigPath:
      process.env.NODE_ENV === "development"
        ? "tsconfig.dev.json"
        : "tsconfig.json",
  },
};

export default nextConfig;
