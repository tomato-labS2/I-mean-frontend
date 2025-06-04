import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',

  // 정적 export를 위한 옵션 주석 처리 또는 삭제
  // trailingSlash: true,
  // output: "export", 
  images: {
    // loader: "akamai", // 정적 사이트에 적합한 이미지 처리 방식 - 필요시 주석 해제
    // path: "/",        // 이미지 경로 기준 - 필요시 주석 해제
    unoptimized: true, // 로컬 개발 시에는 unoptimized: true가 유용할 수 있습니다.
  },
  eslint:{
    ignoreDuringBuilds: true,
  },


};

export default nextConfig;