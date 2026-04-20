import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['hxhmx1tx-3000.inc1.devtunnels.ms', 'localhost:3000'],
    },
  },
};

export default nextConfig;
