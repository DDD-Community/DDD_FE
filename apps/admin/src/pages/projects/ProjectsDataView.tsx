import { useMemo } from "react"
import { Button } from "@heroui/react"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

import { projectQueries } from "@ddd/api"
import type { CohortDto, ProjectDto } from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { FlexBox } from "@/shared/ui/FlexBox"

import { ProjectsTable } from "./components/ProjectsTable"
import type {
  CohortFilterValue,
  PlatformFilterValue,
} from "./components/ProjectsToolbar"

const PAGE_LIMIT = 20

type ProjectsDataViewProps = {
  searchText: string
  platform: PlatformFilterValue
  cohortId: CohortFilterValue
  cohorts: CohortDto[]
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
}

export const ProjectsDataView = ({
  searchText,
  platform,
  cohortId,
  cohorts,
  onEdit,
  onDelete,
}: ProjectsDataViewProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      projectQueries.getAdminInfiniteProjects({
        params: {
          platform: platform === "ALL" ? undefined : platform,
          limit: PAGE_LIMIT,
        },
      })
    )

  const allProjects = useMemo<ProjectDto[]>(
    () => data.pages.flatMap((page) => page.items),
    [data]
  )

  const cohortById = useMemo(
    () => new Map(cohorts.map((c) => [c.id, c])),
    [cohorts]
  )

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        searchText.length === 0 || project.name.includes(searchText)
      const matchesCohort = cohortId === "ALL" || project.cohortId === cohortId
      return matchesSearch && matchesCohort
    })
  }, [allProjects, searchText, cohortId])

  if (filteredProjects.length === 0) {
    return (
      <EmptyState>
        {allProjects.length === 0
          ? "등록된 프로젝트가 없습니다."
          : "조건에 맞는 프로젝트가 없습니다."}
      </EmptyState>
    )
  }

  return (
    <>
      <ProjectsTable
        projects={filteredProjects}
        cohortById={cohortById}
        onEdit={onEdit}
        onDelete={onDelete}
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
  )
}
