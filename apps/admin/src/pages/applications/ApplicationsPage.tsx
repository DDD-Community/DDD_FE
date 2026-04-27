import { useMemo, useState } from "react"
import {
  useAdminApplications,
  useCohorts,
  type CohortDto,
  type ApplicationDto,
} from "@ddd/api"
import { Title, Description } from "@/widgets/heading"
import { CardSection } from "./components/Sections"
import { ApplicationFilters } from "./components/ApplicationFilters"
import { ApplicationTable } from "./components/ApplicationTable"
import type { ApplicationStatus } from "./constants"

const pickLatestCohortId = (cohorts: CohortDto[]): number | undefined => {
  if (cohorts.length === 0) return undefined
  return [...cohorts].sort(
    (a, b) =>
      new Date(b.recruitStartAt).getTime() - new Date(a.recruitStartAt).getTime() ||
      b.id - a.id
  )[0].id
}

/**
 * undefined = "아직 사용자가 선택하지 않음(→ 최신 기수 자동 적용)"
 * null      = 사용자가 명시적으로 "전체 기수" 선택
 */
export default function ApplicationsPage() {
  const [searchText, setSearchText] = useState("")
  const [selectedCohortId, setSelectedCohortId] = useState<number | null | undefined>(undefined)
  const [selectedCohortPartId, setSelectedCohortPartId] = useState<number | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | undefined>(undefined)

  const { data: cohorts } = useCohorts()
  const cohortList = useMemo(() => cohorts ?? [], [cohorts])

  // undefined(미선택) → 최신 기수 자동 적용, null → 전체 기수
  const effectiveCohortId = useMemo(
    () => (selectedCohortId === undefined ? pickLatestCohortId(cohortList) : selectedCohortId ?? undefined),
    [selectedCohortId, cohortList]
  )

  // 카드용 쿼리 — status 제외, 기수/파트만
  const { data: cardApplications } = useAdminApplications({
    params: {
      ...(effectiveCohortId !== undefined && { cohortId: effectiveCohortId }),
      ...(selectedCohortPartId !== undefined && { cohortPartId: selectedCohortPartId }),
    },
  })

  // 표용 쿼리 — 모든 필터 적용
  const { data: tableApplications } = useAdminApplications({
    params: {
      ...(effectiveCohortId !== undefined && { cohortId: effectiveCohortId }),
      ...(selectedCohortPartId !== undefined && { cohortPartId: selectedCohortPartId }),
      ...(selectedStatus !== undefined && { status: selectedStatus as string }),
    },
  })

  const cardList: ApplicationDto[] = useMemo(() => cardApplications ?? [], [cardApplications])
  const tableList: ApplicationDto[] = useMemo(() => tableApplications ?? [], [tableApplications])

  // 클라이언트 검색 필터 (이름 + 연락처)
  const filteredApplications = useMemo(
    () =>
      searchText.trim() === ""
        ? tableList
        : tableList.filter(
            (app) =>
              app.applicantName.includes(searchText) ||
              (app.applicantPhone?.includes(searchText) ?? false)
          ),
    [tableList, searchText]
  )

  // 카드 카운트 산출
  const counts = useMemo(() => {
    const acc: Partial<Record<ApplicationStatus, number>> = {}
    for (const app of cardList) {
      const s = app.status as ApplicationStatus
      acc[s] = (acc[s] ?? 0) + 1
    }
    return acc
  }, [cardList])

  const selectedCohort = cohortList.find((c) => c.id === effectiveCohortId)
  const contextLabel = selectedCohort ? `${selectedCohort.name} 기준` : "전체 기수 합산"

  const handleCohortChange = (id: number | undefined) => {
    // undefined → "전체 기수" 선택으로 null 저장
    setSelectedCohortId(id ?? null)
    setSelectedCohortPartId(undefined) // 기수 변경 시 파트 초기화
  }

  return (
    <div className="w-full space-y-5 p-5">
      <header className="space-y-2">
        <Title title="지원자 관리" />
        <Description title="지원서를 검토하고 상태를 변경합니다." />
      </header>

      <CardSection
        total={cardList.length}
        counts={counts}
        contextLabel={contextLabel}
      />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <ApplicationFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          cohorts={cohortList}
          selectedCohortId={effectiveCohortId}
          onCohortChange={handleCohortChange}
          selectedCohortPartId={selectedCohortPartId}
          onCohortPartChange={setSelectedCohortPartId}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <ApplicationTable
          applications={filteredApplications}
          cohorts={cohortList}
        />
      </div>
    </div>
  )
}
