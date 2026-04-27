import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { SponsorSection } from '@/components/sections/SponsorSection';
import { CtaSection } from '@/components/sections/CtaSection';
import { fetchPublicArticles, fetchPublicProjects } from '@/lib/web-api';

export default async function HomePage() {
  const [projects, articles] = await Promise.all([fetchPublicProjects(), fetchPublicArticles()]);

  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection items={projects.slice(0, 6)} />
        <BlogSection items={articles.slice(0, 5)} />
        <FaqSection />
        <SponsorSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
