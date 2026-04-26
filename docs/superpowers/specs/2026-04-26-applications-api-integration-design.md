# 지원자 관리 페이지 — API 연동 설계

- 작성일: 2026-04-26
- 대상 파일: `apps/admin/src/pages/applications/`
- 관련 패키지: `@ddd/api` (`application`, `cohort`)

## 배경

`apps/admin/src/pages/applications/ApplicationsPage.tsx`는 현재 로컬 목업(`mockApi.ts` + 페이지별 `types.d.ts` + MSW 핸들러 + 하드코딩 상수)으로 구동된다. `@ddd/api`에 어드민 지원자 조회/상태 변경 훅이 이미 준비되어 있어 실제 API로 전환할 때다.

목업과 새 API 사이에는 단순 fetcher 교체 이상의 차이가 있다.

| 항목 | 현재 페이지 | `@ddd/api` |
|---|---|---|
| 데이터 패칭 | `api.get<ApplicationInfo[]>("/application")` | `useAdminApplications({ params })` |
| 필드 | `name, email, part, cohort, semester, appliedAt` | `applicantName, applicantPhone, cohortId, cohortPartId, status, submittedAt, createdAt` (이메일 없음) |
| Part enum | `pm/pd/web/server/ios/android` | `PM/PD/BE/FE/IOS/AND` |
| Status enum | snake_case 9종 (면접 단계 포함) | 한글 8종, 면접 단계 없음 |
| 기수 필터 | "12기/13기/14기" 하드코딩 | `cohortId: number`, `useCohorts()`로 동적 조회 |
| 액션 | UI만 | `usePatchApplicationStatus()` |

## 범위

이번 작업은 다음을 포함한다:

- 목업 제거(파일 삭제, MSW 핸들러 등록 해제)
- 데이터 조회를 `useAdminApplications` 기반으로 전환(읽기 전용)
- 필터 옵션을 `useCohorts()` 기반 동적 옵션 + 백엔드 enum 기반 상태 옵션으로 교체
- 카드 섹션을 백엔드 enum에 맞게 재구성 + 실제 카운트 산출
- "합격 처리" 액션을 단일 "다음 단계" 버튼으로 재정의하고 `usePatchApplicationStatus`로 구현
- 토스트 알림 + 캐시 무효화

다음을 포함하지 **않는다**:

- 지원서 상세/수정 화면 — "수정" 버튼은 disabled 유지(다음 PR 예고)
- 거절(불합격) 분기 — 종결 상태로의 이행 UI는 다음 PR
- 검색어 서버 파라미터 추가(백엔드 변경 필요)
- 페이지네이션, 서버 검색 등 추가 기능

## 결정 사항

| 결정 | 선택 |
|---|---|
| 작업 범위 | B. 읽기 + 합격 처리 mutation까지 |
| 필터 전략 | A. 하이브리드 — 기수/파트/상태는 서버 필터, 검색어는 클라이언트 |
| 필터 옵션 출처 | B. 기수/파트 모두 동적(`useCohorts()`) |
| 상태 enum | A. 백엔드 8종 한글 그대로 |
| 카드 섹션 | A. 백엔드 enum 흐름에 맞춘 5개 카드 |
| 카드 분모 | ii. 카드용 별도 쿼리(상태 필터 제외, 기수/파트만 적용) |
| 누락 필드 처리 | A. 컬럼 유지 + 데이터 매핑 (이메일→연락처, 기수ID→이름, 지원일=`submittedAt ?? createdAt`) |
| 액션 버튼 | A. 단일 "다음 단계" 버튼 (현재 상태 기반 라벨 동적 변경) |
| 기수 초기 선택 | 가장 최근 기수 자동 선택 |

## 데이터 흐름

```
ApplicationsPage
├─ useCohorts()                                              → 기수/파트 옵션 + ID→이름 매핑
├─ useAdminApplications({ cohortId, cohortPartId })          → 카드 통계용 (상태 필터 제외)
├─ useAdminApplications({ cohortId, cohortPartId, status })  → 표 데이터용
└─ usePatchApplicationStatus()                               → "다음 단계" mutation
```

### 필터 상태(로컬, 페이지 컴포넌트 내부)

```ts
const [selectedCohortId, setSelectedCohortId] = useState<number | undefined>(undefined)
const [selectedCohortPartId, setSelectedCohortPartId] = useState<number | undefined>(undefined)
const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | undefined>(undefined)
const [searchText, setSearchText] = useState("")
```

- `undefined` = "전체"로 해석. `useAdminApplications` params에는 정의된 값만 전달.
- 진입 시 `useCohorts()` 데이터가 도착하면 가장 최근 기수를 1회 자동 선택한다. "가장 최근"은 `recruitStartAt` 내림차순 첫 항목으로 정의하며, 동률/누락 시 `id` 내림차순 첫 항목을 fallback으로 사용한다. 이 자동 선택은 페이지 마운트 후 단 1회만 작동하며(useRef 가드), 사용자가 "전체 기수"로 바꾸면 그 이후 강제 선택은 일어나지 않는다.
- 기수가 변경되면 파트는 자동 초기화(`undefined`).
- 기수가 `undefined`(전체)이면 파트 필터는 비활성.

### 검색어 처리

서버에 검색 파라미터가 없으므로 표 데이터 결과를 클라이언트에서 필터링한다.

```ts
const filteredApplications = applications.filter(
  (app) =>
    app.applicantName.includes(searchText) ||
    (app.applicantPhone?.includes(searchText) ?? false)
)
```

검색어는 카드 카운트에 영향을 주지 않는다(카드는 별도 쿼리 사용).

## 필터 옵션 도출

### 기수 옵션

```
[
  { id: undefined, label: "전체 기수" },
  ...cohorts.map((c) => ({ id: c.id, label: c.name })),
]
```

### 파트 옵션

선택된 기수의 `parts` 배열에서 도출:

```
selectedCohort?.parts.filter(p => p.isOpen).map(...)
```

> **검증 포인트**: `CohortDto.parts: CohortPartConfigDto[]`의 각 원소에 `id`(=cohortPartId)가 포함되어 있는지 실제 응답으로 확인 필요.
> - 포함되어 있으면 그대로 매핑.
> - 포함되어 있지 않으면 (a) 백엔드에 ID 노출 요청 후 진행, 또는 (b) 파트 필터를 일단 비활성으로 두고 다음 PR에서 활성화.
>
> 구현 첫 스텝에서 실제 응답을 확인해 분기를 결정한다.

### 상태 옵션

```
[
  { value: undefined, label: "전체 상태" },
  ...Object.values(ApplicationGetAdminListStatus).map(s => ({ value: s, label: s })),
]
```

백엔드 enum이 한글이라 라벨=값으로 동일하게 사용 가능.

## 라벨/매핑 (constants.ts 재구성)

- `STATUS_LABEL`: 백엔드 enum이 그대로 표시 가능하므로 `Record` 형태 라벨 매핑은 사실상 불필요. 단, "표시명을 별도 관리할 여지"를 위해 `STATUS_LABEL: Record<ApplicationStatus, string>`을 유지하되 키=값으로 둔다.
- `PART_LABEL`: 백엔드 `CohortPartConfigDtoName`(PM/PD/BE/FE/IOS/AND) 기준으로 운영진 친숙 표시명을 분리한다.
  - 예: `BE → "Server"`, `FE → "Web"`, `IOS → "iOS"`, `AND → "Android"` (현행 표 라벨과 일관)
- 기존 `COHORT_FILTER_OPTIONS / COHORT_FILTER_MAP` 하드코딩 상수: **삭제**.
- 기존 `STATUS_FILTER_OPTIONS / STATUS_FILTER_MAP` 하드코딩 상수: **삭제**. 페이지 컴포넌트에서 enum-derived로 도출.
- 기존 페이지별 `types.d.ts`: **삭제**. 모든 타입을 `@ddd/api`에서 import.

## 액션 — "다음 단계" 단일 버튼

### 전이 정의

```ts
const NEXT_STATUS: Record<ApplicationStatus, ApplicationStatus | null> = {
  서류심사대기: "서류합격",
  서류합격:   "최종합격",
  최종합격:   "활동중",
  활동중:    "활동완료",
  서류불합격: null,
  최종불합격: null,
  활동완료:   null,
  활동중단:   null,
}
```

### UI

- 버튼 라벨: `다음 단계: {NEXT_STATUS[status]}` (예: "다음 단계: 서류합격")
- `null`인 행: 액션 셀에 `-` 표시(버튼 렌더하지 않음).
- 클릭 동작:

```
patchApplicationStatus({ params: { id }, payload: { status: next } })
  .then(() => {
    toast.success(`상태가 ${next}(으)로 변경됐어요`)
    queryClient.invalidateQueries({ queryKey: applicationKeys.adminLists() })
  })
  .catch(() => {
    toast.error("상태 변경에 실패했어요")
  })
```

- "수정" 버튼: `disabled` 유지. 다음 PR에서 상세/편집 Drawer로 확장.

### 토스트 사용

`docs/admin-toast.md`의 표준 패턴(`toast.success/error`)을 그대로 따른다. 새 라이브러리는 도입하지 않는다.

## 카드 섹션 재구성

5장:

| 카드 | 산출 |
|---|---|
| 전체 지원 | 카드용 쿼리 결과 길이 |
| 서류심사대기 | `status === "서류심사대기"` 카운트 |
| 서류합격 | `status === "서류합격"` 카운트 |
| 최종합격 | `status === "최종합격"` 카운트 |
| 활동중 | `status === "활동중"` 카운트 |

- 보조 텍스트는 선택된 기수 라벨로 동적 치환:
  - `selectedCohortId`가 있으면 → `"{cohortName} 기준"`
  - 없으면 → `"전체 기수 합산"`
- 카드용 쿼리는 표 쿼리와 별도(`status` 미적용). 상태 필터 변경 시 카드는 흔들리지 않는다.
- `Sections.tsx`의 `CardSection`은 props로 카운트 객체와 보조 텍스트를 받아 렌더하도록 변경한다.

```ts
type CardSectionProps = {
  total: number
  counts: Record<ApplicationStatus, number>
  contextLabel: string  // "14기 기준" or "전체 기수 합산"
}
```

## 컴포넌트 분리

페이지가 비대해지지 않도록 작은 단위로 쪼갠다(원칙: 한 파일은 한 책임).

- `ApplicationsPage.tsx` — 필터 상태 + 쿼리 오케스트레이션
- `components/Sections.tsx` — `CardSection`(카운트 props 기반)
- `components/ApplicationFilters.tsx` (신규) — 검색 입력 + 기수/파트/상태 Select 3종. 필터 상태/세터를 props로 전달.
- `components/ApplicationTable.tsx` (신규) — 표 + 행 액션. 데이터/매핑/onAdvance를 props로 전달. "다음 단계" 버튼은 이 파일 내부에 둔다(별도 컴포넌트로 빼지 않는다 — 표 행 외에서 재사용되지 않으므로).

분리 기준: 페이지 컴포넌트가 약 150줄 안쪽이 되도록 위 분리를 강제한다.

## 파일 변경 요약

### 삭제

- `apps/admin/src/pages/applications/mockApi.ts`
- `apps/admin/src/pages/applications/types.d.ts`

### 수정

- `apps/admin/src/pages/applications/ApplicationsPage.tsx` — 훅 교체, 필터 상태 ID 기반, 검색어 매핑, 기본 기수 자동 선택, 컴포넌트 분리
- `apps/admin/src/pages/applications/constants.ts` — 라벨/옵션 재구성, 동적 필터 항목 제거
- `apps/admin/src/pages/applications/components/Sections.tsx` — 5개 카드 재구성, props 기반 카운트
- `apps/admin/src/mocks/handlers.ts` — `applicationHandlers` import/spread 제거

### 신규

- `apps/admin/src/pages/applications/components/ApplicationFilters.tsx`
- `apps/admin/src/pages/applications/components/ApplicationTable.tsx`

## 검증 방법

수동 검증(개발 서버 + 백엔드 dev):

1. 진입 시 가장 최근 기수가 자동 선택되고 카드/표가 그 기수 기준으로 렌더되는지 확인.
2. 기수 변경 → 파트 옵션이 해당 기수의 `parts`로 갱신되고, 파트 선택은 초기화되는지 확인.
3. 기수를 "전체 기수"로 변경 → 파트 필터가 비활성되는지 확인.
4. 상태 필터 변경 → 표만 변하고 **카드는 그대로** 유지되는지 확인.
5. 검색어 입력 → 표가 클라이언트 필터로 좁혀지고, 카드는 영향 없는지 확인.
6. "다음 단계" 클릭 → 토스트 + 표/카드 즉시 갱신.
7. 종결 상태 행에 액션 버튼이 `-`로 표시되는지 확인.
8. 네트워크 차단 시 mutation 실패 → `toast.error` 표시.

코드 검증:

- `pnpm --filter @ddd/admin lint`
- `pnpm --filter @ddd/admin build`(타입 체크 포함)

## 위험과 완화

- **`CohortPartConfigDto`에 `cohortPartId`가 없을 가능성**: 첫 구현 단계에서 응답 검증. 없으면 파트 필터는 비활성으로 출시(나머지 기능은 정상 동작). 백엔드 변경은 별도 트랙.
- **카드 쿼리와 표 쿼리의 동시성/중복 호출**: 두 쿼리가 다른 `queryKey`를 가지므로 캐시 충돌 없음. 추가 호출 1회의 비용은 KPI 안정성과 트레이드오프로 수용.
- **검색어에 공백/특수문자 포함**: 단순 `.includes()`라 별도 정규화 없이 동작. 검색이 의도와 어긋나면 별도 PR에서 trim/대소문자 정책 추가.
