import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack treats this folder as the workspace root (prevents multi-lockfile warning)
  turbopack: {
    root: __dirname,
  },
  // Align with Turbopack root to avoid Vercel warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
