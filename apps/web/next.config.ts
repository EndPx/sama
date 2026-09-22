import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep an open local preview intact while a production build is verified.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  typescript: {
    tsconfigPath:
      process.env.NODE_ENV === "development"
        ? "tsconfig.dev.json"
        : "tsconfig.json",
  },
};

export default nextConfig;
