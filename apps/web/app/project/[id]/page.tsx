import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailSection } from "@/components/sections/ProjectDetailSection";
import { fetchAllPublicProjects, fetchPublicProjectById } from "@/lib/api/project";

type Props = {
  params: Promise<{ id: string }>;
};

/*
  공개된 프로젝트 상세를 빌드 때 전부 미리 굽는다.

  이게 없으면 상세는 "요청 시 렌더" 경로라, 목록에서 카드를 눌러도 Link 가 미리 받아
  둘 것이 없고(동적 경로는 loading 경계까지만 프리페치) 클릭한 뒤에야 서버 렌더를
  기다린다. 미리 구워 두면 정적 경로가 되어 카드가 보일 때 상세를 받아 두고, 클릭
  즉시 바뀐다. 루트 레이아웃의 revalidate 로 60초마다 새로 굽는다.

  빌드 뒤 새로 등록된 프로젝트는 첫 요청 때 렌더돼 캐시된다(dynamicParams 기본값).

  목록 조회에 실패해도 빌드는 깨지지 않는다. 빈 배열이면 전부 요청 시 렌더로 넘어갈 뿐이다.

  이 세그먼트에 loading.tsx 를 두지 말 것. 두면 없는 id 가 404 가 아니라 로딩 셸을
  200 으로 먼저 내보낸 뒤 그 안에 not-found 를 그려서(noindex 메타만 붙는다) 검색엔진과
  링크 미리보기가 "있는 페이지" 로 본다. 2026-09-22 로컬 빌드에서 확인했다.
*/
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  try {
    const projects = await fetchAllPublicProjects();
    return projects.map(({ id }) => ({ id }));
  } catch (error) {
    console.error("[project] 상세 프리렌더 목록을 불러오지 못했다. 요청 시 렌더로 넘긴다.", error);
    return [];
  }
}

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
    notFound();
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
