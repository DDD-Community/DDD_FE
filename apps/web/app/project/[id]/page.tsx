import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailSection } from "@/components/sections/ProjectDetailSection";
import { fetchPublicProjectById, fetchPublicProjects } from "@/lib/web-api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchPublicProjectById(id);
  const projectName = project?.title ?? id;

  return {
    title: projectName,
    description: `DDD에서 진행된 사이드 프로젝트 ${projectName} 직접 확인해보세요.`,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await fetchPublicProjectById(id);

  if (!project) {
    const fallbackProjects = await fetchPublicProjects();
    const fallbackProject = fallbackProjects.find((item) => item.id === id);
    if (!fallbackProject) {
      notFound();
    }

    return (
      <>
        <Navigation />
        <main>
          <ProjectDetailSection project={fallbackProject} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main>
        <ProjectDetailSection project={project} />
      </main>
      <Footer />
    </>
  );
}
