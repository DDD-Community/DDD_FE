# SemestersPage cohort API 연동 설계

> 일자: 2026-05-04
> 대상: `apps/admin/src/pages/semesters/`
> 의존: `packages/api/src/cohort/`, `packages/api/src/application/`, `packages/api/src/project/`

## 1. 배경 / 목적

`apps/admin/src/pages/semesters/SemestersPage.tsx` 가 임의의 엔드포인트(`/admin/semester`)를 직접 호출하고, 임시 타입(`SemesterInfo`)에 의존하고 있다. 한편 `packages/api/src/cohort/` 에는 이미 풀 CRUD 가 가능한 훅(`useCohorts / useCreateCohort / useUpdateCohort / useDeleteCohort / useUpdateCohortParts / useActiveCohort`) 이 준비되어 있다.

이번 작업은:

1. 페이지를 `cohort` 도메인 훅으로 전환한다.
2. 카드/테이블에 표시되는 통계(지원자 수, 멤버 수, 누적 합산)를 `application`, `project` 도메인 훅과 조합해서 채운다.
3. Drawer 의 등록 흐름을 단순한 "한 번에 하나의 미완성 기수만 진행" 정책으로 재정의한다 (create / resume / edit 3-mode).
4. 단일 cohort 흐름 훅을 `entities/cohort/model/` 로 분리하고, 통합 데이터/페이지 컨텍스트 훅은 `pages/semesters/hooks/` 에 둔다.

루트 `CLAUDE.md` 와 `apps/admin/CLAUDE.md` 의 레이어 규칙(§3.1, §3.3)을 준수한다.

## 2. 합의된 결정 (요약)

| 항목 | 결정 |
|---|---|
| 스코프 | 풀 CRUD + `entities/cohort/model/` 흐름 훅 분리 |
| 카드 1 (전체 기수) | `cohorts.length` |
| 카드 2 (현재 상태) | `id` 내림차순 첫 요소의 status 한글 라벨 |
| 카드 3·4 (누적 지원자/멤버) | 테이블용 데이터를 합산 (추가 fetch 없음) |
| 지원자 수 컬럼 | cohort 별 `useAdminApplications({ params: { cohortId } })` 병렬 호출, length |
| 멤버 수 컬럼 | admin projects 1회 호출 → `cohortId === X` 필터 → `members.length` 합산 |
| 정렬 기준 | `id` 내림차순 (가장 최신 = 가장 큰 id) |
| status 한글 라벨 | UPCOMING="모집 예정" / RECRUITING="모집중" / ACTIVE="활동중" / CLOSED="활동 종료" |
| 파트명 | 서버 enum (`PM/PD/BE/FE/IOS/AND`) 으로 통일, UI 라벨은 `PART_LABEL` 매핑 |
| JSON 직렬화 | 로컬 폼 모양 그대로 freeform JSON 으로 보냄 (`process / curriculum / applicationForm`). `parts` 는 이번 스코프에서 omit |
| 등록 흐름 | 한 번에 하나의 기수만. 최신 cohort 의 완성도로 `create | resume` 분기 |
| "완성됨" 판정 | process: 6개 필드 모두 / curriculum: 9주차 모두 date+description / applicationForm: 6개 파트 모두 최소 1 질문 |
| 마저하기 모드 기본정보 | 편집 가능 |
| Drawer 삭제 버튼 | `resume` 모드에서만 노출 |
| 행 "수정" | Drawer 재사용 (`edit` mode) |
| 행 status 전환 | UPCOMING→RECRUITING→ACTIVE→CLOSED 단방향 전이. CLOSED 일 때는 버튼 자체를 렌더링하지 않음 |
| 부분 실패 | `Promise.allSettled` 의미. 핵심 cohort fetch 만 fatal |
| Toast | `apps/admin/CLAUDE.md` `admin-toast` 단일 패턴 (`toast.success/error`) |
| 캐시 무효화 | cohort mutation → `cohortKeys` 만. `deleteCohort` 시 `applicationKeys.adminList({ cohortId })` 도 같이 |
| 삭제 확인 | HeroUI `AlertDialog`. 삭제 성공 시 Drawer 닫음 |

## 3. 아키텍처 / 파일 트리

```
packages/api/src/cohort/                 (변경 없음)

apps/admin/src/
├── entities/
│   └── cohort/
│       ├── model/
│       │   ├── useCreateOrUpdateCohortFlow.ts
│       │   ├── useDeleteCohortFlow.ts
│       │   ├── useTransitionCohortStatusFlow.ts
│       │   ├── completion.ts
│       │   ├── statusFlow.ts
│       │   ├── serialize.ts
│       │   └── constants.ts
│       └── index.ts
│
└── pages/semesters/
    ├── SemestersPage.tsx                (얇아짐: 훅 호출 + 레이아웃)
    ├── SemesterRegisterDrawer.tsx       (mode prop 추가)
    ├── components/                      (기존 유지)
    ├── hooks/
    │   ├── useSemestersTableData.ts
    │   ├── useSemesterRegistrationMode.ts
    │   └── index.ts
    ├── constants.ts                     (서버 enum 기준 재작성)
    └── types.d.ts                       (SemesterRegisterForm 만 유지)
```

**의존성 방향:**

- `pages/semesters/hooks/` → `entities/cohort/model/` + `packages/api/{cohort, application, project}`
- `entities/cohort/model/` → `packages/api/cohort` + `shared/lib`
- `entities/*` 끼리 cross-import 없음

**삭제되는 것:**

- `pages/semesters/SemestersPage.tsx` 의 `getSemesterData` 직접 fetch
- `pages/semesters/types.d.ts` 의 `SemesterInfo / SemesterStatus / SemesterPart` (서버 타입으로 통일)
- `pages/semesters/constants.ts` 의 로컬 `STATUS_FILTER_MAP` (서버 enum 기반으로 재작성)

## 4. 데이터 흐름

### 4.1 페이지 진입 (`useSemestersTableData`)

```
useCohorts()                                    (GET /admin/cohorts)
   │
   └─→ cohorts: CohortDto[]                     (id desc 정렬은 클라이언트 selector)
         │
         ├──→ useQueries(cohorts.map(c => ({
         │       queryKey: applicationKeys.adminList({ cohortId: c.id }),
         │       queryFn: () => applicationAPI.getAdminApplications({ params: { cohortId: c.id } }),
         │     })))                              ─ 병렬, 부분 실패 허용 (allSettled 의미)
         │
         └──→ useProjects() (admin)              (GET /admin/projects)
                 │
                 └─→ projects.filter(p => p.cohortId === c.id)
                                            .reduce((sum, p) => sum + (p.members?.length ?? 0), 0)
```

**파생 값 (`useMemo` selectors):**

- `tableRows: CohortRow[]` = `cohorts.map(c => ({ ...c, applicantsCount, membersCount }))`
  - 실패한 cohort 의 카운트는 `null` → UI 셀에서 `"-"`
- `summary` = `{ totalCohorts, currentStatus, totalApplicants, totalMembers }`
  - `totalCohorts = cohorts.length`
  - `currentStatus = sortedById[0]?.status` (없으면 `"기수 없음"`)
  - `totalApplicants = Σ applicantsCount` (null → 0)
  - `totalMembers = Σ membersCount` (null → 0)

### 4.2 등록 모드 결정 (`useSemesterRegistrationMode`)

```
cohorts (id desc)
   │
   ├─ 비어 있음                          → { mode: 'create', targetId: null,    label: '새 기수 등록' }
   │
   └─ 첫 요소(latest) ─→ isCohortComplete(latest) ?
                          │
                          ├─ true        → { mode: 'create', targetId: null,    label: '새 기수 등록' }
                          │
                          └─ false       → { mode: 'resume', targetId: latest.id, label: '기수 등록 마저하기',
                                              prefill: serializeCohortToForm(latest) }
```

`edit` mode 는 행의 "수정" 버튼이 트리거. `targetId = clicked.id`, `prefill = serializeCohortToForm(clicked)`.

### 4.3 완성도 판정 (`completion.ts`)

```ts
isProcessComplete(p: unknown): boolean
  // p 가 객체 + 6개 키(documentAcceptStartDate/EndDate, documentResultDate,
  //                    interviewStartDate/EndDate, finalResultDate) 모두 비어있지 않은 string

isCurriculumComplete(c: unknown): boolean
  // c 가 길이 9 배열 + 모든 항목이 { date, description } 둘 다 비어있지 않은 string

isApplicationFormComplete(af: unknown): boolean
  // af 가 객체 + 6개 키(PM/PD/BE/FE/IOS/AND) 모두 string[] + 각 배열이 비어있지 않은 질문 1개 이상

isCohortComplete(cohort: CohortDto): boolean
  // 위 3개 모두 true
```

freeform JSON 이 들어오므로 모든 검증은 unknown 가드 형태로 작성. 잘못된 모양이면 미완성 취급 (= `resume` 모드로 빠짐).

### 4.4 직렬화 (`serialize.ts`)

```ts
serializeFormToCreatePayload(form: SemesterRegisterForm): CreateCohortRequestDto
  - name: form.cohortNumber + '기'                    // BasicInfoSection 의 Input placeholder 는 '예: 16' 이며 숫자만 입력 받는 가정
  - recruitStartAt / recruitEndAt: form.recruitStartDate / form.recruitEndDate
  - status: form.status
  - process: form.process
  - curriculum: form.curriculum
  - applicationForm: form.applicationForms
  - parts: omit

serializeFormToUpdatePayload(form: SemesterRegisterForm): UpdateCohortRequestDto
  - 위와 동일한 매핑, 단 모든 필드가 옵셔널인 UpdateCohortRequestDto 로 직렬화
  - dirty 추적 없이 전체 필드를 보냄 (PATCH 의미상 옵셔널이라 안전, 단순함 우선)

serializeCohortToForm(cohort: CohortDto): SemesterRegisterForm
  - cohort.process / curriculum / applicationForm 의 freeform JSON 을 폼 shape 으로 역직렬화
  - 잘못된 shape 이면 해당 섹션은 빈 폼으로 폴백
  - cohort.name 의 '기' 접미사를 제거해 form.cohortNumber 로 복원
```

### 4.5 Mutation 흐름

| 트리거 | 호출 | 무효화 | toast |
|---|---|---|---|
| Drawer 등록 (`create`) | `cohortAPI.createCohort` | `cohortKeys.lists()`, `cohortKeys.active()` | "기수 ${name}을(를) 등록했습니다" / "기수 등록에 실패했습니다" |
| Drawer 저장 (`resume`/`edit`) | `cohortAPI.updateCohort({ id: targetId })` | `cohortKeys.lists()`, `cohortKeys.detail({ id })`, `cohortKeys.active()` | "기수 정보를 저장했습니다" / "저장에 실패했습니다" |
| Drawer 삭제 (`resume` only) | AlertDialog → `cohortAPI.deleteCohort({ id: targetId })` | `cohortKeys.lists()`, `cohortKeys.active()`, `applicationKeys.adminList({ cohortId: targetId })` | "기수를 삭제했습니다" / "삭제에 실패했습니다" |
| 행 "수정" | 페이지의 `setEditTarget(row)` → Drawer 가 `edit` 모드로 열림 | (저장 시 위 update 흐름) | — |
| 행 status 전환 | next status 계산 → `cohortAPI.updateCohort({ id, status })` | `cohortKeys.lists()`, `cohortKeys.detail({ id })`, `cohortKeys.active()` | "${name} 상태를 ${nextLabel}(으)로 변경했습니다" / "상태 변경에 실패했습니다" |

### 4.6 Status 전이 (`statusFlow.ts`)

```ts
nextStatus(UPCOMING)   = RECRUITING    // 버튼 라벨: "모집중 전환"
nextStatus(RECRUITING) = ACTIVE        // 버튼 라벨: "활동중 전환"
nextStatus(ACTIVE)     = CLOSED        // 버튼 라벨: "활동 종료"
nextStatus(CLOSED)     = null          // 버튼 자체를 렌더링하지 않음
```

## 5. 컴포넌트 변경 사항

### 5.1 `SemestersPage.tsx`

```tsx
export default function SemestersPage() {
  const { tableRows, summary, isLoading, isError, refetch } = useSemestersTableData()
  const registration = useSemesterRegistrationMode()
  const { transition } = useTransitionCohortStatusFlow()

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CohortStatus | 'ALL'>('ALL')

  // 행의 "수정" 버튼이 트리거하는 edit 타겟. registration 의 create|resume 결정을 오버라이드.
  const [editTarget, setEditTarget] = useState<CohortDto | null>(null)

  const drawerProps = editTarget
    ? {
        mode: 'edit' as const,
        targetId: editTarget.id,
        prefill: serializeCohortToForm(editTarget),
      }
    : {
        mode: registration.mode,
        targetId: registration.targetId,
        prefill: registration.prefill,
      }

  const filteredRows = useMemo(() => filterRows(tableRows, { searchText, statusFilter }), [...])

  if (isError) return <ErrorState message="기수 목록을 불러오지 못했습니다" onRetry={refetch} />

  return (
    <div className="w-full space-y-5 p-5">
      <Drawer onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <TitleSection registration={registration} />
        <CardSection summary={summary} />
        <SemesterRegisterDrawer {...drawerProps} />
      </Drawer>
      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FilterBar searchText={searchText} statusFilter={statusFilter} ... />
        <SemestersTable
          rows={filteredRows}
          onEdit={(row) => setEditTarget(row) /* Drawer 도 함께 열림 */}
          onTransition={(row) => transition(row)}
        />
      </div>
    </div>
  )
}
```

**`editTarget` 동작:**
- 행의 "수정" 클릭 → `setEditTarget(row)` → Drawer 가 `edit` 모드로 prefill 되어 열림
- Drawer 닫힘 → `setEditTarget(null)` → 다음 진입은 다시 `registration` (create | resume) 결정
- (HeroUI Drawer 의 정확한 close 콜백 prop 명은 컴포넌트 문서 확인 후 매핑; 의미는 "닫힐 때 editTarget 초기화")

**필터 라벨/맵:**

```ts
STATUS_FILTER_OPTIONS = [
  { value: 'ALL',        label: '전체' },
  { value: 'UPCOMING',   label: '모집 예정' },
  { value: 'RECRUITING', label: '모집중' },
  { value: 'ACTIVE',     label: '활동중' },
  { value: 'CLOSED',     label: '활동 종료' },
]
```

### 5.2 `SemesterRegisterDrawer.tsx`

```tsx
type DrawerMode = 'create' | 'resume' | 'edit'

interface Props {
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
}

export function SemesterRegisterDrawer({ mode, targetId, prefill }: Props) {
  const [form, setForm] = useState<SemesterRegisterForm>(() => prefill ?? createInitialForm())

  useEffect(() => {
    setForm(prefill ?? createInitialForm())
  }, [prefill, mode])

  const { submit, isPending: isSubmitting } = useCreateOrUpdateCohortFlow({ mode, targetId })
  const { confirmAndDelete, isPending: isDeleting } = useDeleteCohortFlow({ targetId })

  const titleByMode = {
    create: '신규 기수 등록',
    resume: '기수 등록 마저하기',
    edit:   '기수 수정',
  }
  const submitLabelByMode = { create: '등록', resume: '저장', edit: '저장' }

  return (
    <Drawer.Backdrop>
      <Drawer.Content placement={isMobile ? 'bottom' : 'right'}>
        <Drawer.Dialog>
          <Drawer.Header>
            <Drawer.Heading className="text-lg font-semibold">{titleByMode[mode]}</Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body className="flex-1 space-y-8 overflow-y-auto">
            <BasicInfoSection form={form} onChange={...} />     {/* 모든 모드에서 편집 가능 */}
            <ProcessSection process={form.process} onChange={...} />
            <CurriculumSection curriculum={form.curriculum} onChange={...} />
            <ApplicationFormSection
              applicationForms={form.applicationForms}
              onQuestionChange={...}
              onAddQuestion={...}
              onRemoveQuestion={...}
            />
          </Drawer.Body>

          <Drawer.Footer>
            <Drawer.CloseTrigger />
            {mode === 'resume' && (
              <Button variant="outline" className="text-red-600" onPress={confirmAndDelete} isDisabled={isDeleting}>
                삭제
              </Button>
            )}
            <Button onPress={() => submit(form)} isDisabled={isSubmitting}>
              {submitLabelByMode[mode]}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
```

**파트 탭:**

- `SEMESTER_PARTS = ['PM', 'PD', 'BE', 'FE', 'IOS', 'AND']` (서버 enum)
- 탭에 표시되는 라벨은 `PART_LABEL[name]` 사용

### 5.3 `entities/cohort/model/`

```
useCreateOrUpdateCohortFlow({ mode, targetId })
  → { submit(form: SemesterRegisterForm): void, isPending: boolean }

useDeleteCohortFlow({ targetId })
  → { confirmAndDelete(): void, isPending: boolean }
  // 내부적으로 AlertDialog 의 open/close 상태와 mutate 호출을 캡슐화

useTransitionCohortStatusFlow()
  → { transition(cohort: CohortDto): void, isPending: boolean }
  // nextStatus 계산 → updateCohort 호출 → toast/invalidate

completion.ts   → isProcessComplete / isCurriculumComplete / isApplicationFormComplete / isCohortComplete
statusFlow.ts   → STATUS_LABEL, nextStatus, NEXT_STATUS_LABEL
serialize.ts    → serializeFormToCreatePayload / serializeFormToUpdatePayload / serializeCohortToForm
constants.ts    → PART_LABEL: Record<CohortPartConfigDtoName, string>
```

## 6. 에러 / 캐시 / Toast

### 6.1 부분 실패 정책

| 실패 지점 | 동작 |
|---|---|
| `useCohorts` | 풀 페이지 ErrorState + 재시도 버튼 (fatal) |
| 일부 cohort 의 applications fetch | 해당 행 `applicantsCount = null` → 셀에 `"-"` |
| `useProjects` (admin) | 모든 행 `membersCount = null` → 셀에 `"-"` |
| 카드 누적 합산 | `null` 항목은 0 으로 합산 (사용자가 0 을 보고 새로고침으로 복구) |

### 6.2 로딩 상태

- `useCohorts` pending → 페이지 전체 스켈레톤 (Card + Table)
- cohort 받은 후 applications/projects pending → 카운트 셀만 스피너, 나머지는 정상 렌더
- mutation pending → 트리거 버튼 `isDisabled` + 스피너

### 6.3 삭제 확인 (`AlertDialog`)

```
헤더: "기수를 삭제하시겠습니까?"
본문: "${cohort.name}을(를) 삭제하면 작성 중인 모든 정보가 사라지며,
       이 작업은 되돌릴 수 없습니다."
버튼:
  - 좌: "취소" (variant=outline)
  - 우: "삭제" (빨간색)
```

성공 시: AlertDialog close → Drawer close → cohort/applications 캐시 무효화 → 페이지 다시 그려지며 헤더 버튼이 `"새 기수 등록"` 으로 전환.

## 7. 검증 (수동)

테스트 인프라(`vitest`/`jest`/`playwright` 셋업)가 없으므로 단위 테스트 코드는 추가하지 않는다. 기능별 수동 체크리스트:

### 7.1 정적 검증

```bash
pnpm --filter @ddd/admin lint
pnpm --filter @ddd/admin tsc --noEmit
```

→ 둘 다 0 에러.

### 7.2 페이지 로드 (`useSemestersTableData`)

| 시나리오 | 확인 |
|---|---|
| cohort 0개 | 카드: 0/"기수 없음"/0/0, 테이블 빈 행, 헤더 버튼: "새 기수 등록" |
| cohort 1개 (모두 채워짐) | 카드 1=1, 카드 2=현재 status 라벨, 카드 3=지원자 수, 카드 4=멤버 합산, 헤더 버튼: "새 기수 등록" |
| cohort 1개 (process 미완성) | 헤더 버튼: "기수 등록 마저하기", Drawer prefill 정상 |
| applications 일부 fetch 실패 | 실패 행 지원자 수 셀 "-" |
| projects fetch 실패 | 모든 멤버 수 셀 "-", 카드 4=0 |
| cohort fetch 실패 | 풀 페이지 ErrorState + 재시도 동작 |

### 7.3 등록 (`create`)

- Drawer 모든 필드 채우고 등록 → toast 성공 → 목록 갱신 → Drawer 닫힘
- 필수 빠뜨려 등록 (`name` 빈 값) → 400 → toast 에러
- 등록 중 버튼 연타 → `isDisabled` 로 중복 호출 방지

### 7.4 마저하기 (`resume`)

- 미완성 cohort 1개 있을 때 헤더 라벨이 "기수 등록 마저하기"
- Drawer 열기: 기본 정보 + 채워진 process/curriculum/applicationForm 모두 prefill
- 빈 칸 마저 채우고 저장 → PATCH → toast 성공 → 헤더 버튼이 "새 기수 등록" 으로 전환
- 기본 정보(name/recruitDate/status) 도 편집 가능
- 삭제 버튼 클릭 → AlertDialog 확인 → DELETE → toast → Drawer 닫힘 → 헤더 버튼이 "새 기수 등록" 으로 전환
- AlertDialog 취소 → 삭제 안 됨, Drawer 유지

### 7.5 수정 (`edit`)

- 임의 행 "수정" 클릭 → Drawer prefill, 헤더 "기수 수정", 삭제 버튼 미노출, 저장 버튼 라벨 "저장"
- 저장 → PATCH → toast → 목록 갱신

### 7.6 상태 전환

| 현재 status | 버튼 라벨 | 결과 |
|---|---|---|
| UPCOMING | "모집중 전환" | RECRUITING 으로 변경 |
| RECRUITING | "활동중 전환" | ACTIVE 로 변경 |
| ACTIVE | "활동 종료" | CLOSED 로 변경 |
| CLOSED | (버튼 미노출) | — |

### 7.7 필터 / 검색

- status 필터 변경 → 해당 status 의 행만 렌더
- 검색어 입력 → `name` 부분 일치 행만 렌더
- 두 필터 동시 적용 → AND 조건

### 7.8 브라우저 수동 확인

`pnpm dev:admin` → `/semesters` 진입 → 7.3/7.4/7.5/7.6 시나리오를 Playwright MCP 또는 직접 클릭으로 검증.

## 8. 한 눈에

```
[Page Layer]      pages/semesters/
                   ├─ SemestersPage.tsx
                   ├─ SemesterRegisterDrawer.tsx          (mode: create|resume|edit)
                   └─ hooks/
                       ├─ useSemestersTableData
                       └─ useSemesterRegistrationMode

[Domain Layer]    entities/cohort/model/
                   ├─ useCreateOrUpdateCohortFlow
                   ├─ useDeleteCohortFlow
                   ├─ useTransitionCohortStatusFlow
                   ├─ completion.ts
                   ├─ statusFlow.ts
                   ├─ serialize.ts
                   └─ constants.ts

[API Layer]       packages/api/src/cohort/, application/, project/   (변경 없음)
```

- **부분 실패 정책**: `Promise.allSettled` 의미. 핵심 cohort fetch 만 fatal, 나머지는 행/카드 단위로 graceful degrade.
- **비가역 액션**: 삭제는 AlertDialog 강제, 성공 후 Drawer 닫음.
- **캐시 무효화**: cohort mutation → `cohortKeys` 만. `deleteCohort` 시에만 해당 `cohortId` 의 `applicationKeys.adminList` 도 무효화.
