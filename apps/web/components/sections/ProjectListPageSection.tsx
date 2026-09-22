"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { Skeleton, VisuallyHidden } from "@/components/ui/Skeleton";
import { slicePage, useCursorPagedList } from "@/hooks/useCursorPagedList";
import { fetchAllPublicProjects } from "@/lib/api/project";

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

  // 페이지를 넘길 때 여기로 스크롤이 돌아온다. 헤더가 고정이라 그만큼 아래에서 멈춰야
  // 탭이 가려지지 않는다(헤더 = 상단 여백 32 + 로고 55, 모바일 16 + 48).
  scrollMarginTop: "104px",
  "@media (max-width: 768px)": { scrollMarginTop: "80px" },
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

/*
  next/link 여야 한다. 전에는 styled.a 였는데, 그러면 카드를 눌렀을 때 문서를 통째로
  다시 받아 홈 첫 진입과 같은 대기(서버 렌더 + JS 전부 다시 로드)가 매번 생긴다.
  Link 는 화면에 보이는 카드의 상세를 미리 받아 두고 클릭 즉시 바꿔 그린다.
*/
const CardLink = styled(Link)({
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

  // next/image 의 fill 은 가장 가까운 위치 지정 조상을 기준으로 깔린다.
  position: "relative",

  // Card 가 column flex 라 min-height 가 auto 면 안쪽 img 의 원본 높이가
  // 자동 최소 높이가 되어 위 aspectRatio 를 밀어낸다. 세로형 썸네일만
  // 카드가 길어져 그리드 행 높이가 어긋났다. ProjectCard 와 같은 이유.
  minHeight: 0,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    // 세로 크롭이 상단 카피 대신 아래쪽만 먹게 한다. ProjectCard 와 같은 이유.
    objectPosition: "top",
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

/*
  불러오는 동안 카드가 들어올 자리를 잡아두는 뼈대.

  여백·모서리·최소 높이를 위 실제 카드와 같은 값으로 맞춘다. 어긋나면 결과가 들어오는
  순간 그리드 높이가 바뀌어 화면이 한 번 튄다.
*/
const SkeletonThumbnail = styled(Skeleton)({
  aspectRatio: "1 / 1",
  width: "100%",
  borderRadius: "30px",
});

const SkeletonTitle = styled(Skeleton)({
  width: "70%",
  height: "32px",

  "@media (max-width: 1024px)": { height: "30px" },
  "@media (max-width: 768px)": { height: "25px" },
  "@media (max-width: 767px)": { height: "20px" },
});

// CardDescription 의 minHeight(2줄) 와 같은 높이를 차지한다.
const SkeletonDescription = styled(Skeleton)({
  width: "100%",
  height: "40px",
});

const SkeletonBadge = styled(Skeleton)({
  width: "84px",
  height: "28px",
  borderRadius: "30px",

  "@media (max-width: 1024px)": { height: "23px" },
  "@media (max-width: 768px)": { height: "20px" },
  "@media (max-width: 767px)": { height: "18px" },
});

const SkeletonCard = () => (
  // 읽을 내용이 없는 시각적 자리표시자다. 로딩 중이라는 사실은 아래 status 가 말한다.
  <Card aria-hidden>
    <SkeletonThumbnail />
    <CardBody>
      <SkeletonTitle />
      <SkeletonDescription />
    </CardBody>
    <BadgeRow>
      <SkeletonBadge />
      <SkeletonBadge />
    </BadgeRow>
  </Card>
);

type Props = {
  /** 서버에서 받아둔 "전체" 탭 프로젝트 **전부**. 한 페이지가 아니다. */
  initialProjects?: ProjectItem[];
  /** 서버 조회가 실패했는지. 실패했으면 그 빈 목록을 캐시하지 않고 브라우저에서 다시 받는다. */
  initialLoadFailed?: boolean;
};

const DEFAULT_TAB: ProjectCategory = "전체";

/*
  브라우저가 받아올 썸네일 크기를 고른다. 아래 Grid 의 열 수와 같은 순서로 적는다 —
  어긋나면 필요보다 큰 이미지를 받거나(느려짐) 작은 이미지를 늘려 그린다(흐릿해짐).

  본문은 최대 1280px 에 3열·간격 24px 이라 한 칸이 약 427px 이다.
*/
const THUMBNAIL_SIZES = "(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 427px";

/** 그리드 첫 줄(3열)에 들어가는 카드 수. 이만큼은 lazy 로 미루지 않는다. */
const FIRST_ROW_COUNT = 3;

const toApiPlatform = (tab: ProjectCategory): "IOS" | "AOS" | "WEB" | undefined => {
  if (tab === "전체") return undefined;
  if (tab === "iOS") return "IOS";
  return tab;
};

export const ProjectListPageSection = ({
  initialProjects = [],
  initialLoadFailed = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>(DEFAULT_TAB);

  // 탭별로 한 번 받아둔 전체 목록. 서버가 내려준 "전체" 탭 몫으로 시작한다.
  const allByTabRef = useRef<Partial<Record<ProjectCategory, ProjectItem[]>>>(
    initialLoadFailed ? {} : { [DEFAULT_TAB]: initialProjects },
  );

  /*
    탭이 바뀔 때만 새로 만들어야 한다. 매 렌더마다 새 함수를 넘기면 훅이 "필터가 또
    바뀌었다" 고 보고 체인을 다시 걷는다.

    한 탭에서 네트워크를 타는 건 첫 호출 한 번뿐이고, 그 뒤 페이지는 받아둔 배열을
    자르기만 한다 — 그래서 훅의 배경 선행이 요청 없이 즉시 끝나고 페이지 번호가 첫
    화면부터 정확하다.
  */
  const fetchProjectsPage = useCallback(
    async (cursor: string | null) => {
      const cached = allByTabRef.current[activeTab];
      const all = cached ?? (await fetchAllPublicProjects({ platform: toApiPlatform(activeTab) }));
      allByTabRef.current[activeTab] = all;
      return slicePage(all, cursor, PROJECT_LIST_PAGE_SIZE);
    },
    [activeTab],
  );

  const {
    items: projectItems,
    currentPage,
    pageCount,
    isLoading,
    hasError,
    goToPage,
    retry,
    listTopRef,
  } = useCursorPagedList<ProjectItem>({
    filterKey: activeTab,
    fetchPage: fetchProjectsPage,
    initialChain: initialLoadFailed
      ? undefined
      : { filterKey: DEFAULT_TAB, page: slicePage(initialProjects, null, PROJECT_LIST_PAGE_SIZE) },
    logLabel: "project",
  });

  /*
    로딩 중에는 안내를 내지 않는다. 탭을 누르면 `activeTab` 은 즉시 바뀌지만 목록은
    응답이 와야 바뀌므로, 그 사이에 그리면 아직 확인하지도 않은 탭을 두고 "없어요" 라고
    단언하게 된다. 실패는 LoadErrorNotice 가 맡으므로 여기서는 제외한다.
  */
  const isEmpty = projectItems.length === 0 && !isLoading && !hasError;
  const emptyMessage =
    activeTab === "전체"
      ? "아직 등록된 프로젝트가 없어요."
      : `아직 등록된 ${PROJECT_CATEGORY_LABELS[activeTab]} 프로젝트가 없어요.`;

  return (
    <Section>
      <Banner>
        <Heading>
          <Label>Projects</Label>
          <Title>DDD 멤버들이 만든 다양한 프로젝트를 확인해보세요.</Title>
        </Heading>
      </Banner>
      <ContentSection>
        <Body ref={listTopRef}>
          <TabList role="tablist" aria-label="프로젝트 카테고리">
            {PROJECT_CATEGORY_TABS.map((tab) => (
              <Tab
                key={tab}
                role="tab"
                active={activeTab === tab}
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {PROJECT_CATEGORY_LABELS[tab]}
              </Tab>
            ))}
          </TabList>
          <Grid aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: PROJECT_LIST_PAGE_SIZE }, (_, index) => (
                  <SkeletonCard key={index} />
                ))
              : projectItems.map((project, index) => (
                  <CardLink key={project.id} href={`/project/${project.id}`}>
                    <Card>
                      <CardThumbnail>
                        {project.thumbnail ? (
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            sizes={THUMBNAIL_SIZES}
                            /*
                              첫 줄은 화면을 열자마자 보이는 자리다. next/image 는
                              기본이 lazy 라 이 세 장까지 뒤로 미뤄지면 가장 큰
                              요소가 늦게 그려진다. 나머지는 lazy 로 둔다.
                            */
                            priority={index < FIRST_ROW_COUNT}
                          />
                        ) : null}
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
          {isLoading ? (
            <VisuallyHidden role="status">프로젝트 목록을 불러오는 중이에요.</VisuallyHidden>
          ) : null}
          {isEmpty ? <EmptyNotice message={emptyMessage} /> : null}
          {hasError ? (
            <LoadErrorNotice
              message="프로젝트를 불러오지 못했어요. 잠시 후 다시 시도해주세요."
              onRetry={retry}
            />
          ) : null}
          <CursorPagination
            label="프로젝트 페이지네이션"
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
