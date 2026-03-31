import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // TODO: fetch project name by id
  const projectName = id;

  return {
    title: projectName,
    description: `DDD에서 진행된 사이드 프로젝트 ${projectName} 직접 확인해보세요.`,
  };
}

export default function ProjectDetailPage() {
  return <></>;
}
