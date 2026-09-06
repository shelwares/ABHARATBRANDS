import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false, // Disable Turbopack to fix CSS generation with Tailwind v4
  },
};

export default nextConfig;