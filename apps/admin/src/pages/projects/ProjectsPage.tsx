import { useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCohorts, useInfiniteProjects } from "@ddd/api"
import type { ProjectDto } from "@ddd/api"

import { FlexBox } from "@/shared/ui/FlexBox"
import { Title, Description } from "@/widgets/heading"

import {
  ProjectsToolbar,
  type CohortFilterValue,
  type PlatformFilterValue,
} from "./components/ProjectsToolbar"
import { ProjectsTable } from "./components/ProjectsTable"

const PAGE_LIMIT = 20

/** 프로젝트 관리 페이지 */
export default function ProjectsPage() {
  const [searchText, setSearchText] = useState("")
  const [platform, setPlatform] = useState<PlatformFilterValue>("ALL")
  const [cohortId, setCohortId] = useState<CohortFilterValue>("ALL")

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProjects({
    params: {
      platform: platform === "ALL" ? undefined : platform,
      limit: PAGE_LIMIT,
    },
  })

  const { data: cohorts = [] } = useCohorts()

  const cohortById = useMemo(
    () => new Map(cohorts.map((c) => [c.id, c])),
    [cohorts]
  )

  const allProjects = useMemo<ProjectDto[]>(
    () => projectsData?.pages.flatMap((page) => page.items) ?? [],
    [projectsData]
  )

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        searchText.length === 0 || project.name.includes(searchText)
      const matchesCohort = cohortId === "ALL" || project.cohortId === cohortId
      return matchesSearch && matchesCohort
    })
  }, [allProjects, searchText, cohortId])

  const handleCreate = () => {
    // Phase 6에서 ProjectFormDrawer 연결
  }

  const handleEdit = (_project: ProjectDto) => {
    // Phase 6에서 ProjectFormDrawer 연결
  }

  const handleDelete = (_project: ProjectDto) => {
    // Phase 7에서 DeleteProjectDialog 연결
  }

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection onCreate={handleCreate} />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <ProjectsToolbar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          platform={platform}
          onPlatformChange={setPlatform}
          cohortId={cohortId}
          onCohortChange={setCohortId}
          cohorts={cohorts}
        />

        {isProjectsLoading ? (
          <EmptyState>불러오는 중...</EmptyState>
        ) : isProjectsError ? (
          <EmptyState tone="danger">
            프로젝트 목록을 불러오지 못했습니다.
          </EmptyState>
        ) : filteredProjects.length === 0 ? (
          <EmptyState>
            {allProjects.length === 0
              ? "등록된 프로젝트가 없습니다."
              : "조건에 맞는 프로젝트가 없습니다."}
          </EmptyState>
        ) : (
          <>
            <ProjectsTable
              projects={filteredProjects}
              cohortById={cohortById}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <FlexBox className="justify-between pt-2">
              <span className="text-muted-foreground text-xs">
                현재 {filteredProjects.length}개 표시
                {hasNextPage ? " · 더 있음" : ""}
              </span>
              {hasNextPage && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => fetchNextPage()}
                  isDisabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
                </Button>
              )}
            </FlexBox>
          </>
        )}
      </div>
    </div>
  )
}

type TitleSectionProps = { onCreate: () => void }

const TitleSection = ({ onCreate }: TitleSectionProps) => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="프로젝트 관리" />
        <Description title="홈페이지에 노출되는 프로젝트를 등록하고 관리합니다." />
      </header>
      <Button size="lg" onPress={onCreate}>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        프로젝트 등록
      </Button>
    </FlexBox>
  )
}

type EmptyStateProps = {
  children: React.ReactNode
  tone?: "default" | "danger"
}

const EmptyState = ({ children, tone = "default" }: EmptyStateProps) => {
  return (
    <div
      className={
        tone === "danger"
          ? "py-12 text-center text-sm text-red-500"
          : "text-muted-foreground py-12 text-center text-sm"
      }
    >
      {children}
    </div>
  )
}
