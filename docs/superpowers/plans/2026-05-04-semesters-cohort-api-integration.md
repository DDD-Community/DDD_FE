# SemestersPage cohort API 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/admin/src/pages/semesters/SemestersPage.tsx` 의 임의 fetch 를 `packages/api/src/cohort` 훅으로 전환하고, application/project 도메인과 조합한 통계 + Drawer 의 create/resume/edit 3-mode 흐름을 구현한다.

**Architecture:** `entities/cohort/model/` 에 단일 cohort 도메인 흐름 훅(`useCreateOrUpdateCohortFlow`, `useDeleteCohortFlow`, `useTransitionCohortStatusFlow`) + 순수 로직 (completion / serialize / statusFlow / constants) 을 모은다. `pages/semesters/hooks/` 에는 cohort + applications + projects 를 조합하는 `useSemestersTableData` 와 등록 모드를 결정하는 `useSemesterRegistrationMode` 를 둔다. SemestersPage 는 얇은 컨테이너로 축소하고, SemesterRegisterDrawer 는 `mode | targetId | prefill` props 를 받는 controlled drawer 로 전환한다.

**Tech Stack:** Vite + React 19, TanStack Query v5, HeroUI v3 (`Drawer`, `AlertDialog`, `toast`), Tailwind CSS 4, `@ddd/api` (orval-generated 타입 + 도메인 훅).

**참조 스펙:** `docs/superpowers/specs/2026-05-04-semesters-api-integration-design.md`

**테스트 정책:** 이 프로젝트는 vitest/jest 인프라가 없다. 단위 테스트 코드는 추가하지 않는다. 각 task 의 검증은 `pnpm --filter @ddd/admin lint` + `pnpm --filter @ddd/admin tsc --noEmit` (또는 `pnpm build:admin`) + 마지막 단계의 수동 시나리오 확인으로 대체한다.

**커밋 정책:** 각 task 끝에서 작업 파일만 명시적으로 `git add` 한다 (`git add -A` 금지 — 워크트리에 잔류한 다른 modified 파일이 섞이지 않도록). 모든 커밋은 다음 형식의 footer 를 포함한다:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## File Structure

```
packages/api/src/project/
  ├── queries.ts                                       [Task 0 — getAdminProjects query options 추가]
  ├── queryKeys.ts                                     [Task 0 — (이미 존재) adminLists() 사용]
  └── hooks.ts                                         [Task 0 — useAdminProjects 추가]

apps/admin/src/entities/cohort/
  ├── model/
  │   ├── constants.ts                                 [Task 1 — PART_LABEL]
  │   ├── statusFlow.ts                                [Task 2 — STATUS_LABEL, nextStatus, NEXT_STATUS_LABEL]
  │   ├── completion.ts                                [Task 3 — 4 predicates]
  │   ├── serialize.ts                                 [Task 4 — 3 serializers]
  │   ├── useCreateOrUpdateCohortFlow.ts               [Task 8]
  │   ├── useDeleteCohortFlow.ts                       [Task 9]
  │   └── useTransitionCohortStatusFlow.ts             [Task 10]
  └── index.ts                                         [Task 5 + Task 11 — 두 단계로 채워짐]

apps/admin/src/pages/semesters/
  ├── constants.ts                                     [Task 6 — 서버 enum 기반 재작성]
  ├── types.d.ts                                       [Task 7 — SemesterInfo/Status/Part 제거]
  ├── hooks/
  │   ├── useSemestersTableData.ts                     [Task 12]
  │   ├── useSemesterRegistrationMode.ts               [Task 13]
  │   └── index.ts                                     [Task 14]
  ├── SemesterRegisterDrawer.tsx                       [Task 15 — 3-mode + flow hooks]
  └── SemestersPage.tsx                                [Task 16 — 얇은 컨테이너]
```

각 파일의 책임은 한 가지로 좁혀진다. 흐름 훅 / 순수 로직 / 페이지 통합 / UI 가 모두 분리된다.

---

## Task 0: packages/api 의 admin projects 단일 호출 훅 추가

**왜 필요한가:** spec 은 `useProjects(admin) 1회 호출` 을 가정하지만, 실제 `packages/api/src/project/hooks.ts` 에는 `useAdminInfiniteProjects` (cursor) 와 `useProjects` (public) 만 노출되어 있다. `projectAPI.getAdminProjects()` 함수와 `projectKeys.adminLists()` 는 이미 존재하므로, 비-infinite query options 와 hook 만 얇게 추가한다.

**Files:**
- Modify: `packages/api/src/project/queries.ts`
- Modify: `packages/api/src/project/hooks.ts`

- [ ] **Step 1: `getAdminProjects` query options 추가**

`packages/api/src/project/queries.ts` 의 `projectQueries` 객체 안 (예: `getAdminInfiniteProjects` 정의 직전 또는 직후) 에 다음을 추가:

```ts
  /**
   * 어드민 프로젝트 전체 목록 조회 쿼리 (GET /admin/projects, non-infinite)
   *
   * 단일 호출로 모든 프로젝트를 받아온다. cursor 페이지네이션이 필요한 화면은
   * getAdminInfiniteProjects 를 사용한다.
   *
   * @returns {QueryOptions} TanStack Query 옵션 객체
   */
  getAdminProjects: () =>
    queryOptions({
      queryKey: projectKeys.adminLists(),
      queryFn: () => projectAPI.getAdminProjects(),
    }),
```

`queryOptions` import 가 이미 있는지 확인. 없으면 파일 상단에 추가:
```ts
import { queryOptions, mutationOptions, infiniteQueryOptions } from "@tanstack/react-query";
```

- [ ] **Step 2: `useAdminProjects` 훅 추가**

`packages/api/src/project/hooks.ts` 의 `useAdminInfiniteProjects` 정의 직후에 추가:

```ts
/**
 * 어드민 프로젝트 전체 목록 조회 훅 (단일 호출)
 *
 * @example
 * const { data: projects } = useAdminProjects()
 */
export const useAdminProjects = () =>
  useQuery(projectQueries.getAdminProjects());
```

- [ ] **Step 3: 정적 검증**

```bash
pnpm --filter @ddd/api tsc --noEmit
```
Expected: 0 에러.

- [ ] **Step 4: 커밋**

```bash
git add packages/api/src/project/queries.ts packages/api/src/project/hooks.ts
git commit -m "$(cat <<'EOF'
feat(api): admin projects 단일 호출 훅(useAdminProjects) 추가

cohort 별 멤버 수 합산 등 cursor 페이지네이션이 불필요한 어드민 화면을 위해
getAdminProjects query options + useAdminProjects 훅을 추가한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 1: `entities/cohort/model/constants.ts` — `PART_LABEL`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/constants.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { CohortPartConfigDtoName } from "@ddd/api"

import type { CohortPartName } from "@ddd/api"

/**
 * 서버 파트 enum → 사용자 표시 라벨.
 * 서버 enum 을 단일 진실 출처로 두고, UI 에 노출되는 한글 라벨만 여기에 유지한다.
 */
export const PART_LABEL: Record<CohortPartName, string> = {
  [CohortPartConfigDtoName.PM]: "PM",
  [CohortPartConfigDtoName.PD]: "PD",
  [CohortPartConfigDtoName.BE]: "백엔드",
  [CohortPartConfigDtoName.FE]: "프론트엔드",
  [CohortPartConfigDtoName.IOS]: "iOS",
  [CohortPartConfigDtoName.AND]: "Android",
}

/** Drawer 의 파트 탭 순서 (서버 enum 그대로) */
export const SEMESTER_PARTS: CohortPartName[] = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
]
```

> **참고:** `@ddd/api` 가 `CohortPartConfigDtoName` 런타임 객체와 `CohortPartName` 타입 둘 다 re-export 하는지 확인. 만약 안 한다면 `packages/api/src/index.ts` 또는 `packages/api/src/cohort/index.ts` 에 추가 export 가 필요할 수 있다. 작업 직전에 다음 명령으로 확인:
> ```bash
> grep -n "CohortPartConfigDtoName\|CohortPartName" packages/api/src/index.ts packages/api/src/cohort/index.ts
> ```
> 누락 시 해당 파일에 `export { CohortPartConfigDtoName } from "./generated/dddApi.schemas"` 와 `export type { CohortPartName } from "./cohort/types"` 를 추가하고 같이 커밋.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러. (이 시점에 사용처가 없으므로 unused 경고만 있을 수 있다. 다음 task 들에서 import 됨.)

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/constants.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort 파트 라벨/순서 상수 추가

서버 CohortPartConfigDtoName 을 단일 진실 출처로 두고, UI 에 노출되는
한글 라벨(PART_LABEL) 과 Drawer 탭 순서(SEMESTER_PARTS) 를 entities/cohort/model
에 모은다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `entities/cohort/model/statusFlow.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/statusFlow.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortStatus } from "@ddd/api"

/** status enum → 사용자 표시 라벨 */
export const STATUS_LABEL: Record<CohortStatus, string> = {
  [CreateCohortRequestDtoStatus.UPCOMING]: "모집 예정",
  [CreateCohortRequestDtoStatus.RECRUITING]: "모집중",
  [CreateCohortRequestDtoStatus.ACTIVE]: "활동중",
  [CreateCohortRequestDtoStatus.CLOSED]: "활동 종료",
}

/**
 * 다음 단계 status. CLOSED 는 종착이라 null 을 반환.
 * UI 는 null 일 때 전환 버튼 자체를 렌더링하지 않는다.
 */
export const nextStatus = (s: CohortStatus): CohortStatus | null => {
  switch (s) {
    case CreateCohortRequestDtoStatus.UPCOMING:
      return CreateCohortRequestDtoStatus.RECRUITING
    case CreateCohortRequestDtoStatus.RECRUITING:
      return CreateCohortRequestDtoStatus.ACTIVE
    case CreateCohortRequestDtoStatus.ACTIVE:
      return CreateCohortRequestDtoStatus.CLOSED
    case CreateCohortRequestDtoStatus.CLOSED:
      return null
    default: {
      // exhaustive check — 새 status 추가 시 컴파일 에러로 알림
      const _exhaustive: never = s
      void _exhaustive
      return null
    }
  }
}

/** 전환 버튼에 표시될 라벨 ("모집중 전환", "활동중 전환", "활동 종료") */
export const NEXT_STATUS_BUTTON_LABEL: Record<CohortStatus, string | null> = {
  [CreateCohortRequestDtoStatus.UPCOMING]: "모집중 전환",
  [CreateCohortRequestDtoStatus.RECRUITING]: "활동중 전환",
  [CreateCohortRequestDtoStatus.ACTIVE]: "활동 종료",
  [CreateCohortRequestDtoStatus.CLOSED]: null,
}
```

> **참고:** `CreateCohortRequestDtoStatus` 런타임 객체 / `CohortStatus` 타입이 `@ddd/api` 에서 export 되는지 확인. 누락 시 `packages/api/src/index.ts` 에 추가 export 후 같이 커밋.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/statusFlow.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort status 전이 함수 + 라벨 맵 추가

UPCOMING→RECRUITING→ACTIVE→CLOSED 단방향 전이를 nextStatus 로 캡슐화하고,
status 한글 라벨(STATUS_LABEL) 과 전환 버튼 라벨(NEXT_STATUS_BUTTON_LABEL)
을 한 파일에 모은다. CLOSED 는 종착으로 null 을 반환해 UI 가 버튼을
렌더링하지 않도록 한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `entities/cohort/model/completion.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/completion.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { CohortPartConfigDtoName } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0

const PROCESS_KEYS = [
  "documentAcceptStartDate",
  "documentAcceptEndDate",
  "documentResultDate",
  "interviewStartDate",
  "interviewEndDate",
  "finalResultDate",
] as const

const PARTS = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
] as const

/** process: 6개 키 모두 비어있지 않은 string 이어야 완료 */
export const isProcessComplete = (process: unknown): boolean => {
  if (typeof process !== "object" || process === null) return false
  const obj = process as Record<string, unknown>
  return PROCESS_KEYS.every((k) => isNonEmptyString(obj[k]))
}

/** curriculum: 길이 9 배열 + 모든 항목이 { date, description } 둘 다 비어있지 않음 */
export const isCurriculumComplete = (curriculum: unknown): boolean => {
  if (!Array.isArray(curriculum)) return false
  if (curriculum.length !== 9) return false
  return curriculum.every((week) => {
    if (typeof week !== "object" || week === null) return false
    const w = week as Record<string, unknown>
    return isNonEmptyString(w.date) && isNonEmptyString(w.description)
  })
}

/**
 * applicationForm: 6개 파트(PM/PD/BE/FE/IOS/AND) 모두 string[] 이며
 * 각 배열에 비어있지 않은 질문이 1개 이상.
 */
export const isApplicationFormComplete = (af: unknown): boolean => {
  if (typeof af !== "object" || af === null) return false
  const obj = af as Record<string, unknown>
  return PARTS.every((part) => {
    const list = obj[part]
    if (!Array.isArray(list)) return false
    return list.some((q) => isNonEmptyString(q))
  })
}

/** 위 3개 모두 완료여야 cohort 가 완료된 것으로 간주 (= "새 기수 등록" 모드) */
export const isCohortComplete = (cohort: CohortDto): boolean =>
  isProcessComplete(cohort.process) &&
  isCurriculumComplete(cohort.curriculum) &&
  isApplicationFormComplete(cohort.applicationForm)
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/completion.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort 완성도 판정 함수 추가

process 6개 / curriculum 9주차 (date+description 모두) / applicationForm 6개
파트 모두 1+ 질문 — 세 영역이 모두 완료되어야 cohort 가 완료된 것으로
간주한다. 이 판정은 "기수 등록 마저하기" vs "새 기수 등록" 모드 분기에
사용된다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `entities/cohort/model/serialize.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/serialize.ts`

> 이 task 는 `pages/semesters/types.d.ts` 의 `SemesterRegisterForm` 을 import 한다. 현재 `applicationForms: Record<SemesterPart, string[]>` 형태인데, **Task 7 에서 `SemesterPart` 를 제거하고 `CohortPartName` 으로 교체**한다. 이 task 작성 시점에는 아직 변경 전이므로, 임시로 인라인 타입을 정의해 호환되게 한다 (Task 7 적용 후 자연히 정합).

- [ ] **Step 1: 파일 작성**

```ts
import { CohortPartConfigDtoName } from "@ddd/api"

import type {
  CohortDto,
  CohortPartName,
  CreateCohortRequestDto,
  UpdateCohortRequestDto,
} from "@ddd/api"

import type { SemesterRegisterForm } from "../../../pages/semesters/types"

const PARTS: CohortPartName[] = [
  CohortPartConfigDtoName.PM,
  CohortPartConfigDtoName.PD,
  CohortPartConfigDtoName.BE,
  CohortPartConfigDtoName.FE,
  CohortPartConfigDtoName.IOS,
  CohortPartConfigDtoName.AND,
]

/** form.cohortNumber("16") → DTO.name("16기"). cohort.name 가 "기" 로 끝나면 그대로 둔다 */
const buildName = (cohortNumber: string): string => {
  const trimmed = cohortNumber.trim()
  if (!trimmed) return ""
  return trimmed.endsWith("기") ? trimmed : `${trimmed}기`
}

const stripSuffix = (name: string): string =>
  name.endsWith("기") ? name.slice(0, -1) : name

/** 빈 폼 (Task 15 의 SemesterRegisterDrawer 가 사용하는 createInitialForm 과 동일 모양) */
const emptyForm = (): SemesterRegisterForm => ({
  cohortNumber: "",
  status: CohortPartConfigDtoName.PM // placeholder; 다음 줄에서 덮어씀
    ? "UPCOMING"
    : "UPCOMING",
  recruitStartDate: "",
  recruitEndDate: "",
  process: {
    documentAcceptStartDate: "",
    documentAcceptEndDate: "",
    documentResultDate: "",
    interviewStartDate: "",
    interviewEndDate: "",
    finalResultDate: "",
  },
  curriculum: Array.from({ length: 9 }, () => ({ date: "", description: "" })),
  applicationForms: {
    [CohortPartConfigDtoName.PM]: [""],
    [CohortPartConfigDtoName.PD]: [""],
    [CohortPartConfigDtoName.BE]: [""],
    [CohortPartConfigDtoName.FE]: [""],
    [CohortPartConfigDtoName.IOS]: [""],
    [CohortPartConfigDtoName.AND]: [""],
  } as SemesterRegisterForm["applicationForms"],
})

/** 폼 → CreateCohortRequestDto */
export const serializeFormToCreatePayload = (
  form: SemesterRegisterForm,
): CreateCohortRequestDto => ({
  name: buildName(form.cohortNumber),
  recruitStartAt: form.recruitStartDate,
  recruitEndAt: form.recruitEndDate,
  status: form.status,
  process: { ...form.process },
  curriculum: form.curriculum.map((w) => ({ ...w })),
  applicationForm: { ...form.applicationForms } as Record<string, unknown>,
  // parts 는 이번 스코프에서 omit
})

/**
 * 폼 → UpdateCohortRequestDto.
 * dirty 추적 없이 모든 필드를 보낸다 (PATCH 옵셔널이라 안전, 단순함 우선).
 */
export const serializeFormToUpdatePayload = (
  form: SemesterRegisterForm,
): UpdateCohortRequestDto => ({
  name: buildName(form.cohortNumber),
  recruitStartAt: form.recruitStartDate,
  recruitEndAt: form.recruitEndDate,
  status: form.status,
  process: { ...form.process },
  curriculum: form.curriculum.map((w) => ({ ...w })),
  applicationForm: { ...form.applicationForms } as Record<string, unknown>,
})

/** CohortDto → SemesterRegisterForm. 잘못된 shape 은 빈 폼으로 폴백 */
export const serializeCohortToForm = (
  cohort: CohortDto,
): SemesterRegisterForm => {
  const base = emptyForm()
  return {
    cohortNumber: stripSuffix(cohort.name ?? ""),
    status: cohort.status,
    recruitStartDate: cohort.recruitStartAt ?? "",
    recruitEndDate: cohort.recruitEndAt ?? "",
    process: extractProcess(cohort.process) ?? base.process,
    curriculum: extractCurriculum(cohort.curriculum) ?? base.curriculum,
    applicationForms:
      extractApplicationForms(cohort.applicationForm) ?? base.applicationForms,
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0

const extractProcess = (
  raw: unknown,
): SemesterRegisterForm["process"] | null => {
  if (typeof raw !== "object" || raw === null) return null
  const o = raw as Record<string, unknown>
  return {
    documentAcceptStartDate: isNonEmptyString(o.documentAcceptStartDate)
      ? o.documentAcceptStartDate
      : "",
    documentAcceptEndDate: isNonEmptyString(o.documentAcceptEndDate)
      ? o.documentAcceptEndDate
      : "",
    documentResultDate: isNonEmptyString(o.documentResultDate)
      ? o.documentResultDate
      : "",
    interviewStartDate: isNonEmptyString(o.interviewStartDate)
      ? o.interviewStartDate
      : "",
    interviewEndDate: isNonEmptyString(o.interviewEndDate)
      ? o.interviewEndDate
      : "",
    finalResultDate: isNonEmptyString(o.finalResultDate)
      ? o.finalResultDate
      : "",
  }
}

const extractCurriculum = (
  raw: unknown,
): SemesterRegisterForm["curriculum"] | null => {
  if (!Array.isArray(raw)) return null
  const padded = Array.from({ length: 9 }, (_, i) => {
    const w = raw[i]
    if (typeof w !== "object" || w === null) return { date: "", description: "" }
    const o = w as Record<string, unknown>
    return {
      date: isNonEmptyString(o.date) ? o.date : "",
      description: isNonEmptyString(o.description) ? o.description : "",
    }
  })
  return padded
}

const extractApplicationForms = (
  raw: unknown,
): SemesterRegisterForm["applicationForms"] | null => {
  if (typeof raw !== "object" || raw === null) return null
  const o = raw as Record<string, unknown>
  const result = {} as SemesterRegisterForm["applicationForms"]
  for (const part of PARTS) {
    const list = o[part]
    if (Array.isArray(list)) {
      const filtered = list.filter((q): q is string => typeof q === "string")
      result[part] = filtered.length > 0 ? filtered : [""]
    } else {
      result[part] = [""]
    }
  }
  return result
}
```

> **주의:** `emptyForm` 의 `status` 초기값은 `"UPCOMING"` (서버 enum 값) 이다. Task 7 에서 `SemesterRegisterForm.status` 타입이 `CohortStatus` 가 되므로 정합. `CohortPartConfigDtoName.PM` 을 truthy 가드로 쓴 줄은 단순히 import 사용처 보장용이며, 런타임 동작에 영향 없음. 이 라인은 Task 7 가 적용된 후 다음 Task 의 코드 정합 점검에서 제거해도 무방하다 (지금 단계에서는 그대로 둔다).

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러. (Task 7 적용 전이라도 `SemesterRegisterForm.applicationForms` 의 key 타입이 string 으로 해석되므로 `as` 단언으로 통과한다.)

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/serialize.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort 폼/DTO 직렬화 함수 추가

serializeFormToCreatePayload / serializeFormToUpdatePayload / serializeCohortToForm
세 개의 양방향 매퍼를 추가. cohortNumber 는 자동으로 "기" 접미사 부착,
역직렬화 시 잘못된 freeform JSON shape 은 빈 폼으로 폴백한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `entities/cohort/index.ts` (1차 배럴)

**Files:**
- Create: `apps/admin/src/entities/cohort/index.ts`

흐름 훅(Task 8-10) 은 아직 없으므로 1차로는 순수 로직만 export. Task 11 에서 흐름 훅을 추가 export 한다.

- [ ] **Step 1: 파일 작성**

```ts
export * from "./model/constants"
export * from "./model/statusFlow"
export * from "./model/completion"
export * from "./model/serialize"
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/index.ts
git commit -m "$(cat <<'EOF'
feat(admin): entities/cohort 1차 배럴(constants/statusFlow/completion/serialize)

흐름 훅은 후속 task 에서 추가된다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `pages/semesters/constants.ts` 재작성

**Files:**
- Modify: `apps/admin/src/pages/semesters/constants.ts`

서버 enum 기준으로 전부 재작성. 로컬 타입(`SemesterStatus` / `SemesterPart`) 의존을 끊는다.

- [ ] **Step 1: 파일 전체 교체**

```ts
import { CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortStatus } from "@ddd/api"

/** status 필터 값 — "ALL" 은 전체 표시 */
export type StatusFilterValue = CohortStatus | "ALL"

export const STATUS_FILTER_OPTIONS: Array<{
  value: StatusFilterValue
  label: string
}> = [
  { value: "ALL", label: "전체" },
  { value: CreateCohortRequestDtoStatus.UPCOMING, label: "모집 예정" },
  { value: CreateCohortRequestDtoStatus.RECRUITING, label: "모집중" },
  { value: CreateCohortRequestDtoStatus.ACTIVE, label: "활동중" },
  { value: CreateCohortRequestDtoStatus.CLOSED, label: "활동 종료" },
]

/** Drawer 의 status 셀렉트 옵션 (필터 옵션과 달리 "ALL" 미포함) */
export const STATUS_OPTIONS: Array<{ label: string; value: CohortStatus }> = [
  { label: "모집 예정", value: CreateCohortRequestDtoStatus.UPCOMING },
  { label: "모집 중", value: CreateCohortRequestDtoStatus.RECRUITING },
  { label: "활동 중", value: CreateCohortRequestDtoStatus.ACTIVE },
  { label: "활동 종료", value: CreateCohortRequestDtoStatus.CLOSED },
]

export const CURRICULUM_WEEK_COUNT = 9
```

> **삭제된 export:** `STATUS_LABEL` (→ `entities/cohort/model/statusFlow.ts` 로 이동), `STATUS_FILTER_MAP` (페이지 hook 의 selector 가 `statusFilter !== "ALL"` 비교만 하므로 불필요), `SEMESTER_PARTS` (→ `entities/cohort/model/constants.ts` 로 이동).

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: `STATUS_LABEL / STATUS_FILTER_MAP / SEMESTER_PARTS` 의 기존 import 처가 깨짐 — Task 15/16 에서 import 경로를 entities/cohort 로 교체할 때 해소된다. 이 시점에는 빨간 줄이 남아 있어도 OK. 다만 빌드는 후속 task 에서 통과해야 한다.

> **주의:** 빌드가 깨진 채로 커밋하면 워크트리가 broken 상태가 되어 다음 task 시작 시 혼란이 생긴다. 해소책 두 가지 중 하나:
> - (선호) Task 15/16 까지 한 번에 묶어 커밋 (각 task 개별 commit 대신 phase 단위 commit)
> - 또는 Task 6 이후 즉시 Task 14/15/16 으로 진행해 빌드 회복 시점을 짧게 유지

이 plan 은 후자를 따른다 — Task 6 의 commit 은 진행하되, 다음 Task 들을 곧장 이어서 진행해 broken 상태를 최소화한다.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/constants.ts
git commit -m "$(cat <<'EOF'
refactor(admin/semesters): constants 를 서버 enum 기준으로 재작성

- STATUS_FILTER_OPTIONS / STATUS_OPTIONS 를 CohortStatus 값으로 교체
- 로컬 SEMESTER_PARTS / STATUS_LABEL / STATUS_FILTER_MAP 제거 (entities/cohort 로 이동)
- CURRICULUM_WEEK_COUNT 만 유지

후속 task 에서 호출처 import 경로를 정리하면서 빌드가 회복된다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `pages/semesters/types.d.ts` 정리

**Files:**
- Modify: `apps/admin/src/pages/semesters/types.d.ts`

- [ ] **Step 1: 파일 전체 교체**

```ts
import type { CohortPartName, CohortStatus } from "@ddd/api"

export type ProcessSchedule = {
  documentAcceptStartDate: string
  documentAcceptEndDate: string
  documentResultDate: string
  interviewStartDate: string
  interviewEndDate: string
  finalResultDate: string
}

export type CurriculumWeek = {
  date: string
  description: string
}

/**
 * Drawer 폼 state shape.
 * cohortNumber 는 숫자만 입력 받는 가정 (직렬화 시 "기" 접미사가 자동 부착됨).
 * status 는 CohortStatus 서버 enum 값.
 * applicationForms 는 서버 파트 enum (PM/PD/BE/FE/IOS/AND) 키 사용.
 */
export type SemesterRegisterForm = {
  cohortNumber: string
  status: CohortStatus
  recruitStartDate: string
  recruitEndDate: string
  process: ProcessSchedule
  curriculum: CurriculumWeek[]
  applicationForms: Record<CohortPartName, string[]>
}
```

> **삭제된 type:** `SemesterStatus` (→ `CohortStatus`), `SemesterPart` (→ `CohortPartName`), `SemesterInfo` (→ `CohortDto` 직접 사용 + page hook 의 `CohortRow`).

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: `SemesterStatus / SemesterPart / SemesterInfo` 를 import 하던 호출처에서 에러. 이는 Task 15/16 에서 해소된다.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/types.d.ts
git commit -m "$(cat <<'EOF'
refactor(admin/semesters): 로컬 타입 제거, 서버 타입으로 통일

SemesterStatus → CohortStatus, SemesterPart → CohortPartName,
SemesterInfo 제거. SemesterRegisterForm 의 applicationForms 키도
서버 enum 으로 통일한다.

후속 task 에서 호출처가 정리되며 빌드 회복.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `entities/cohort/model/useCreateOrUpdateCohortFlow.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/useCreateOrUpdateCohortFlow.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import {
  cohortKeys,
  useCreateCohort,
  useUpdateCohort,
} from "@ddd/api"

import type { SemesterRegisterForm } from "../../../pages/semesters/types"
import {
  serializeFormToCreatePayload,
  serializeFormToUpdatePayload,
} from "./serialize"

type Mode = "create" | "resume" | "edit"

interface Args {
  mode: Mode
  /** resume/edit 에서 채워짐. create 모드면 null */
  targetId: number | null
  /** 성공 시 호출 (Drawer 닫기 등) */
  onSuccess?: () => void
}

/**
 * 등록/저장 흐름 훅.
 * - mode=create   → POST /admin/cohorts
 * - mode=resume   → PATCH /admin/cohorts/:targetId
 * - mode=edit     → PATCH /admin/cohorts/:targetId
 *
 * 성공 시: cohortKeys 무효화 + toast.success + onSuccess()
 * 실패 시: toast.error
 */
export const useCreateOrUpdateCohortFlow = ({
  mode,
  targetId,
  onSuccess,
}: Args) => {
  const queryClient = useQueryClient()
  const createMutation = useCreateCohort()
  const updateMutation = useUpdateCohort()

  const isPending = createMutation.isPending || updateMutation.isPending

  const submit = async (form: SemesterRegisterForm) => {
    try {
      if (mode === "create") {
        const payload = serializeFormToCreatePayload(form)
        const created = await createMutation.mutateAsync({ payload })
        queryClient.invalidateQueries({ queryKey: cohortKeys.all })
        toast.success(`기수 ${created.name}을(를) 등록했습니다`)
      } else {
        if (targetId == null) {
          toast.error("저장할 기수를 찾을 수 없습니다")
          return
        }
        const payload = serializeFormToUpdatePayload(form)
        await updateMutation.mutateAsync({
          params: { id: targetId },
          payload,
        })
        queryClient.invalidateQueries({ queryKey: cohortKeys.all })
        toast.success("기수 정보를 저장했습니다")
      }
      onSuccess?.()
    } catch (error) {
      const fallback =
        mode === "create" ? "기수 등록에 실패했습니다" : "저장에 실패했습니다"
      toast.error(fallback, {
        description: (error as Error)?.message,
      })
    }
  }

  return { submit, isPending }
}
```

> **참고:** `cohortKeys` 가 `@ddd/api` 에서 export 되는지 확인. `packages/api/src/cohort/queryKeys.ts` 에 정의되어 있고, 보통 `packages/api/src/index.ts` 에 re-export 되어 있다. 누락 시 추가 후 같이 커밋.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: `pages/semesters/types` 가 Task 7 에서 갱신된 상태이므로 이 파일은 OK. 다만 호출처(SemesterRegisterDrawer) 가 아직 갱신 전이라 거기서 에러는 그대로.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/useCreateOrUpdateCohortFlow.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort 등록/저장 흐름 훅(useCreateOrUpdateCohortFlow) 추가

mode (create | resume | edit) 에 따라 POST 또는 PATCH 를 분기 호출하고,
성공 시 cohortKeys 전체 무효화 + 성공 toast + onSuccess 콜백을 실행한다.
실패 시 사용자 친화 메시지로 toast.error.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `entities/cohort/model/useDeleteCohortFlow.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/useDeleteCohortFlow.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { useState } from "react"

import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import {
  applicationKeys,
  cohortKeys,
  useDeleteCohort,
} from "@ddd/api"

interface Args {
  /** 삭제 대상 cohort id. resume 모드에서만 채워짐 */
  targetId: number | null
  /** 삭제 성공 시 호출 (Drawer 닫기 + form 초기화) */
  onDeleted?: () => void
}

/**
 * 삭제 확인 다이얼로그 + DELETE 호출 + 캐시 무효화 + toast 를 묶은 훅.
 *
 * UI 측은 다음을 받아 사용한다:
 * - isConfirmOpen: AlertDialog 의 isOpen
 * - openConfirm: 삭제 버튼이 호출 (다이얼로그 열기)
 * - closeConfirm: 다이얼로그 onOpenChange(false) 핸들러
 * - confirm: 다이얼로그의 "삭제" 버튼이 호출 (실제 mutate)
 */
export const useDeleteCohortFlow = ({ targetId, onDeleted }: Args) => {
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteCohort()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const openConfirm = () => {
    if (targetId == null) {
      toast.error("삭제할 기수를 찾을 수 없습니다")
      return
    }
    setIsConfirmOpen(true)
  }

  const closeConfirm = () => setIsConfirmOpen(false)

  const confirm = async () => {
    if (targetId == null) return
    try {
      await deleteMutation.mutateAsync({ params: { id: targetId } })
      queryClient.invalidateQueries({ queryKey: cohortKeys.all })
      queryClient.invalidateQueries({
        queryKey: applicationKeys.adminList({ cohortId: targetId }),
      })
      toast.success("기수를 삭제했습니다")
      setIsConfirmOpen(false)
      onDeleted?.()
    } catch (error) {
      toast.error("삭제에 실패했습니다", {
        description: (error as Error)?.message,
      })
    }
  }

  return {
    isConfirmOpen,
    openConfirm,
    closeConfirm,
    confirm,
    isPending: deleteMutation.isPending,
  }
}
```

> **참고:** `applicationKeys` 가 `@ddd/api` 에서 export 되는지 확인. 누락 시 추가.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 이 파일은 OK.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/useDeleteCohortFlow.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort 삭제 흐름 훅(useDeleteCohortFlow) 추가

AlertDialog 의 open/close state 를 hook 내부로 캡슐화하고, 삭제 성공 시
cohortKeys + 해당 cohortId 의 applicationKeys.adminList 를 무효화한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `entities/cohort/model/useTransitionCohortStatusFlow.ts`

**Files:**
- Create: `apps/admin/src/entities/cohort/model/useTransitionCohortStatusFlow.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { toast } from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"

import { cohortKeys, useUpdateCohort } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

import { STATUS_LABEL, nextStatus } from "./statusFlow"

/**
 * cohort status 단방향 전이 훅.
 * UPCOMING→RECRUITING→ACTIVE→CLOSED 의 다음 단계로 PATCH 를 호출한다.
 * CLOSED 의 경우 nextStatus 가 null 이라 호출 자체가 무시된다 (UI 가 버튼을
 * 렌더링하지 않으므로 도달하지 않는 게 정상).
 */
export const useTransitionCohortStatusFlow = () => {
  const queryClient = useQueryClient()
  const updateMutation = useUpdateCohort()

  const transition = async (cohort: CohortDto) => {
    const next = nextStatus(cohort.status)
    if (next == null) return

    try {
      await updateMutation.mutateAsync({
        params: { id: cohort.id },
        payload: { status: next },
      })
      queryClient.invalidateQueries({ queryKey: cohortKeys.all })
      toast.success(
        `${cohort.name} 상태를 ${STATUS_LABEL[next]}(으)로 변경했습니다`,
      )
    } catch (error) {
      toast.error("상태 변경에 실패했습니다", {
        description: (error as Error)?.message,
      })
    }
  }

  return { transition, isPending: updateMutation.isPending }
}
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 이 파일은 OK.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/model/useTransitionCohortStatusFlow.ts
git commit -m "$(cat <<'EOF'
feat(admin): cohort status 전환 흐름 훅(useTransitionCohortStatusFlow) 추가

nextStatus 로 다음 단계 계산 → PATCH → cohortKeys 무효화 → 상태별 한글
라벨로 toast.success.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `entities/cohort/index.ts` 배럴 보강

**Files:**
- Modify: `apps/admin/src/entities/cohort/index.ts`

- [ ] **Step 1: 흐름 훅 export 추가**

```ts
export * from "./model/constants"
export * from "./model/statusFlow"
export * from "./model/completion"
export * from "./model/serialize"
export * from "./model/useCreateOrUpdateCohortFlow"
export * from "./model/useDeleteCohortFlow"
export * from "./model/useTransitionCohortStatusFlow"
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러 (배럴만 갱신).

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/entities/cohort/index.ts
git commit -m "$(cat <<'EOF'
feat(admin): entities/cohort 배럴에 흐름 훅 3종 export 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `pages/semesters/hooks/useSemestersTableData.ts`

**Files:**
- Create: `apps/admin/src/pages/semesters/hooks/useSemestersTableData.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { useMemo } from "react"

import { useQueries, useQuery } from "@tanstack/react-query"

import {
  applicationQueries,
  useAdminProjects,
  useCohorts,
} from "@ddd/api"

import type {
  ApplicationDto,
  CohortDto,
  CohortStatus,
  ProjectDto,
} from "@ddd/api"

import { STATUS_LABEL } from "../../../entities/cohort"

export interface CohortRow extends CohortDto {
  /** 해당 cohort 의 지원자 수. fetch 실패 시 null → UI 에 "-" */
  applicantsCount: number | null
  /** 해당 cohort 의 멤버 수 합. fetch 실패 시 null */
  membersCount: number | null
}

export interface SemestersSummary {
  totalCohorts: number
  /** 표시 라벨. cohort 가 없으면 "기수 없음" */
  currentStatusLabel: string
  totalApplicants: number
  totalMembers: number
}

interface Result {
  tableRows: CohortRow[]
  summary: SemestersSummary
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * cohort 목록 + cohort별 application 카운트 + admin projects 를 조합해
 * 테이블 행과 요약 카드 데이터를 산출한다.
 *
 * - cohort fetch 가 실패하면 isError=true (페이지 전체 ErrorState 노출 신호)
 * - applications/projects 의 부분 실패는 행/카드 단위 graceful degrade
 */
export const useSemestersTableData = (): Result => {
  const cohortsQuery = useCohorts()
  const projectsQuery = useAdminProjects()

  const cohorts: CohortDto[] = cohortsQuery.data ?? []

  const applicationsByCohort = useQueries({
    queries: cohorts.map((c) =>
      applicationQueries.getAdminApplications({
        params: { cohortId: c.id },
      }),
    ),
  })

  const tableRows: CohortRow[] = useMemo(() => {
    const projects: ProjectDto[] = projectsQuery.data?.items ?? []
    const projectsFailed = projectsQuery.isError

    return cohorts
      .slice()
      .sort((a, b) => b.id - a.id) // id desc
      .map((c) => {
        const appQuery = applicationsByCohort[
          cohorts.findIndex((x) => x.id === c.id)
        ]
        const apps: ApplicationDto[] | undefined = appQuery?.data
        const appsFailed = appQuery?.isError === true

        const applicantsCount = appsFailed
          ? null
          : apps
            ? apps.length
            : 0

        const membersCount = projectsFailed
          ? null
          : projects
              .filter((p) => p.cohortId === c.id)
              .reduce((sum, p) => sum + (p.members?.length ?? 0), 0)

        return { ...c, applicantsCount, membersCount }
      })
  }, [cohorts, applicationsByCohort, projectsQuery.data, projectsQuery.isError])

  const summary: SemestersSummary = useMemo(() => {
    const sortedDesc = cohorts.slice().sort((a, b) => b.id - a.id)
    const latestStatus: CohortStatus | undefined = sortedDesc[0]?.status

    const totalApplicants = tableRows.reduce(
      (sum, r) => sum + (r.applicantsCount ?? 0),
      0,
    )
    const totalMembers = tableRows.reduce(
      (sum, r) => sum + (r.membersCount ?? 0),
      0,
    )

    return {
      totalCohorts: cohorts.length,
      currentStatusLabel: latestStatus ? STATUS_LABEL[latestStatus] : "기수 없음",
      totalApplicants,
      totalMembers,
    }
  }, [cohorts, tableRows])

  return {
    tableRows,
    summary,
    isLoading: cohortsQuery.isLoading,
    isError: cohortsQuery.isError,
    refetch: () => {
      cohortsQuery.refetch()
      projectsQuery.refetch()
    },
  }
}
```

> **주의:** `applicationsByCohort` 에서 인덱스를 `cohorts.findIndex(...)` 로 다시 찾는 부분은 정렬 전 원본 배열(`cohorts`) 기준으로 매핑하기 위함이다 (`useQueries` 의 결과 순서는 입력 순서와 동일).

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 이 파일은 OK. 다른 호출처(SemestersPage) 에서는 여전히 빌드 에러가 남아 있을 수 있다 — Task 16 에서 해소.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/hooks/useSemestersTableData.ts
git commit -m "$(cat <<'EOF'
feat(admin/semesters): useSemestersTableData 훅 추가

cohort 목록 + cohort별 application 병렬 조회 + admin projects 단일 호출을
조합해 테이블 행(applicantsCount/membersCount 포함) 과 요약 카드 데이터를
산출한다. 부분 실패 시 해당 카운트는 null 로 두어 UI 가 "-" 처리한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: `pages/semesters/hooks/useSemesterRegistrationMode.ts`

**Files:**
- Create: `apps/admin/src/pages/semesters/hooks/useSemesterRegistrationMode.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { useMemo } from "react"

import { useCohorts } from "@ddd/api"

import type { CohortDto } from "@ddd/api"

import {
  isCohortComplete,
  serializeCohortToForm,
} from "../../../entities/cohort"

import type { SemesterRegisterForm } from "../types"

export type RegistrationMode = "create" | "resume"

export interface RegistrationState {
  mode: RegistrationMode
  /** resume 모드에서만 채워짐 */
  targetId: number | null
  /** resume 모드에서만 채워짐 — Drawer 가 prefill 에 사용 */
  prefill: SemesterRegisterForm | undefined
  /** TitleSection 의 버튼 라벨 */
  buttonLabel: string
}

/**
 * id 내림차순으로 가장 최신 cohort 의 완성도를 보고 등록 모드를 결정한다.
 * - cohort 없음 → create
 * - 최신 cohort 가 모두 채워짐 → create
 * - 최신 cohort 가 미완성 → resume (해당 cohort id + 현재 값으로 prefill)
 *
 * edit 모드는 페이지의 행 "수정" 클릭이 별도로 트리거하므로 여기서 다루지 않는다.
 */
export const useSemesterRegistrationMode = (): RegistrationState => {
  const { data } = useCohorts()
  const cohorts: CohortDto[] = data ?? []

  return useMemo(() => {
    const sortedDesc = cohorts.slice().sort((a, b) => b.id - a.id)
    const latest = sortedDesc[0]

    if (!latest || isCohortComplete(latest)) {
      return {
        mode: "create",
        targetId: null,
        prefill: undefined,
        buttonLabel: "새 기수 등록",
      }
    }

    return {
      mode: "resume",
      targetId: latest.id,
      prefill: serializeCohortToForm(latest),
      buttonLabel: "기수 등록 마저하기",
    }
  }, [cohorts])
}
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 이 파일은 OK.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/hooks/useSemesterRegistrationMode.ts
git commit -m "$(cat <<'EOF'
feat(admin/semesters): useSemesterRegistrationMode 훅 추가

id 내림차순 최신 cohort 의 완성도(isCohortComplete) 로 create | resume 모드를
결정. resume 모드는 prefill 폼과 targetId 를 함께 반환해 Drawer 가 그대로
사용할 수 있게 한다.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: `pages/semesters/hooks/index.ts`

**Files:**
- Create: `apps/admin/src/pages/semesters/hooks/index.ts`

- [ ] **Step 1: 파일 작성**

```ts
export * from "./useSemestersTableData"
export * from "./useSemesterRegistrationMode"
```

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 0 에러.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/hooks/index.ts
git commit -m "$(cat <<'EOF'
feat(admin/semesters): hooks 배럴 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: `SemesterRegisterDrawer.tsx` 리팩터

**Files:**
- Modify: `apps/admin/src/pages/semesters/SemesterRegisterDrawer.tsx`

기존 파일을 거의 그대로 두되 다음을 변경:
- props 추가: `isOpen / onOpenChange / mode / targetId / prefill`
- `Drawer.Backdrop` → `Drawer` (controlled)
- `handleSubmit` 의 `console.log` 제거 → `useCreateOrUpdateCohortFlow.submit(form)`
- footer 에 삭제 버튼 (resume only) + AlertDialog 인라인
- 헤더 타이틀 / 푸터 버튼 라벨 mode 분기
- 파트 탭에 PART_LABEL 적용
- prefill 동기화 useEffect

- [ ] **Step 1: 파일 전체 교체**

```tsx
import { useEffect, useState } from "react"
import { PlusSignIcon, X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  AlertDialog,
  Button,
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  Drawer,
  Input,
  ListBox,
  RangeCalendar,
  Select,
  Tabs,
  TextArea,
} from "@heroui/react"

import { CohortPartConfigDtoName, CreateCohortRequestDtoStatus } from "@ddd/api"

import type { CohortPartName } from "@ddd/api"

import {
  PART_LABEL,
  SEMESTER_PARTS,
  useCreateOrUpdateCohortFlow,
  useDeleteCohortFlow,
} from "@/entities/cohort"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import { GridBox } from "@/shared/ui/GridBox"

import { CURRICULUM_WEEK_COUNT, STATUS_OPTIONS } from "./constants"
import type {
  CurriculumWeek,
  ProcessSchedule,
  SemesterRegisterForm,
} from "./types"

type DrawerMode = "create" | "resume" | "edit"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  targetId: number | null
  prefill?: SemesterRegisterForm
}

const createInitialForm = (): SemesterRegisterForm => ({
  cohortNumber: "",
  status: CreateCohortRequestDtoStatus.UPCOMING,
  recruitStartDate: "",
  recruitEndDate: "",
  process: {
    documentAcceptStartDate: "",
    documentAcceptEndDate: "",
    documentResultDate: "",
    interviewStartDate: "",
    interviewEndDate: "",
    finalResultDate: "",
  },
  curriculum: Array.from({ length: CURRICULUM_WEEK_COUNT }, () => ({
    date: "",
    description: "",
  })),
  applicationForms: {
    [CohortPartConfigDtoName.PM]: [""],
    [CohortPartConfigDtoName.PD]: [""],
    [CohortPartConfigDtoName.BE]: [""],
    [CohortPartConfigDtoName.FE]: [""],
    [CohortPartConfigDtoName.IOS]: [""],
    [CohortPartConfigDtoName.AND]: [""],
  },
})

const TITLE_BY_MODE: Record<DrawerMode, string> = {
  create: "신규 기수 등록",
  resume: "기수 등록 마저하기",
  edit: "기수 수정",
}

const SUBMIT_LABEL_BY_MODE: Record<DrawerMode, string> = {
  create: "등록",
  resume: "저장",
  edit: "저장",
}

export function SemesterRegisterDrawer({
  isOpen,
  onOpenChange,
  mode,
  targetId,
  prefill,
}: Props) {
  const isMobile = useIsMobile()
  const [form, setForm] = useState<SemesterRegisterForm>(
    () => prefill ?? createInitialForm(),
  )

  // prefill / mode 가 바뀌면 폼 갱신 (다른 cohort 선택 시 등)
  useEffect(() => {
    setForm(prefill ?? createInitialForm())
  }, [prefill, mode])

  const { submit, isPending: isSubmitting } = useCreateOrUpdateCohortFlow({
    mode,
    targetId,
    onSuccess: () => onOpenChange(false),
  })

  const {
    isConfirmOpen,
    openConfirm,
    closeConfirm,
    confirm: confirmDelete,
    isPending: isDeleting,
  } = useDeleteCohortFlow({
    targetId,
    onDeleted: () => onOpenChange(false),
  })

  const handleBasicChange = (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProcessChange = (field: keyof ProcessSchedule, value: string) => {
    setForm((prev) => ({
      ...prev,
      process: { ...prev.process, [field]: value },
    }))
  }

  const handleCurriculumChange = (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.curriculum]
      next[weekIndex] = { ...next[weekIndex], [field]: value }
      return { ...prev, curriculum: next }
    })
  }

  const handleQuestionChange = (
    part: CohortPartName,
    questionIndex: number,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.applicationForms[part]]
      next[questionIndex] = value
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  const addQuestion = (part: CohortPartName) => {
    setForm((prev) => ({
      ...prev,
      applicationForms: {
        ...prev.applicationForms,
        [part]: [...prev.applicationForms[part], ""],
      },
    }))
  }

  const removeQuestion = (part: CohortPartName, questionIndex: number) => {
    setForm((prev) => {
      const next = prev.applicationForms[part].filter(
        (_, i) => i !== questionIndex,
      )
      return {
        ...prev,
        applicationForms: { ...prev.applicationForms, [part]: next },
      }
    })
  }

  return (
    <>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Backdrop>
          <Drawer.Content placement={isMobile ? "bottom" : "right"}>
            <Drawer.Dialog
              className={!isMobile ? "w-full max-w-1/2 bg-gray-100" : ""}
            >
              <Drawer.Header>
                <Drawer.Heading className="text-lg font-semibold">
                  {TITLE_BY_MODE[mode]}
                </Drawer.Heading>
              </Drawer.Header>

              <Drawer.Body className="flex-1 space-y-8 overflow-y-auto">
                <BasicInfoSection form={form} onChange={handleBasicChange} />
                <ProcessSection
                  process={form.process}
                  onChange={handleProcessChange}
                />
                <CurriculumSection
                  curriculum={form.curriculum}
                  onChange={handleCurriculumChange}
                />
                <ApplicationFormSection
                  applicationForms={form.applicationForms}
                  onQuestionChange={handleQuestionChange}
                  onAddQuestion={addQuestion}
                  onRemoveQuestion={removeQuestion}
                />
              </Drawer.Body>

              <Drawer.Footer className="gap-2">
                <Button slot="close" variant="tertiary">
                  취소
                </Button>
                {mode === "resume" && (
                  <Button
                    variant="danger"
                    isDisabled={isDeleting || isSubmitting}
                    onPress={openConfirm}
                  >
                    삭제
                  </Button>
                )}
                <Button
                  isDisabled={isSubmitting || isDeleting}
                  onPress={() => submit(form)}
                >
                  {isSubmitting ? "저장 중..." : SUBMIT_LABEL_BY_MODE[mode]}
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <AlertDialog.Backdrop isOpen={isConfirmOpen} onOpenChange={(o) => !o && closeConfirm()}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>기수를 삭제하시겠습니까?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                작성 중인 모든 정보가 사라지며, 이 작업은 되돌릴 수 없습니다.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                취소
              </Button>
              <Button
                variant="danger"
                isDisabled={isDeleting}
                onPress={confirmDelete}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}

// ─── 섹션 서브컴포넌트 ────────────────────────────────────────────────────────

type BasicInfoSectionProps = {
  form: SemesterRegisterForm
  onChange: (
    field: keyof Pick<
      SemesterRegisterForm,
      "cohortNumber" | "status" | "recruitStartDate" | "recruitEndDate"
    >,
    value: string,
  ) => void
}

function BasicInfoSection({ form, onChange }: BasicInfoSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>기본 정보</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="기수">
          <Input
            type="text"
            placeholder="예: 16"
            value={form.cohortNumber}
            onChange={(e) => onChange("cohortNumber", e.target.value)}
            className="w-full"
          />
        </FormField>
        <FormField label="상태">
          <Select
            className="w-full"
            selectedKey={form.status}
            onSelectionChange={(key) => onChange("status", String(key))}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_OPTIONS.map((opt) => (
                  <ListBox.Item
                    key={opt.value}
                    id={opt.value}
                    textValue={opt.label}
                  >
                    {opt.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </FormField>
        <FormField label="모집 시작일">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("recruitStartDate", date?.toString() || "")
            }
          >
            <DateField.Group fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DatePicker.Popover>
              <Calendar aria-label="모집 시작일">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
        <FormField label="모집 종료일">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("recruitEndDate", date?.toString() || "")
            }
          >
            <DateField.Group fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DatePicker.Popover>
              <Calendar aria-label="모집 종료일">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
      </GridBox>
    </section>
  )
}

type ProcessSectionProps = {
  process: ProcessSchedule
  onChange: (field: keyof ProcessSchedule, value: string) => void
}

function ProcessSection({ onChange }: ProcessSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>프로세스 일정</SectionTitle>
      <GridBox className="grid-cols-2 gap-5">
        <FormField label="서류 접수">
          <DateRangePicker
            className="w-full"
            value={null}
            onChange={(value) => {
              onChange(
                "documentAcceptStartDate",
                value?.start.toString() || "",
              )
              onChange("documentAcceptEndDate", value?.end.toString() || "")
            }}
          >
            <DateField.Group fullWidth>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="서류 접수 기간">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </FormField>
        <FormField label="서류 발표">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("documentResultDate", date?.toString() || "")
            }
          >
            <DateField.Group fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DatePicker.Popover>
              <Calendar aria-label="서류 발표">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
        <FormField label="인터뷰 날짜">
          <DateRangePicker
            className="w-full"
            value={null}
            onChange={(value) => {
              onChange("interviewStartDate", value?.start.toString() || "")
              onChange("interviewEndDate", value?.end.toString() || "")
            }}
          >
            <DateField.Group fullWidth>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="인터뷰 기간">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </FormField>
        <FormField label="최종 발표">
          <DatePicker
            className="w-full"
            value={null}
            onChange={(date) =>
              onChange("finalResultDate", date?.toString() || "")
            }
          >
            <DateField.Group fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DatePicker.Popover>
              <Calendar aria-label="최종 발표">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        </FormField>
      </GridBox>
    </section>
  )
}

type CurriculumSectionProps = {
  curriculum: CurriculumWeek[]
  onChange: (
    weekIndex: number,
    field: keyof CurriculumWeek,
    value: string,
  ) => void
}

function CurriculumSection({ curriculum, onChange }: CurriculumSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>커리큘럼</SectionTitle>
      <div className="space-y-3">
        {curriculum.map((week, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-sm text-gray-500">
              {index + 1}주차
            </span>
            <DatePicker
              className="w-1/2"
              value={null}
              onChange={(date) =>
                onChange(index, "date", date?.toString() || "")
              }
            >
              <DateField.Group fullWidth>
                <DateField.Input>
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                  <DatePicker.Trigger>
                    <DatePicker.TriggerIndicator />
                  </DatePicker.Trigger>
                </DateField.Suffix>
              </DateField.Group>
              <DatePicker.Popover>
                <Calendar aria-label={`${index + 1}주차 날짜`}>
                  <Calendar.Header>
                    <Calendar.YearPickerTrigger>
                      <Calendar.YearPickerTriggerHeading />
                      <Calendar.YearPickerTriggerIndicator />
                    </Calendar.YearPickerTrigger>
                    <Calendar.NavButton slot="previous" />
                    <Calendar.NavButton slot="next" />
                  </Calendar.Header>
                  <Calendar.Grid>
                    <Calendar.GridHeader>
                      {(day) => (
                        <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                      )}
                    </Calendar.GridHeader>
                    <Calendar.GridBody>
                      {(date) => <Calendar.Cell date={date} />}
                    </Calendar.GridBody>
                  </Calendar.Grid>
                </Calendar>
              </DatePicker.Popover>
            </DatePicker>
            <Input
              placeholder="내용 입력"
              value={week.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

type ApplicationFormSectionProps = {
  applicationForms: SemesterRegisterForm["applicationForms"]
  onQuestionChange: (
    part: CohortPartName,
    index: number,
    value: string,
  ) => void
  onAddQuestion: (part: CohortPartName) => void
  onRemoveQuestion: (part: CohortPartName, index: number) => void
}

function ApplicationFormSection({
  applicationForms,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
}: ApplicationFormSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>파트별 지원서 양식</SectionTitle>
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="파트별 지원서">
            {SEMESTER_PARTS.map((part) => (
              <Tabs.Tab key={part} id={part}>
                {PART_LABEL[part]}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {SEMESTER_PARTS.map((part) => (
          <Tabs.Panel key={part} id={part} className="space-y-3 py-4">
            {applicationForms[part].map((question, qIndex) => (
              <div key={qIndex} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    질문 {qIndex + 1}
                  </label>
                  {applicationForms[part].length > 1 && (
                    <Button
                      isIconOnly
                      variant="outline"
                      size="sm"
                      onPress={() => onRemoveQuestion(part, qIndex)}
                    >
                      <HugeiconsIcon icon={X} />
                    </Button>
                  )}
                </div>
                <TextArea
                  placeholder="질문을 입력하세요"
                  className="w-full resize-none"
                  value={question}
                  onChange={(e) =>
                    onQuestionChange(part, qIndex, e.target.value)
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onPress={() => onAddQuestion(part)}
            >
              <HugeiconsIcon icon={PlusSignIcon} className="mr-1" />
              질문 추가
            </Button>
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  )
}

// ─── 공통 UI ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b pb-2 text-sm font-semibold text-foreground">
      {children}
    </h3>
  )
}

type FormFieldProps = {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="flex flex-col items-start gap-1">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {children}
    </label>
  )
}
```

> **주의사항:**
> - `Button slot="close" variant="tertiary"` 는 기존 `DeleteProjectDialog` / `ProjectFormDrawer` 와 동일한 패턴.
> - `Drawer.CloseTrigger` 가 없어진 자리에 `Button slot="close"` 가 들어감 (HeroUI 의 controlled drawer 패턴).
> - `DatePicker` 의 `value={null}` 는 기존 코드 패턴 그대로 유지 (별도 controlled date 처리는 추후 spec).
> - `Select` 의 `selectedKey` / `onSelectionChange` 는 HeroUI v3 controlled API. 기존 `value` / `onChange` 와 다르므로 주의.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: 이 파일은 OK. SemestersPage 가 아직 갱신 전이라 page 측에서만 에러.

- [ ] **Step 3: 커밋**

```bash
git add apps/admin/src/pages/semesters/SemesterRegisterDrawer.tsx
git commit -m "$(cat <<'EOF'
feat(admin/semesters): SemesterRegisterDrawer 를 controlled + 3-mode 로 전환

- props: isOpen / onOpenChange / mode (create|resume|edit) / targetId / prefill
- handleSubmit 의 console.log 제거 → useCreateOrUpdateCohortFlow.submit
- 푸터에 삭제 버튼(resume only) + AlertDialog 인라인 (useDeleteCohortFlow)
- 헤더 타이틀 / 푸터 버튼 라벨 mode 별 분기
- 파트 탭에 PART_LABEL 적용, 폼 state 키를 서버 enum 으로 통일
- prefill / mode 변경 시 useEffect 로 폼 동기화

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: `SemestersPage.tsx` 리팩터

**Files:**
- Modify: `apps/admin/src/pages/semesters/SemestersPage.tsx`

- [ ] **Step 1: 파일 전체 교체**

```tsx
import { useMemo, useState } from "react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, Input, ListBox, Select, Table } from "@heroui/react"

import type { CohortDto } from "@ddd/api"

import {
  STATUS_LABEL,
  NEXT_STATUS_BUTTON_LABEL,
  nextStatus,
  serializeCohortToForm,
  useTransitionCohortStatusFlow,
} from "@/entities/cohort"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { Description, Title } from "@/widgets/heading"

import { SemesterRegisterDrawer } from "./SemesterRegisterDrawer"
import {
  STATUS_FILTER_OPTIONS,
  type StatusFilterValue,
} from "./constants"
import {
  useSemesterRegistrationMode,
  useSemestersTableData,
  type CohortRow,
  type SemestersSummary,
} from "./hooks"

/** 기수 관리 페이지 */
export default function SemestersPage() {
  const { tableRows, summary, isError, refetch } = useSemestersTableData()
  const registration = useSemesterRegistrationMode()
  const { transition } = useTransitionCohortStatusFlow()

  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL")

  // 행 "수정" 클릭 시 채워지는 edit 타겟. registration 모드를 오버라이드.
  const [editTarget, setEditTarget] = useState<CohortDto | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const drawerProps = useMemo(() => {
    if (editTarget) {
      return {
        mode: "edit" as const,
        targetId: editTarget.id,
        prefill: serializeCohortToForm(editTarget),
      }
    }
    return {
      mode: registration.mode,
      targetId: registration.targetId,
      prefill: registration.prefill,
    }
  }, [editTarget, registration])

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) setEditTarget(null)
  }

  const filteredRows = useMemo(() => {
    return tableRows
      .filter((row) =>
        searchText === "" ? true : row.name.includes(searchText),
      )
      .filter((row) =>
        statusFilter === "ALL" ? true : row.status === statusFilter,
      )
  }, [tableRows, searchText, statusFilter])

  if (isError) {
    return (
      <div className="w-full p-5">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-800">
            기수 목록을 불러오지 못했습니다
          </p>
          <Button className="mt-3" onPress={refetch}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection
        registrationLabel={registration.buttonLabel}
        onClickRegister={() => {
          setEditTarget(null)
          setIsDrawerOpen(true)
        }}
      />

      <CardSection summary={summary} />

      <SemesterRegisterDrawer
        isOpen={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        mode={drawerProps.mode}
        targetId={drawerProps.targetId}
        prefill={drawerProps.prefill}
      />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <FlexBox className="justify-between">
          <Input
            variant="secondary"
            placeholder="검색..."
            className="max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            variant="secondary"
            className="max-w-36"
            aria-label="상태 필터"
            selectedKey={statusFilter}
            onSelectionChange={(key) =>
              setStatusFilter(String(key) as StatusFilterValue)
            }
          >
            <Select.Trigger>
              <Select.Value>
                {
                  STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
                    ?.label
                }
              </Select.Value>
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <ListBox.Item
                    key={option.value}
                    id={option.value}
                    textValue={option.label}
                  >
                    {option.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </FlexBox>

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="기수 목록">
              <Table.Header>
                <Table.Column isRowHeader>기수</Table.Column>
                <Table.Column>상태</Table.Column>
                <Table.Column>모집 기간</Table.Column>
                <Table.Column>지원자 수</Table.Column>
                <Table.Column>멤버 수</Table.Column>
                <Table.Column>등록일</Table.Column>
                <Table.Column>액션</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredRows.map((row) => (
                  <SemesterRow
                    key={row.id}
                    row={row}
                    onEdit={() => {
                      setEditTarget(row)
                      setIsDrawerOpen(true)
                    }}
                    onTransition={() => transition(row)}
                  />
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  )
}

// ─── 서브컴포넌트 ────────────────────────────────────────────────────────────

type TitleSectionProps = {
  registrationLabel: string
  onClickRegister: () => void
}

const TitleSection = ({
  registrationLabel,
  onClickRegister,
}: TitleSectionProps) => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="기수 관리" />
        <Description title="DDD 활동 기수를 등록하고 상태를 관리합니다." />
      </header>
      <Button onPress={onClickRegister}>
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        {registrationLabel}
      </Button>
    </FlexBox>
  )
}

type CardSectionProps = {
  summary: SemestersSummary
}

const CardSection = ({ summary }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-4 gap-5">
      <SummaryCard
        title="전체 기수"
        value={`${summary.totalCohorts}`}
        sub="등록된 기수 수"
      />
      <SummaryCard
        title="현재 상태"
        value={summary.currentStatusLabel}
        sub="가장 최신 기수"
      />
      <SummaryCard
        title="누적 지원자"
        value={`${summary.totalApplicants}명`}
        sub="전체 기수 합산"
      />
      <SummaryCard
        title="누적 활동 멤버"
        value={`${summary.totalMembers}명`}
        sub="전체 기수 합산"
      />
    </GridBox>
  )
}

const SummaryCard = ({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub: string
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
    <h3 className="font-semibold text-gray-700">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-500">{sub}</p>
  </div>
)

type SemesterRowProps = {
  row: CohortRow
  onEdit: () => void
  onTransition: () => void
}

const SemesterRow = ({ row, onEdit, onTransition }: SemesterRowProps) => {
  const transitionLabel = NEXT_STATUS_BUTTON_LABEL[row.status]
  const canTransition = nextStatus(row.status) !== null

  return (
    <Table.Row>
      <Table.Cell>{row.name}</Table.Cell>
      <Table.Cell>{STATUS_LABEL[row.status]}</Table.Cell>
      <Table.Cell>
        {formatPeriod(row.recruitStartAt, row.recruitEndAt)}
      </Table.Cell>
      <Table.Cell>{row.applicantsCount ?? "-"}</Table.Cell>
      <Table.Cell>{row.membersCount ?? "-"}</Table.Cell>
      <Table.Cell>
        {new Date(row.createdAt).toLocaleDateString("ko-KR")}
      </Table.Cell>
      <Table.Cell>
        <Button size="sm" variant="outline" className="mr-2" onPress={onEdit}>
          수정
        </Button>
        {canTransition && transitionLabel && (
          <Button size="sm" onPress={onTransition}>
            {transitionLabel}
          </Button>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

const formatPeriod = (start: string, end: string): string => {
  if (!start && !end) return "-"
  const left = start ? start.slice(0, 10) : "?"
  const right = end ? end.slice(0, 10) : "?"
  return `${left} ~ ${right}`
}
```

> **참고:**
> - `@/entities/cohort` 별칭이 vite/tsconfig 의 alias 설정에 있는지 확인. `apps/admin/tsconfig.json` 의 `paths` 에 `"@/*": ["./src/*"]` 가 있으면 OK (기존 코드에서 이미 `@/shared/...` 를 쓰고 있으니 동일하게 동작).
> - 기존 `STATUS_LABEL` import 경로(`./constants`) 는 더 이상 존재하지 않음 → `@/entities/cohort` 로 변경됨.

- [ ] **Step 2: 정적 검증**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```
Expected: **0 에러** (이 시점에서 모든 호출처가 정합).

- [ ] **Step 3: lint**

```bash
pnpm --filter @ddd/admin lint
```
Expected: 0 에러 (warning 은 기존 baseline 수준).

- [ ] **Step 4: 커밋**

```bash
git add apps/admin/src/pages/semesters/SemestersPage.tsx
git commit -m "$(cat <<'EOF'
feat(admin/semesters): SemestersPage 를 cohort API 훅 + 페이지 hooks 로 전환

- getSemesterData 직접 fetch 제거, useSemestersTableData / useSemesterRegistrationMode 사용
- editTarget state + isDrawerOpen state 로 controlled drawer 제어
- 행 "수정" 클릭 → editTarget 세팅, "전환" 클릭 → useTransitionCohortStatusFlow
- CardSection 의 하드코딩된 통계를 summary 로 대체
- 상태 필터 / 검색을 서버 enum 기반으로 재정렬, CLOSED 의 전환 버튼 미렌더

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: 빌드 + 수동 검증

**Files:** (없음 — 검증만)

- [ ] **Step 1: 전체 정적 검증**

```bash
pnpm --filter @ddd/admin lint
pnpm --filter @ddd/admin tsc --noEmit
pnpm --filter @ddd/api tsc --noEmit
```
Expected: 모두 0 에러.

- [ ] **Step 2: 어드민 dev 서버 기동**

```bash
pnpm dev:admin
```
브라우저에서 `http://localhost:<port>/semesters` 진입. (포트는 콘솔 출력 확인.)

- [ ] **Step 3: 핵심 시나리오 수동 확인**

다음 시나리오를 직접 클릭(또는 Playwright MCP) 으로 검증:

| # | 시나리오 | 기대 |
|---|---|---|
| 1 | cohort 0개 상태 | 카드: `0 / "기수 없음" / 0 / 0`. 헤더 버튼 라벨 "새 기수 등록". 테이블 빈 행. |
| 2 | "새 기수 등록" 클릭 | Drawer 가 빈 폼으로 열림. 헤더 "신규 기수 등록". 삭제 버튼 미노출. |
| 3 | 모든 필드 채워서 등록 | toast 성공, Drawer 닫힘, 테이블에 새 행. status 가 UPCOMING 이면 행에 "모집중 전환" 버튼. |
| 4 | 일부만 채운 상태로 등록 | toast 성공. 다음 진입 시 헤더 버튼이 "기수 등록 마저하기" 로 바뀜. |
| 5 | "기수 등록 마저하기" 클릭 | Drawer 가 채워진 상태로 열림. 헤더 "기수 등록 마저하기". 삭제 버튼 노출. 기본 정보(name 등) 도 편집 가능. |
| 6 | resume 모드에서 빈 칸 마저 채우고 저장 | toast 성공, Drawer 닫힘. 다음 진입 시 헤더 버튼 "새 기수 등록" 으로 전환. |
| 7 | resume 모드에서 삭제 버튼 클릭 | AlertDialog 노출. "삭제" 클릭 시 toast 성공, Drawer 닫힘, 헤더 "새 기수 등록". |
| 8 | resume 모드에서 삭제 → AlertDialog "취소" | 삭제 안 됨, Drawer 유지. |
| 9 | 행 "수정" 클릭 | Drawer 가 해당 행 데이터로 prefill 되어 열림. 헤더 "기수 수정". 삭제 버튼 미노출. 저장 버튼 라벨 "저장". |
| 10 | 수정 후 저장 | toast 성공, 목록 갱신. |
| 11 | UPCOMING 행의 "모집중 전환" 클릭 | toast "...상태를 모집중(으)로 변경했습니다", status 변경 반영. |
| 12 | RECRUITING 행 → "활동중 전환" → ACTIVE | 라벨/동작 정상. |
| 13 | ACTIVE 행 → "활동 종료" → CLOSED | 라벨/동작 정상. |
| 14 | CLOSED 행 | 전환 버튼 자체가 렌더링되지 않음. |
| 15 | 검색어 입력 | name 부분 일치 행만 노출. |
| 16 | 상태 필터 변경 | 해당 status 행만 노출. |
| 17 | 검색 + 필터 동시 적용 | AND 조건. |
| 18 | (네트워크 탭에서 application 1건만 fail 시뮬레이트) | 해당 행의 지원자 수 셀이 "-", 다른 행은 정상. |
| 19 | (admin/projects 응답 fail 시뮬레이트) | 모든 행의 멤버 수 셀이 "-", 카드 4 가 0. |
| 20 | (admin/cohorts 응답 fail 시뮬레이트) | 풀 페이지 ErrorState + "다시 시도" 버튼 동작. |

- [ ] **Step 4: 검증 체크리스트 완료 보고**

수동 시나리오에서 발견된 이슈는 별도 task 로 분리해 fix. 발견 없으면 plan 종료.

> **이 task 는 commit 을 만들지 않는다** (검증만).

---

## Self-Review

### Spec Coverage Check

스펙(`docs/superpowers/specs/2026-05-04-semesters-api-integration-design.md`) 의 §2 "합의된 결정" 표 16개 항목을 task 매핑:

| 스펙 항목 | 매핑된 task |
|---|---|
| 풀 CRUD + entities/cohort/model 분리 | Task 1-11 |
| 카드 1 (전체 기수) | Task 12 (`useSemestersTableData.summary`) |
| 카드 2 (현재 상태) | Task 12 (`currentStatusLabel`) |
| 카드 3·4 (누적 합산) | Task 12 (`totalApplicants/totalMembers`) |
| 지원자 수 컬럼 | Task 12 (`useQueries(applicationQueries.getAdminApplications)`) |
| 멤버 수 컬럼 | Task 0 (useAdminProjects 추가) + Task 12 (필터/합산) |
| id 내림차순 정렬 | Task 12 (`sortedDesc`) |
| status 한글 라벨 | Task 2 (`STATUS_LABEL`) |
| 파트명 서버 enum 통일 | Task 1, 6, 7, 15 |
| JSON 직렬화 (로컬 폼 → freeform) | Task 4 |
| 한 번에 하나만 등록 (create vs resume) | Task 13 (`useSemesterRegistrationMode`) |
| 완성 판정 (process/curriculum/AF) | Task 3 |
| resume 모드 기본정보 편집 가능 | Task 15 (모든 모드 같은 폼) |
| Drawer 삭제 버튼 (resume only) | Task 9 + Task 15 |
| 행 "수정" → edit mode | Task 16 (`editTarget`) |
| 행 status 전환 (CLOSED 미렌더) | Task 10 + Task 16 (`canTransition` 가드) |
| Promise.allSettled 의미 | Task 12 (개별 query isError → null 표시) |
| toast 패턴 | Task 8/9/10 (모든 흐름 훅) |
| 캐시 무효화 (cohortKeys + delete 시 applicationKeys) | Task 8/9/10 |
| AlertDialog 삭제 확인 + 성공 시 Drawer 닫음 | Task 9 + Task 15 |

→ 모든 스펙 결정사항이 적어도 1개 task 에 매핑됨.

### Placeholder Scan

- "TBD" / "TODO" / "implement later": 없음.
- "Add appropriate error handling": 없음 (모든 에러 처리는 try/catch + toast.error 로 명시).
- "Write tests for the above": 없음 (테스트 인프라 부재 명시).
- "Similar to Task N" without code: 없음 (모든 코드 블록은 자기 완결적).

### Type Consistency

- `CohortStatus`, `CohortPartName`: Task 1/2/3/4/6/7 에서 일관되게 `@ddd/api` 의 타입 별칭 사용.
- `SemesterRegisterForm.applicationForms` key 타입: Task 4 에서 임시 `as` 단언, Task 7 에서 `Record<CohortPartName, string[]>` 로 정합.
- `nextStatus(s) | null` 의 null 의미: Task 2 에서 정의, Task 10 (호출 시 early return), Task 16 (`canTransition` 가드) 에서 일관 사용.
- `useCreateOrUpdateCohortFlow.submit(form)` 시그니처: Task 8 정의, Task 15 호출 (`submit(form)`).
- `useDeleteCohortFlow` 의 반환 키 (`isConfirmOpen / openConfirm / closeConfirm / confirm / isPending`): Task 9 정의, Task 15 사용 (`confirm: confirmDelete` 로 별칭).
- `CohortRow` (= `CohortDto + applicantsCount/membersCount`): Task 12 정의, Task 16 import 사용.
- `StatusFilterValue` (= `CohortStatus | "ALL"`): Task 6 정의, Task 16 사용.

→ 타입 일관성 OK.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-04-semesters-cohort-api-integration.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — 각 task 마다 fresh subagent 를 띄우고, task 완료 사이마다 사용자 검토 가능. 빠른 반복.

**2. Inline Execution** — 현재 세션에서 task 들을 batch 실행하며 checkpoint 마다 검토.

어느 쪽으로 진행할까요?
