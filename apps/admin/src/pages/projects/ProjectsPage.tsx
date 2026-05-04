import { useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCohorts, useAdminInfiniteProjects } from "@ddd/api"
import type { ProjectDto } from "@ddd/api"

import { FlexBox } from "@/shared/ui/FlexBox"
import { TitleSection } from "@/widgets/heading"

import { DeleteProjectDialog } from "./components/DeleteProjectDialog"
import { ProjectFormDrawer } from "./components/ProjectFormDrawer"
import {
  ProjectsToolbar,
  type CohortFilterValue,
  type PlatformFilterValue,
} from "./components/ProjectsToolbar"
import { ProjectsTable } from "./components/ProjectsTable"

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; project: ProjectDto }

const PAGE_LIMIT = 20

/** 프로젝트 관리 페이지 */
export default function ProjectsPage() {
  const [searchText, setSearchText] = useState("")
  const [platform, setPlatform] = useState<PlatformFilterValue>("ALL")
  const [cohortId, setCohortId] = useState<CohortFilterValue>("ALL")
  const [drawerState, setDrawerState] = useState<DrawerState>({
    mode: "closed",
  })
  const [deleteTarget, setDeleteTarget] = useState<ProjectDto | null>(null)

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminInfiniteProjects({
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

  const handleCreate = () => setDrawerState({ mode: "create" })

  const handleEdit = (project: ProjectDto) =>
    setDrawerState({ mode: "edit", project })

  const handleDelete = (project: ProjectDto) => setDeleteTarget(project)

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) setDrawerState({ mode: "closed" })
  }

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) setDeleteTarget(null)
  }

  return (
    <div className="w-full space-y-5 p-5">
      <FlexBox className="justify-between">
        <TitleSection
          title="프로젝트 관리"
          description="홈페이지에 노출되는 프로젝트를 등록하고 관리합니다."
        />
        <Button size="lg" onPress={handleCreate}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
          프로젝트 등록
        </Button>
      </FlexBox>

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

      <ProjectFormDrawer
        isOpen={drawerState.mode !== "closed"}
        onOpenChange={handleDrawerOpenChange}
        mode={drawerState.mode === "edit" ? "edit" : "create"}
        project={drawerState.mode === "edit" ? drawerState.project : undefined}
        cohorts={cohorts}
      />

      <DeleteProjectDialog
        isOpen={deleteTarget !== null}
        onOpenChange={handleDeleteOpenChange}
        project={deleteTarget}
      />
    </div>
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
