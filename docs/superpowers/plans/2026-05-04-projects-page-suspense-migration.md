# ProjectsPage Suspense + ErrorBoundary 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/admin/src/pages/projects/ProjectsPage.tsx` 의 `useQuery`/`useInfiniteQuery` 기반 로딩·에러 분기를 React Suspense + ErrorBoundary 패턴(2단 중첩)으로 마이그레이션한다.

**Architecture:** Page 는 빈 껍질로 축소하고, `ProjectsContent` (cohorts `useSuspenseQuery`) 와 `ProjectsDataView` (projects `useSuspenseInfiniteQuery`) 두 컴포넌트로 분리. `ProjectsTableSkeleton` 1개를 외곽/내부 두 Suspense fallback 으로 공용. `early-notification` 페이지의 패턴과 일치시킨다.

**Tech Stack:** React 19 / TanStack Query (`useSuspenseQuery`, `useSuspenseInfiniteQuery`) / `react-error-boundary` / HeroUI v3 (`Skeleton`, `Table`) / TypeScript

**Spec:** [`docs/superpowers/specs/2026-05-04-projects-page-suspense-migration-design.md`](../specs/2026-05-04-projects-page-suspense-migration-design.md)

---

## 사전 메모

이 코드베이스에는 단위 테스트 인프라(vitest/jest 등) 가 없다. spec 의 검증 방법대로 정적 검사 + 수동 브라우저 워크스루로 검증한다.

- 타입체크: `pnpm --filter @ddd/admin typecheck`
- 린트: `pnpm --filter @ddd/admin lint`
- 개발 서버: `pnpm dev:admin`

각 task 는 "파일 변경 → typecheck → 커밋" 순서를 따른다. 모든 변경이 끝난 뒤 마지막 task 에서 lint + 수동 워크스루로 종합 검증한다.

---

## 파일 구조

| 경로 | 작업 | 책임 |
|---|---|---|
| `apps/admin/src/pages/projects/components/ProjectsTableSkeleton.tsx` | 신규 | 7컬럼 행 6개를 모사한 fallback 스켈레톤 (props 없음) |
| `apps/admin/src/pages/projects/ProjectsDataView.tsx` | 신규 | projects 페치 + 메모/필터 + 테이블 + 카운트/더보기 |
| `apps/admin/src/pages/projects/ProjectsContent.tsx` | 신규 | cohorts 페치 + 모든 state + 헤더/툴바/드로어/다이얼로그 보유 |
| `apps/admin/src/pages/projects/ProjectsPage.tsx` | 수정 | 외곽 ErrorBoundary/Suspense 만 남기는 빈 껍질로 축소 |

기타 변경 없음:
- `components/ProjectsTable.tsx`, `components/ProjectsToolbar.tsx`, `components/ProjectFormDrawer.tsx`, `components/DeleteProjectDialog.tsx` — props 그대로 사용
- `pages/index.tsx` 라우트 등록 그대로
- `packages/api/src/project/*`, `packages/api/src/cohort/*` — 신규 훅 추가 없음

---

## Task 1 — `ProjectsTableSkeleton.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/projects/components/ProjectsTableSkeleton.tsx`

`ProjectsTable.tsx` 의 7개 컬럼(썸네일/서비스명/플랫폼/기수/한줄 설명/참여자/액션) 폭에 맞춰 회색 박스 행 6개를 렌더한다. `EarlyNotificationTableSkeleton` 과 동일한 패턴. props 없음.

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/projects/components/ProjectsTableSkeleton.tsx`:

```tsx
import { Skeleton, Table } from "@heroui/react"

const SKELETON_ROW_COUNT = 6

export const ProjectsTableSkeleton = () => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="프로젝트 목록 로딩 중"
          className="min-w-[900px]"
        >
          <Table.Header>
            <Table.Column>썸네일</Table.Column>
            <Table.Column isRowHeader>서비스명</Table.Column>
            <Table.Column>플랫폼</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>한줄 설명</Table.Column>
            <Table.Column>참여자</Table.Column>
            <Table.Column>액션</Table.Column>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton className="h-10 w-10 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-32 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-20 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-12 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-44 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-12 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-20 rounded" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
```

- [ ] **Step 2: 타입체크**

Run:
```bash
pnpm --filter @ddd/admin typecheck
```

Expected: 종료 코드 0. (이 파일은 import 만 있고 어디서도 사용되지 않으므로 새로운 에러는 없어야 한다)

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/projects/components/ProjectsTableSkeleton.tsx
git commit -m "feat(admin/projects): ProjectsTableSkeleton 추가"
```

---

## Task 2 — `ProjectsDataView.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/projects/ProjectsDataView.tsx`

projects 를 `useSuspenseInfiniteQuery` 로 페치하고, 메모로 `allProjects` / `cohortById` / `filteredProjects` 를 계산. 빈 결과는 `shared/ui/EmptyState`. 데이터가 있으면 `ProjectsTable` + 카운트 라벨 + "더 보기" 버튼.

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/projects/ProjectsDataView.tsx`:

```tsx
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
```

- [ ] **Step 2: 타입체크**

Run:
```bash
pnpm --filter @ddd/admin typecheck
```

Expected: 종료 코드 0. 이 파일은 아직 어디서도 사용되지 않지만 자체 타입만 검사된다.

확인 포인트:
- `projectQueries` 가 `@ddd/api` 에서 export 되는지 (이미 됨)
- `ProjectsToolbar` 에서 `PlatformFilterValue`, `CohortFilterValue` 가 export 되는지 (이미 됨)
- `ProjectsTable` props 시그니처와 일치하는지 (`projects`, `cohortById`, `onEdit`, `onDelete`)

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/projects/ProjectsDataView.tsx
git commit -m "feat(admin/projects): ProjectsDataView 추가 (Suspense 기반 데이터 영역)"
```

---

## Task 3 — `ProjectsContent.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/projects/ProjectsContent.tsx`

cohorts 를 `useSuspenseQuery` 로 페치. 모든 state (`searchText`, `platform`, `cohortId`, `drawerState`, `deleteTarget`) 를 보유. 헤더 행(TitleSection + 등록 버튼) → 흰 카드(툴바 + 내부 ErrorBoundary/Suspense 로 감싼 DataView) → Drawer/Dialog. 

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/projects/ProjectsContent.tsx`:

```tsx
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
```

- [ ] **Step 2: 타입체크**

Run:
```bash
pnpm --filter @ddd/admin typecheck
```

Expected: 종료 코드 0.

확인 포인트:
- `cohortQueries` 가 `@ddd/api` 에서 export 되는지 (이미 됨, `packages/api/src/cohort/queries.ts:14`)
- `ProjectsDataView` (Task 2 에서 만든 것) props 시그니처와 일치하는지
- `ProjectFormDrawer` 의 mode prop 이 `ProjectFormDrawerMode` 타입(`"create" | "edit"`) 과 일치하는지

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/projects/ProjectsContent.tsx
git commit -m "feat(admin/projects): ProjectsContent 추가 (cohorts Suspense + 컨트롤 보유)"
```

---

## Task 4 — `ProjectsPage.tsx` 를 빈 껍질로 전환

**Files:**
- Modify: `apps/admin/src/pages/projects/ProjectsPage.tsx`

기존 페이지 내부 전체를 `ErrorBoundary > Suspense > ProjectsContent` 만 남기는 형태로 교체. 인라인 `EmptyState` 정의 제거, 사용하지 않게 된 import 모두 제거.

- [ ] **Step 1: 기존 파일 전체 교체**

`apps/admin/src/pages/projects/ProjectsPage.tsx` 의 내용을 다음으로 완전히 교체한다 (기존 라인 1~187 전체):

```tsx
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { ProjectsContent } from "./ProjectsContent"
import { ProjectsTableSkeleton } from "./components/ProjectsTableSkeleton"

/** 프로젝트 관리 페이지 */
export default function ProjectsPage() {
  return (
    <div className="w-full space-y-5 p-5">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<ProjectsTableSkeleton />}>
          <ProjectsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

확인:
- `useState`, `useMemo`, `useCohorts`, `useAdminInfiniteProjects`, `Button`, `PlusSignIcon`, `HugeiconsIcon`, `ProjectDto`, `FlexBox`, `TitleSection`, `DeleteProjectDialog`, `ProjectFormDrawer`, `ProjectsToolbar`, `ProjectsTable`, `DrawerState`, `PAGE_LIMIT`, `EmptyState` 인라인 컴포넌트 등 — **모두 제거**되어야 한다.
- 라우트 등록(`pages/index.tsx`) 의 `element: <ProjectsPage />` 는 default export 를 그대로 사용하므로 변경 불필요.

- [ ] **Step 2: 타입체크 + 린트**

Run:
```bash
pnpm --filter @ddd/admin typecheck
pnpm --filter @ddd/admin lint
```

Expected:
- typecheck 종료 코드 0
- lint 에서 신규/수정 파일에 신규 경고 없음 (기존 무관 경고는 무시)

대표적으로 잡힐 가능성이 있는 경고:
- "사용하지 않는 import" → Step 1 에서 모두 제거했는지 확인
- "사용하지 않는 변수" → 인라인 `EmptyState` 제거했는지 확인

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/projects/ProjectsPage.tsx
git commit -m "refactor(admin/projects): ProjectsPage 를 ErrorBoundary/Suspense 껍질로 전환"
```

---

## Task 5 — 수동 브라우저 워크스루 (검증)

코드 변경 없음. spec 의 "검증" 섹션에 정의된 시나리오를 실제 브라우저에서 확인한다.

**Files:** (변경 없음)

- [ ] **Step 1: 개발 서버 기동**

Run:
```bash
pnpm dev:admin
```

브라우저에서 `http://localhost:5173/projects` (포트는 환경에 따라 다를 수 있음. 콘솔 출력 확인) 진입.

먼저 로그인이 필요하다면 진행한 뒤 `/projects` 로 이동.

- [ ] **Step 2: 정상 진입 시나리오**

| 시나리오 | 기대 동작 | 확인 |
|---|---|---|
| 첫 진입 | `ProjectsTableSkeleton` 표시 → cohorts 도착 후 헤더/툴바 표시 → projects 도착 후 테이블 표시 | [ ] |
| `platform` 필터 변경 (예: 전체 → WEB) | 헤더/툴바 유지, 테이블 자리만 스켈레톤 → 새 데이터 표시 | [ ] |
| `searchText` 입력 | 즉시 클라이언트 필터링, 깜빡임 없음 | [ ] |
| `cohortId` 필터 변경 | 즉시 클라이언트 필터링, 깜빡임 없음 | [ ] |
| 빈 결과(검색어를 의도적으로 매칭 안 되게) | "조건에 맞는 프로젝트가 없습니다" 표시 | [ ] |
| "더 보기" 버튼 (있는 경우) | 버튼 라벨 "불러오는 중..." 으로 변경, 기존 행 유지된 채 추가 행 누적 | [ ] |
| "프로젝트 등록" → 드로어 | cohorts 가 보장된 상태이므로 드로어의 cohort 셀렉트에 목록 정상 표시 | [ ] |
| 행 "수정" → 드로어 (edit 모드) | 기존 동작 그대로 | [ ] |
| 행 "삭제" → 다이얼로그 | 기존 동작 그대로 | [ ] |

- [ ] **Step 3: 에러 시나리오**

DevTools → Network → `Block request URL` 기능을 사용:

| 차단 대상 | 시나리오 | 기대 동작 | 확인 |
|---|---|---|---|
| `**/admin/cohorts**` | 페이지 새로고침 | 외곽 `ErrorFallback` 이 페이지 본문 자리 전체를 덮음. "다시 시도" 버튼 노출. (헤더/툴바 모두 안 보임) | [ ] |
| `**/admin/projects**` | 페이지 새로고침 | 헤더/툴바는 정상 표시되고, 테이블 자리만 `ErrorFallback` 표시. "다시 시도" 버튼 노출 | [ ] |
| 위 차단 해제 + "다시 시도" 클릭 | — | 재 suspend 후 정상 데이터 도착 | [ ] |

- [ ] **Step 4: 회귀 확인**

| 페이지 | 확인 |
|---|---|
| `/applications` | 정상 진입 | [ ] |
| `/semesters` | 정상 진입 | [ ] |
| `/reminders` (early-notification) | 정상 진입 | [ ] |
| `/blog-posts` | 정상 진입 | [ ] |

- [ ] **Step 5: 결과 보고**

모든 체크 통과 시 사용자에게 다음을 보고:
- 파일 4개 작업 완료 (신규 3 + 수정 1)
- 타입체크 / 린트 통과
- 수동 워크스루 통과 (정상 9건, 에러 3건, 회귀 4건)

이슈 발견 시 — 절대 임의로 spec 을 변경해 우회하지 말고, 사용자에게 보고하고 결정을 요청한다.

---

## 검증 체크리스트 요약

- [ ] Task 1 — Skeleton 추가 + typecheck + commit
- [ ] Task 2 — DataView 추가 + typecheck + commit
- [ ] Task 3 — Content 추가 + typecheck + commit
- [ ] Task 4 — Page 빈 껍질화 + typecheck + lint + commit
- [ ] Task 5 — 수동 워크스루 (정상/에러/회귀)

## 비범위 확인

다음은 이 계획에 포함되지 않는다 (spec 의 "범위 밖" 그대로):

- `useDeferredValue` 도입
- `QueryErrorResetBoundary` 도입
- `useCohorts` / `useAdminInfiniteProjects` 훅을 Suspense 버전으로 교체하거나 추가
- mutation 에러 처리 변경
- 다른 페이지(`/applications`, `/semesters` 등) 의 패턴 적용
