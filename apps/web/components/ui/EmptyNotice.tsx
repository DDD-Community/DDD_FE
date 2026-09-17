"use client";

import styled from "@emotion/styled";
import { fontWeights } from "@/constants/tokens";

/*
  등록된 항목이 0건일 때 목록 자리에 대신 세우는 안내.

  목록이 비었는데 아무것도 그리지 않으면 화면이 "아직 불러오는 중" 인지 "원래 없음"
  인지 구분되지 않는다. 등록된 Android 프로젝트가 없는 탭이 흰 여백만 남겨 로딩이
  멈춘 것처럼 보였다.

  0건은 실패가 아니라 정상 응답이라 재시도할 대상이 없다 — 그래서 LoadErrorNotice 와
  달리 버튼을 두지 않는다. 둘을 한 컴포넌트로 합치면 "없음" 에도 [다시 시도] 가 붙어
  사용자가 고칠 수 있는 문제처럼 보인다.
*/

const Wrap = styled.div({
  display: "flex",
  justifyContent: "center",
  padding: "60px 0",

  "@media (max-width: 768px)": { padding: "40px 0" },
});

const Message = styled.p({
  margin: 0,
  textAlign: "center",
  color: "#525252",
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.regular,

  "@media (max-width: 768px)": { fontSize: "14px", lineHeight: "18px" },
});

type Props = {
  message: string;
};

export const EmptyNotice = ({ message }: Props) => (
  // 실패 안내가 아니라 목록의 현재 상태라서 alert 가 아닌 status 로 알린다. 탭을 옮겨
  // 0건이 됐을 때 스크린리더가 끼어들지 않고 차례가 오면 읽는다.
  <Wrap role="status">
    <Message>{message}</Message>
  </Wrap>
);
