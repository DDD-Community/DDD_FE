"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import { ARTICLE_LIST_PAGE_SIZE, type ArticleItem } from "@/constants/articles";
import { CursorPagination } from "@/components/ui/CursorPagination";
import { EmptyNotice } from "@/components/ui/EmptyNotice";
import { LoadErrorNotice } from "@/components/ui/LoadErrorNotice";
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

type Props = {
  initialItems?: ArticleItem[];
  initialNextCursor?: string | null;
  /** 서버에서 그린 1페이지가 실패했는지. 실패한 채로 넘어오면 처음부터 안내를 띄운다. */
  initialLoadFailed?: boolean;
};

export const ArticleListPageSection = ({
  initialItems = [],
  initialNextCursor = null,
  initialLoadFailed = false,
}: Props) => {
  const [articleItems, setArticleItems] = useState<ArticleItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  /** 지나온 페이지마다 그 페이지를 불러올 때 쓴 커서. 1페이지는 커서가 없어 null 이다. */
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(initialLoadFailed);

  // 현재 페이지는 히스토리 길이와 항상 같다. 따로 state 로 들고 있으면 둘이 어긋날 수 있다.
  const currentPage = cursorHistory.length;
  /**
   * 번호로 그릴 수 있는 페이지 수.
   *
   * 커서 페이지네이션이라 전체 개수를 모른다. 지나온 페이지 + `nextCursor` 가 있으면
   * 다음 한 칸까지가 지금 확실히 아는 전부다. 뒤로 더 있어도 가보기 전에는 그릴 수 없다.
   */
  const knownPageCount = currentPage + (nextCursor ? 1 : 0);

  // 불러오는 중이거나 실패한 목록은 "없음" 이 아니다. 실패는 LoadErrorNotice 가 맡는다.
  const isEmpty = articleItems.length === 0 && !isLoading && !hasLoadError;

  const goToPage = async (page: number) => {
    if (isLoading || page === currentPage || page < 1 || page > knownPageCount) return;

    // 앞쪽 페이지는 지나올 때 쓴 커서가 히스토리에 남아 있고, 아직 안 가본 다음 페이지는
    // 방금 응답이 준 nextCursor 로만 갈 수 있다.
    const cursor = page <= cursorHistory.length ? cursorHistory[page - 1] : nextCursor;

    setIsLoading(true);
    setHasLoadError(false);
    try {
      const loaded = await fetchPublicArticlesPage({
        cursor: cursor ?? undefined,
        limit: ARTICLE_LIST_PAGE_SIZE,
      });
      setArticleItems(loaded.items);
      setNextCursor(loaded.nextCursor);
      // 뒤로 갈 때는 건너뛴 뒤쪽 히스토리를 버린다. 남겨두면 없는 페이지 번호가 계속 뜬다.
      setCursorHistory((prev) => [...prev.slice(0, page - 1), cursor]);
    } catch (error) {
      // catch 가 없으면 실패가 조용히 삼켜져 버튼만 안 먹는 것처럼 보인다.
      console.error("[blog] 페이지를 불러오지 못했다.", error);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 지금 페이지를 그대로 다시 불러온다.
   *
   * 첫 로드가 실패하면 목록이 비어 이전·다음 버튼도 눌릴 게 없다. 프로젝트 목록은
   * 탭을 다시 눌러 재시도하지만 여기엔 탭이 없어, 안내의 재시도 버튼이 유일한 경로다.
   */
  const retryCurrentPage = async () => {
    if (isLoading) return;
    const cursor = cursorHistory[cursorHistory.length - 1];
    setIsLoading(true);
    setHasLoadError(false);
    try {
      const page = await fetchPublicArticlesPage({
        cursor: cursor ?? undefined,
        limit: ARTICLE_LIST_PAGE_SIZE,
      });
      setArticleItems(page.items);
      setNextCursor(page.nextCursor);
    } catch (error) {
      console.error("[blog] 페이지를 다시 불러오지 못했다.", error);
      setHasLoadError(true);
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
          {isEmpty ? <EmptyNotice message="아직 등록된 글이 없어요." /> : null}
          {hasLoadError ? (
            <LoadErrorNotice
              message="글 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
              onRetry={() => void retryCurrentPage()}
              isRetrying={isLoading}
            />
          ) : null}
          <CursorPagination
            label="블로그 페이지네이션"
            currentPage={currentPage}
            pageCount={knownPageCount}
            isLoading={isLoading}
            onChange={(page) => void goToPage(page)}
          />
        </Body>
      </ContentSection>
    </Section>
  );
};
