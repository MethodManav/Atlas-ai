import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "liteapi-travel-static-data.s3.amazonaws.com" },
      { protocol: "https", hostname: "static.cupid.travel" },
      { protocol: "https", hostname: "**.liteapi.travel" },
    ],
  },
};

export default nextConfig;
