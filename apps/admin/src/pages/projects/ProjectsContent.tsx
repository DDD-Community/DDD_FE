import { Suspense, useState } from "react"
import { Button } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cohortQueries } from "@ddd/api"
import type { ProjectDto } from "@ddd/api"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"
import { FlexBox } from "@/shared/ui/FlexBox"
import { TitleSection } from "@/widgets/heading"

import { DeleteProjectDialog } from "./components/DeleteProjectDialog"
import { ProjectFormDrawer } from "./components/ProjectFormDrawer"
import { ProjectsTableSkeleton } from "./components/ProjectsTableSkeleton"
import {
  ProjectsToolbar,
  type CohortFilterValue,
  type PlatformFilterValue,
} from "./components/ProjectsToolbar"
import { ProjectsDataView } from "./ProjectsDataView"

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; project: ProjectDto }

export const ProjectsContent = () => {
  const { data: cohorts } = useSuspenseQuery(cohortQueries.getCohorts())

  const [searchText, setSearchText] = useState("")
  const [platform, setPlatform] = useState<PlatformFilterValue>("ALL")
  const [cohortId, setCohortId] = useState<CohortFilterValue>("ALL")
  const [drawerState, setDrawerState] = useState<DrawerState>({
    mode: "closed",
  })
  const [deleteTarget, setDeleteTarget] = useState<ProjectDto | null>(null)

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
    <>
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

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ProjectsTableSkeleton />}>
            <ProjectsDataView
              searchText={searchText}
              platform={platform}
              cohortId={cohortId}
              cohorts={cohorts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
        </ErrorBoundary>
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
    </>
  )
}
