import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Dùng Next.js image optimization thay vì unoptimized
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 500],
  },
};

export default nextConfig;
