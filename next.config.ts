import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Disable CSS minification
    if (config.optimization) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
