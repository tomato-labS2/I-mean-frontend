import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 정적 export를 위한 옵션
  trailingSlash: true, //모든 경로에 슬래시 붙여서 S3에서 폴더처럼 인식
  output: "export",
  images: {
    unoptimized: true, // 이미지 최적화 기능 꺼짐
  },

  // (선택) basePath도 설정 가능
  // basePath: '/your-subpath',
};

export default nextConfig;
