'use client';

import { useState } from 'react';
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
  padding: '120px 40px',
  gap: '24px',
});

const Inner = styled.div({
  width: '100%',
  maxWidth: '1280px',
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
});

const SectionTitle = styled.h2({
  fontFamily: "'Pretendard', sans-serif",
  fontSize: fontSizes.headingLarge,
  fontWeight: fontWeights.semiBold,
  lineHeight: lineHeights.headingLarge,
  color: colors.textInverse,
});

const TabsAndCards = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
});

const TabList = styled.div({
  display: 'flex',
  gap: '40px',
  width: '100%',
  role: 'tablist',
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
}));

const CardGrid = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '24px',
  width: '100%',
});

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
});

export const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>('전체');

  const filteredProjects =
    activeTab === '전체' ? PROJECTS : PROJECTS.filter((project) => project.category === activeTab);

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
          <CardGrid>
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
          <MoreButton href="/project">
            더 알아보기
            <img src={assets.arrowLeft} alt="" width={24} height={24} />
          </MoreButton>
        </TabsAndCards>
      </Inner>
    </Section>
  );
};
