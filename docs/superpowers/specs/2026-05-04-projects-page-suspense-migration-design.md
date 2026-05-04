# ProjectsPage Suspense + ErrorBoundary 마이그레이션 설계

- 일자: 2026-05-04
- 대상: `apps/admin/src/pages/projects/ProjectsPage.tsx`
- 참고 패턴: `apps/admin/src/pages/early-notification/`

## 배경

현재 `ProjectsPage` 는 `useQuery` / `useInfiniteQuery` 의 `isLoading` / `isError` 플래그를 인라인 삼항으로 분기해 로딩/에러 UI 를 표시한다. 어드민 코드베이스의 다른 페이지(`early-notification`) 는 이미 React Suspense + ErrorBoundary 패턴으로 마이그레이션되어 있어, 일관성을 위해 동일 패턴을 적용한다.

## 결정 사항 요약

| 항목 | 결정 |
|---|---|
| 레이어 분리 | 2단 중첩 (Page → Content → DataView) |
| 필터 변경 시 UX | `platform` 변경은 내부 Suspense 만 fallback. `useDeferredValue` 불필요 |
| 상태 소유권 | 모든 state 와 헤더/버튼을 Content 안으로 이동. Page 는 빈 껍질 |
| 스켈레톤 | 신규 `ProjectsTableSkeleton` 1개를 외곽/내부 Suspense 모두에서 재사용 |
| Suspense 훅 추가 | API 패키지에 `useSuspenseXxx` 훅 추가 안 함. `xxxQueries` 객체를 직접 import 해 `useSuspenseQuery` / `useSuspenseInfiniteQuery` 와 함께 사용 (early-notification 컨벤션 일치) |

## 아키텍처

```
ProjectsPage (state 없음, 빈 껍질)
└─ <ErrorBoundary FallbackComponent={ErrorFallback}>
   └─ <Suspense fallback={<ProjectsTableSkeleton />}>
      └─ ProjectsContent
         (useSuspenseQuery(cohortQueries.getCohorts))
         (state: searchText, platform, cohortId, drawerState, deleteTarget)
         ├─ Header row (TitleSection + 프로젝트 등록 버튼)
         ├─ ProjectsToolbar
         ├─ <ErrorBoundary FallbackComponent={ErrorFallback}>
         │  └─ <Suspense fallback={<ProjectsTableSkeleton />}>
         │     └─ ProjectsDataView
         │        (useSuspenseInfiniteQuery(projectQueries.getAdminInfiniteProjects))
         │        ├─ ProjectsTable
         │        └─ 카운트 + "더 보기" 버튼
         ├─ ProjectFormDrawer (cohorts 사용)
         └─ DeleteProjectDialog
```

## 파일 구조

```
apps/admin/src/pages/projects/
├─ ProjectsPage.tsx              # 수정: 빈 껍질로 축소
├─ ProjectsContent.tsx           # 신규
├─ ProjectsDataView.tsx          # 신규
├─ index.tsx                     # 변경 없음
├─ constants.ts                  # 변경 없음
└─ components/
   ├─ ProjectsToolbar.tsx        # 변경 없음
   ├─ ProjectsTable.tsx          # 변경 없음
   ├─ ProjectsTableSkeleton.tsx  # 신규
   ├─ ProjectFormDrawer.tsx      # 변경 없음
   └─ DeleteProjectDialog.tsx    # 변경 없음
```

`packages/api/src/project/*` 와 `packages/api/src/cohort/*` 는 변경 없음.

## 컴포넌트 책임과 시그니처

### ProjectsPage.tsx (수정)

```tsx
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

- props 없음, state 없음, 훅 호출 없음
- 인라인 `EmptyState` 컴포넌트 정의 삭제

### ProjectsContent.tsx (신규)

- `useSuspenseQuery(cohortQueries.getCohorts())` 로 cohorts 페치
- 모든 state (`searchText`, `platform`, `cohortId`, `drawerState`, `deleteTarget`) 보유
- 핸들러: `handleCreate`, `handleEdit`, `handleDelete`, `handleDrawerOpenChange`, `handleDeleteOpenChange`
- 렌더: 헤더 행 + 툴바 + 내부 ErrorBoundary/Suspense 로 감싼 DataView + Drawer + Dialog
- props 없음

### ProjectsDataView.tsx (신규)

```tsx
type ProjectsDataViewProps = {
  searchText: string
  platform: PlatformFilterValue
  cohortId: CohortFilterValue
  cohorts: CohortDto[]
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
}
```

- `useSuspenseInfiniteQuery(projectQueries.getAdminInfiniteProjects({ params: { platform: ..., limit: PAGE_LIMIT } }))` 로 projects 페치
- 메모: `allProjects`, `cohortById`, `filteredProjects`
- 빈 결과는 `shared/ui/EmptyState` 사용
  - 전체 빈: "등록된 프로젝트가 없습니다."
  - 필터 결과 빈: "조건에 맞는 프로젝트가 없습니다."
- `<ProjectsTable>` 렌더 + 카운트 라벨 + 더보기 버튼

### components/ProjectsTableSkeleton.tsx (신규)

- `ProjectsTable` 의 컬럼 폭을 모사한 회색 박스 행 6~8개만 렌더 (흰 카드 래퍼나 헤더/툴바 모사는 포함하지 않음)
- 외곽 fallback 으로 사용될 때 (`ProjectsPage` 의 패딩 컨테이너 안) → 행만 표시. 헤더/툴바는 비어 있음 (C 안의 합의된 동작)
- 내부 fallback 으로 사용될 때 (흰 카드 + 툴바 아래) → 행만 표시. 자연스럽게 어울림
- props 없음 (early-notification 의 `CohortsAreaSkeleton` / `EarlyNotificationTableSkeleton` 컨벤션과 일치)

## 데이터 흐름

### 정상 진입

1. 라우트 진입 → `ProjectsPage` 렌더 → 외곽 Suspense 가 `ProjectsContent` 의 cohorts 쿼리에 의해 suspend
2. `<ProjectsTableSkeleton />` 표시
3. cohorts 도착 → `ProjectsContent` 렌더 → 헤더/툴바 표시
4. 동시에 내부 Suspense 가 projects 쿼리에 의해 suspend → 같은 fallback 이 테이블 자리에 표시
5. projects 도착 → `ProjectsDataView` 렌더 완료

### 필터 변경

| 필터 | 영향 |
|---|---|
| `searchText` | 클라이언트 필터. `filteredProjects` 메모만 재계산. fallback 없음 |
| `cohortId` | 클라이언트 필터. 동일 |
| `platform` | 서버 파라미터 → queryKey 변경 → 내부 Suspense 가 fallback 으로 전환 → 툴바/헤더 살아있음 |

### 더보기

- `fetchNextPage()` 호출. `isFetchingNextPage` 는 suspend 트리거하지 않음
- 버튼 라벨만 "불러오는 중..." 으로, 기존 행은 유지된 채 누적

## 에러 처리

- cohorts 페치 실패 → 외곽 ErrorBoundary → `ErrorFallback` 이 페이지 본문 자리 전체를 덮음
- projects 페치 실패 → 내부 ErrorBoundary → 헤더/툴바 살아있고 테이블 자리만 `ErrorFallback`
- `ErrorFallback` (`shared/ui/ErrorFallback`) 의 "다시 시도" → `resetErrorBoundary` → 재 suspend → 재요청 시도
- mutation (생성/수정/삭제) 실패는 기존 toast 패턴 유지 (이번 마이그레이션 범위 밖)

### 알려진 한계

`react-error-boundary` 의 `resetErrorBoundary` 만으로는 TanStack Query 의 캐시된 에러를 초기화하지 못해 재시도가 안 될 수 있다. early-notification 도 동일 패턴이고 현재까지 이슈 보고가 없으므로 이번 마이그레이션에서는 동일 패턴을 유지하고, 이슈 발견 시 별도 작업으로 `QueryErrorResetBoundary` 도입을 검토한다.

## 엣지 케이스

| 상황 | 처리 |
|---|---|
| cohorts 가 빈 배열 | 툴바 cohort 셀렉트는 "ALL" 만 표시. 현 동작 유지. (이번 범위 밖) |
| projects 가 빈 배열 | DataView 의 `EmptyState` "등록된 프로젝트가 없습니다" |
| 필터 결과만 빈 배열 | DataView 의 `EmptyState` "조건에 맞는 프로젝트가 없습니다" |
| `platform` 빠른 연속 변경 | 새 queryKey 마다 suspend. TanStack Query 가 in-flight 요청 자동 취소 |
| 더보기 도중 `platform` 변경 | 새 쿼리 시작, 기존 페이지 누적 사라짐. 현 동작 유지 |
| Drawer/Dialog 열린 채 내부 Suspense fallback 전환 | Drawer/Dialog 는 외곽 Suspense 자식이므로 영향 없음 |
| 첫 진입 (cohorts 도 도착 전) "프로젝트 등록" 버튼 | 헤더가 Content 안에 있으므로 보이지 않음. 합의된 동작 |

## 비변경 보장

- `ProjectsToolbar`, `ProjectsTable`, `ProjectFormDrawer`, `DeleteProjectDialog` 의 props 시그니처
- `pages/index.tsx` 라우트 등록 (`element: <ProjectsPage />, errorElement: <ErrorPage />`)
- `packages/api/src/project/*`, `packages/api/src/cohort/*`
- 다른 페이지 (`/applications`, `/semesters`, `/reminders`, `/blog-posts`)
- 사이드바 / 라우터

## 검증

### 자동 검사

- `pnpm --filter @ddd/admin lint`
- `pnpm --filter @ddd/admin build` (또는 `tsc --noEmit`)

### 수동 브라우저 워크스루

`pnpm dev:admin` 실행 후 `/projects` 진입.

| 시나리오 | 기대 동작 |
|---|---|
| 첫 진입 | 스켈레톤 → 헤더/툴바 표시 → 테이블 표시 |
| `platform` 필터 변경 | 헤더/툴바 유지, 테이블 자리만 스켈레톤 → 새 데이터 |
| `searchText` 입력 | 즉시 클라이언트 필터링, 깜빡임 없음 |
| `cohortId` 필터 변경 | 즉시 클라이언트 필터링, 깜빡임 없음 |
| 빈 결과 | "조건에 맞는 프로젝트가 없습니다" |
| 더보기 | 버튼 "불러오는 중...", 기존 행 유지된 채 추가 |
| 등록 → 드로어 | cohorts 보장 상태에서 셀렉트 정상 |
| 행 수정/삭제 | 기존 동작 유지 |

### 에러 시나리오 (DevTools Network → Block request URL)

| 차단 대상 | 기대 동작 |
|---|---|
| `GET /admin/cohorts` | 외곽 ErrorFallback 이 본문 전체 덮음. "다시 시도" 동작 |
| `GET /admin/projects` | 내부 ErrorFallback. 헤더/툴바 유지. "다시 시도" 동작 |

## 범위 밖

- `useDeferredValue` 도입
- `QueryErrorResetBoundary` 도입
- `useCohorts` / `useAdminInfiniteProjects` 훅을 Suspense 버전으로 교체하거나 추가
- mutation 에러 처리 변경
- 다른 페이지(`/applications`, `/semesters` 등) 의 패턴 적용 (별도 작업)
