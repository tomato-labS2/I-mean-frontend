import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',

  images: {
    unoptimized: true,
  },
  eslint:{
    ignoreDuringBuilds: true,
  },

  // ✅ 여기에 환경 변수 주입 추가
  env: {
    NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_PYTHON_API_URL: process.env.NEXT_PUBLIC_PYTHON_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
