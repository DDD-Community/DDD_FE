# Reminders API 연동 보강 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/reminders` 어드민 페이지에 CSV 다운로드를 추가하고, 로딩/에러/빈 상태를 Suspense + ErrorBoundary 패턴으로 정식 처리하며, 통계 카드를 `StatCard`로 공통화하여 reminders/applications/semesters 3개 페이지를 일괄 마이그레이션한다.

**Architecture:** `RemindersPage`(외곽 + UI 상태) → `RemindersContent`(cohorts useSuspenseQuery) → `RemindersDataView`(reminders useSuspenseQuery) 3단 분리. 각 데이터 경계에 `ErrorBoundary` + `Suspense` 배치, `useSuspenseQuery`의 enabled 부재 함정을 트리 분리로 회피. 공용 컴포넌트(`EmptyState`, `StatCard`, `ErrorFallback`)는 `shared/ui/`에 둔다.

**Tech Stack:** React 19, Vite, TanStack Query (`useSuspenseQuery`), `react-error-boundary` (신규), HeroUI v3 (`Skeleton`/`Card`), Hugeicons, `@ddd/api` (`early-notification` + `cohort` 도메인)

**Spec:** `docs/superpowers/specs/2026-05-04-reminders-api-integration-design.md`

---

## Spec과 정정 사항

스펙 §3.3 "변경 없음"에 `packages/api/src/early-notification/**` 가 포함되어 있으나, 본 plan 작성 중 발견:

- `earlyNotificationExportAdminCsv` (orval generated)는 `responseType` 없이 호출되어 client.ts의 JSON 파서를 거친다.
- CSV 응답은 `Content-Type: text/csv` → JSON 파서가 `ApiError("UNKNOWN_ERROR")`를 던진다.
- 따라서 현 상태에서 CSV 호출은 **항상 실패**한다.

**정정**: `packages/api/src/early-notification/api.ts`의 `exportAdminCsv` 한 함수만 수정한다 (Task 5). generated 코드/타입/queries/queryKeys/hooks는 그대로 유지하므로 다른 도메인 영향 0.

---

## File Structure

### 신규 (apps/admin)

| 경로 | 책임 |
| --- | --- |
| `src/shared/ui/EmptyState.tsx` | tone 가능한 empty/error 표시 박스 |
| `src/shared/ui/StatCard.tsx` | 통계 카드 + `StatCard.Skeleton` (compound) |
| `src/shared/ui/ErrorFallback.tsx` | react-error-boundary FallbackProps 표준 fallback |
| `src/pages/reminders/lib/downloadRemindersCsv.ts` | CSV API 호출 + Blob 다운로드 트리거 |
| `src/pages/reminders/RemindersContent.tsx` | cohorts 페칭 + 트리 조립 |
| `src/pages/reminders/RemindersDataView.tsx` | reminders 페칭 + 필터링 + 통계/테이블 |
| `src/pages/reminders/components/RemindersTableSkeleton.tsx` | 테이블 영역 Suspense fallback |
| `src/pages/reminders/components/RemindersStatsSection.tsx` | StatCard 3개 (전체/대기/완료) |
| `src/pages/reminders/components/RemindersStatsSkeleton.tsx` | StatCard.Skeleton 3개 묶음 |
| `src/pages/reminders/components/CohortsAreaSkeleton.tsx` | Stats + Table skeleton 외곽 묶음 |

### 수정

| 경로 | 변경 |
| --- | --- |
| `apps/admin/package.json` | `react-error-boundary` 의존성 추가 |
| `packages/api/src/early-notification/api.ts` | `exportAdminCsv`를 apiFetch 직접 호출 + `responseType: "text"` |
| `apps/admin/src/pages/reminders/RemindersPage.tsx` | 외곽(헤딩 + ErrorBoundary + Suspense) + UI 상태만 보유. 페칭 위임 |
| `apps/admin/src/pages/reminders/components/RemindersToolbar.tsx` | CSV 버튼 + props 3개 추가 |
| `apps/admin/src/pages/reminders/components/Sections.tsx` | `CardSection` 제거 (`RemindersStatsSection`으로 대체). `TitleSection`만 잔존 |
| `apps/admin/src/pages/applications/components/Sections.tsx` | `StatCard` 치환 |
| `apps/admin/src/pages/semesters/SemestersPage.tsx` | 로컬 `StatCard` 제거, 공용 `StatCard` 사용 |

---

## 작업 순서 개요

| Task | 내용 | 결과물 |
| --- | --- | --- |
| 1 | `react-error-boundary` 설치 | package.json 갱신 |
| 2 | `shared/ui/EmptyState.tsx` 생성 | 1 file |
| 3 | `shared/ui/StatCard.tsx` 생성 (+ Skeleton) | 1 file |
| 4 | `shared/ui/ErrorFallback.tsx` 생성 | 1 file |
| 5 | `packages/api` CSV `responseType` 정합화 | 1 file mod |
| 6 | `lib/downloadRemindersCsv.ts` 생성 | 1 file |
| 7 | reminders Skeleton 3종 (Table / Stats / CohortsArea) | 3 files |
| 8 | `RemindersStatsSection.tsx` 생성 | 1 file |
| 9 | `RemindersDataView.tsx` 생성 | 1 file |
| 10 | `RemindersToolbar.tsx` 확장 (CSV 버튼) | 1 file mod |
| 11 | `RemindersContent.tsx` 생성 | 1 file |
| 12 | `RemindersPage.tsx` 슬림화 + `Sections.tsx` `CardSection` 제거 | 2 files mod |
| 13 | applications `Sections.tsx` StatCard 치환 | 1 file mod |
| 14 | semesters `SemestersPage.tsx` 로컬 StatCard 제거 + 공용 사용 | 1 file mod |
| 15 | 최종 검증 (typecheck + lint + 브라우저 수동) | 검증 |

각 Task는 독립 commit. 검증 명령은 모든 task 끝에서 `pnpm --filter @ddd/admin typecheck` 통과 필수.

---

## Task 1: `react-error-boundary` 설치

**Files:**
- Modify: `apps/admin/package.json`

- [ ] **Step 1: 설치**

```bash
pnpm --filter @ddd/admin add react-error-boundary
```

Expected: `apps/admin/package.json`에 `"react-error-boundary": "^4.x.x"` 라인 추가, `pnpm-lock.yaml` 갱신.

- [ ] **Step 2: 임포트 검증**

```bash
node -e "console.log(require.resolve('react-error-boundary', { paths: ['apps/admin/node_modules'] }))"
```

또는 간단히 다음 임시 파일로 확인 (지우진 말고 다음 task에서 사용):

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: 타입 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore(admin): react-error-boundary 의존성 추가

reminders 페이지 Suspense + ErrorBoundary 패턴 도입을 위한 첫 도입.
~3KB, FallbackProps 시그니처 표준.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `shared/ui/EmptyState.tsx` 생성

**Files:**
- Create: `apps/admin/src/shared/ui/EmptyState.tsx`

참고: BlogPostsPage의 로컬 EmptyState와 동일 시각 사양 (`tone="default" | "danger"`).

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/shared/ui/EmptyState.tsx
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

type EmptyStateProps = {
  children: ReactNode
  tone?: "default" | "danger"
}

export const EmptyState = ({
  children,
  tone = "default",
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[160px] flex-col items-center justify-center gap-1 rounded-md bg-gray-50 px-4 py-10 text-center text-sm",
        tone === "danger" ? "text-red-600" : "text-gray-500",
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/shared/ui/EmptyState.tsx
git commit -m "$(cat <<'EOF'
feat(admin/shared): EmptyState 컴포넌트 추가

tone(default | danger) 지원. blog-posts/projects 의 로컬 EmptyState 패턴을
공용화. 본 PR에서는 reminders 만 사용. 추후 점진 마이그레이션.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `shared/ui/StatCard.tsx` 생성 (compound + Skeleton)

**Files:**
- Create: `apps/admin/src/shared/ui/StatCard.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/shared/ui/StatCard.tsx
import type { ReactNode } from "react"

import { Card, Skeleton } from "@heroui/react"

type StatCardProps = {
  title: string
  value: ReactNode
  footer?: ReactNode
}

const StatCardRoot = ({ title, value, footer }: StatCardProps) => (
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

const StatCardSkeleton = () => (
  <Card>
    <Card.Header>
      <Skeleton className="h-3 w-16 rounded" />
    </Card.Header>
    <Card.Content>
      <Skeleton className="h-6 w-12 rounded" />
    </Card.Content>
    <Card.Footer>
      <Skeleton className="h-3 w-10 rounded" />
    </Card.Footer>
  </Card>
)

export const StatCard = Object.assign(StatCardRoot, {
  Skeleton: StatCardSkeleton,
})
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/shared/ui/StatCard.tsx
git commit -m "$(cat <<'EOF'
feat(admin/shared): StatCard + StatCard.Skeleton 추가

reminders/applications/semesters 의 통계 카드를 공통화하기 위한 베이스.
compound 패턴(Object.assign)으로 Skeleton 동봉. HeroUI v3 Card + Skeleton 사용.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `shared/ui/ErrorFallback.tsx` 생성

**Files:**
- Create: `apps/admin/src/shared/ui/ErrorFallback.tsx`

전제: Task 1(react-error-boundary), Task 2(EmptyState) 완료.

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/shared/ui/ErrorFallback.tsx
import { Button } from "@heroui/react"
import type { FallbackProps } from "react-error-boundary"

import { EmptyState } from "./EmptyState"

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const message =
    error instanceof Error
      ? error.message
      : "잠시 후 다시 시도해 주세요."

  return (
    <EmptyState tone="danger">
      <p className="font-medium">데이터를 불러오지 못했습니다.</p>
      <p className="mt-1 text-xs text-gray-500">{message}</p>
      <Button
        size="sm"
        variant="secondary"
        onPress={resetErrorBoundary}
        className="mt-3"
      >
        다시 시도
      </Button>
    </EmptyState>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/shared/ui/ErrorFallback.tsx
git commit -m "$(cat <<'EOF'
feat(admin/shared): ErrorFallback (react-error-boundary용) 추가

EmptyState tone='danger' + 다시 시도 버튼. ErrorBoundary 의 FallbackComponent
또는 fallbackRender 모두 지원하는 표준 fallback.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `packages/api` CSV `responseType` 정합화

**Files:**
- Modify: `packages/api/src/early-notification/api.ts`

이유: orval generated `earlyNotificationExportAdminCsv`가 `responseType` 없이 호출 → JSON 파서가 throw. 도메인 wrapper에서 apiFetch를 직접 호출하면서 `responseType: "text"` 명시.

- [ ] **Step 1: api.ts 수정**

기존:
```ts
import {
  earlyNotificationGetAdminList,
  earlyNotificationExportAdminCsv,
  earlyNotificationSendBulk,
} from "../generated/admin-early-notification/admin-early-notification";
```

수정 후 전체 파일:

```ts
// packages/api/src/early-notification/api.ts
import {
  earlyNotificationGetAdminList,
  earlyNotificationSendBulk,
} from "../generated/admin-early-notification/admin-early-notification";
import { earlyNotificationSubscribe } from "../generated/early-notification/early-notification";
import { apiFetch } from "../mutator";
import type {
  GetAdminEarlyNotificationsParams,
  GetAdminEarlyNotificationsResponse,
  GetAdminEarlyNotificationsCsvParams,
  GetAdminEarlyNotificationsCsvResponse,
  PostSendBulkEarlyNotificationRequest,
  PostSubscribeEarlyNotificationRequest,
  PostSubscribeEarlyNotificationResponse,
} from "./types";

export const earlyNotificationAPI = {
  /** 기수별 사전 알림 신청 목록을 조회합니다. */
  getAdminEarlyNotifications: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsParams;
  }) =>
    earlyNotificationGetAdminList(params) as unknown as Promise<GetAdminEarlyNotificationsResponse>,

  /**
   * 기수별 사전 알림 신청 목록을 CSV 텍스트로 내보냅니다.
   *
   * NOTE: orval generated 함수는 responseType 을 전달하지 않아 JSON 파서를 거치므로
   * 여기서는 apiFetch 를 직접 호출하면서 responseType: "text" 를 명시한다.
   */
  exportAdminCsv: ({
    params,
  }: {
    params: GetAdminEarlyNotificationsCsvParams;
  }): Promise<GetAdminEarlyNotificationsCsvResponse> =>
    apiFetch<string>({
      url: "/api/v1/admin/early-notifications/export",
      method: "GET",
      params: params as unknown as Record<string, unknown>,
      responseType: "text",
    }),

  /** 기수별 미발송 대상에게 사전 알림 이메일을 일괄 발송합니다. */
  sendBulkEarlyNotification: ({
    payload,
  }: {
    payload: PostSendBulkEarlyNotificationRequest;
  }) => earlyNotificationSendBulk(payload),

  /** 기수별 사전 알림 이메일을 등록합니다. */
  subscribeEarlyNotification: ({
    payload,
  }: {
    payload: PostSubscribeEarlyNotificationRequest;
  }) =>
    earlyNotificationSubscribe(payload) as Promise<PostSubscribeEarlyNotificationResponse>,
};
```

- [ ] **Step 2: typecheck (api 패키지 + admin)**

```bash
pnpm --filter @ddd/api typecheck 2>/dev/null || pnpm --filter @ddd/admin typecheck
```

Expected: PASS. (api 패키지에 typecheck 스크립트 없으면 admin 쪽 typecheck로 갈음 — admin이 @ddd/api 워크스페이스 의존이므로 충분.)

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/early-notification/api.ts
git commit -m "$(cat <<'EOF'
fix(api/early-notification): exportAdminCsv 가 text responseType 으로 호출되도록 수정

orval generated 함수는 apiFetch 에 responseType 을 전달하지 않아 JSON 파서를
거쳐 text/csv 응답에 대해 ApiError 를 throw 하던 문제. 도메인 wrapper 에서
apiFetch 를 직접 호출하면서 responseType: 'text' 를 명시한다.

generated 코드와 다른 도메인은 영향 없음.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `lib/downloadRemindersCsv.ts` 생성

**Files:**
- Create: `apps/admin/src/pages/reminders/lib/downloadRemindersCsv.ts`

전제: Task 5 완료 (`exportAdminCsv`가 text로 정상 응답).

- [ ] **Step 1: 파일 생성**

```ts
// apps/admin/src/pages/reminders/lib/downloadRemindersCsv.ts
import { earlyNotificationAPI } from "@ddd/api"

const BOM = "﻿"

const formatYyyyMmDd = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}${m}${day}`
}

export async function downloadRemindersCsv({
  cohortId,
  cohortName,
}: {
  cohortId: number
  cohortName: string
}): Promise<void> {
  const csv = await earlyNotificationAPI.exportAdminCsv({
    params: { cohortId },
  })

  const blob = new Blob([BOM + csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `사전알림_${cohortName}_${formatYyyyMmDd(new Date())}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/reminders/lib/downloadRemindersCsv.ts
git commit -m "$(cat <<'EOF'
feat(admin/reminders): downloadRemindersCsv 유틸 추가

UTF-8 BOM(엑셀 한글 호환) prepend + Blob/<a download> 트리거.
파일명: 사전알림_{cohortName}_{YYYYMMDD}.csv

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: reminders Skeleton 3종 생성

**Files:**
- Create: `apps/admin/src/pages/reminders/components/RemindersTableSkeleton.tsx`
- Create: `apps/admin/src/pages/reminders/components/RemindersStatsSkeleton.tsx`
- Create: `apps/admin/src/pages/reminders/components/CohortsAreaSkeleton.tsx`

전제: Task 3 (StatCard.Skeleton).

- [ ] **Step 1: RemindersTableSkeleton.tsx 생성**

```tsx
// apps/admin/src/pages/reminders/components/RemindersTableSkeleton.tsx
import { Skeleton, Table } from "@heroui/react"

const SKELETON_ROW_COUNT = 6

export const RemindersTableSkeleton = () => {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="사전 알림 목록 로딩 중"
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
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Skeleton className="h-4 w-44 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-24 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-16 rounded" />
                </Table.Cell>
                <Table.Cell>
                  <Skeleton className="h-4 w-32 rounded" />
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

- [ ] **Step 2: RemindersStatsSkeleton.tsx 생성**

```tsx
// apps/admin/src/pages/reminders/components/RemindersStatsSkeleton.tsx
import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"

export const RemindersStatsSkeleton = () => {
  return (
    <GridBox className="grid-cols-3 gap-5">
      <StatCard.Skeleton />
      <StatCard.Skeleton />
      <StatCard.Skeleton />
    </GridBox>
  )
}
```

- [ ] **Step 3: CohortsAreaSkeleton.tsx 생성**

```tsx
// apps/admin/src/pages/reminders/components/CohortsAreaSkeleton.tsx
import { RemindersStatsSkeleton } from "./RemindersStatsSkeleton"
import { RemindersTableSkeleton } from "./RemindersTableSkeleton"

export const CohortsAreaSkeleton = () => {
  return (
    <div className="space-y-5">
      <RemindersStatsSkeleton />
      <div className="rounded-lg bg-white p-5 shadow">
        <RemindersTableSkeleton />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/reminders/components/RemindersTableSkeleton.tsx \
        apps/admin/src/pages/reminders/components/RemindersStatsSkeleton.tsx \
        apps/admin/src/pages/reminders/components/CohortsAreaSkeleton.tsx
git commit -m "$(cat <<'EOF'
feat(admin/reminders): Skeleton 3종 (Table / Stats / CohortsArea) 추가

Suspense fallback 으로 사용. CohortsAreaSkeleton 은 외곽 Suspense (cohorts
페칭 중) 와 내부 Suspense (reminders 페칭 중) 양쪽에서 재사용.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `RemindersStatsSection.tsx` 생성

**Files:**
- Create: `apps/admin/src/pages/reminders/components/RemindersStatsSection.tsx`

전제: Task 3 (StatCard).

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/pages/reminders/components/RemindersStatsSection.tsx
import { useMemo } from "react"

import type { EarlyNotificationDto } from "@ddd/api"

import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"

type RemindersStatsSectionProps = {
  reminders: EarlyNotificationDto[]
}

export const RemindersStatsSection = ({
  reminders,
}: RemindersStatsSectionProps) => {
  const stats = useMemo(() => {
    const total = reminders.length
    const notified = reminders.filter((r) => !!r.notifiedAt).length
    return { total, notified, pending: total - notified }
  }, [reminders])

  return (
    <GridBox className="grid-cols-3 gap-5">
      <StatCard title="전체 신청" value={`${stats.total}명`} footer="누적" />
      <StatCard title="대기" value={`${stats.pending}명`} footer="미발송" />
      <StatCard
        title="발송 완료"
        value={`${stats.notified}명`}
        footer="완료"
      />
    </GridBox>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/reminders/components/RemindersStatsSection.tsx
git commit -m "$(cat <<'EOF'
feat(admin/reminders): RemindersStatsSection (StatCard 3개) 추가

reminders 데이터에서 total/notified/pending 을 derive 하여 StatCard 3개로 표시.
기존 Sections.tsx CardSection 의 데이터 도출 로직과 동일.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `RemindersDataView.tsx` 생성

**Files:**
- Create: `apps/admin/src/pages/reminders/RemindersDataView.tsx`

전제: Task 2 (EmptyState), Task 8 (StatsSection).

`useSuspenseQuery` 사용. `cohortId: number` prop 보장.

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/pages/reminders/RemindersDataView.tsx
import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"

import {
  earlyNotificationQueries,
  type CohortDto,
} from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"

import { RemindersStatsSection } from "./components/RemindersStatsSection"
import { RemindersTable } from "./components/RemindersTable"
import {
  STATUS_FILTER_PREDICATE,
  type StatusFilterOption,
} from "./constants"

type RemindersDataViewProps = {
  cohortId: number
  cohorts: CohortDto[]
  searchText: string
  statusFilter: StatusFilterOption
}

export const RemindersDataView = ({
  cohortId,
  cohorts,
  searchText,
  statusFilter,
}: RemindersDataViewProps) => {
  const { data: reminders } = useSuspenseQuery(
    earlyNotificationQueries.getAdminEarlyNotifications({
      params: { cohortId },
    }),
  )

  const filteredReminders = useMemo(() => {
    const statusPredicate = STATUS_FILTER_PREDICATE[statusFilter]
    return reminders
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
  }, [reminders, searchText, statusFilter])

  if (reminders.length === 0) {
    return (
      <EmptyState>
        해당 기수에 사전 알림 신청자가 없습니다.
      </EmptyState>
    )
  }

  return (
    <>
      <RemindersStatsSection reminders={reminders} />
      <RemindersTable reminders={filteredReminders} cohorts={cohorts} />
    </>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/reminders/RemindersDataView.tsx
git commit -m "$(cat <<'EOF'
feat(admin/reminders): RemindersDataView (reminders useSuspenseQuery) 추가

cohortId: number 보장 후 reminders 페칭 + 검색/상태 필터 + 빈 상태/통계/테이블
렌더링. enabled 가드 부재 함정은 prop 보장으로 우회.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `RemindersToolbar.tsx` 확장 (CSV 버튼)

**Files:**
- Modify: `apps/admin/src/pages/reminders/components/RemindersToolbar.tsx`

기존 props에 `onExportCsv`, `isExporting`, `isExportDisabled` 추가. CSV 버튼은 발송 버튼 옆에 보조 버튼으로.

- [ ] **Step 1: 파일 전체 교체**

```tsx
// apps/admin/src/pages/reminders/components/RemindersToolbar.tsx
import { Button, Input, ListBox, Select } from "@heroui/react"
import {
  Download04Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
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
  onExportCsv: () => void
  isExporting: boolean
  isExportDisabled: boolean
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
  onExportCsv,
  isExporting,
  isExportDisabled,
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
      <FlexBox className="gap-2">
        <Button
          size="lg"
          variant="secondary"
          onPress={onExportCsv}
          isDisabled={isExportDisabled}
        >
          <HugeiconsIcon icon={Download04Icon} className="mr-2" />
          {isExporting ? "내보내는 중..." : "CSV"}
        </Button>
        <Button
          size="lg"
          onPress={onOpenBulkSend}
          isDisabled={isBulkSendDisabled}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
          알림 발송
        </Button>
      </FlexBox>
    </FlexBox>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS. (`Download04Icon` 이 hugeicons free set에 없는 경우 다음 후보 중 import 가능한 것 사용: `Download02Icon`, `Download01Icon`, `FileDownloadIcon`. 이미지 자체가 다운로드 의미만 전달하면 됨.)

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/reminders/components/RemindersToolbar.tsx
git commit -m "$(cat <<'EOF'
feat(admin/reminders/toolbar): CSV 다운로드 버튼 추가

발송 버튼 옆 보조 버튼(secondary). isExporting 시 라벨 변경, isExportDisabled
로 비활성화. props 3개(onExportCsv, isExporting, isExportDisabled) 추가.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `RemindersContent.tsx` 생성

**Files:**
- Create: `apps/admin/src/pages/reminders/RemindersContent.tsx`

전제: Task 4 (ErrorFallback), Task 6 (downloadRemindersCsv), Task 7 (CohortsAreaSkeleton), Task 9 (DataView), Task 10 (Toolbar 확장).

`cohorts` `useSuspenseQuery` + 트리 조립 + CSV/Drawer 핸들러.

- [ ] **Step 1: 파일 생성**

```tsx
// apps/admin/src/pages/reminders/RemindersContent.tsx
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "@heroui/react"

import {
  cohortQueries,
  type CohortDto,
} from "@ddd/api"

import { EmptyState } from "@/shared/ui/EmptyState"
import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { CohortsAreaSkeleton } from "./components/CohortsAreaSkeleton"
import { RemindersBulkSendDrawer } from "./components/RemindersBulkSendDrawer"
import { RemindersToolbar } from "./components/RemindersToolbar"
import { RemindersDataView } from "./RemindersDataView"
import { downloadRemindersCsv } from "./lib/downloadRemindersCsv"
import type { StatusFilterOption } from "./constants"

const pickActiveCohortId = (cohorts: CohortDto[]): number | null => {
  if (cohorts.length === 0) return null
  const open = cohorts.find((c) => c.status === "RECRUITING")
  if (open) return open.id
  const sorted = [...cohorts].sort(
    (a, b) =>
      new Date(b.recruitStartAt).getTime() -
      new Date(a.recruitStartAt).getTime(),
  )
  return sorted[0]?.id ?? null
}

type RemindersContentProps = {
  searchText: string
  statusFilter: StatusFilterOption
  overrideCohortId: number | null
  onSearchChange: (v: string) => void
  onStatusFilterChange: (v: StatusFilterOption) => void
  onCohortChange: (id: number) => void
}

export const RemindersContent = ({
  searchText,
  statusFilter,
  overrideCohortId,
  onSearchChange,
  onStatusFilterChange,
  onCohortChange,
}: RemindersContentProps) => {
  const { data: cohorts } = useSuspenseQuery(cohortQueries.getCohorts())
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  if (cohorts.length === 0) {
    return <EmptyState>등록된 기수가 없습니다.</EmptyState>
  }

  const effectiveCohortId =
    overrideCohortId ?? pickActiveCohortId(cohorts)
  // cohorts.length > 0 이므로 effectiveCohortId 는 number 보장.
  // 타입 시스템상 null 가능성을 좁히기 위한 가드.
  if (effectiveCohortId === null) {
    return <EmptyState>활성 기수를 결정할 수 없습니다.</EmptyState>
  }

  const selectedCohort = cohorts.find((c) => c.id === effectiveCohortId)
  if (!selectedCohort) {
    return <EmptyState>선택된 기수를 찾을 수 없습니다.</EmptyState>
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadRemindersCsv({
        cohortId: effectiveCohortId,
        cohortName: selectedCohort.name,
      })
    } catch (error) {
      toast.error("CSV 내보내기에 실패했습니다", {
        description:
          error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해 주세요.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5 rounded-lg bg-white p-5 shadow">
        <RemindersToolbar
          searchText={searchText}
          onSearchChange={onSearchChange}
          cohorts={cohorts}
          cohortId={effectiveCohortId}
          onCohortChange={onCohortChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onOpenBulkSend={() => setIsBulkSendOpen(true)}
          isBulkSendDisabled={false}
          onExportCsv={handleExport}
          isExporting={isExporting}
          isExportDisabled={isExporting}
        />
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CohortsAreaSkeleton />}>
            <RemindersDataView
              cohortId={effectiveCohortId}
              cohorts={cohorts}
              searchText={searchText}
              statusFilter={statusFilter}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

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

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/reminders/RemindersContent.tsx
git commit -m "$(cat <<'EOF'
feat(admin/reminders): RemindersContent (cohorts useSuspenseQuery + 조립) 추가

- cohortQueries.getCohorts() 를 useSuspenseQuery 로 호출 (enabled 제약 없음)
- effectiveCohortId 결정(override ?? pickActive) 로직 보유
- 내부 Suspense + ErrorBoundary 로 RemindersDataView 감쌈
- CSV export 핸들러(toast 에러 처리) + 발송 Drawer 트리거
- isBulkSendDisabled=false 고정 (스펙 §10 비범위 — 데이터 0건 가드는 후속)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `RemindersPage.tsx` 슬림화 + `Sections.tsx` `CardSection` 제거

**Files:**
- Modify: `apps/admin/src/pages/reminders/RemindersPage.tsx`
- Modify: `apps/admin/src/pages/reminders/components/Sections.tsx`

전제: Task 11 (RemindersContent).

`RemindersPage`는 외곽(헤딩 + ErrorBoundary + Suspense) + UI 상태(`useState`)만 보유. cohorts/reminders 페칭은 자식이 담당.

- [ ] **Step 1: components/Sections.tsx에서 CardSection 제거**

`apps/admin/src/pages/reminders/components/Sections.tsx` 전체를 다음으로 교체:

```tsx
// apps/admin/src/pages/reminders/components/Sections.tsx
import { FlexBox } from "@/shared/ui/FlexBox"
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
```

(기존 `CardSection`/`Card`/`GridBox` import 모두 제거.)

- [ ] **Step 2: RemindersPage.tsx 전체 교체**

```tsx
// apps/admin/src/pages/reminders/RemindersPage.tsx
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { ErrorFallback } from "@/shared/ui/ErrorFallback"

import { CohortsAreaSkeleton } from "./components/CohortsAreaSkeleton"
import { TitleSection } from "./components/Sections"
import { RemindersContent } from "./RemindersContent"
import type { StatusFilterOption } from "./constants"

export default function RemindersPage() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption>("전체")
  const [overrideCohortId, setOverrideCohortId] = useState<number | null>(
    null,
  )

  return (
    <div className="w-full space-y-5 p-5">
      <TitleSection />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<CohortsAreaSkeleton />}>
          <RemindersContent
            searchText={searchText}
            statusFilter={statusFilter}
            overrideCohortId={overrideCohortId}
            onSearchChange={setSearchText}
            onStatusFilterChange={setStatusFilter}
            onCohortChange={setOverrideCohortId}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

- [ ] **Step 3: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS. 만약 `Sections.tsx` 에서 export 했던 `CardSection` 을 아직 import 하는 곳이 있다면 에러 발생 → 해당 import 제거.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/pages/reminders/RemindersPage.tsx \
        apps/admin/src/pages/reminders/components/Sections.tsx
git commit -m "$(cat <<'EOF'
refactor(admin/reminders): RemindersPage 외곽만 책임, 페칭은 자식으로 위임

- RemindersPage: TitleSection + ErrorBoundary + Suspense + UI 상태(useState)만
- Sections.tsx: CardSection 제거 (RemindersStatsSection 으로 이미 대체됨).
  TitleSection 만 잔존
- cohortId: 0 폴백 제거. 트리 분리(RemindersContent → RemindersDataView)로
  cohortId 가 number 임이 prop 시점에 보장됨

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: applications `Sections.tsx` StatCard 치환

**Files:**
- Modify: `apps/admin/src/pages/applications/components/Sections.tsx`

기존 inline `Card.Header`/`Card.Title`/`Card.Content`/`Card.Footer`를 `StatCard`로 치환. cards 배열은 유지.

- [ ] **Step 1: 파일 전체 교체**

```tsx
// apps/admin/src/pages/applications/components/Sections.tsx
import { GridBox } from "@/shared/ui/GridBox"
import { StatCard } from "@/shared/ui/StatCard"

import type { ApplicationStatus } from "../constants"

type CardSectionProps = {
  total: number
  counts: Partial<Record<ApplicationStatus, number>>
  contextLabel: string
}

export const CardSection = ({
  total,
  counts,
  contextLabel,
}: CardSectionProps) => {
  const cards: { title: string; key: ApplicationStatus | "total" }[] = [
    { title: "전체 지원", key: "total" },
    { title: "서류심사대기", key: "서류심사대기" },
    { title: "서류합격", key: "서류합격" },
    { title: "최종합격", key: "최종합격" },
    { title: "활동중", key: "활동중" },
  ]

  return (
    <GridBox className="grid-cols-5 gap-5">
      {cards.map(({ title, key }) => (
        <StatCard
          key={title}
          title={title}
          value={`${
            key === "total" ? total : (counts[key as ApplicationStatus] ?? 0)
          }명`}
          footer={contextLabel}
        />
      ))}
    </GridBox>
  )
}
```

- [ ] **Step 2: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/applications/components/Sections.tsx
git commit -m "$(cat <<'EOF'
refactor(admin/applications): 통계 카드를 공용 StatCard 로 치환

inline Card.* compound 호출을 shared/ui/StatCard 로 교체. props 시그니처와
외형 동일.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: semesters `SemestersPage.tsx` 로컬 StatCard 제거 + 공용 사용

**Files:**
- Modify: `apps/admin/src/pages/semesters/SemestersPage.tsx`

현재 SemestersPage 하단에 로컬 `StatCard` (`{title, value, hint}`) 가 정의되어 있음. 공용 `StatCard` (`{title, value, footer}`) 로 치환하면서 로컬 정의 제거. `hint` → `footer` 매핑.

- [ ] **Step 1: import 라인 추가**

기존 import 영역(`SemestersPage.tsx` 상단) 의 `import { GridBox } from "@/shared/ui/GridBox"` 아래에 추가:

```tsx
import { StatCard } from "@/shared/ui/StatCard"
```

- [ ] **Step 2: CardSection 내부 StatCard 호출의 `hint` prop 을 `footer` 로 교체**

`CardSection` 함수 내부 (현재 `SemestersPage.tsx:144-167` 근방) 의 `<StatCard ... hint="..." />` 4개를 모두 `footer="..."` 로 변경:

```tsx
<StatCard title="전체 기수" value={`${cohorts.length}`} footer="등록된 모든 기수" />
<StatCard title="모집 예정" value={`${counts.UPCOMING}`} footer="UPCOMING" />
<StatCard title="모집중" value={`${counts.RECRUITING}`} footer="RECRUITING" />
<StatCard title="활동중" value={`${counts.ACTIVE}`} footer="ACTIVE" />
```

- [ ] **Step 3: 파일 하단의 로컬 `StatCard` 정의 + `StatCardProps` 타입 제거**

기존:
```tsx
type StatCardProps = { title: string; value: string; hint: string }

const StatCard = ({ title, value, hint }: StatCardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{hint}</p>
    </div>
  )
}
```

→ 통째로 삭제 (파일 끝에 닫는 `}` 위치 주의).

- [ ] **Step 4: typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/semesters/SemestersPage.tsx
git commit -m "$(cat <<'EOF'
refactor(admin/semesters): 로컬 StatCard 제거 후 공용 StatCard 채택

CardSection 4개 카드의 hint prop 을 공용 StatCard 의 footer prop 으로 매핑.
파일 하단의 로컬 StatCard / StatCardProps 정의 제거.

외형은 일부 변경됨: 공용 StatCard 는 HeroUI Card.Header/Content/Footer 를
사용하여 다른 페이지(applications/reminders) 와 시각적으로 정렬됨.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: 최종 검증 (typecheck + lint + 브라우저 수동)

**Files:** (변경 없음)

- [ ] **Step 1: 전체 typecheck**

```bash
pnpm --filter @ddd/admin typecheck
```

Expected: PASS.

- [ ] **Step 2: 전체 lint**

```bash
pnpm --filter @ddd/admin lint
```

Expected: PASS. 경고만 있으면 그대로 두되, 본 PR에서 도입된 컴포넌트 관련 에러가 있으면 수정.

- [ ] **Step 3: 빌드 검증**

```bash
pnpm --filter @ddd/admin build
```

Expected: 성공.

- [ ] **Step 4: dev 서버에서 수동 시나리오 점검**

```bash
pnpm dev:admin
```

브라우저에서 `/reminders` 진입 후 다음 시나리오를 순서대로 확인 (스펙 §9 참조):

1. **첫 진입 (cohorts 페칭 중)** — 헤더 즉시 표시, `CohortsAreaSkeleton` (Stats + Table skeleton) 표시
2. **첫 진입 (reminders 페칭 중)** — Toolbar 표시, Stats Skeleton + Table Skeleton 동시 표시
3. **기수 0개** — `EmptyState` "등록된 기수가 없습니다." 표시 (테스트 환경에서 cohorts mock 비우기 또는 신규 환경에서 확인)
4. **기수 있음 + reminders 0개** — `EmptyState` "해당 기수에 사전 알림 신청자가 없습니다." 표시 (Stats 영역은 0건 표시 또는 empty 분기 진입)
5. **기수 변경** — Toolbar/헤더는 유지되고 Stats + Table 영역만 Skeleton 전환
6. **CSV 다운로드 정상** — `사전알림_{cohort명}_YYYYMMDD.csv` 다운로드. 파일 열어서 한글 깨짐 없는지(Excel/Numbers/메모장) 확인
7. **CSV API 실패** — 네트워크 차단 또는 백엔드 다운 상태에서 버튼 클릭 → `toast.error("CSV 내보내기에 실패했습니다")` 표시. 페이지 상태는 영향 없음
8. **reminders API 실패** — 네트워크 차단 후 기수 변경 → `ErrorFallback` 표시. "다시 시도" 클릭 시 재페칭
9. **cohorts API 실패** — 새로고침 시 외곽 ErrorBoundary 가 잡아 `ErrorFallback` 표시
10. **일괄 발송 후 캐시 무효화** — 발송 버튼 → Drawer 제출 → reminders 목록 자동 갱신, `notifiedAt` 컬럼 채워짐
11. **검색/상태 필터 보존** — 검색어/상태 필터 입력 후 기수 변경 시 두 필터값이 그대로 유지
12. **applications 페이지 회귀** — `/applications` 진입 후 통계 카드 5개가 정상 렌더되는지 (외형 회귀 없음)
13. **semesters 페이지 회귀** — `/semesters` 진입 후 통계 카드 4개가 정상 렌더되는지 (외형 변경 인지: 공용 StatCard 로 통일)

각 시나리오에서 콘솔에 오류가 없는지 확인.

- [ ] **Step 5: progress.md 갱신 (선택)**

본 PR로 변경된 항목(reminders CSV ✅, suspense/error boundary 도입, StatCard 공통화) 을 `progress.md` 에 반영. 별도 커밋.

```bash
# 직접 편집 후
git add progress.md
git commit -m "$(cat <<'EOF'
docs(progress): reminders API 연동 보강 결과 반영

- 3.2 사전 알림: CSV 다운로드 ✅, 로딩/에러/빈 상태 정식 처리 ✅
- 공통 인프라: Suspense + ErrorBoundary 어드민 첫 도입(reminders 시범)
- shared/ui: EmptyState / StatCard / ErrorFallback 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review (작성 후 점검)

### Spec coverage

| 스펙 결정 # | 항목 | 구현 task |
| --- | --- | --- |
| 1 | 작업 범위 (보강) | 전 task |
| 2 | CSV 버튼 위치 (Toolbar 우측) | Task 10 |
| 3 | CSV 트리거 (직접 API 호출) | Task 6 |
| 4 | CSV 파일명 | Task 6 |
| 5 | CSV BOM | Task 6 |
| 6 | Suspense + ErrorBoundary 패턴 | Task 11, 12 |
| 7 | react-error-boundary 도입 | Task 1 |
| 8 | useSuspenseQuery 위치 (페이지에서 직접) | Task 9, 11 |
| 9 | EmptyState 추출 | Task 2 |
| 10 | StatCard 추출 + 일괄 마이그레이션 | Task 3, 13, 14 |
| 11 | ErrorFallback | Task 4 |
| 12 | 페이지 구조 3단 분리 | Task 9, 11, 12 |
| 13 | 통계 영역 위치 (DataView 안쪽) | Task 9 |
| 14 | cohortId 가드 | Task 9, 11 |
| 15 | 캐시 무효화 정책 | Task 6 (CSV는 invalidate 없음) |
| 16 | CSV 성공 알림 미발생 | Task 11 |
| (정정) | packages/api CSV responseType | Task 5 |

모든 스펙 결정에 대응되는 task 존재.

### 타입/시그니처 일관성

- `EmptyState` props: `{ children, tone? }` — Task 2, 4, 9, 11에서 동일 사용
- `StatCard` props: `{ title, value, footer? }` — Task 3, 8, 13, 14에서 동일 사용
- `ErrorFallback`: `react-error-boundary`의 `FallbackProps` — Task 4, 11, 12에서 동일 시그니처
- `RemindersDataView` props: `{ cohortId: number, cohorts, searchText, statusFilter }` — Task 9 정의, Task 11 호출 시 동일
- `RemindersContent` props: 6개 (`searchText`, `statusFilter`, `overrideCohortId`, 3 setters) — Task 11 정의, Task 12 호출 시 동일
- `RemindersToolbar` props: 기존 9개 + 추가 3개 (`onExportCsv`, `isExporting`, `isExportDisabled`) — Task 10 정의, Task 11 호출 시 동일
- `downloadRemindersCsv` 시그니처: `({cohortId, cohortName}) => Promise<void>` — Task 6 정의, Task 11 호출 시 동일
- `cohortQueries.getCohorts()` — Task 11에서 `useSuspenseQuery`로 사용. `@ddd/api` 에서 export 됨 (검증 완료)
- `earlyNotificationQueries.getAdminEarlyNotifications` — Task 9에서 사용. `@ddd/api` 에서 export 됨 (검증 완료)

### 개방 이슈 (실행 중 발견 가능성)

1. **`Download04Icon`** — hugeicons 패키지에 정확한 이름 검증 미완. 없으면 같은 카테고리 다른 이름으로 교체. Task 10 step 2에 노트 있음.
2. **`StatCard.Skeleton` Object.assign 패턴** — React Devtools에서 displayName이 빈약할 수 있음. 필요 시 `StatCardRoot.displayName = "StatCard"` 추가하지만 본 plan에는 미포함 (UX 영향 없음).
3. **`isBulkSendDisabled={false}` 회귀** — 스펙 §10에서 비범위로 인정. 추후 작업 항목.
4. **CSV 응답 형식** — 백엔드가 정확히 `text/csv` 로 내려주는지, `application/octet-stream` 로 내려주는지에 따라 client.ts 분기 결과가 다를 수 있음. Task 5 의 `responseType: "text"` 는 Content-Type 검사를 우회하므로 어떤 경우든 text로 처리 가능. 만약 백엔드가 `ApiResponse<{csv: string}>` 같은 래퍼로 내려준다면 Task 5/6 모두 재설계 필요 → Task 15 step 4에서 dev 검증 시 가장 먼저 확인.

---

## 실행 핸드오프

Plan complete and saved to `docs/superpowers/plans/2026-05-04-reminders-api-integration.md`. Two execution options:

**1. Subagent-Driven (recommended)** — task당 fresh subagent 1개 dispatch + task 사이 review. fast iteration.

**2. Inline Execution** — 본 세션에서 그대로 task 진행, checkpoint 단위로 review.

Which approach?
