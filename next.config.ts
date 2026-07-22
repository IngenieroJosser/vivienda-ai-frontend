import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400,
  },
};

export default nextConfig;
