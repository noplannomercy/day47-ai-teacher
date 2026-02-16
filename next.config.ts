import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 빌드 성능 향상
  reactStrictMode: true,

  // 이미지 최적화
  images: {
    formats: ['image/webp'],
  },
};

export default nextConfig;
