"use client";

import styled from "@emotion/styled";
import { fontWeights } from "@/constants/tokens";

/*
  목록을 불러오지 못했을 때 목록 자리에 대신 세우는 안내.

  문구만 띄우고 끝내지 않는다 — 첫 로드가 실패하면 목록이 비어 있어 사용자가 다시
  시도해볼 대상 자체가 화면에 없고, 남는 선택지가 새로고침뿐이면 대부분 그냥 떠난다.
  그래서 재시도는 옵션이 아니라 이 컴포넌트의 일부다.

  "0건" 과 "못 불러옴" 은 다른 상황이므로 이 컴포넌트를 빈 목록 안내로 쓰지 말 것.
  등록된 항목이 없는 것은 실패가 아니라서 재시도할 것도 없다.
*/

const Wrap = styled.div({
  margin: "40px 0 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  textAlign: "center",
});

const Message = styled.p({
  margin: 0,
  color: "#525252",
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.regular,

  "@media (max-width: 768px)": { fontSize: "14px", lineHeight: "18px" },
});

const RetryButton = styled.button<{ disabled?: boolean }>(({ disabled }) => ({
  border: "1px solid #cad5e2",
  borderRadius: "8px",
  background: "transparent",
  padding: "8px 16px",
  color: disabled ? "#9aa8bb" : "#525252",
  fontSize: "14px",
  lineHeight: "18px",
  fontWeight: fontWeights.medium,
  cursor: disabled ? "not-allowed" : "pointer",
}));

type Props = {
  message?: string;
  onRetry: () => void;
  /** 재시도 요청이 도는 중. 같은 요청이 겹쳐 나가지 않도록 버튼을 잠근다. */
  isRetrying?: boolean;
};

export const LoadErrorNotice = ({
  message = "목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
  onRetry,
  isRetrying = false,
}: Props) => (
  <Wrap role="alert">
    <Message>{message}</Message>
    <RetryButton type="button" onClick={onRetry} disabled={isRetrying}>
      {isRetrying ? "불러오는 중…" : "다시 시도"}
    </RetryButton>
  </Wrap>
);
