"use client";

import { useEffect } from "react";
import { colors, fontWeights } from "@/constants/tokens";

/*
  라우트 단위 에러 바운더리.

  이게 없으면 서버 렌더 중 발생한 예외가 그대로 Next 기본 화면("Application error:
  a server-side exception has occurred")으로 나간다. 사용자는 무엇을 해야 할지 알 수
  없고, 제보받아도 digest 숫자 하나뿐이라 추적이 어렵다.

  스타일은 인라인이다 — 이 화면은 무언가 이미 잘못됐을 때 나오므로 스타일 런타임에
  기대지 않는다.
*/
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션에서는 원본 메시지가 클라이언트로 오지 않는다. 서버 로그와 이어 붙일
    // 수 있도록 digest 를 콘솔에 남긴다.
    console.error("[error boundary]", error.digest ?? "(no digest)", error);
  }, [error]);

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
      <h1 style={{ margin: 0, fontSize: "32px", lineHeight: 1.3, fontWeight: fontWeights.bold }}>
        문제가 생겼어요
      </h1>
      <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.5, color: colors.slate300 }}>
        잠시 후 다시 시도해주세요. 계속 이러면 아래 코드와 함께 알려주시면 도움이 됩니다.
      </p>
      {error.digest ? (
        <code style={{ fontSize: "13px", color: colors.slate500 }}>{error.digest}</code>
      ) : null}
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: "12px",
          height: "52px",
          padding: "0 32px",
          border: "none",
          borderRadius: "99px",
          background: colors.primary,
          color: colors.textInverse,
          fontSize: "16px",
          fontWeight: fontWeights.medium,
          cursor: "pointer",
        }}
      >
        다시 시도
      </button>
    </main>
  );
}
