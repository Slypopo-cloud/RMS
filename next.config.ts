import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure stable builds on some environments
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
