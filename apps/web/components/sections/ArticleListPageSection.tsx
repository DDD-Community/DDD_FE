"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { ARTICLE_LIST_PAGE_SIZE, type ArticleItem } from "@/constants/articles";
import { CursorPagination } from "@/components/ui/CursorPagination";
import { EmptyNotice } from "@/components/ui/EmptyNotice";
import { LoadErrorNotice } from "@/components/ui/LoadErrorNotice";
import { Skeleton, VisuallyHidden } from "@/components/ui/Skeleton";
import { slicePage, useCursorPagedList } from "@/hooks/useCursorPagedList";
import { fetchAllPublicArticles } from "@/lib/api/blog";

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

  // 페이지를 넘길 때 여기로 스크롤이 돌아온다. 헤더가 고정이라 그만큼 아래에서 멈춰야
  // 첫 줄이 가려지지 않는다(헤더 = 상단 여백 32 + 로고 55, 모바일 16 + 48).
  scrollMarginTop: "104px",
  "@media (max-width: 768px)": { scrollMarginTop: "80px" },
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

/*
  썸네일 자리. 안쪽 이미지는 next/image 의 fill 로 깔리므로 이 박스가 크기를 정한다.
  썸네일이 없는 행도 같은 박스를 빈 채로 두어 행 높이를 맞춘다.
*/
const Thumbnail = styled.div({
  position: "relative",
  width: "100%",
  height: "324px",
  borderRadius: "30px",
  overflow: "hidden",
  background: colors.categoryBg,

  "& img": {
    objectFit: "cover",
  },

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

/* Row 의 그리드 한 칸 = 썸네일 폭. 위 Row 의 gridTemplateColumns 와 같은 값이다. */
const THUMBNAIL_SIZES =
  "(max-width: 767px) 100vw, (max-width: 768px) 316px, (max-width: 1024px) 340px, 410px";

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
  /** 서버에서 받아둔 아티클 **전부**. 한 페이지가 아니다. */
  initialArticles?: ArticleItem[];
  /** 서버 조회가 실패했는지. 실패했으면 그 빈 목록을 캐시하지 않고 브라우저에서 다시 받는다. */
  initialLoadFailed?: boolean;
};

/** 아티클 목록은 필터가 없다 — 체인이 하나뿐이라 캐시 키도 고정값 하나면 된다. */
const SINGLE_FILTER_KEY = "all";

export const ArticleListPageSection = ({
  initialArticles = [],
  initialLoadFailed = false,
}: Props) => {
  // 한 번 받아둔 목록 전체. 탭이 없어 배열 하나면 되고, 서버가 내려준 걸로 시작한다.
  const allArticlesRef = useRef<ArticleItem[] | null>(initialLoadFailed ? null : initialArticles);

  /*
    서버 조회가 성공했다면 이 함수는 한 번도 실제로 돌지 않는다 — 페이지 넘기기는 전부
    받아둔 배열을 자르는 것으로 끝나기 때문이다. 서버가 실패했을 때만 여기서 받아온다.
  */
  const fetchArticlesPage = useCallback(async (cursor: string | null) => {
    const all = allArticlesRef.current ?? (await fetchAllPublicArticles());
    allArticlesRef.current = all;
    return slicePage(all, cursor, ARTICLE_LIST_PAGE_SIZE);
  }, []);

  const {
    items: articleItems,
    currentPage,
    pageCount,
    isLoading,
    hasError,
    goToPage,
    retry,
    listTopRef,
  } = useCursorPagedList<ArticleItem>({
    filterKey: SINGLE_FILTER_KEY,
    fetchPage: fetchArticlesPage,
    initialChain: initialLoadFailed
      ? undefined
      : {
          filterKey: SINGLE_FILTER_KEY,
          page: slicePage(initialArticles, null, ARTICLE_LIST_PAGE_SIZE),
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
        <Body ref={listTopRef}>
          <List aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: ARTICLE_LIST_PAGE_SIZE }, (_, index) => (
                  <SkeletonArticleRow key={index} />
                ))
              : articleItems.map((article, index) => (
                  <Row
                    key={article.id}
                    {...(article.externalUrl
                      ? { href: article.externalUrl, target: "_blank", rel: "noopener noreferrer" }
                      : { as: "article" as const })}
                  >
                    <Thumbnail>
                      {article.thumbnail ? (
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          fill
                          sizes={THUMBNAIL_SIZES}
                          /*
                            목록의 첫 행은 화면을 열자마자 보인다. next/image 의
                            기본값(lazy) 으로 두면 전에 쓰던 <img> 보다 오히려
                            늦게 뜬다. 나머지 행은 스크롤할 때 받는다.
                          */
                          priority={index === 0}
                        />
                      ) : null}
                    </Thumbnail>
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
