import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "**.amadeus.com" },
      { protocol: "https", hostname: "**.hotel-ds.com" },
    ],
  },
};

export default nextConfig;
