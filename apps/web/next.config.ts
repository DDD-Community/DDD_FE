import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddd/ui"],
  compiler: {
    emotion: true,
  },
  /*
    썸네일은 어드민에서 올린 원본이 그대로 스토리지에 있다. 4096×4096 PNG 18MB 짜리가
    섞여 있는데 화면에서는 400px 안팎으로 그려지므로, next/image 를 통해 카드 크기에
    맞춰 다시 인코딩한 것을 내려보낸다.

    근본 해결은 업로드 시점에 줄이는 것이다. 여기서 변환하면 최적화 서버가 매번 원본
    18MB 를 받아 와야 해서 첫 요청이 느리고, 호스팅에 따라 변환 비용도 붙는다.
  */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/ddd-project/**" },
    ],
    // 원본이 큰 만큼 한 번 만든 결과를 오래 들고 있는다. 썸네일은 교체되면 URL(uuid) 이
    // 같이 바뀌므로 캐시가 길어도 낡은 이미지가 남지 않는다.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
