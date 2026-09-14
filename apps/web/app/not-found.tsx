import Link from "next/link";
import { colors, fontWeights } from "@/constants/tokens";

/*
  스타일을 emotion 이 아니라 인라인으로 둔다.

  이 화면은 무언가 이미 잘못됐을 때 나오는 마지막 페이지다. 스타일 런타임까지 끌어다
  쓰면 그 런타임이 원인일 때 대체 화면마저 못 그린다. 의존성 없이 스스로 그린다.
*/
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "0 24px",
        textAlign: "center",
        background: colors.background,
        color: colors.textInverse,
      }}
    >
      <p style={{ margin: 0, fontSize: "20px", fontWeight: fontWeights.bold, color: colors.primary }}>
        404
      </p>
      <h1 style={{ margin: 0, fontSize: "32px", lineHeight: 1.3, fontWeight: fontWeights.bold }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.5, color: colors.slate300 }}>
        주소가 바뀌었거나 삭제된 페이지예요.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "12px",
          display: "inline-flex",
          alignItems: "center",
          height: "52px",
          padding: "0 32px",
          borderRadius: "99px",
          background: colors.primary,
          color: colors.textInverse,
          fontSize: "16px",
          fontWeight: fontWeights.medium,
          textDecoration: "none",
        }}
      >
        홈으로 가기
      </Link>
    </main>
  );
}
