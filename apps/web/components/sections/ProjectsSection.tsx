"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { ProjectItem } from "@/constants/projects";
import { colors, fontSizes, fontWeights } from "@/constants/tokens";

type ProjectCategory = "전체" | "iOS" | "AOS" | "WEB";

const TABS: ProjectCategory[] = ["전체", "iOS", "AOS", "WEB"];

const Section = styled.section({
  background: colors.background,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "120px 80px",
  gap: "24px",

  "@media (max-width: 1024px)": { padding: "120px 80px" },
  "@media (max-width: 768px)": { padding: "100px 40px" },
  "@media (max-width: 767px)": { padding: "80px 16px" },
});

const Inner = styled.div({
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "24px",

  "@media (max-width: 767px)": { gap: "12px" },
});

const TitleArea = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",

  // 375 의 Gutter 토큰은 12 다.
  "@media (max-width: 767px)": { gap: "12px" },
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.medium,
  color: colors.textInverse,
  fontSize: "20px",
  lineHeight: "28px",
  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "23px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    fontSize: "14px",
    lineHeight: "18px",
  },
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontWeight: fontWeights.semiBold,
  color: colors.textInverse,
  fontSize: "28px",
  lineHeight: "32px",
  "@media (max-width: 1024px)": {
    fontSize: "24px",
    lineHeight: "30px",
  },
  "@media (max-width: 768px)": {
    fontSize: "20px",
    lineHeight: "25px",
  },
  "@media (max-width: 767px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
});

const TabsAndCards = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px",
  width: "100%",
});

const TabList = styled.div({
  display: "flex",
  gap: "40px",
  justifyContent: "center",
  width: "100%",
  flexWrap: "nowrap",
  role: "tablist",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  msOverflowStyle: "none",

  "&::-webkit-scrollbar": {
    display: "none",
  },

  "@media (max-width: 768px)": {
    overflowX: "auto",
    justifyContent: "flex-start",
    WebkitOverflowScrolling: "touch",
  },
  "@media (max-width: 767px)": { gap: "12px" },
});

interface TabButtonProps {
  isActive: boolean;
}

const TabButton = styled.button<TabButtonProps>(({ isActive: active }) => ({
  border: "none",
  background: "transparent",
  color: active ? colors.primary : "#FFF",
  borderBottom: `2px solid ${active ? colors.primary : "FFF"}`,
  fontSize: "16px",
  lineHeight: "20px",
  // xl/Heading/Medium 은 전 브레이크포인트에서 Medium 이다.
  fontWeight: fontWeights.medium,
  padding: "8px 20px",
  cursor: "pointer",
  whiteSpace: "nowrap",

  "@media (max-width: 1024px)": { fontSize: "14px", lineHeight: "18px" },
  "@media (max-width: 768px)": { fontSize: "13px", lineHeight: "16px" },
  "@media (max-width: 767px)": {
    fontSize: "12px",
    lineHeight: "15px",
  },
}));

const CardGrid = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "24px",
  width: "100%",

  "@media (max-width: 1024px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (max-width: 768px)": {
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    gap: "12px",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",

    "&::-webkit-scrollbar": {
      display: "none",
    },

    "& > *": {
      flex: "0 0 100%",
      minWidth: "100%",
      scrollSnapAlign: "start",
    },
  },
});

const MobileBulletRow = styled.div({
  display: "none",

  "@media (max-width: 768px)": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
});

const MobileBullet = styled.button<{ active: boolean }>(({ active }) => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: active ? colors.slate500 : colors.slate200,
  opacity: active ? 1 : 0.9,
  border: "none",
  padding: 0,
  cursor: "pointer",
}));

const MoreButton = styled(Link)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  height: "80px",
  padding: "20px 50px",
  background: colors.primary,
  borderRadius: "100px",
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: "28px",
  textDecoration: "none",
  whiteSpace: "nowrap",
  flexShrink: 0,
  transition: "background 0.15s",

  "&:hover": {
    background: "#1f5fe0",
  },

  "@media (max-width: 1024px)": {
    fontSize: "18px",
    lineHeight: "24px",
  },
  "@media (max-width: 768px)": {
    fontSize: "16px",
    lineHeight: "20px",
  },
  "@media (max-width: 767px)": {
    height: "48px",
    padding: "0 40px",
    fontSize: "14px",
    lineHeight: "18px",
    "& svg": { width: "20px", height: "20px" },
  },
});

type Props = {
  items: ProjectItem[];
};

export const ProjectsSection = ({ items }: Props) => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>("전체");
  const [activeSlide, setActiveSlide] = useState(0);
  const cardGridRef = useRef<HTMLDivElement | null>(null);
  const sourceProjects: readonly ProjectItem[] = items;

  const filteredProjects =
    activeTab === "전체"
      ? sourceProjects
      : sourceProjects.filter((project) => project.category === activeTab);

  const updateActiveSlide = useCallback(() => {
    const container = cardGridRef.current;
    if (!container) return;

    const slides = Array.from(container.children) as HTMLElement[];
    if (slides.length === 0) return;

    const scrollLeft = container.scrollLeft;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveSlide(nearestIndex);
  }, []);

  const handleBulletClick = useCallback((index: number) => {
    const container = cardGridRef.current;
    if (!container) return;

    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;

    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveSlide(index);
  }, []);

  useEffect(() => {
    const container = cardGridRef.current;
    if (!container) return;

    const onScroll = () => updateActiveSlide();
    container.addEventListener("scroll", onScroll, { passive: true });
    let raf = 0;
    raf = requestAnimationFrame(() => updateActiveSlide());

    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [updateActiveSlide, filteredProjects]);

  useEffect(() => {
    const container = cardGridRef.current;
    if (!container) return;
    container.scrollTo({ left: 0, behavior: "auto" });
    let raf = 0;
    raf = requestAnimationFrame(() => setActiveSlide(0));

    return () => cancelAnimationFrame(raf);
  }, [activeTab]);

  return (
    <Section>
      <Inner>
        <TitleArea>
          <SectionLabel>Projects</SectionLabel>
          <SectionTitle>DDD 멤버들이 만든 다양한 프로젝트를 확인해보세요.</SectionTitle>
        </TitleArea>
        <TabsAndCards>
          <TabList role="tablist">
            {TABS.map((tab) => (
              <TabButton
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </TabButton>
            ))}
          </TabList>
          <CardGrid ref={cardGridRef}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                thumbnail={project.thumbnail}
                category={project.category}
                generation={project.generation}
                href={`/project/${project.id}`}
              />
            ))}
          </CardGrid>
          <MobileBulletRow>
            {filteredProjects.map((project, index) => (
              <MobileBullet
                key={project.id}
                active={activeSlide === index}
                aria-label={`${index + 1}번 프로젝트로 이동`}
                onClick={() => handleBulletClick(index)}
              />
            ))}
          </MobileBulletRow>
          <MoreButton href="/project">
            더 알아보기
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" fill="white" />
            </svg>{" "}
          </MoreButton>
        </TabsAndCards>
      </Inner>
    </Section>
  );
};
