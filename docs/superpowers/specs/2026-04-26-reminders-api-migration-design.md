# /reminders 어드민 페이지 — API 연동 마이그레이션 설계 문서

> **작성일**: 2026-04-26
> **대상**: `apps/admin/src/pages/reminders/`
> **API**: `@ddd/api`의 `early-notification`, `cohort` 도메인

---

## 1. 목적

`apps/admin/src/pages/reminders/`의 임시 mock 기반 구현을 걷어내고, 실제 백엔드 API
(`@ddd/api/early-notification`)로 교체한다. UI를 백엔드 DTO에 맞춰 축소하고,
사전 알림 일괄 발송 기능을 실제 API로 동작시킨다.

기존 직접 `api.get<ReminderInfo[]>("/reminder")` 호출과 페이지 로컬 타입(`types.d.ts`),
MSW mock(`mockApi.ts`)은 모두 제거한다.

---

## 2. 결정 사항 (Decision Log)

| #   | 영역             | 결정                                                                                              |
| --- | ---------------- | ------------------------------------------------------------------------------------------------- |
| 1   | DTO 정합화       | 이름·직군 컬럼 제거. 백엔드 `EarlyNotificationDto` 형태(`email`, `cohortId`, `notifiedAt?`)에 맞춤 |
| 2   | 상태 enum        | UI 로컬 `ReminderStatus` 폐기. `notifiedAt` 유무로 클라이언트에서 derive                          |
| 3   | "전체 기수" 필터 | 옵션 제거. 진입 시 활성/최신 기수 자동 선택 + 다른 기수로 전환은 Select에서                       |
| 4   | 일괄 발송 폼     | Drawer 패턴(`SemesterRegisterDrawer`와 동일). 폼은 4슬롯(B-2 템플릿)                              |
| 5   | 이메일 템플릿    | HTML 셸은 코드 고정, 운영진은 `subject`+`message`+`ctaLabel`+`ctaUrl` 4슬롯만 채움                |
| 6   | 행 단위 액션     | 발송/취소 버튼 제거(매칭 API 없음). 액션 컬럼 자체 제거                                           |
| 7   | 통계 카드        | 4개 → 3개로 축소. 전체/대기/발송 완료. "취소"는 도메인에 없으므로 제거                            |
| 8   | CSV 내보내기     | 본 마이그레이션 범위에 포함. `useAdminEarlyNotificationsCsv` 활용                                 |
| 9   | 기수 ID 매핑     | `useCohorts()`로 기수 목록 조회 → `cohort.name`으로 Select 표시, 값은 `cohort.id`                 |
| 10  | 토스트           | `docs/admin-toast.md` 표준 패턴. mutation 성공/실패 모두 처리                                     |
| 11  | 검색             | 클라이언트 필터링 유지. `email`만 대상(이름 컬럼 제거됨)                                          |

---

## 3. 데이터 흐름 비교

### 3.1 Before (제거 대상)

```
RemindersPage
  └─ useQuery({ queryFn: api.get<ReminderInfo[]>("/reminder") })
        ↓ MSW intercept
        mockApi.ts (faker로 가짜 데이터 생성)
```

페이지 로컬 타입(`ReminderInfo`)에 백엔드에 존재하지 않는 `name`, `role`, `semester`(string), `appliedAt`, `status`(enum) 포함.

### 3.2 After

```
RemindersPage
  ├─ useCohorts()                         // 기수 Select 옵션 + 기본 cohortId 결정
  └─ useAdminEarlyNotifications({ params: { cohortId } })
        → EarlyNotificationDto[] = [{ id, cohortId, email, notifiedAt?, createdAt }]
              ↓ derive
              상태(대기/완료) = !!notifiedAt
              검색 = email.includes(searchText)
              통계 = length / pending / notified

RemindersBulkSendDrawer
  └─ useSendBulkEarlyNotification()
        ← buildEmailTemplate({ message, ctaLabel, ctaUrl }) → { html, text }
        + subject

RemindersToolbar (CSV 버튼)
  └─ useAdminEarlyNotificationsCsv({ params: { cohortId } })
```

---

## 4. 폴더 구조

```
apps/admin/src/pages/reminders/
├── RemindersPage.tsx                # 최상위 페이지
├── index.tsx                        # 배럴 (변경 없음)
├── components/
│   ├── Sections.tsx                 # 기존 TitleSection/CardSection (수정)
│   ├── RemindersToolbar.tsx         # 신규: 검색 + 기수 Select + CSV 버튼 + 발송 버튼
│   ├── RemindersTable.tsx           # 신규: 테이블 본체
│   └── RemindersBulkSendDrawer.tsx  # 신규: 일괄 발송 Drawer
├── lib/
│   └── buildEmailTemplate.ts        # 신규: 4슬롯 → { html, text } 변환
└── constants.ts                     # 수정: 라벨/필터 상수 정리

# ❌ 삭제 대상
apps/admin/src/pages/reminders/types.d.ts
apps/admin/src/pages/reminders/mockApi.ts
```

---

## 5. 컴포넌트 설계

### 5.1 `RemindersPage.tsx`

책임:
- `cohortId` 상태(기본값 = 활성/최신 기수)와 검색/상태 필터 상태 보유
- `useAdminEarlyNotifications`로 데이터 fetch
- 통계 derive (전체/대기/발송 완료)
- Toolbar/Table/Drawer를 합성

핵심 흐름:

```tsx
const { data: cohorts } = useCohorts()
const defaultCohortId = useMemo(() => pickActiveCohortId(cohorts), [cohorts])
const [cohortId, setCohortId] = useState<number | null>(null)
const effectiveCohortId = cohortId ?? defaultCohortId

const { data: reminders, isLoading } = useAdminEarlyNotifications({
  params: { cohortId: effectiveCohortId! },
  // enabled는 queries 단에서 !!cohortId로 처리되어 있음
})
```

`pickActiveCohortId(cohorts)` 우선순위:
1. `status === 'OPEN'` (또는 모집 중) 인 기수 중 가장 최근
2. 없으면 `recruitStartAt` 기준 가장 최신
3. 그것도 없으면 `null`

기수가 단 한 개도 없을 때는 빈 상태 메시지(예: "등록된 기수가 없습니다") 노출.

### 5.2 `RemindersToolbar.tsx`

```tsx
type Props = {
  searchText: string
  onSearchChange: (v: string) => void
  cohortId: number | null
  cohorts: CohortDto[]
  onCohortChange: (id: number) => void
  statusFilter: ReminderStatusFilter
  onStatusFilterChange: (v: ReminderStatusFilter) => void
  onOpenBulkSend: () => void
  onExportCsv: () => void
  isCsvPending: boolean
}
```

- 검색 Input(이메일 only), 기수 Select(`cohorts` 옵션), 상태 Select("전체"/"대기"/"발송 완료")
- 우측: "CSV 다운로드" Button + "알림 발송" Button → `onOpenBulkSend`

### 5.3 `RemindersTable.tsx`

컬럼:

| 컬럼     | 소스                                          |
| -------- | --------------------------------------------- |
| 이메일   | `email`                                       |
| 기수     | `cohorts` 매핑(`id → name`)                   |
| 신청일   | `createdAt` → `toLocaleDateString("ko-KR")`   |
| 상태     | `notifiedAt ? "발송 완료" : "대기"` + 배지/색 |
| 발송 일시 | `notifiedAt ? toLocaleString : "-"`           |

행 단위 액션 컬럼은 제거.

### 5.4 `RemindersBulkSendDrawer.tsx`

폼 필드(react-hook-form + zod):

| 필드       | 타입     | 검증                        |
| ---------- | -------- | --------------------------- |
| `subject`  | string   | required, max 200           |
| `message`  | string   | required, max 5000          |
| `ctaLabel` | string   | required, max 30            |
| `ctaUrl`   | string   | required, URL 형식          |

제출:

```tsx
const { mutateAsync, isPending } = useSendBulkEarlyNotification()

const onSubmit = async (values) => {
  const { html, text } = buildEmailTemplate(values)
  try {
    await mutateAsync({
      payload: { cohortId, subject: values.subject, html, text },
    })
    queryClient.invalidateQueries({ queryKey: earlyNotificationKeys.adminLists() })
    toast.success("알림 발송이 완료되었습니다", {
      description: `${cohortName}에 등록된 신청자에게 발송했습니다.`,
    })
    onClose()
  } catch (error) {
    toast.error("발송에 실패했습니다", {
      description: (error as Error).message,
    })
  }
}
```

### 5.5 `lib/buildEmailTemplate.ts`

```ts
type TemplateInput = {
  message: string
  ctaLabel: string
  ctaUrl: string
}

export function buildEmailTemplate({ message, ctaLabel, ctaUrl }: TemplateInput): {
  html: string
  text: string
} {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")
  const safeUrl = encodeURI(ctaUrl)
  const safeLabel = escapeHtml(ctaLabel)

  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <p style="font-size:15px;line-height:1.7;color:#222;">${safeMessage}</p>
  <a href="${safeUrl}"
     style="display:inline-block;margin-top:24px;padding:12px 20px;
            background:#000;color:#fff;text-decoration:none;border-radius:8px;">
    ${safeLabel}
  </a>
</div>`.trim()

  const text = `${message}\n\n${ctaLabel}: ${ctaUrl}`

  return { html, text }
}
```

- `escapeHtml`은 `&`, `<`, `>`, `"`, `'` 치환하는 단순 함수.
- 외부 라이브러리 추가하지 않음.

---

## 6. 제거/수정/신규 파일 목록

### ❌ 삭제

| 파일                                                | 이유                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| `apps/admin/src/pages/reminders/types.d.ts`         | `EarlyNotificationDto`로 대체                      |
| `apps/admin/src/pages/reminders/mockApi.ts`         | 실제 API 연동으로 mock 불필요                      |

### ✏️ 수정

| 파일                                                       | 변경                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/admin/src/pages/reminders/RemindersPage.tsx`         | mock fetch 제거, hooks 도입, 컴포넌트 분리                              |
| `apps/admin/src/pages/reminders/constants.ts`              | `STATUS_*` 단순화(2개), `ROLE_LABEL`/`COHORT_*` 제거                    |
| `apps/admin/src/pages/reminders/components/Sections.tsx`   | `CardSection` 4개 → 3개, props로 실제 통계 받음                         |
| `apps/admin/src/mocks/handlers.ts`                         | `reminderHandlers` import/spread 제거                                   |

### ➕ 신규

| 파일                                                                 | 역할                                |
| -------------------------------------------------------------------- | ----------------------------------- |
| `apps/admin/src/pages/reminders/components/RemindersToolbar.tsx`     | 검색/필터/액션 버튼                 |
| `apps/admin/src/pages/reminders/components/RemindersTable.tsx`       | 테이블 본체                         |
| `apps/admin/src/pages/reminders/components/RemindersBulkSendDrawer.tsx` | 일괄 발송 Drawer + 폼            |
| `apps/admin/src/pages/reminders/lib/buildEmailTemplate.ts`           | 4슬롯 → `{ html, text }` 변환       |

---

## 7. 에러/엣지 케이스

| 케이스                          | 처리                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- |
| 기수가 0개                      | 페이지 본문에 빈 상태 메시지 + 발송/CSV 버튼 disabled                            |
| 알림 신청자가 0명               | 테이블 빈 상태 + 발송 버튼 disabled (or click 시 toast.warning)                  |
| 목록 fetch 실패                 | TanStack Query 기본 에러 처리 + 재시도 버튼 노출 (Optional, fallback은 toast)    |
| 발송 mutation 실패              | `toast.error` + Drawer 유지(폼 데이터 보존)                                      |
| CSV 다운로드 실패               | `toast.error`                                                                    |
| `cohortId` 미선택 상태에서 mount | `enabled: false`로 fetch 차단 (queries 파일에 이미 구현되어 있음)                |

---

## 8. 토스트 메시지 (표준)

| 액션          | 종류    | title                           | description                             |
| ------------- | ------- | ------------------------------- | --------------------------------------- |
| 일괄 발송 성공 | success | `"알림 발송이 완료되었습니다"`  | `"${cohortName}에 등록된 신청자에게 발송했습니다."` |
| 일괄 발송 실패 | error   | `"발송에 실패했습니다"`         | `error.message`                         |
| CSV 다운로드 실패 | error | `"CSV 다운로드에 실패했습니다"` | `error.message`                         |

성공 시 `queryClient.invalidateQueries({ queryKey: earlyNotificationKeys.adminLists() })`로 목록 재조회 → 통계와 상태 컬럼이 자동 반영.

---

## 9. 검증 계획

- [ ] 타입 체크: `pnpm -F @ddd/admin tsc --noEmit`
- [ ] 린트: `pnpm lint`
- [ ] 수동 테스트(브라우저, MSW 끈 상태):
  - [ ] 페이지 진입 시 활성 기수가 기본 선택되고 목록이 로드된다
  - [ ] 기수 Select 변경 → 다른 기수 데이터 로드
  - [ ] 검색(이메일 부분 일치) 동작
  - [ ] 상태 필터 동작
  - [ ] "알림 발송" Drawer 열림 → 폼 검증(빈 값/긴 값/잘못된 URL) → 성공 토스트 → 목록의 `notifiedAt` 채워짐
  - [ ] CSV 다운로드 정상
  - [ ] 기수 0개 시 빈 상태 메시지

---

## 10. 범위 외 (Out of Scope)

- 이메일 템플릿 미리보기(WYSIWYG)
- 행 단위 발송/취소 (백엔드 API 없음)
- 페이지네이션 (현재 응답이 배열 한 번에 옴)
- 백엔드에 이름/직군 필드 추가 협의
