"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { colors, fontWeights } from "@/constants/tokens";
import type { ProjectCategory, ProjectItem } from "@/constants/projects";
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_CATEGORY_TABS,
  PROJECT_LIST_PAGE_SIZE,
} from "@/constants/projects";
import { CursorPagination } from "@/components/ui/CursorPagination";
import { EmptyNotice } from "@/components/ui/EmptyNotice";
import { LoadErrorNotice } from "@/components/ui/LoadErrorNotice";
import { fetchPublicProjectsPage } from "@/lib/api/project";

const Section = styled.section({
  background: "#ffffff",
});

// 피그마 Banner(1920×330)는 배경 이미지 없이 가로 그라데이션만 쓴다.
// 이전에 쓰던 banner-bg.jpg 는 우측 3D "D" 오브젝트와 노이즈가 들어간 래스터라
// 디자인과 달랐다.
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

const ContentSection = styled.div({
  padding: "80px",
  "@media (max-width: 1024px)": { padding: "80px" },
  "@media (max-width: 768px)": { padding: "40px" },
  "@media (max-width: 767px)": { padding: "40px 16px" },
});

const Body = styled.div({
  maxWidth: "1280px",
  margin: "0 auto",
});

const Label = styled.p({
  margin: 0,
  fontSize: "28px",
  lineHeight: "32px",
  color: "#62748e",
  fontWeight: fontWeights.semiBold,
  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "12px", lineHeight: "15px" },
});

const Title = styled.h1({
  margin: 0,
  color: "#cad5e2",
  fontSize: "40px",
  lineHeight: "50px",
  fontWeight: fontWeights.bold,

  "@media (max-width: 1024px)": { fontSize: "34px", lineHeight: "45px" },
  "@media (max-width: 768px)": { fontSize: "30px", lineHeight: "38px" },
  "@media (max-width: 767px)": { fontSize: "24px", lineHeight: "30px", width: "265px" },
});

const TabList = styled.div({
  display: "flex",
  gap: "24px",
  justifyContent: "center",
  marginBottom: "80px",
  overflowX: "auto",
  paddingBottom: "4px",
  flexWrap: "nowrap",
  WebkitOverflowScrolling: "touch",

  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",

  "@media (max-width: 768px)": {
    justifyContent: "flex-start",
    marginBottom: "40px",
  },
});

const Tab = styled.button<{ active: boolean }>(({ active }) => ({
  border: "none",
  background: "transparent",
  color: active ? colors.primary : "#525252",
  borderBottom: `2px solid ${active ? colors.primary : "transparent"}`,
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  padding: "8px 20px",
  cursor: "pointer",
  whiteSpace: "nowrap",

  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "13px", lineHeight: "16px", padding: "6px 10px" },
  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "15px",
    padding: "4px 8px",
  },
}));

const Grid = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "24px",

  "@media (max-width: 1024px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" },
  "@media (max-width: 768px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" },
  "@media (max-width: 767px)": { gridTemplateColumns: "1fr", gap: "12px" },
});

const CardLink = styled.a({
  textDecoration: "none",
  color: "inherit",
});

const Card = styled.article({
  display: "flex",
  flexDirection: "column",
});

const CardThumbnail = styled.div({
  aspectRatio: "1 / 1",
  borderRadius: "30px",
  overflow: "hidden",
  width: "100%",
  background: colors.categoryBg,

  // Card 가 column flex 라 min-height 가 auto 면 안쪽 img 의 원본 높이가
  // 자동 최소 높이가 되어 위 aspectRatio 를 밀어낸다. 세로형 썸네일만
  // 카드가 길어져 그리드 행 높이가 어긋났다. ProjectCard 와 같은 이유.
  minHeight: 0,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
});

const CardBody = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "10px 20px",
});

const CardTitle = styled.p({
  margin: 0,
  color: "#202325",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: fontWeights.semiBold,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",

  "@media (max-width: 1024px)": { fontSize: "24px", lineHeight: "30px" },
  "@media (max-width: 768px)": { fontSize: "20px", lineHeight: "25px" },
  "@media (max-width: 767px)": { fontSize: "16px", lineHeight: "20px" },
});

const CardDescription = styled.p({
  margin: 0,
  color: "#525252",
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: fontWeights.regular,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "40px",

  "@media (max-width: 1024px)": { fontSize: "14px", lineHeight: "18px" },
  "@media (max-width: 768px)": { fontSize: "13px", lineHeight: "18px" },
  "@media (max-width: 767px)": { fontSize: "12px", lineHeight: "15px" },
});

const BadgeRow = styled.div({
  display: "flex",
  gap: "8px",
  padding: "0 20px",
});

const Badge = styled.span<{ kind: "primary" | "gray" }>(({ kind }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 20px",
  borderRadius: "30px",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: fontWeights.medium,
  background: kind === "primary" ? colors.mainLight : "#e9e9e9",
  color: kind === "primary" ? colors.primary : "#525252",
  "@media (max-width: 1024px)": { fontSize: "18px", lineHeight: "23px" },
  "@media (max-width: 768px)": { fontSize: "16px", lineHeight: "20px" },
  "@media (max-width: 767px)": { fontSize: "14px", lineHeight: "18px" },
}));

type Props = {
  initialItems?: ProjectItem[];
  initialNextCursor?: string | null;
  /** 서버에서 그린 1페이지가 실패했는지. 실패한 채로 넘어오면 처음부터 안내 문구를 띄운다. */
  initialLoadFailed?: boolean;
};

const toApiPlatform = (tab: ProjectCategory): "IOS" | "AOS" | "WEB" | undefined => {
  if (tab === "전체") return undefined;
  if (tab === "iOS") return "IOS";
  return tab;
};

export const ProjectListPageSection = ({
  initialItems = [],
  initialNextCursor = null,
  initialLoadFailed = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("전체");
  const [projectItems, setProjectItems] = useState<ProjectItem[]>(initialItems);
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

  /*
    로딩 중에는 안내를 내지 않는다. 탭을 누르면 `activeTab` 은 즉시 바뀌지만 목록은
    응답이 와야 바뀌므로, 그 사이에 그리면 아직 확인하지도 않은 탭을 두고 "없어요" 라고
    단언하게 된다. 실패는 LoadErrorNotice 가 맡으므로 여기서는 제외한다.
  */
  const isEmpty = projectItems.length === 0 && !isLoading && !hasLoadError;
  const emptyMessage =
    activeTab === "전체"
      ? "아직 등록된 프로젝트가 없어요."
      : `아직 등록된 ${PROJECT_CATEGORY_LABELS[activeTab]} 프로젝트가 없어요.`;

  const goToPage = async (page: number) => {
    if (isLoading || page === currentPage || page < 1 || page > knownPageCount) return;

    // 앞쪽 페이지는 지나올 때 쓴 커서가 히스토리에 남아 있고, 아직 안 가본 다음 페이지는
    // 방금 응답이 준 nextCursor 로만 갈 수 있다.
    const cursor = page <= cursorHistory.length ? cursorHistory[page - 1] : nextCursor;

    setIsLoading(true);
    setHasLoadError(false);
    try {
      const loaded = await fetchPublicProjectsPage({
        platform: toApiPlatform(activeTab),
        limit: PROJECT_LIST_PAGE_SIZE,
        cursor: cursor ?? undefined,
      });
      setProjectItems(loaded.items);
      setNextCursor(loaded.nextCursor);
      // 뒤로 갈 때는 건너뛴 뒤쪽 히스토리를 버린다. 남겨두면 없는 페이지 번호가 계속 뜬다.
      setCursorHistory((prev) => [...prev.slice(0, page - 1), cursor]);
    } catch (error) {
      console.error("[project] 페이지를 불러오지 못했다.", error);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 지금 탭·페이지를 그대로 다시 불러온다.
   *
   * 탭을 다시 눌러 재시도하게 두지 않는 이유는, 그 경로가 항상 1페이지로 돌아가기
   * 때문이다. 3페이지에서 실패한 사람을 말없이 1페이지로 보내면 안 된다.
   */
  const retryCurrentPage = async () => {
    if (isLoading) return;
    const cursor = cursorHistory[cursorHistory.length - 1];
    setIsLoading(true);
    setHasLoadError(false);
    try {
      const loaded = await fetchPublicProjectsPage({
        platform: toApiPlatform(activeTab),
        limit: PROJECT_LIST_PAGE_SIZE,
        cursor: cursor ?? undefined,
      });
      setProjectItems(loaded.items);
      setNextCursor(loaded.nextCursor);
    } catch (error) {
      console.error("[project] 페이지를 다시 불러오지 못했다.", error);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTab = async (tab: ProjectCategory) => {
    if (isLoading || tab === activeTab) return;

    const previousTab = activeTab;
    setActiveTab(tab);
    setIsLoading(true);
    setHasLoadError(false);
    try {
      const loaded = await fetchPublicProjectsPage({
        platform: toApiPlatform(tab),
        limit: PROJECT_LIST_PAGE_SIZE,
      });
      setProjectItems(loaded.items);
      setNextCursor(loaded.nextCursor);
      setCursorHistory([null]);
    } catch (error) {
      console.error("[project] 탭 목록을 불러오지 못했다.", error);
      // 탭만 바뀌고 목록은 이전 탭 것이 남으면 화면이 거짓말을 한다. 선택을 되돌린다.
      setActiveTab(previousTab);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section>
      <Banner>
        <Heading>
          <Label>Projects</Label>
          <Title>DDD 멤버들이 만든 다양한 프로젝트를 확인해보세요.</Title>
        </Heading>
      </Banner>
      <ContentSection>
        <Body>
          <TabList role="tablist" aria-label="프로젝트 카테고리">
            {PROJECT_CATEGORY_TABS.map((tab) => (
              <Tab
                key={tab}
                role="tab"
                active={activeTab === tab}
                aria-selected={activeTab === tab}
                onClick={() => void selectTab(tab)}
              >
                {PROJECT_CATEGORY_LABELS[tab]}
              </Tab>
            ))}
          </TabList>
          <Grid>
            {projectItems.map((project) => (
              <CardLink key={project.id} href={`/project/${project.id}`}>
                <Card>
                  <CardThumbnail>
                    {project.thumbnail ? <img src={project.thumbnail} alt={project.title} /> : null}
                  </CardThumbnail>
                  <CardBody>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardBody>
                  <BadgeRow>
                    <Badge kind="primary">{PROJECT_CATEGORY_LABELS[project.category]}</Badge>
                    <Badge kind="gray">{project.generation}</Badge>
                  </BadgeRow>
                </Card>
              </CardLink>
            ))}
          </Grid>
          {isEmpty ? <EmptyNotice message={emptyMessage} /> : null}
          {hasLoadError ? (
            <LoadErrorNotice
              message="프로젝트를 불러오지 못했어요. 잠시 후 다시 시도해주세요."
              onRetry={() => void retryCurrentPage()}
              isRetrying={isLoading}
            />
          ) : null}
          <CursorPagination
            label="프로젝트 페이지네이션"
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
