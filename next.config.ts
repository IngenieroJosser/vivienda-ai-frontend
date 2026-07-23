import type { NextConfig } from "next";
import { PROJECT_EMBED_HOSTS } from "./lib/housing-catalog/embed";

const projectFrameSources = PROJECT_EMBED_HOSTS.flatMap((host) => [
  `https://${host}`,
  `https://*.${host}`,
]).join(" ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-src 'self' ${projectFrameSources};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
