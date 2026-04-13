'use client';

import styled from '@emotion/styled';
import { colors, fontWeights, fontSizes, lineHeights } from '@/constants/tokens';
import type { ProjectItem } from '@/constants/projects';

const Section = styled.section({
  background: '#ffffff',
});

const Banner = styled.div<{ src: string }>(({ src }) => ({
  minHeight: '330px',
  padding: '160px 320px 80px',
  backgroundImage: `url('${src}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'flex-end',

  '@media (max-width: 1024px)': { padding: '160px 80px 80px' },
  '@media (max-width: 768px)': { padding: '140px 40px 50px', minHeight: '300px' },
  '@media (max-width: 375px)': { padding: '160px 16px 20px', minHeight: '300px' },
}));

const BannerLabel = styled.p({
  margin: 0,
  color: '#62748e',
  fontSize: fontSizes.headingLarge,
  lineHeight: lineHeights.headingLarge,
  fontWeight: fontWeights.semiBold,

  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '20px' },
  '@media (max-width: 375px)': { fontSize: '12px', lineHeight: '15px' },
});

const BannerTitle = styled.h1({
  margin: '8px 0 0',
  color: '#cad5e2',
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 1024px)': { fontSize: '34px', lineHeight: '45px' },
  '@media (max-width: 768px)': { fontSize: '24px', lineHeight: '30px' },
  '@media (max-width: 375px)': { fontSize: '24px', lineHeight: '30px', maxWidth: '265px' },
});

const Container = styled.div({
  padding: '80px 320px',

  '@media (max-width: 1024px)': { padding: '40px 80px' },
  '@media (max-width: 768px)': { padding: '40px' },
  '@media (max-width: 375px)': { padding: '40px 16px' },
});

const BadgeRow = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
});

const Badge = styled.span<{ kind: 'primary' | 'gray' }>(({ kind }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 20px',
  borderRadius: '30px',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,
  color: kind === 'primary' ? colors.primary : '#525252',
  background: kind === 'primary' ? colors.mainLight : '#e9e9e9',

  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '23px' },
  '@media (max-width: 375px)': { fontSize: '14px', lineHeight: '18px' },
}));

const Title = styled.h2({
  margin: '20px 0 0',
  color: '#202325',
  fontSize: '48px',
  lineHeight: '55px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '38px', lineHeight: '45px' },
  '@media (max-width: 375px)': { fontSize: '18px', lineHeight: '25px', marginTop: '20px' },
});

const LongDescription = styled.p({
  margin: '12px 0 0',
  color: '#202325',
  whiteSpace: 'pre-line',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 768px)': { fontSize: '14px', lineHeight: '18px' },
  '@media (max-width: 375px)': { fontSize: '9px', lineHeight: '12px' },
});

const TeamTitle = styled.h3({
  margin: '48px 0 0',
  color: '#202325',
  fontSize: '40px',
  lineHeight: '50px',
  fontWeight: fontWeights.bold,

  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '25px' },
  '@media (max-width: 375px)': { marginTop: '48px' },
});

const MemberGrid = styled.div({
  marginTop: '12px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
});

const Member = styled.div({
  background: '#f1f5f9',
  borderRadius: '10px',
  padding: '12px 20px',
  display: 'inline-flex',
  alignItems: 'flex-end',
  gap: '14px',
});

const MemberName = styled.span({
  color: '#202325',
  fontSize: '24px',
  lineHeight: '30px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 768px)': { fontSize: '20px', lineHeight: '25px' },
  '@media (max-width: 375px)': { fontSize: '16px', lineHeight: '20px' },
});

const MemberRole = styled.span({
  color: '#90a1b9',
  fontSize: '20px',
  lineHeight: '25px',
  fontWeight: fontWeights.medium,

  '@media (max-width: 768px)': { fontSize: '18px', lineHeight: '23px' },
  '@media (max-width: 375px)': { fontSize: '14px', lineHeight: '18px' },
});

const Pdf = styled.img({
  marginTop: '40px',
  width: '100%',
  height: 'auto',
  display: 'block',
});

type Props = { project: ProjectItem };

export const ProjectDetailSection = ({ project }: Props) => {
  return (
    <Section>
      <Banner src={project.banner}>
        <div>
          <BannerLabel>Projects</BannerLabel>
          <BannerTitle>DDD 멤버들이 만든 다양한 프로젝트를 확인해보세요.</BannerTitle>
        </div>
      </Banner>
      <Container>
        <BadgeRow>
          <Badge kind="primary">{project.category}</Badge>
          <Badge kind="gray">{project.generation}</Badge>
        </BadgeRow>
        <Title>{project.detailTitle}</Title>
        <LongDescription>{project.longDescription}</LongDescription>

        <TeamTitle>팀원</TeamTitle>
        <MemberGrid>
          {project.participants.map((member) => (
            <Member key={`${member.name}-${member.role}`}>
              <MemberName>{member.name}</MemberName>
              <MemberRole>{member.role}</MemberRole>
            </Member>
          ))}
        </MemberGrid>

        <Pdf src={project.pdf} alt={`${project.title} 상세 소개`} />
      </Container>
    </Section>
  );
};
