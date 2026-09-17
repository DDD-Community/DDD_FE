"use client";

import styled from "@emotion/styled";
import { fontWeights } from "@/constants/tokens";

/*
  커서 페이지네이션 목록이 공유하는 페이지 이동 UI.

  전체 개수를 모르는 커서 방식이라 "총 N페이지" 를 그릴 수 없다. 지나온 페이지와
  다음 한 칸까지가 지금 확실히 아는 전부이고, 그 범위를 `pageCount` 로 받는다.

  1페이지밖에 없어도 숨기지 않는다 — 목록 아래에 이동 수단이 있다는 사실 자체가
  화면의 구조를 알려주고, 글이 늘어났을 때 갑자기 없던 UI 가 나타나지도 않는다.
*/

const Nav = styled.nav({
  marginTop: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px",
  color: "#d4d4d4",
  fontSize: "20px",
  lineHeight: "25px",
  fontWeight: fontWeights.medium,

  "@media (max-width: 768px)": {
    gap: "24px",
    marginTop: "48px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const ArrowButton = styled.button<{ disabled?: boolean }>(({ disabled }) => ({
  border: "none",
  background: "transparent",
  color: disabled ? "#9aa8bb" : "#cad5e2",
  fontSize: "18px",
  cursor: disabled ? "not-allowed" : "pointer",
}));

// 숫자 크기·굵기는 Nav 가 정한다. 여기서 다시 지정하면 반응형 분기를 두 곳에서
// 관리하게 되므로 font 는 상속만 받는다.
const PageNumber = styled.button<{ active: boolean }>(({ active }) => ({
  border: "none",
  background: "transparent",
  padding: 0,
  font: "inherit",
  color: active ? "#525252" : "#d4d4d4",
  cursor: active ? "default" : "pointer",

  "&:disabled": { cursor: "not-allowed" },
}));

type Props = {
  currentPage: number;
  /** 번호로 그릴 수 있는 페이지 수. 지나온 페이지 + 다음 커서가 있으면 1. */
  pageCount: number;
  isLoading: boolean;
  onChange: (page: number) => void;
  label: string;
};

export const CursorPagination = ({
  currentPage,
  pageCount,
  isLoading,
  onChange,
  label,
}: Props) => (
  <Nav aria-label={label}>
    <ArrowButton
      type="button"
      aria-label="이전 페이지"
      onClick={() => onChange(currentPage - 1)}
      disabled={currentPage <= 1 || isLoading}
    >
      ‹
    </ArrowButton>
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
      <PageNumber
        key={page}
        type="button"
        active={page === currentPage}
        aria-label={`${page}페이지`}
        aria-current={page === currentPage ? "page" : undefined}
        disabled={isLoading}
        onClick={() => onChange(page)}
      >
        {page}
      </PageNumber>
    ))}
    <ArrowButton
      type="button"
      aria-label="다음 페이지"
      onClick={() => onChange(currentPage + 1)}
      disabled={currentPage >= pageCount || isLoading}
    >
      ›
    </ArrowButton>
  </Nav>
);
