import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The catalogue uses already-optimized external CDN images. Skipping Next's
    // on-demand optimizer keeps the dev worker pool stable and avoids per-image
    // optimization costs in production — next/image still handles lazy loading
    // and layout. (Shopify can resize via ?width= on the URL if needed later.)
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.superkicks.in" },
    ],
  },
};

export default nextConfig;
