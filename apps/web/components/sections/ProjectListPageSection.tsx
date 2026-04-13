'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { colors, fontWeights } from '@/constants/tokens';
import { projects, type ProjectCategory } from '@/constants/projects';

const tabs: ProjectCategory[] = ['전체', 'iOS', 'AOS', 'WEB'];

const Section = styled.section({
  background: '#ffffff',
});

const Banner = styled.div({
  position: 'relative',
  overflow: 'hidden',
  padding: '160px 320px 80px',
  minHeight: '330px',
  backgroundImage: "url('https://www.figma.com/api/mcp/asset/6f928e32-36e6-4c5d-886d-63789ff48cea')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',

  '@media (max-width: 1024px)': { padding: '160px 80px 80px' },
  '@media (max-width: 768px)': { padding: '140px 40px 50px', minHeight: '300px' },
  '@media (max-width: 375px)': { padding: '160px 16px 20px', minHeight: '300px' },
});

const Heading = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const Body = styled.div({
  padding: '80px 319px',
  '@media (max-width: 1024px)': { padding: '80px' },
  '@media (max-width: 768px)': { padding: '40px' },
  '@media (max-width: 375px)': { padding: '40px 16px' },
});

const Label = styled.p({
  margin: 0,
  fontSize: '28px',
  lineHeight: '32px',
  color: '#62748e',
  fontWeight: fontWeights.semiBold,
  '@media (max-width: 1024px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '20px' },
  '@media (max-width: 375px)': { fontSize: '12px', lineHeight: '15px' },
});

const Title = styled.h1({
  margin: 0,
  color: '#cad5e2',
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 1024px)': { fontSize: '34px', lineHeight: '45px' },
  '@media (max-width: 768px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 375px)': { fontSize: '24px', lineHeight: '30px', width: '265px' },
});

const TabList = styled.div({
  display: 'flex',
  gap: '24px',
  justifyContent: 'center',
  marginBottom: '80px',
  overflowX: 'auto',
  paddingBottom: '4px',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',

  '@media (max-width: 768px)': {
    marginBottom: '40px',
  },
});

const Tab = styled.button<{ active: boolean }>(({ active }) => ({
  border: 'none',
  background: 'transparent',
  color: active ? colors.primary : '#525252',
  borderBottom: `2px solid ${active ? colors.primary : 'transparent'}`,
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: fontWeights.semiBold,
  padding: '8px 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  '@media (max-width: 1024px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 768px)': { fontSize: '14px', lineHeight: '18px', padding: '6px 10px' },
  '@media (max-width: 375px)': {
    fontSize: '12px',
    lineHeight: '15px',
    padding: '4px 8px',
  },
}));

const Grid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '24px',

  '@media (max-width: 1024px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
});

const Pagination = styled.div({
  marginTop: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '40px',
  color: '#d4d4d4',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 768px)': {
    gap: '24px',
    marginTop: '48px',
    fontSize: '14px',
    lineHeight: '18px',
  },
});

const Arrow = styled.span({
  color: '#cad5e2',
  fontSize: '18px',
});

export const ProjectListPageSection = () => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>('전체');

  const filtered = useMemo(() => {
    if (activeTab === '전체') return projects;
    return projects.filter((project) => project.category === activeTab);
  }, [activeTab]);

  return (
    <Section>
      <Banner>
        <Heading>
          <Label>Projects</Label>
          <Title>DDD 멤버들이 만든 다양한 프로젝트를 확인해보세요.</Title>
        </Heading>
      </Banner>
      <Body>
        <TabList role="tablist" aria-label="프로젝트 카테고리">
          {tabs.map((tab) => (
            <Tab key={tab} role="tab" active={activeTab === tab} aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </Tab>
          ))}
        </TabList>
        <Grid>
          {filtered.map((project) => (
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
        </Grid>
        <Pagination aria-label="프로젝트 페이지네이션">
          <Arrow>‹</Arrow>
          <span style={{ color: '#525252' }}>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <Arrow>›</Arrow>
        </Pagination>
      </Body>
    </Section>
  );
};
