/**
 * ⚠️ `https://www.figma.com/api/mcp/asset/...` 주소는 Figma 데스크톱 MCP 세션에서만 살아있는
 * 임시 URL 이라 배포 환경에서는 전부 404 다. 아래 남아있는 항목들도 실제로는 렌더되지 않으므로,
 * 사용할 때는 Figma 에서 export 한 파일을 `public/images/` 에 넣고 로컬 경로로 교체해야 한다.
 */
export const assets = {
  logo: "/images/logo.png",
  /**
   * 홈 히어로 + 모집안내의 `Currently Under Renewal`(사전알림·지원마감) 배경.
   * Figma `bg` 노드(2085:2389 / 573:4077) — 어두운 녹/검정 계열.
   */
  heroBg: "/images/hero/hero-bg.jpg",
  /**
   * 모집안내의 `Now Recruiting`(모집중) 배경 — 청록 계열로 위와 다른 이미지다.
   * Figma `img_faqbg`(2140:2631). 히어로 프레임(183:1459) 안이 아니라 페이지 프레임
   * (2136:5076)의 형제로 깔려 있어서, 히어로만 단독으로 보면 찾을 수 없다.
   */
  recruitHeroOpenBg: "/images/hero/recruit-hero-open.jpg",
  /** 지원서·프로젝트·아티클 상단 배너(1920x400) 배경. 3D "D" 오브젝트가 이미지에 포함돼 있다. */
  bannerBg: "/images/banner/banner-bg.jpg",
  heroTextBg: "https://www.figma.com/api/mcp/asset/b0a8d8db-c55b-4d71-9a03-7bba5fbcd1a6",
  recruitHeroTextBg: "https://www.figma.com/api/mcp/asset/e7dc7d16-f496-491c-9ad9-ac2771191474",
  recruit3d: "https://www.figma.com/api/mcp/asset/e16d4787-f270-41f0-ad5d-0c40683b9c77",
  hero3d: "/images/hero/main-hero-3d.png",
  hero3d1024: "https://www.figma.com/api/mcp/asset/baac66b4-230e-4fa2-8529-3fdf3ca3988e",
  hero3d768: "https://www.figma.com/api/mcp/asset/500cd51c-3def-4ced-bf9a-c3bafa84f13d",
  hero3d375: "https://www.figma.com/api/mcp/asset/77b87f10-9900-430d-839e-662ba3e26fa7",
  arrowRight: "https://www.figma.com/api/mcp/asset/962d703d-9e8e-47c9-b2a4-3e9d1bf0edf2",
  arrowLeft: "https://www.figma.com/api/mcp/asset/475824fe-4859-46e5-8228-9e4a34252ce5",
  chevronDown: "https://www.figma.com/api/mcp/asset/d136abfc-f9a0-4ac5-91f3-f513323f26cf",
  sponsors: {
    elice: "/images/imag_elice.png",
    ictcoc: "/images/image_ictcoc.png",
    asanNanum: "/images/image_asan-nanum.png",
    hanbit: "/images/image_hanbit.png",
  },
  social: {
    tistory: "/images/Tistory.png",
    medium: "/images/Medium.png",
    brunch: "/images/Brunch.png",
    instagram: "/images/Instagram.png",
  },
} as const;
