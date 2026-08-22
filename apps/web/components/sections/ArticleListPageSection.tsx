"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import type { ArticleItem } from "@/constants/articles";
import { fetchPublicArticlesPage } from "@/lib/api/blog";

const Section = styled.section({
  background: "#fff",
});

// 피그마 Banner(1920×330)는 프로젝트/아티클이 같은 컴포넌트를 쓰며,
// 배경 이미지 없이 가로 그라데이션만 깔린다.
const Banner = styled.div({
  padding: "160px 80px 80px",
  position: "relative",
  overflow: "hidden",
  minHeight: "330px",
  background: "linear-gradient(90deg, #02111f 7.926%, #072d3e 66.31%, #011924 100%)",

  "@media (max-width: 1024px)": { minHeight: "323px" },
  "@media (max-width: 768px)": { padding: "140px 40px 50px", minHeight: "300px" },
  // 375 프레임은 2정거장 그라데이션이 반대 방향으로 깔린다.
  "@media (max-width: 767px)": {
    padding: "160px 16px 20px",
    minHeight: "300px",
    background: "linear-gradient(270deg, #072c3d 0%, #02101e 100%)",
  },
});

const Heading = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxWidth: "1280px",
  margin: "0 auto",
});

const BannerLabel = styled.p({
  margin: 0,
  color: "#62748e",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "12px", lineHeight: "15px" },
});

const BannerTitle = styled.h1({
  margin: "8px 0 0",
  color: "#cad5e2",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,
  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 767px)": { fontSize: "24px", lineHeight: "30px" },
});

const ContentSection = styled.div({
  padding: "80px 80px",
  "@media (max-width: 1024px)": { padding: "80px" },
  "@media (max-width: 768px)": { padding: "48px 40px" },
  "@media (max-width: 767px)": { padding: "40px 16px" },
});

const Body = styled.div({
  maxWidth: "1280px",
  margin: "0 auto",
});

const List = styled.div({
  display: "flex",
  flexDirection: "column",
});

const Row = styled.a({
  display: "grid",
  gridTemplateColumns: "410px 1fr",
  alignItems: "center",
  gap: "24px",
  padding: "40px 0",
  borderBottom: "1px solid #c9c9c9",
  color: "inherit",
  textDecoration: "none",

  "@media (max-width: 1024px)": {
    gridTemplateColumns: "340px 1fr",
  },
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
    gap: "24px",
    padding: "20px 0",
  },
});

const Thumbnail = styled.img({
  width: "100%",
  height: "324px",
  objectFit: "cover",
  borderRadius: "30px",
  display: "block",
  background: colors.categoryBg,

  "@media (max-width: 1024px)": {
    height: "260px",
  },
  "@media (max-width: 768px)": {
    height: "220px",
    borderRadius: "20px",
  },
  "@media (max-width: 767px)": {
    height: "222px",
    borderRadius: "25px",
  },
});

const ThumbnailPlaceholder = Thumbnail.withComponent("div");

const TextWrap = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  minWidth: 0,
});

const Title = styled.h2({
  margin: 0,
  color: "#202325",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const Description = styled.p({
  margin: 0,
  color: "#525252",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",

  "@media (max-width: 1024px)": { fontSize: "18px", lineHeight: "23px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "20px" },
  "@media (max-width: 767px)": { fontSize: "14px", lineHeight: "18px" },
});

const Pagination = styled.div({
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
    marginTop: "48px",
    gap: "24px",
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const Arrow = styled.span({
  color: "#cad5e2",
  fontSize: "18px",
});

type Props = {
  initialItems?: ArticleItem[];
  initialNextCursor?: string | null;
};

const PaginationButton = styled.button<{ disabled?: boolean }>(({ disabled }) => ({
  border: "none",
  background: "transparent",
  color: disabled ? "#9aa8bb" : "#cad5e2",
  fontSize: "18px",
  cursor: disabled ? "not-allowed" : "pointer",
}));

export const ArticleListPageSection = ({ initialItems = [], initialNextCursor = null }: Props) => {
  const [articleItems, setArticleItems] = useState<ArticleItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextPage = async () => {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const page = await fetchPublicArticlesPage({ cursor: nextCursor, limit: 4 });
      setArticleItems(page.items);
      setCursorHistory((prev) => [...prev, nextCursor]);
      setNextCursor(page.nextCursor);
      setCurrentPage((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrevPage = async () => {
    if (cursorHistory.length <= 1 || isLoading) return;
    const prevHistory = [...cursorHistory];
    prevHistory.pop();
    const prevCursor = prevHistory[prevHistory.length - 1] ?? null;
    setIsLoading(true);
    try {
      const page = await fetchPublicArticlesPage({ cursor: prevCursor ?? undefined, limit: 4 });
      setArticleItems(page.items);
      setNextCursor(page.nextCursor);
      setCursorHistory(prevHistory);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section>
      <Banner>
        <Heading>
          <BannerLabel>Article</BannerLabel>
          <BannerTitle>일잘러들의 생각, 글로 남겼어요.</BannerTitle>
        </Heading>
      </Banner>
      <ContentSection>
        <Body>
          <List>
            {articleItems.map((article) => (
              <Row
                key={article.id}
                {...(article.externalUrl
                  ? { href: article.externalUrl, target: "_blank", rel: "noopener noreferrer" }
                  : { as: "article" as const })}
              >
                {article.thumbnail ? (
                  <Thumbnail src={article.thumbnail} alt={article.title} />
                ) : (
                  <ThumbnailPlaceholder />
                )}
                <TextWrap>
                  <Title>{article.title}</Title>
                  {article.description ? <Description>{article.description}</Description> : null}
                </TextWrap>
              </Row>
            ))}
          </List>
          <Pagination>
            <PaginationButton
              onClick={loadPrevPage}
              disabled={cursorHistory.length <= 1 || isLoading}
            >
              <Arrow>‹</Arrow>
            </PaginationButton>
            <span style={{ color: "#525252" }}>{currentPage}</span>
            <PaginationButton onClick={loadNextPage} disabled={!nextCursor || isLoading}>
              <Arrow>›</Arrow>
            </PaginationButton>
          </Pagination>
        </Body>
      </ContentSection>
    </Section>
  );
};
