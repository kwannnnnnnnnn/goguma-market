import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 판매글 사진을 서버 액션으로 업로드하므로 전송 용량 제한을 늘립니다(기본 1MB).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // Supabase Storage 의 사진 주소를 next/image 가 보여줄 수 있도록 허용합니다.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ekrypaqvyzsrytpomynv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
