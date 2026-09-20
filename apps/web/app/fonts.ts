import localFont from "next/font/local";

/*
  Pretendard 를 우리 오리진에서 직접 내려준다.

  전에는 globals.css 첫 줄의 `@import` 로 jsdelivr 의 pretendard.css 를 받아왔다.
  `@import` 는 렌더를 막는 스타일시트 안에서 또 한 번 네트워크를 타므로
  globals.css 를 받고 → 파싱하고 → 그제야 pretendard.css 를 발견해 받는 동안
  화면이 비어 있는다. 외부 도메인이라 DNS·TCP·TLS 도 처음부터 맺어야 했다.

  next/font 로 옮기면 빌드 때 폰트를 정적 자산으로 굽고 <head> 에 preload 를 넣어
  주므로 그 왕복이 통째로 사라진다.

  static 9 종이 아니라 가변 폰트 하나만 쓴다. 코드가 쓰는 weight 가 400/500/600/700
  네 종이라 static 으로는 파일 네 개(약 3.0MB)를 받아야 하는데, 가변 폰트는 하나
  (약 2.0MB)로 전 구간을 덮는다.
*/
export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  // 폰트가 도착하기 전에도 대체 글꼴로 글자를 먼저 그린다. 기존 pretendard.css 와 같은 동작.
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});
