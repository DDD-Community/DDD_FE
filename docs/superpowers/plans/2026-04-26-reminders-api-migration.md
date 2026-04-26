# Reminders API 연동 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `apps/admin/src/pages/reminders/`의 mock 기반 구현을 걷어내고 `@ddd/api/early-notification` 훅 기반의 실제 API 연동으로 교체한다.

**Architecture:** UI를 `EarlyNotificationDto` 형태에 맞춰 컬럼/통계를 축소하고, `useCohorts()`로 기수 옵션을 채운 뒤 활성 기수를 기본 선택. 일괄 발송은 react-hook-form + zod 기반 Drawer 폼 + 코드에 고정된 4슬롯 HTML 템플릿(`buildEmailTemplate`)으로 `useSendBulkEarlyNotification` 호출.

**Tech Stack:** React 19, Vite, TanStack Query, react-hook-form 7, zod, @hookform/resolvers/zod, HeroUI v3, Hugeicons, `@ddd/api` (early-notification + cohort 도메인)

**Spec:** `docs/superpowers/specs/2026-04-26-reminders-api-migration-design.md`

## Out of Scope — CSV 다운로드 제외 사유 (상세)

본 PR 스펙(`docs/superpowers/specs/2026-04-26-reminders-api-migration-design.md` §2 결정 #8)에는 CSV 다운로드가 포함되어 있었으나, 구현 계획 작성 중 **현재 `@ddd/api` 클라이언트 레이어가 비-JSON 응답을 처리하지 못함**을 발견하여 본 PR에서 분리한다.

### 1. 기술적 블로커: `apiFetch`의 응답 처리

`packages/api/src/client.ts:53-75`:

```ts
const contentType = res.headers.get("Content-Type") || ""
const isJsonResponse = contentType.includes("application/json")

if (res.status === 204 || res.headers.get("content-length") === "0") {
  // ... null 반환
}

let body: ApiResponse<T>

if (isJsonResponse) {
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch (error) {
    throw new ApiError("UNKNOWN_ERROR", ...)
  }
} else {
  const text = await res.text().catch(() => "")
  const message = text || "Unexpected response format from the server."
  throw new ApiError("UNKNOWN_ERROR", message)   // ← CSV는 항상 여기로
}
```

CSV는 `Content-Type: text/csv`로 내려오므로 `isJsonResponse === false` 분기로 들어가 **무조건 `ApiError`를 던진다**. 즉 현재 `useAdminEarlyNotificationsCsv` 훅과 `earlyNotificationAPI.exportAdminCsv` 함수는 호출 즉시 실패한다.

추가로 `apiFetch`는 모든 응답을 `ApiResponse<T>` 래퍼(`{ code, message, data }`)로 가정하지만 CSV 바이너리는 그런 래퍼가 없다.

### 2. 회피 옵션과 트레이드오프

| 옵션 | 내용 | 평가 |
| --- | --- | --- |
| A. 페이지 단에서 `fetch()` 직접 호출 | `RemindersPage`에서 raw `fetch` + `res.blob()` | **부적절** — `@ddd/api` 우회. 인증 헤더/에러 모델 일관성 깨짐. |
| B. `apiFetch`에 `responseType` 옵션 추가 | `responseType: "json" \| "blob" \| "text"` | **권장** — 최소 변경, JSON 기본값 유지하므로 기존 호출부 영향 0. |
| C. 클라이언트 레이어 전체 리아키텍팅 | 클래스/팩토리 기반, 프로젝트별 override | 큰 변경. CSV 한 건 때문에 시작하기엔 부담. |

→ **B가 정답**이지만 packages/api는 admin/web 모두 의존하는 공용 패키지라 변경 시 cross-cutting impact 점검이 필요하다.

### 3. 분리 결정

본 PR은 **`/reminders` 페이지의 데이터 흐름 마이그레이션**에 집중한다. CSV는:

- 별도 PR로 `packages/api/src/client.ts`에 `responseType` 옵션 도입
- 도입 후 `useAdminEarlyNotificationsCsv` 훅 정상화 검증
- 그 다음에야 `RemindersToolbar`에 "CSV 다운로드" 버튼 + `<a download>` 기반 트리거 추가

분리 효과:
- 본 PR 리뷰 단순화 (페이지 단 변경에만 집중)
- `client.ts` 수정이 다른 도메인(blog/project/auth 등)에 끼치는 영향 검증을 별도 단계로 격리
- 롤백 단위가 명확해짐

### 4. 후속 PR 체크리스트 (참고)

- [ ] `packages/api/src/client.ts`: `apiFetch`에 `responseType` 옵션 추가 (`"json"` 기본, `"blob"` / `"text"` 지원)
- [ ] `apiFetch`의 `ApiResponse<T>` 래핑 우회 케이스 — blob/text는 `data` 추출 없이 raw 반환
- [ ] 기존 호출부(blog/project/auth 등) 회귀 확인
- [ ] `useAdminEarlyNotificationsCsv` 호출 → `Blob` 정상 수신 검증
- [ ] `RemindersToolbar`에 CSV 버튼 추가, 다운로드 트리거 연결
- [ ] 토스트 (`"CSV 다운로드에 실패했습니다"`) 에러 처리

---

## 작업 순서 개요

| Task | 내용                                                           | 수정/생성/삭제                  |
| ---- | -------------------------------------------------------------- | ------------------------------- |
| 1    | MSW 핸들러 등록 해제 + `mockApi.ts` 삭제                       | mocks/handlers.ts (mod), 1 del  |
| 2    | `constants.ts` 정리 (status 단순화, role/cohort 제거)          | 1 mod                           |
| 3    | `types.d.ts` 삭제                                              | 1 del                           |
| 4    | `lib/buildEmailTemplate.ts` 신규                               | 1 create                        |
| 5    | `Sections.tsx` 리팩터 (CardSection 3개 + props)                | 1 mod                           |
| 6    | `RemindersToolbar.tsx` 신규                                    | 1 create                        |
| 7    | `RemindersTable.tsx` 신규                                      | 1 create                        |
| 8    | `RemindersBulkSendDrawer.tsx` 신규                             | 1 create                        |
| 9    | `RemindersPage.tsx` 리팩터 (조립 + 상태 + cohort 선택)         | 1 mod                           |
| 10   | 타입 체크 + 린트 + 수동 검증                                   | -                               |

각 Task는 독립 커밋. Task 9까지 완료하면 페이지가 동작 가능.

---

## Task 1: MSW 핸들러 등록 해제 + mockApi 삭제

**Files:**
- Modify: `apps/admin/src/mocks/handlers.ts`
- Delete: `apps/admin/src/pages/reminders/mockApi.ts`

- [ ] **Step 1: `mocks/handlers.ts`에서 `reminderHandlers` import와 spread 제거**

`apps/admin/src/mocks/handlers.ts`를 다음과 같이 수정:

```ts
import type { RequestHandler } from "msw"

import { semesterHandlers } from "@/pages/semesters/mockApi"
import { applicationHandlers } from "@/pages/applications/mockApi"

/**
 * MSW 핸들러 목록
 *
 * 새 핸들러를 추가할 때:
 *   1. {도메인}.handlers.ts 에 핸들러 배열 작성
 *   2. 아래 handlers 배열에 ...{도메인}Handlers 추가
 */
export const handlers: RequestHandler[] = [
  ...semesterHandlers,
  ...applicationHandlers,
]
```

- [ ] **Step 2: `pages/reminders/mockApi.ts` 삭제**

```bash
git rm apps/admin/src/pages/reminders/mockApi.ts
```

- [ ] **Step 3: 타입 체크로 dangling import 없는지 확인**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: PASS (현재 `mockApi.ts`를 import하는 곳은 `handlers.ts`뿐이라 위 수정으로 해소됨)

- [ ] **Step 4: 커밋**

```bash
git add apps/admin/src/mocks/handlers.ts apps/admin/src/pages/reminders/mockApi.ts
git commit -m "chore(admin): reminders mock 핸들러 제거"
```

---

## Task 2: `constants.ts` 정리

**Files:**
- Modify: `apps/admin/src/pages/reminders/constants.ts`

상태/직군/기수 라벨이 `EarlyNotificationDto`에 맞춰 단순화된다. `notifiedAt` 유무 기반 derive에 쓸 헬퍼 라벨만 남긴다.

- [ ] **Step 1: `constants.ts` 전체 교체**

`apps/admin/src/pages/reminders/constants.ts` 내용을 다음으로 교체:

```ts
/** 사전 알림 상태 라벨 — `notifiedAt` 유무로 derive */
export const STATUS_LABEL = {
  pending: "대기",
  notified: "발송 완료",
} as const

export type ReminderStatusKey = keyof typeof STATUS_LABEL

/** 상태 필터 — Select 옵션 */
export const STATUS_FILTER_OPTIONS = ["전체", "대기", "발송 완료"] as const
export type StatusFilterOption = (typeof STATUS_FILTER_OPTIONS)[number]

/** 필터값을 `notifiedAt` 기준 술어로 매핑 */
export const STATUS_FILTER_PREDICATE: Record<
  StatusFilterOption,
  ((notifiedAt?: string) => boolean) | null
> = {
  전체: null,
  대기: (notifiedAt) => !notifiedAt,
  "발송 완료": (notifiedAt) => !!notifiedAt,
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: 현재 `RemindersPage.tsx`가 아직 옛 import를 쓰고 있으니 에러가 있을 수 있음. 후속 Task 9에서 정리되므로 OK. **단, Task 9 전까지는 RemindersPage가 깨진 상태일 수 있음** — 본 Task 단독 커밋은 컴파일 깨짐을 동반하므로 Task 3·9와 묶어 Task 9 끝에 한 번에 커밋한다.

> **주의:** Task 2~9는 컴파일이 일시적으로 깨질 수 있어, **Task 2/3은 별도 커밋하지 않고 Task 9 커밋에 포함**한다. (각 Task의 step 4 "커밋"은 Task 9에서 일괄 수행)

- [ ] **Step 3: 다음 Task 진행**

(이 Task는 커밋 없이 다음으로 진행)

---

## Task 3: `types.d.ts` 삭제

**Files:**
- Delete: `apps/admin/src/pages/reminders/types.d.ts`

- [ ] **Step 1: 파일 삭제**

```bash
git rm apps/admin/src/pages/reminders/types.d.ts
```

- [ ] **Step 2: 다음 Task 진행** (Task 9에서 일괄 커밋)

---

## Task 4: `lib/buildEmailTemplate.ts` 신규

**Files:**
- Create: `apps/admin/src/pages/reminders/lib/buildEmailTemplate.ts`

코드에 박힌 HTML 셸에 4슬롯(message/ctaLabel/ctaUrl)을 채워 `{ html, text }`를 반환. XSS 방지를 위한 escape 포함.

- [ ] **Step 1: `lib/` 디렉터리 + 파일 생성**

`apps/admin/src/pages/reminders/lib/buildEmailTemplate.ts`:

```ts
type TemplateInput = {
  message: string
  ctaLabel: string
  ctaUrl: string
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

const escapeHtml = (input: string): string =>
  input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch)

/**
 * 사전 알림 메일 4슬롯 → { html, text }
 *
 * - HTML 셸은 본 함수 내부에 고정.
 * - 운영진은 message / ctaLabel / ctaUrl 만 입력.
 * - text는 HTML을 못 보는 클라이언트용 plain text 대체본.
 */
export const buildEmailTemplate = ({
  message,
  ctaLabel,
  ctaUrl,
}: TemplateInput): { html: string; text: string } => {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")
  const safeUrl = encodeURI(ctaUrl)
  const safeLabel = escapeHtml(ctaLabel)

  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
  <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${safeMessage}</p>
  <a href="${safeUrl}"
     style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
    ${safeLabel}
  </a>
</div>`.trim()

  const text = `${message}\n\n${ctaLabel}: ${ctaUrl}`

  return { html, text }
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: 새 파일 자체는 self-contained라 통과. 다른 깨짐(Task 2/3 영향)은 무시.

- [ ] **Step 3: 다음 Task 진행** (Task 9에서 일괄 커밋)

---

## Task 5: `Sections.tsx` 리팩터

**Files:**
- Modify: `apps/admin/src/pages/reminders/components/Sections.tsx`

`CardSection`을 4 → 3 카드로 줄이고 props로 실제 통계를 받음. `TitleSection`은 제목/설명만 노출 (발송 버튼은 Toolbar로 이전).

- [ ] **Step 1: `Sections.tsx` 전체 교체**

`apps/admin/src/pages/reminders/components/Sections.tsx`:

```tsx
import { Card } from "@heroui/react"
import { FlexBox } from "@/shared/ui/FlexBox"
import { GridBox } from "@/shared/ui/GridBox"
import { Title, Description } from "@/widgets/heading"

export const TitleSection = () => {
  return (
    <FlexBox className="justify-between">
      <header className="space-y-2">
        <Title title="사전 알림 신청" />
        <Description title="기수 모집 공지 신청자를 관리합니다." />
      </header>
    </FlexBox>
  )
}

type CardSectionProps = {
  total: number
  pending: number
  notified: number
}

export const CardSection = ({ total, pending, notified }: CardSectionProps) => {
  return (
    <GridBox className="grid-cols-3 gap-5">
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">전체 신청</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{total}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">누적</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">대기</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{pending}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">미발송</span>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title className="text-xs font-bold">발송 완료</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-xl font-semibold">{notified}명</p>
        </Card.Content>
        <Card.Footer>
          <span className="text-muted-foreground text-xs">완료</span>
        </Card.Footer>
      </Card>
    </GridBox>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: `Sections.tsx` 자체는 self-contained라 통과. 사용처(`RemindersPage.tsx`)는 Task 9에서 정리.

- [ ] **Step 3: 다음 Task 진행**

---

## Task 6: `RemindersToolbar.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/reminders/components/RemindersToolbar.tsx`

검색 입력 + 기수 Select + 상태 Select + "알림 발송" 버튼. CSV 버튼은 본 PR 범위 외라 제외.

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/reminders/components/RemindersToolbar.tsx`:

```tsx
import { Button, Input, ListBox, Select } from "@heroui/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { CohortDto } from "@ddd/api"

import { FlexBox } from "@/shared/ui/FlexBox"

import {
  STATUS_FILTER_OPTIONS,
  type StatusFilterOption,
} from "../constants"

type RemindersToolbarProps = {
  searchText: string
  onSearchChange: (v: string) => void
  cohorts: CohortDto[]
  cohortId: number | null
  onCohortChange: (id: number) => void
  statusFilter: StatusFilterOption
  onStatusFilterChange: (v: StatusFilterOption) => void
  onOpenBulkSend: () => void
  isBulkSendDisabled: boolean
}

export const RemindersToolbar = ({
  searchText,
  onSearchChange,
  cohorts,
  cohortId,
  onCohortChange,
  statusFilter,
  onStatusFilterChange,
  onOpenBulkSend,
  isBulkSendDisabled,
}: RemindersToolbarProps) => {
  const selectedCohort = cohorts.find((c) => c.id === cohortId)

  return (
    <FlexBox className="flex-wrap justify-between gap-3">
      <FlexBox className="gap-2">
        <Input
          variant="secondary"
          placeholder="이메일 검색..."
          className="max-w-xs"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          variant="secondary"
          className="max-w-40"
          aria-label="기수 필터"
        >
          <Select.Trigger>
            <Select.Value>
              {selectedCohort?.name ?? "기수 선택"}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {cohorts.map((cohort) => (
                <ListBox.Item
                  key={cohort.id}
                  id={String(cohort.id)}
                  textValue={cohort.name}
                  onClick={() => onCohortChange(cohort.id)}
                >
                  {cohort.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          variant="secondary"
          className="max-w-36"
          aria-label="상태 필터"
        >
          <Select.Trigger>
            <Select.Value>{statusFilter}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <ListBox.Item
                  key={option}
                  id={option}
                  textValue={option}
                  onClick={() => onStatusFilterChange(option)}
                >
                  {option}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FlexBox>
      <Button
        size="lg"
        onPress={onOpenBulkSend}
        isDisabled={isBulkSendDisabled}
      >
        <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
        알림 발송
      </Button>
    </FlexBox>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: 새 파일 self-contained 통과. 다른 깨짐 무시.

- [ ] **Step 3: 다음 Task 진행**

---

## Task 7: `RemindersTable.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/reminders/components/RemindersTable.tsx`

5개 컬럼: 이메일 / 기수 / 신청일 / 상태 / 발송 일시. 행 단위 액션 컬럼 없음.

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/reminders/components/RemindersTable.tsx`:

```tsx
import { Table } from "@heroui/react"

import type { CohortDto, EarlyNotificationDto } from "@ddd/api"

import { STATUS_LABEL } from "../constants"

type RemindersTableProps = {
  reminders: EarlyNotificationDto[]
  cohorts: CohortDto[]
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ko-KR")

const formatDateTime = (iso?: string): string =>
  iso ? new Date(iso).toLocaleString("ko-KR") : "-"

export const RemindersTable = ({ reminders, cohorts }: RemindersTableProps) => {
  const cohortNameById = new Map(cohorts.map((c) => [c.id, c.name]))

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="사전 알림 신청 목록"
          className="min-w-[720px]"
        >
          <Table.Header>
            <Table.Column isRowHeader>이메일</Table.Column>
            <Table.Column>기수</Table.Column>
            <Table.Column>신청일</Table.Column>
            <Table.Column>상태</Table.Column>
            <Table.Column>발송 일시</Table.Column>
          </Table.Header>

          <Table.Body>
            {reminders.map((reminder) => (
              <Table.Row key={reminder.id}>
                <Table.Cell>{reminder.email}</Table.Cell>
                <Table.Cell>
                  {cohortNameById.get(reminder.cohortId) ?? "-"}
                </Table.Cell>
                <Table.Cell>{formatDate(reminder.createdAt)}</Table.Cell>
                <Table.Cell>
                  {reminder.notifiedAt
                    ? STATUS_LABEL.notified
                    : STATUS_LABEL.pending}
                </Table.Cell>
                <Table.Cell>{formatDateTime(reminder.notifiedAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: 통과.

- [ ] **Step 3: 다음 Task 진행**

---

## Task 8: `RemindersBulkSendDrawer.tsx` 신규

**Files:**
- Create: `apps/admin/src/pages/reminders/components/RemindersBulkSendDrawer.tsx`

react-hook-form + zod로 4슬롯 폼. `useSendBulkEarlyNotification` mutation. `docs/admin-toast.md` 패턴 따름.

- [ ] **Step 1: 파일 생성**

`apps/admin/src/pages/reminders/components/RemindersBulkSendDrawer.tsx`:

```tsx
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Drawer, Input, TextArea, toast } from "@heroui/react"

import {
  earlyNotificationKeys,
  useSendBulkEarlyNotification,
} from "@ddd/api"

import { useIsMobile } from "@/shared/hooks/useIsMobile"

import { buildEmailTemplate } from "../lib/buildEmailTemplate"

const bulkSendSchema = z.object({
  subject: z
    .string()
    .min(1, "제목을 입력해 주세요.")
    .max(200, "200자 이하로 입력해 주세요."),
  message: z
    .string()
    .min(1, "본문을 입력해 주세요.")
    .max(5000, "5000자 이하로 입력해 주세요."),
  ctaLabel: z
    .string()
    .min(1, "버튼 라벨을 입력해 주세요.")
    .max(30, "30자 이하로 입력해 주세요."),
  ctaUrl: z.string().url("URL 형식이 아닙니다."),
})

type BulkSendFormValues = z.infer<typeof bulkSendSchema>

const DEFAULT_VALUES: BulkSendFormValues = {
  subject: "",
  message: "",
  ctaLabel: "지원하기",
  ctaUrl: "",
}

type RemindersBulkSendDrawerProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cohortId: number
  cohortName: string
}

export const RemindersBulkSendDrawer = ({
  isOpen,
  onOpenChange,
  cohortId,
  cohortName,
}: RemindersBulkSendDrawerProps) => {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useSendBulkEarlyNotification()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BulkSendFormValues>({
    resolver: zodResolver(bulkSendSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_VALUES)
    }
  }, [isOpen, reset])

  const onSubmit = handleSubmit(async (values) => {
    const { html, text } = buildEmailTemplate({
      message: values.message,
      ctaLabel: values.ctaLabel,
      ctaUrl: values.ctaUrl,
    })

    try {
      await mutateAsync({
        payload: {
          cohortId,
          subject: values.subject,
          html,
          text,
        },
      })
      queryClient.invalidateQueries({
        queryKey: earlyNotificationKeys.adminLists(),
      })
      toast.success("알림 발송이 완료되었습니다", {
        description: `${cohortName}에 등록된 신청자에게 발송했습니다.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error("발송에 실패했습니다", {
        description: (error as Error).message,
      })
    }
  })

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement={isMobile ? "bottom" : "right"}
      size={isMobile ? "full" : "md"}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>사전 알림 발송</Drawer.Title>
          <Drawer.Description>
            {cohortName}에 등록된 모든 신청자에게 일괄 발송됩니다.
          </Drawer.Description>
        </Drawer.Header>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <Drawer.Body className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">제목</label>
              <Input
                {...register("subject")}
                placeholder="예: 14기 모집이 시작되었습니다"
                isInvalid={!!errors.subject}
              />
              {errors.subject && (
                <p className="text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">본문</label>
              <TextArea
                {...register("message")}
                rows={8}
                placeholder="신청자에게 안내할 내용을 입력하세요. 줄바꿈은 그대로 적용됩니다."
                isInvalid={!!errors.message}
              />
              {errors.message && (
                <p className="text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">버튼 라벨</label>
              <Input
                {...register("ctaLabel")}
                placeholder="지원하기"
                isInvalid={!!errors.ctaLabel}
              />
              {errors.ctaLabel && (
                <p className="text-xs text-red-500">
                  {errors.ctaLabel.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">버튼 링크 (URL)</label>
              <Input
                {...register("ctaUrl")}
                placeholder="https://dddstudy.com/recruit"
                isInvalid={!!errors.ctaUrl}
              />
              {errors.ctaUrl && (
                <p className="text-xs text-red-500">{errors.ctaUrl.message}</p>
              )}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="ghost"
              onPress={() => onOpenChange(false)}
              isDisabled={isSubmitting || isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              isDisabled={isSubmitting || isPending}
              isLoading={isSubmitting || isPending}
            >
              발송
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: 새 파일 self-contained 통과. (아직 어디서도 import하지 않으므로)

- [ ] **Step 3: 다음 Task 진행**

---

## Task 9: `RemindersPage.tsx` 리팩터 + 일괄 커밋

**Files:**
- Modify: `apps/admin/src/pages/reminders/RemindersPage.tsx`

페이지를 조립 컴포넌트로 슬림화. 상태(검색/기수/상태필터/Drawer 오픈), `useCohorts`+`useAdminEarlyNotifications` 호출, 통계 derive, 활성 기수 자동 선택.

- [ ] **Step 1: `pickActiveCohortId` 헬퍼 결정 — 어디 둘지**

페이지 내부 함수로 둠 (1회용, 외부 재사용 없음). `RemindersPage.tsx` 상단에 정의.

- [ ] **Step 2: `RemindersPage.tsx` 전체 교체**

`apps/admin/src/pages/reminders/RemindersPage.tsx`:

```tsx
import { useMemo, useState } from "react"

import {
  useAdminEarlyNotifications,
  useCohorts,
  type CohortDto,
} from "@ddd/api"

import { CardSection, TitleSection } from "./components/Sections"
import { RemindersBulkSendDrawer } from "./components/RemindersBulkSendDrawer"
import { RemindersTable } from "./components/RemindersTable"
import { RemindersToolbar } from "./components/RemindersToolbar"
import {
  STATUS_FILTER_PREDICATE,
  type StatusFilterOption,
} from "./constants"

const pickActiveCohortId = (cohorts: CohortDto[] | undefined): number | null => {
  if (!cohorts || cohorts.length === 0) return null
  const open = cohorts.find((c) => c.status === "OPEN")
  if (open) return open.id
  const sorted = [...cohorts].sort(
    (a, b) =>
      new Date(b.recruitStartAt).getTime() -
      new Date(a.recruitStartAt).getTime(),
  )
  return sorted[0]?.id ?? null
}

export default function RemindersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")
  const [overrideCohortId, setOverrideCohortId] = useState<number | null>(null)
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false)

  const { data: cohorts } = useCohorts()
  const cohortList = cohorts ?? []
  const defaultCohortId = useMemo(
    () => pickActiveCohortId(cohortList),
    [cohortList],
  )
  const effectiveCohortId = overrideCohortId ?? defaultCohortId

  const { data: reminders } = useAdminEarlyNotifications({
    params: {
      cohortId: effectiveCohortId ?? 0,
    },
  })

  const remindersList = useMemo(() => reminders ?? [], [reminders])

  const filteredReminders = useMemo(() => {
    const statusPredicate = STATUS_FILTER_PREDICATE[statusFilter]
    return remindersList
      .filter((item) =>
        searchText.trim() === ""
          ? true
          : item.email
              .toLowerCase()
              .includes(searchText.trim().toLowerCase()),
      )
      .filter((item) =>
        statusPredicate === null ? true : statusPredicate(item.notifiedAt),
      )
  }, [remindersList, searchText, statusFilter])

  const stats = useMemo(() => {
    const total = remindersList.length
    const notified = remindersList.filter((r) => !!r.notifiedAt).length
    return { total, notified, pending: total - notified }
  }, [remindersList])

  const selectedCohort = cohortList.find((c) => c.id === effectiveCohortId)

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <CardSection
        total={stats.total}
        pending={stats.pending}
        notified={stats.notified}
      />

      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        {effectiveCohortId === null ? (
          <p className="py-12 text-center text-sm text-gray-500">
            등록된 기수가 없습니다.
          </p>
        ) : (
          <>
            <RemindersToolbar
              searchText={searchText}
              onSearchChange={setSearchText}
              cohorts={cohortList}
              cohortId={effectiveCohortId}
              onCohortChange={setOverrideCohortId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onOpenBulkSend={() => setIsBulkSendOpen(true)}
              isBulkSendDisabled={remindersList.length === 0}
            />
            <RemindersTable
              reminders={filteredReminders}
              cohorts={cohortList}
            />
          </>
        )}
      </div>

      {effectiveCohortId !== null && selectedCohort && (
        <RemindersBulkSendDrawer
          isOpen={isBulkSendOpen}
          onOpenChange={setIsBulkSendOpen}
          cohortId={effectiveCohortId}
          cohortName={selectedCohort.name}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
pnpm --filter @ddd/admin tsc --noEmit
```

Expected: PASS (전체 마이그레이션이 완료되어 모든 import가 정합)

만약 `cohort.status === "OPEN"` 비교에서 enum 값 불일치 에러가 나면, `packages/api/src/cohort/types.ts`의 `CohortStatus` enum 값을 확인해서 그에 맞는 문자열로 교체. (예: `"RECRUITING"`, `"open"` 등)

- [ ] **Step 4: 린트**

```bash
pnpm lint
```

Expected: PASS. 경고만 있고 에러 없으면 OK.

- [ ] **Step 5: 일괄 커밋 (Task 1~9 묶음)**

이미 Task 1만 별도 커밋된 경우:

```bash
git add apps/admin/src/pages/reminders apps/admin/src/mocks/handlers.ts
git commit -m "feat(admin): reminders 페이지 early-notification API 연동

- 페이지 로컬 ReminderInfo/mockApi 제거, EarlyNotificationDto 직접 사용
- useCohorts + useAdminEarlyNotifications 도입, 활성 기수 자동 선택
- 컬럼 축소: 이메일/기수/신청일/상태/발송 일시 (이름·직군·액션 제거)
- 통계 카드 4 → 3 (전체/대기/발송 완료, 'notifiedAt' derive)
- RemindersBulkSendDrawer + 4슬롯 HTML 템플릿(buildEmailTemplate)
- useSendBulkEarlyNotification 연동 + admin-toast 패턴

CSV 다운로드는 packages/api/client.ts의 Blob 응답 처리 부재로 후속 PR로 분리"
```

---

## Task 10: 수동 검증

**Files:** -

자동화 테스트 인프라가 admin 앱에 없으므로 브라우저 수동 검증으로 마무리한다.

- [ ] **Step 1: 개발 서버 기동 (실 백엔드 또는 mock 환경)**

```bash
pnpm dev:admin
```

`.env.local`의 `VITE_API_URL`이 실제 백엔드 또는 mock으로 설정되어 있어야 한다. `VITE_MSW_ENABLED=false`(또는 미설정)인지 확인 — true이면 핸들러가 없는 reminder 요청은 통과되긴 하지만 cohort/early-notification 둘 다 실 API여야 의미 있음.

- [ ] **Step 2: `/reminders` 진입 → 활성 기수 자동 선택 + 목록 로드 확인**

확인 항목:
- 페이지 로드 시 toolbar의 기수 Select가 `OPEN` 또는 최신 기수로 채워졌는가?
- 목록이 해당 기수의 사전 알림으로 채워지는가?
- 통계 카드가 `total / pending / notified` 합으로 표시되는가?

- [ ] **Step 3: 검색 동작 확인**

이메일 일부 입력 → 케이스 무관 부분 일치로 필터되는지.

- [ ] **Step 4: 상태 필터 동작 확인**

"전체"/"대기"/"발송 완료" 전환 시 행이 알맞게 줄어드는지.

- [ ] **Step 5: 기수 Select 변경 → 다른 기수 데이터 로드 확인**

다른 기수 선택 → 목록·통계 업데이트.

- [ ] **Step 6: "알림 발송" Drawer 폼 검증**

확인 항목:
- 빈 값 제출 → 각 필드 에러 표시
- 제목 200자 초과 / 본문 5000자 초과 → 에러
- ctaUrl이 URL 형식 아님 → 에러
- 모두 유효한 값 입력 → 발송 → 성공 토스트(`"알림 발송이 완료되었습니다"`) → Drawer 닫힘 → 목록의 해당 행 `notifiedAt`이 채워지고 상태 → "발송 완료"
- 실패 케이스(예: 백엔드 에러 강제) → 에러 토스트 + Drawer 유지 + 입력값 보존

- [ ] **Step 7: 기수 0개 케이스 (확인 가능하다면)**

전체 기수가 없을 때 "등록된 기수가 없습니다" 노출되는지.

- [ ] **Step 8: 결과 요약**

검증 결과(통과/이슈)를 PR description에 작성. 이슈 발견 시 디버깅 후 추가 커밋.

---

## 자체 리뷰 (Self-Review)

### 1. 스펙 커버리지

| 스펙 결정                                            | 구현 위치                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| #1 DTO 정합화                                        | Task 7 (RemindersTable 컬럼)                               |
| #2 상태 derive (`notifiedAt` 유무)                   | Task 7, Task 9 (통계)                                      |
| #3 "전체 기수" 제거 + 활성 기수 자동 선택            | Task 9 (`pickActiveCohortId`)                              |
| #4 일괄 발송 Drawer + 4슬롯 폼                       | Task 8                                                     |
| #5 코드 고정 HTML 셸 + 슬롯 4개                      | Task 4 (`buildEmailTemplate`)                              |
| #6 행 단위 액션 컬럼 제거                            | Task 7 (Table 컬럼 정의)                                   |
| #7 통계 카드 3개                                     | Task 5 (`CardSection`)                                     |
| #8 CSV                                               | **Out of scope** (선두에 명시 + Task 9 커밋 메시지에 명시) |
| #9 기수 ID 매핑                                      | Task 7 (`cohortNameById`), Task 6 (Select 옵션)            |
| #10 토스트 표준 패턴                                 | Task 8 (`toast.success/error`)                             |
| #11 검색은 이메일만, 클라이언트 필터                 | Task 9 (`filteredReminders`)                               |
| Edge: 기수 0개 / 신청자 0명                          | Task 9 (빈 상태 분기), Task 6 (`isBulkSendDisabled`)       |

### 2. 플레이스홀더 스캔

- "TBD"/"TODO"/"적절히 처리" 없음 ✓
- 모든 스텝에 실제 코드/명령어 포함 ✓

### 3. 타입 정합성

- `StatusFilterOption` Task 2 정의 → Task 6/9에서 사용 ✓
- `EarlyNotificationDto`, `CohortDto` `@ddd/api` import ✓
- `buildEmailTemplate({ message, ctaLabel, ctaUrl })` 시그니처 Task 4 정의 → Task 8에서 동일 시그니처 호출 ✓
- `pickActiveCohortId` 시그니처 Task 9 내부 정의 ✓

### 4. 알려진 리스크

- `CohortDto.status` 비교 문자열(`"OPEN"`)이 실제 enum 값과 다를 수 있음 → Task 9 Step 3에서 빌드 에러 시 즉시 수정 안내.
- `isCsvPending`/CSV 관련 props는 본 PR 코드에 등장하지 않음 (Out of scope).

---

## 실행 옵션

**Plan complete and saved to `docs/superpowers/plans/2026-04-26-reminders-api-migration.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 각 Task별로 fresh subagent 디스패치, Task 간 리뷰. 빠른 반복.

**2. Inline Execution** — 본 세션에서 Task를 직접 실행, 체크포인트마다 일시정지.

**어떤 방식으로 진행할까요?**
