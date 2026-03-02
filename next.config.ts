import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['henry-proposalflow.vercel.app'],
    },
  },
};

export default nextConfig;
