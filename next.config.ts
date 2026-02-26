import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "gyaanstore.com",
      },
      {
        protocol: "https",
        hostname: "www.gyaanstore.com",
      },
    ],
  },
};

export default nextConfig;
