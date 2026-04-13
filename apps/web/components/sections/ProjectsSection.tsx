'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { assets } from '@/constants/assets';
import { colors, fontSizes, fontWeights, lineHeights } from '@/constants/tokens';

type ProjectCategory = '전체' | 'iOS' | 'AOS' | 'WEB';

const TABS: ProjectCategory[] = ['전체', 'iOS', 'AOS', 'WEB'];

const PROJECTS = [
  {
    id: '1',
    title: 'Moyorak (모여락)',
    description: '점심 맛집을 기록·추천하고 팀별로 공유할 수 있는 사내 맛집 관리 서비스 Moyorak을 발표했어요.',
    thumbnail: assets.projectThumbnails[0],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
  {
    id: '2',
    title: 'Growit (그로잇)',
    description: 'IT 직장인을 위한 자기 회고 및 성장 시각화 기반의 web 기록 서비스 GROWIT을 발표했어요.',
    thumbnail: assets.projectThumbnails[1],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
  {
    id: '3',
    title: 'FESTIBEE (페스티비)',
    description: '페스티벌 정보를 확인하고 소통할 수 있는 캘린더 기반 알림 서비스 FESTIBEE를 발표했어요.',
    thumbnail: assets.projectThumbnails[2],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
  {
    id: '4',
    title: 'FESTIBEE (페스티비)',
    description: '페스티벌 정보를 확인하고 소통할 수 있는 캘린더 기반 알림 서비스 FESTIBEE를 발표했어요.',
    thumbnail: assets.projectThumbnails[2],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
  {
    id: '5',
    title: 'Growit (그로잇)',
    description: 'IT 직장인을 위한 자기 회고 및 성장 시각화 기반의 web 기록 서비스 GROWIT을 발표했어요.',
    thumbnail: assets.projectThumbnails[1],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
  {
    id: '6',
    title: 'Moyorak (모여락)',
    description: '점심 맛집을 기록·추천하고 팀별로 공유할 수 있는 사내 맛집 관리 서비스 Moyorak을 발표했어요.',
    thumbnail: assets.projectThumbnails[0],
    category: 'WEB' as ProjectCategory,
    generation: '13기',
  },
] as const;

const Section = styled.section({
  background: colors.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '120px 320px',
  gap: '24px',

  '@media (max-width: 1024px)': { padding: '120px 80px' },
  '@media (max-width: 768px)': { padding: '100px 40px' },
  '@media (max-width: 375px)': { padding: '80px 16px' },
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1920px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const TitleArea = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const SectionLabel = styled.p({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  color: colors.textInverse,

  '@media (max-width: 375px)': {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
  },
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,

  '@media (max-width: 768px)': {
    fontSize: '24px',
    lineHeight: '30px',
  },
  '@media (max-width: 375px)': {
    fontSize: '20px',
    lineHeight: '25px',
  },
});

const TabsAndCards = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
  width: '100%',
});

const TabList = styled.div({
  display: 'flex',
  gap: '40px',
  justifyContent: 'center',
  width: '100%',
  role: 'tablist',

  '@media (max-width: 375px)': { gap: '12px', overflowX: 'auto', justifyContent: 'flex-start' },
});

interface TabButtonProps {
  isActive: boolean;
}

const TabButton = styled.button<TabButtonProps>(({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 20px',
  background: 'none',
  border: 'none',
  borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingMedium,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.headingMedium,
  color: isActive ? colors.primary : colors.textInverse,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'color 0.15s, border-color 0.15s',

  '@media (max-width: 375px)': {
    padding: '6px 12px',
    fontSize: '16px',
    lineHeight: '20px',
  },
}));

const CardGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '24px',
  width: '100%',

  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (max-width: 768px)': {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    gap: '12px',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',

    '&::-webkit-scrollbar': {
      display: 'none',
    },

    '& > *': {
      flex: '0 0 100%',
      minWidth: '100%',
      scrollSnapAlign: 'start',
    },
  },
});

const MobileBulletRow = styled.div({
  display: 'none',

  '@media (max-width: 768px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
});

const MobileBullet = styled.button<{ active: boolean }>(({ active }) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: active ? colors.slate500 : colors.slate200,
  opacity: active ? 1 : 0.9,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
}));

const MoreButton = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  height: '80px',
  padding: '20px 50px',
  background: colors.primary,
  borderRadius: '100px',
  color: colors.textInverse,
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.large,
  fontWeight: fontWeights.medium,
  lineHeight: lineHeights.paragraphLarge,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'background 0.15s',

  '&:hover': {
    background: '#1f5fe0',
  },

  '@media (max-width: 768px)': {
    height: '68px',
    padding: '16px 36px',
    fontSize: '18px',
    lineHeight: '24px',
  },
  '@media (max-width: 375px)': {
    height: '56px',
    padding: '30px 40px',
    fontSize: '14px',
    lineHeight: '18px',
  },
});

export const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>('전체');
  const [activeSlide, setActiveSlide] = useState(0);
  const cardGridRef = useRef<HTMLDivElement | null>(null);

  const filteredProjects =
    activeTab === '전체' ? PROJECTS : PROJECTS.filter((project) => project.category === activeTab);

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

    container.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    setActiveSlide(index);
  }, []);

  useEffect(() => {
    const container = cardGridRef.current;
    if (!container) return;

    const onScroll = () => updateActiveSlide();
    container.addEventListener('scroll', onScroll, { passive: true });
    let raf = 0;
    raf = requestAnimationFrame(() => updateActiveSlide());

    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [updateActiveSlide, filteredProjects]);

  useEffect(() => {
    const container = cardGridRef.current;
    if (!container) return;
    container.scrollTo({ left: 0, behavior: 'auto' });
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
            <img src={assets.arrowLeft} alt="" width={24} height={24} />
          </MoreButton>
        </TabsAndCards>
      </Inner>
    </Section>
  );
};
