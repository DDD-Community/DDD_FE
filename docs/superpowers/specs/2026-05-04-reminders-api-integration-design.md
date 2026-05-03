# /reminders 어드민 페이지 — API 연동 보강 설계 문서

> **작성일**: 2026-05-04
> **대상**: `apps/admin/src/pages/reminders/`
> **API**: `@ddd/api`의 `early-notification` 도메인 (`useAdminEarlyNotifications`, `useAdminEarlyNotificationsCsv`, `useSendBulkEarlyNotification`, `useCohorts`)
> **선행 문서**: [2026-04-26-reminders-api-migration-design.md](./2026-04-26-reminders-api-migration-design.md)

---

## 1. 목적

선행 마이그레이션(`2026-04-26`)으로 mock → 실제 API 전환과 발송 흐름이 끝났다. 본 문서는 그 위에 **누락된 기능 보강**을 설계한다.

- CSV 다운로드 기능 추가
- 로딩/에러/빈 상태 정식 처리 (Suspense + ErrorBoundary + Skeleton)
- 통계 카드 공통화 (`StatCard`) — reminders/applications/semesters 일괄 마이그레이션
- `cohortId: 0` 폴백 제거 (트리 분리로 가드)

본 작업은 어드민 앱에서 **Suspense + ErrorBoundary 패턴의 첫 도입**이다. reminders 페이지를 시범 사례로 삼고, 추후 다른 페이지로 점진 확산할 수 있도록 공용 컴포넌트(`EmptyState`, `StatCard`, `ErrorFallback`)를 `shared/ui`에 둔다.

---

## 2. 결정 사항 (Decision Log)

| # | 영역 | 결정 |
| --- | --- | --- |
| 1 | 작업 범위 | "누락 기능 보강"에 한정. `onlyUnnotified` 서버 필터 도입, 검색 서버화 등은 비범위 |
| 2 | CSV 버튼 위치 | `RemindersToolbar` 우측, "알림 발송" 버튼 옆 보조 버튼 |
| 3 | CSV 트리거 방식 | 클릭 시 `earlyNotificationAPI.exportAdminCsv` 직접 호출. `useAdminEarlyNotificationsCsv` 훅(useQuery)은 미사용. 캐시 안 함 |
| 4 | CSV 파일명 | `사전알림_{cohortName}_{YYYYMMDD}.csv` |
| 5 | CSV 인코딩 | UTF-8 BOM(`﻿`) prepend. 한글 운영진이 Excel(특히 Windows)에서 깨짐 없이 열기 위함 |
| 6 | 로딩/에러 패턴 | Suspense + ErrorBoundary 도입. 인라인 `isLoading`/`isError` 분기는 사용하지 않음 |
| 7 | ErrorBoundary 라이브러리 | `react-error-boundary` 신규 의존성으로 채택 (~3KB, 사실상 표준) |
| 8 | Suspense Query 위치 | `packages/api`의 훅은 `useQuery` 그대로 유지. 페이지가 `earlyNotificationQueries.*`를 `useSuspenseQuery`로 직접 래핑 호출 |
| 9 | EmptyState 추출 | `shared/ui/EmptyState.tsx` 신설. 본 작업에서는 reminders만 사용. blog-posts/projects 마이그레이션은 별도 작업 |
| 10 | StatCard 추출 | `shared/ui/StatCard.tsx` 신설 (compound `StatCard.Skeleton` 포함). reminders/applications/semesters를 **일괄** 마이그레이션 |
| 11 | ErrorFallback | `shared/ui/ErrorFallback.tsx` 신설. `EmptyState tone="danger"` + 재시도 버튼 |
| 12 | 페이지 구조 | `RemindersPage`(외곽 + UI 상태) → `RemindersContent`(cohorts 페칭) → `RemindersDataView`(cohortId 보장 후 reminders 페칭). 페칭은 모두 자식 컴포넌트에서 (외곽이 suspended되지 않도록) |
| 13 | 통계 영역 위치 | `RemindersStatsSection`은 reminders 데이터에서 derive 하므로 `RemindersDataView`와 같은 Suspense 경계 안쪽에 배치 |
| 14 | `cohortId` 가드 | `cohortId ?? 0` 폴백 제거. `RemindersDataView`는 `cohortId: number` 보장 (트리 구조로 가드) |
| 15 | 캐시 무효화 | CSV 다운로드는 read-only. invalidate 없음. 발송 후 `earlyNotificationKeys.adminLists()` 무효화는 기존대로 유지 |
| 16 | CSV 성공 알림 | toast 미발생. 브라우저 다운로드 자체가 피드백. 실패 시에만 `toast.error` |

---

## 3. 파일 변경 명세

### 3.1 신규 파일

```
apps/admin/src/shared/ui/
├── EmptyState.tsx              # tone: default | danger
├── StatCard.tsx                # StatCard + StatCard.Skeleton (compound)
└── ErrorFallback.tsx           # react-error-boundary FallbackProps 사용

apps/admin/src/pages/reminders/
├── RemindersContent.tsx               # cohorts useSuspenseQuery (외곽 Suspense의 자식)
├── RemindersDataView.tsx              # cohortId 보장 후 reminders 페칭/필터/통계/테이블
├── lib/downloadRemindersCsv.ts        # CSV 다운로드 유틸
└── components/
    ├── CohortsAreaSkeleton.tsx        # 외곽 Suspense fallback (Stats + Table skeleton 묶음)
    ├── RemindersTableSkeleton.tsx     # 내부 Suspense fallback (테이블만)
    ├── RemindersStatsSection.tsx      # StatCard 3개 (reminders 데이터 derive)
    └── RemindersStatsSkeleton.tsx     # StatCard.Skeleton 3개 묶음
```

### 3.2 수정 파일

| 파일 | 변경 |
| --- | --- |
| `apps/admin/src/pages/reminders/RemindersPage.tsx` | 외곽(`TitleSection` + ErrorBoundary + Suspense) + 검색/상태/cohort override `useState` 보유. cohorts/reminders 페칭은 자식으로 위임 |
| `apps/admin/src/pages/reminders/components/RemindersToolbar.tsx` | CSV 버튼(`⬇ CSV`) 추가. props에 `onExportCsv`, `isExporting` 추가 |
| `apps/admin/src/pages/reminders/components/Sections.tsx` | `TitleSection`만 남기고 `CardSection` 제거 (`RemindersStatsSection`으로 대체) |
| `apps/admin/src/pages/applications/components/Sections.tsx` | 통계 카드를 `StatCard`로 치환 |
| `apps/admin/src/pages/semesters/components/Sections.tsx` | 통계 카드를 `StatCard`로 치환 |
| `apps/admin/package.json` | `react-error-boundary` 의존성 추가 |

### 3.3 변경 없음

- `apps/admin/src/pages/reminders/components/RemindersBulkSendDrawer.tsx`
- `apps/admin/src/pages/reminders/components/RemindersTable.tsx`
- `apps/admin/src/pages/reminders/constants.ts`
- `apps/admin/src/pages/reminders/lib/buildEmailTemplate.ts`
- `packages/api/src/early-notification/**` (훅/쿼리/타입 모두 그대로)

---

## 4. 컴포넌트 트리 & 데이터 흐름

> **핵심 원칙**: `useSuspenseQuery`는 **자식 컴포넌트**에서 호출해야 부모의 Suspense가 잡는다. `RemindersPage`가 직접 호출하면 페이지 외곽(헤딩 포함)이 통째로 suspended 되므로, 페칭은 모두 자식 컴포넌트로 분리한다.

```
RemindersPage  (검색/상태/cohort override useState 보유)
├── TitleSection                                          ← 항상 즉시 렌더
└── ErrorBoundary fallbackRender={ErrorFallback}
    └── Suspense fallback={<CohortsAreaSkeleton/>}
        └── RemindersContent(state + setters props)
            ├── useSuspenseQuery: cohorts
            ├── effectiveCohortId = override ?? pickActiveCohortId(cohorts)
            ├── cohorts.length === 0
            │   └── EmptyState "등록된 기수가 없습니다."
            └── cohorts.length > 0
                ├── RemindersToolbar
                │   - 기수/검색/상태 필터 + CSV/발송 버튼
                │   - CSV 핸들러는 RemindersContent에서 주입
                └── ErrorBoundary fallbackRender={ErrorFallback}
                    └── Suspense fallback={<CohortsAreaSkeleton/>}    ← 외곽과 동일 fallback 재사용
                        └── RemindersDataView(cohortId: number, ...)
                            ├── useSuspenseQuery: reminders
                            ├── reminders.length === 0
                            │   └── EmptyState "사전 알림 신청자가 없습니다."
                            └── reminders.length > 0
                                ├── RemindersStatsSection(reminders)
                                └── RemindersTable(filteredReminders, cohorts)
```

### 4.1 페칭/가드 책임 분리

| 컴포넌트 | 페칭 | 가드 책임 |
| --- | --- | --- |
| `RemindersPage` | (없음) | 외곽 ErrorBoundary/Suspense 셋업 + UI 상태 보유 |
| `RemindersContent` | `cohorts` (useSuspenseQuery) | cohorts 빈 배열 → EmptyState. cohortId 결정 로직 담당 |
| `RemindersDataView` | `reminders` (useSuspenseQuery) | `cohortId: number` prop으로 보장됨. reminders 빈 배열 → EmptyState |

### 4.2 Suspense 경계 의도

- **외곽 cohorts 경계**: cohorts가 안 와도 `TitleSection`은 즉시 렌더. fallback은 `CohortsAreaSkeleton` (간단한 Toolbar 자리 + 통계 자리 + 테이블 자리)
- **내부 reminders 경계**: cohortId 변경 시 통계/테이블만 Skeleton 전환 (Toolbar/헤딩은 안 깜박임)
- 통계와 테이블은 같은 데이터(`reminders`) 기반이므로 같은 경계 안

> `CohortsAreaSkeleton`은 본 작업 범위에서 신규 추가 (`pages/reminders/components/`). 내부적으로 `RemindersStatsSkeleton` + `RemindersTableSkeleton`을 묶는다. 외곽 Suspense와 내부 Suspense fallback에서 모두 재사용 (외곽은 Toolbar 부재 상태, 내부는 Toolbar 존재 상태로 시각적 차이 발생).

### 4.3 상태 보유 위치

- `searchText`, `statusFilter`, `overrideCohortId` 모두 **`RemindersPage`** 보유.
- 이유: cohorts 페칭이 다시 일어나도(에러 후 재시도 등) 검색어/필터/cohort 선택이 보존됨.
- props 흐름: `RemindersPage` → `RemindersContent` → `RemindersToolbar`(읽기/쓰기) + `RemindersDataView`(읽기 전용).

---

## 5. 신규 컴포넌트 스펙

### 5.1 `shared/ui/EmptyState.tsx`

```tsx
type EmptyStateProps = {
  children: ReactNode
  tone?: "default" | "danger"
}
```

- 시각 사양은 `BlogPostsPage` 로컬 정의와 동일 (회색 배경 박스, 중앙 정렬, paddings)
- `tone="danger"`일 때 텍스트 컬러를 `text-red-600`/`text-red-500` 계열로

### 5.2 `shared/ui/StatCard.tsx`

```tsx
type StatCardProps = {
  title: string
  value: ReactNode      // 숫자 / "활동 중" 등 문자 모두 허용
  footer?: ReactNode
}

const StatCard = ({ title, value, footer }: StatCardProps) => (
  <Card>
    <Card.Header>
      <Card.Title className="text-xs font-bold">{title}</Card.Title>
    </Card.Header>
    <Card.Content>
      <p className="text-xl font-semibold">{value}</p>
    </Card.Content>
    {footer && (
      <Card.Footer>
        <span className="text-muted-foreground text-xs">{footer}</span>
      </Card.Footer>
    )}
  </Card>
)

StatCard.Skeleton = () => (
  <Card>
    <Card.Header><Skeleton className="h-3 w-16" /></Card.Header>
    <Card.Content><Skeleton className="h-6 w-12" /></Card.Content>
    <Card.Footer><Skeleton className="h-3 w-10" /></Card.Footer>
  </Card>
)
```

- HeroUI v3의 `Skeleton` 컴포넌트 활용
- compound 패턴으로 `<StatCard>` / `<StatCard.Skeleton>` 짝지어 발견성 ↑

### 5.3 `shared/ui/ErrorFallback.tsx`

```tsx
import type { FallbackProps } from "react-error-boundary"

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <EmptyState tone="danger">
    <p>데이터를 불러오지 못했습니다.</p>
    <p className="text-xs text-muted-foreground mt-1">
      {error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."}
    </p>
    <Button size="sm" variant="secondary" onPress={resetErrorBoundary} className="mt-3">
      다시 시도
    </Button>
  </EmptyState>
)
```

- ErrorBoundary 사용처에서 `<ErrorBoundary FallbackComponent={ErrorFallback}>` 형태로 사용
- 또는 `fallbackRender={(props) => <ErrorFallback {...props} />}` 형태 — 둘 다 허용

### 5.4 `pages/reminders/components/RemindersTableSkeleton.tsx`

- HeroUI `Table` 외형 유지하면서 Skeleton row 5~6줄
- 컬럼 너비/구조는 `RemindersTable`과 정렬

### 5.5 `pages/reminders/components/RemindersStatsSection.tsx`

```tsx
type Props = { reminders: EarlyNotificationDto[] }

export const RemindersStatsSection = ({ reminders }: Props) => {
  const total = reminders.length
  const notified = reminders.filter((r) => !!r.notifiedAt).length
  const pending = total - notified
  return (
    <GridBox className="grid-cols-3 gap-5">
      <StatCard title="전체 신청" value={`${total}명`} footer="누적" />
      <StatCard title="대기" value={`${pending}명`} footer="미발송" />
      <StatCard title="발송 완료" value={`${notified}명`} footer="완료" />
    </GridBox>
  )
}
```

### 5.6 `pages/reminders/components/RemindersStatsSkeleton.tsx`

```tsx
<GridBox className="grid-cols-3 gap-5">
  <StatCard.Skeleton />
  <StatCard.Skeleton />
  <StatCard.Skeleton />
</GridBox>
```

### 5.7 `pages/reminders/RemindersContent.tsx`

```tsx
type Props = {
  searchText: string
  statusFilter: StatusFilterOption
  overrideCohortId: number | null
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: StatusFilterOption) => void
  onCohortChange: (id: number) => void
}

export const RemindersContent = (props: Props) => {
  const { data: cohorts } = useSuspenseQuery(cohortQueries.getCohorts())   // 또는 동등 헬퍼
  const [isExporting, setIsExporting] = useState(false)
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false)

  if (cohorts.length === 0) {
    return <EmptyState>등록된 기수가 없습니다.</EmptyState>
  }

  const effectiveCohortId =
    props.overrideCohortId ?? pickActiveCohortId(cohorts)!  // cohorts.length > 0 보장
  const selectedCohort = cohorts.find((c) => c.id === effectiveCohortId)!

  const handleExport = async () => { /* §6.2 참조 */ }

  return (
    <div className="space-y-5 rounded-lg bg-white p-5 shadow">
      <RemindersToolbar
        cohorts={cohorts}
        cohortId={effectiveCohortId}
        searchText={props.searchText}
        statusFilter={props.statusFilter}
        onSearchChange={props.onSearchChange}
        onCohortChange={props.onCohortChange}
        onStatusFilterChange={props.onStatusFilterChange}
        onOpenBulkSend={() => setIsBulkSendOpen(true)}
        isBulkSendDisabled={false}      // ⚠ §10 비범위 항목 참조 (회귀 인지)
        onExportCsv={handleExport}
        isExporting={isExporting}
        isExportDisabled={isExporting}
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<CohortsAreaSkeleton/>}>
          <RemindersDataView
            cohortId={effectiveCohortId}
            cohorts={cohorts}
            searchText={props.searchText}
            statusFilter={props.statusFilter}
          />
        </Suspense>
      </ErrorBoundary>
      <RemindersBulkSendDrawer
        isOpen={isBulkSendOpen}
        onOpenChange={setIsBulkSendOpen}
        cohortId={effectiveCohortId}
        cohortName={selectedCohort.name}
      />
    </div>
  )
}
```

> 참고: `useCohorts` 훅은 useQuery 기반이라 그대로는 못 쓴다. 대신 이미 `@ddd/api`에서 export 중인 `cohortQueries.getCohorts()` (queryOptions, `enabled` 제약 없음)를 `useSuspenseQuery`로 직접 호출한다. `packages/api`의 변경은 없다.

### 5.8 `pages/reminders/RemindersDataView.tsx`

```tsx
type Props = {
  cohortId: number
  cohorts: CohortDto[]
  searchText: string
  statusFilter: StatusFilterOption
}

export const RemindersDataView = ({ cohortId, cohorts, searchText, statusFilter }: Props) => {
  const { data: reminders } = useSuspenseQuery(
    earlyNotificationQueries.getAdminEarlyNotifications({ params: { cohortId } })
  )
  const filtered = useMemo(() => {
    const predicate = STATUS_FILTER_PREDICATE[statusFilter]
    return reminders
      .filter((r) =>
        searchText.trim() === ""
          ? true
          : r.email.toLowerCase().includes(searchText.trim().toLowerCase())
      )
      .filter((r) => (predicate === null ? true : predicate(r.notifiedAt)))
  }, [reminders, searchText, statusFilter])

  if (reminders.length === 0) {
    return <EmptyState>해당 기수에 사전 알림 신청자가 없습니다.</EmptyState>
  }

  return (
    <>
      <RemindersStatsSection reminders={reminders} />
      <RemindersTable reminders={filtered} cohorts={cohorts} />
    </>
  )
}
```

> ⚠️ `enabled: !!params.cohortId` 가드는 `useSuspenseQuery`에 없다. `RemindersDataView`는 `cohortId: number`(자연수 보장)를 prop으로 받아 호출 시점에 보장한다.

---

## 6. CSV 다운로드 흐름

### 6.1 유틸 함수

```ts
// pages/reminders/lib/downloadRemindersCsv.ts
import { earlyNotificationAPI } from "@ddd/api"

export async function downloadRemindersCsv({
  cohortId,
  cohortName,
}: { cohortId: number; cohortName: string }): Promise<void> {
  const csv = await earlyNotificationAPI.exportAdminCsv({ params: { cohortId } })
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  a.href = url
  a.download = `사전알림_${cohortName}_${yyyymmdd}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

### 6.2 호출부 (`RemindersContent`)

```tsx
const [isExporting, setIsExporting] = useState(false)

const handleExport = async () => {
  if (!effectiveCohortId || !selectedCohort) return
  setIsExporting(true)
  try {
    await downloadRemindersCsv({
      cohortId: effectiveCohortId,
      cohortName: selectedCohort.name,
    })
  } catch (e) {
    toast.error("CSV 내보내기에 실패했습니다", {
      description: (e as Error).message ?? "잠시 후 다시 시도해 주세요.",
    })
  } finally {
    setIsExporting(false)
  }
}
```

### 6.3 RemindersToolbar Props 확장

```tsx
type RemindersToolbarProps = {
  // 기존
  searchText: string
  onSearchChange: (v: string) => void
  cohorts: CohortDto[]
  cohortId: number
  onCohortChange: (id: number) => void
  statusFilter: StatusFilterOption
  onStatusFilterChange: (v: StatusFilterOption) => void
  onOpenBulkSend: () => void
  isBulkSendDisabled: boolean
  // 추가
  onExportCsv: () => void
  isExporting: boolean
  isExportDisabled: boolean   // 데이터 0건 또는 export 진행 중
}
```

레이아웃:
```
[ 검색 ] [ 기수 ] [ 상태 ]                [⬇ CSV] [+ 알림 발송]
```

- CSV 버튼: `variant="secondary"` 또는 보조 색상. `isDisabled={isExportDisabled}`. 텍스트는 `isExporting ? "내보내는 중..." : "CSV"`
- 아이콘: `@hugeicons/core-free-icons`에서 다운로드 아이콘 선택

---

## 7. 마이그레이션 영향 (StatCard 치환)

### 7.1 reminders

- `components/Sections.tsx`의 `CardSection` 삭제
- `RemindersStatsSection` (StatCard 3개) 신설
- 호출은 `RemindersDataView` 안쪽

### 7.2 applications

- `components/Sections.tsx`에서 통계 카드 부분 → `StatCard`로 치환
- `title`, `value`, `footer`만 prop으로 전달
- 외곽 레이아웃/페이지 props 시그니처 변경 없음

### 7.3 semesters

- `components/Sections.tsx`에서 4개 통계 카드 → `StatCard`로 치환
- 외곽 레이아웃/페이지 props 시그니처 변경 없음

> 두 페이지의 통계 데이터 소스는 본 작업 범위에서 변경하지 않는다 (현재 하드코딩/기존 흐름 유지).

---

## 8. 의존성

```
apps/admin/package.json
  + "react-error-boundary": "^4.x"  # 또는 채택 시점 최신 버전
```

설치 후 `pnpm install`. 다른 패키지 영향 없음.

---

## 9. 검증 포인트

| # | 시나리오 | 기대 동작 |
| --- | --- | --- |
| 1 | 기수 0개 | "등록된 기수가 없습니다." EmptyState |
| 2 | 기수 있음 + reminders 0개 | "해당 기수에 사전 알림 신청자가 없습니다." EmptyState |
| 3 | 첫 진입 시 cohorts 페칭 중 | 외곽(헤더)는 즉시 렌더, cohorts 영역은 `CohortsAreaSkeleton` (Stats + Table skeleton) 표시 |
| 4 | 첫 진입 시 reminders 페칭 중 | 통계 Skeleton + 테이블 Skeleton 동시 표시 |
| 5 | 기수 변경 (cohortId 전환) | Toolbar/헤더 유지, 통계+테이블만 Skeleton 전환 |
| 6 | reminders API 실패 | ErrorFallback 표시 + "다시 시도" 클릭 시 재페칭 |
| 7 | cohorts API 실패 | 외곽 ErrorBoundary가 잡음. ErrorFallback 표시 |
| 8 | CSV 다운로드 정상 | 파일명 `사전알림_{cohort명}_YYYYMMDD.csv` 다운로드. Excel(Win)에서 한글 깨짐 없음 |
| 9 | CSV API 실패 | `toast.error("CSV 내보내기에 실패했습니다")` 표시. 페이지 상태는 영향 없음 |
| 10 | 일괄 발송 후 캐시 무효화 | reminders 목록 자동 갱신 (기존 동작 회귀 없음) |
| 11 | 검색어/상태 필터 | 클라이언트 필터링 유지. cohortId 변경 시 검색어/필터는 보존 |
| 12 | StatCard 마이그레이션 | applications/semesters 페이지 외형 회귀 없음 |

---

## 10. 비범위 (다음 사이클로)

- `onlyUnnotified` 서버 필터 도입 → 상태필터를 서버 쿼리로 위임
- 검색 서버화
- blog-posts/projects의 `EmptyState` 마이그레이션
- 다른 페이지의 Suspense/ErrorBoundary 도입
- ErrorFallback의 재시도 정책 고도화 (지수 백오프 등)
- **발송 버튼 disable(데이터 0건) 가드 복원** — 현재 트리에서 reminders 페칭이 `RemindersDataView` 안쪽이라 Toolbar(`RemindersContent` 위치)에서 길이를 알기 어려움. 단순 `isBulkSendDisabled={false}`로 일시 회귀. 후속 작업에서 캐시 공유 또는 트리 재배치로 복원

---

## 11. 참고

- 선행: [2026-04-26-reminders-api-migration-design.md](./2026-04-26-reminders-api-migration-design.md)
- HeroUI v3 Skeleton: `docs/hero-ui.txt` "Skeleton" 항목 참조
- 토스트 패턴: `docs/admin-toast.md`
- 코드 규칙: `CODE_RULES.md` §3.1, §3.3
