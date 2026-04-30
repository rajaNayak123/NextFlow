import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@trigger.dev/sdk'],
};

export default nextConfig;
