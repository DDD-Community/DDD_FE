import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddd/ui"],
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
