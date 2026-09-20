"use client";

import { useCallback } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { ARTICLE_LIST_PAGE_SIZE, type ArticleItem } from "@/constants/articles";
import { CursorPagination } from "@/components/ui/CursorPagination";
import { EmptyNotice } from "@/components/ui/EmptyNotice";
import { LoadErrorNotice } from "@/components/ui/LoadErrorNotice";
import { Skeleton, VisuallyHidden } from "@/components/ui/Skeleton";
import { useCursorPagedList } from "@/hooks/useCursorPagedList";
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
    gridTemplateColumns: "316px 1fr",
    gap: "24px",
    padding: "20px 0",
  },
  // 375 프레임에서만 썸네일이 본문 위로 올라간다. 768 프레임은 가로 배치를 유지한다.
  "@media (max-width: 767px)": {
    gridTemplateColumns: "1fr",
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
    height: "240px",
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

/*
  불러오는 동안 글 한 줄이 들어올 자리를 잡아두는 뼈대.

  Row 와 같은 그리드·여백·썸네일 높이를 쓴다. 어긋나면 결과가 들어오는 순간 목록
  전체 높이가 바뀌어 스크롤 위치가 튄다.
*/
const SkeletonRow = styled.div({
  display: "grid",
  gridTemplateColumns: "410px 1fr",
  alignItems: "center",
  gap: "24px",
  padding: "40px 0",
  borderBottom: "1px solid #c9c9c9",

  "@media (max-width: 1024px)": { gridTemplateColumns: "340px 1fr" },
  "@media (max-width: 768px)": { gridTemplateColumns: "316px 1fr", padding: "20px 0" },
  "@media (max-width: 767px)": { gridTemplateColumns: "1fr" },
});

const SkeletonThumbnail = styled(Skeleton)({
  width: "100%",
  height: "324px",
  borderRadius: "30px",

  "@media (max-width: 1024px)": { height: "260px" },
  "@media (max-width: 768px)": { height: "240px", borderRadius: "20px" },
  "@media (max-width: 767px)": { height: "222px", borderRadius: "25px" },
});

const SkeletonTexts = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const SkeletonTitle = styled(Skeleton)({
  width: "60%",
  height: "32px",

  "@media (max-width: 1024px)": { height: "30px" },
  "@media (max-width: 768px)": { height: "25px" },
  "@media (max-width: 767px)": { height: "20px" },
});

// Description 은 3줄까지 차지한다(20/28 → 84px).
const SkeletonDescription = styled(Skeleton)({
  width: "100%",
  height: "84px",

  "@media (max-width: 1024px)": { height: "69px" },
  "@media (max-width: 768px)": { height: "60px" },
  "@media (max-width: 767px)": { height: "54px" },
});

const SkeletonArticleRow = () => (
  // 읽을 내용이 없는 시각적 자리표시자다. 로딩 중이라는 사실은 아래 status 가 말한다.
  <SkeletonRow aria-hidden>
    <SkeletonThumbnail />
    <SkeletonTexts>
      <SkeletonTitle />
      <SkeletonDescription />
    </SkeletonTexts>
  </SkeletonRow>
);

type Props = {
  initialItems?: ArticleItem[];
  initialNextCursor?: string | null;
  /** 서버에서 그린 1페이지가 실패했는지. 실패했으면 그 결과를 캐시하지 않고 브라우저에서 다시 받는다. */
  initialLoadFailed?: boolean;
};

/** 아티클 목록은 필터가 없다 — 체인이 하나뿐이라 캐시 키도 고정값 하나면 된다. */
const SINGLE_FILTER_KEY = "all";

export const ArticleListPageSection = ({
  initialItems = [],
  initialNextCursor = null,
  initialLoadFailed = false,
}: Props) => {
  // 목록 전체가 한 체인이라 요청 함수도 한 번 만들어두면 그만이다.
  const fetchArticlesPage = useCallback(
    (cursor: string | null) =>
      fetchPublicArticlesPage({
        cursor: cursor ?? undefined,
        limit: ARTICLE_LIST_PAGE_SIZE,
      }),
    [],
  );

  const {
    items: articleItems,
    currentPage,
    pageCount,
    isLoading,
    hasError,
    goToPage,
    retry,
  } = useCursorPagedList<ArticleItem>({
    filterKey: SINGLE_FILTER_KEY,
    fetchPage: fetchArticlesPage,
    initialChain: initialLoadFailed
      ? undefined
      : {
          filterKey: SINGLE_FILTER_KEY,
          page: { items: initialItems, nextCursor: initialNextCursor },
        },
    logLabel: "blog",
  });

  // 불러오는 중이거나 실패한 목록은 "없음" 이 아니다. 실패는 LoadErrorNotice 가 맡는다.
  const isEmpty = articleItems.length === 0 && !isLoading && !hasError;

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
          <List aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: ARTICLE_LIST_PAGE_SIZE }, (_, index) => (
                  <SkeletonArticleRow key={index} />
                ))
              : articleItems.map((article) => (
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
                      {article.description ? (
                        <Description>{article.description}</Description>
                      ) : null}
                    </TextWrap>
                  </Row>
                ))}
          </List>
          {isLoading ? (
            <VisuallyHidden role="status">글 목록을 불러오는 중이에요.</VisuallyHidden>
          ) : null}
          {isEmpty ? <EmptyNotice message="아직 등록된 글이 없어요." /> : null}
          {hasError ? (
            <LoadErrorNotice
              message="글 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
              onRetry={retry}
            />
          ) : null}
          <CursorPagination
            label="블로그 페이지네이션"
            currentPage={currentPage}
            pageCount={pageCount}
            isLoading={isLoading}
            onChange={goToPage}
          />
        </Body>
      </ContentSection>
    </Section>
  );
};
