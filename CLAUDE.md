# IT 사이드 프로젝트 동아리 어드민 (DDD)

## 프로젝트 개요

- **목적**: IT 사이드 프로젝트 동아리 운영을 위한 어드민 페이지
- **구조**: 모노레포 (PNPM Workspaces)
  - `apps/admin` — 어드민 페이지 (현재 개발 대상)
  - `apps/web` — 랜딩페이지 + 동아리 신청 폼 (추후 개발)
  - `packages/db` — Drizzle ORM 기반 순수 CRUD
  - `packages/core` — 비즈니스 로직 + Zod 스키마
  - `packages/ui` — 공통 UI 컴포넌트 (추후)

### 기술 스택

| 분류        | 기술                                                        |
| ----------- | ----------------------------------------------------------- |
| 프레임워크  | Next.js (App Router, 풀스택)                                |
| 언어        | TypeScript strict mode                                      |
| 인증        | NextAuth.js                                                 |
| DB          | PostgreSQL (Supabase hosting — 추후 Neon/Railway 교체 가능) |
| ORM         | Drizzle ORM (`@ddd/db`)                                     |
| 입력값 검증 | Zod + drizzle-zod (`@ddd/db`에서 자동 생성, `@ddd/core`에서 확장) |
| 파일 업로드 | Cloudflare R2 (미확정)                                      |

### 외부 연동

| 서비스              | 용도                             | 방식                    |
| ------------------- | -------------------------------- | ----------------------- |
| Google Calendar API | 면접 일정 등록/수정              | API Routes (외부 콜백)  |
| Discord Bot         | 합격자 서버 초대, Role 자동 부여 | API Routes (외부 콜백)  |
| Discord Webhook     | 공지 작성 시 채널 자동 전송      | Server Action에서 fetch |

---

## 도메인

### 흐름

```
Season 생성
  → Application 접수
    → Interview 생성
      → 합격 시 Member 자동 생성
        → Admin 부여 가능
```

### ERD 요약

```
Season ──< Application ──1 Interview
Season ──< Member
Application ──1 Member
Member ──< Admin
Notice >── Season (nullable)
Notice >── Admin
```

### Season (기수)

| 필드                          | 타입       | 설명                         |
| ----------------------------- | ---------- | ---------------------------- |
| id                            | UUID PK    |                              |
| number                        | INT UNIQUE | 기수 번호 (3, 4, 5...)       |
| recruit_start / recruit_end   | DATE       | 모집 기간                    |
| activity_start / activity_end | DATE       | 활동 기간                    |
| status                        | ENUM       | RECRUITING / ACTIVE / CLOSED |

### Application (지원서)

| 필드                 | 타입        | 설명                                             |
| -------------------- | ----------- | ------------------------------------------------ |
| id                   | UUID PK     |                                                  |
| season_id            | FK → Season |                                                  |
| name / email / phone | TEXT        |                                                  |
| field                | ENUM        | FRONTEND / BACKEND / ANDROID / IOS / DESIGN / PM |
| status               | ENUM        | RECEIVED → INTERVIEW → PASSED / FAILED           |
| answers              | JSONB       | 기수별 자유형식 질문/답변 배열                   |
| portfolio_file_url   | TEXT        | 파일 업로드 경로 (R2 등)                         |
| reference_urls       | TEXT[]      | 참고 URL 배열 (GitHub, Figma, 노션 등 자유 입력) |

> `reference_urls` 어드민 UI: 도메인 파싱으로 아이콘 구분 (github.com → GitHub 아이콘 등)
> 합격 처리 시 → Member 자동 생성

### Interview (면접)

| 필드            | 타입                    | 설명                      |
| --------------- | ----------------------- | ------------------------- |
| id              | UUID PK                 |                           |
| application_id  | FK → Application UNIQUE | 1:1 관계                  |
| scheduled_at    | TIMESTAMPTZ             | 면접 일시                 |
| google_event_id | TEXT                    | Google Calendar 이벤트 ID |
| score           | INT                     | 0~100                     |
| memo            | TEXT                    | 면접관 메모               |
| result          | ENUM                    | PENDING / PASS / FAIL     |
| interviewed_by  | FK → Admin              |                           |

### Member (회원)

| 필드                 | 타입                    | 설명                                                  |
| -------------------- | ----------------------- | ----------------------------------------------------- |
| id                   | UUID PK                 |                                                       |
| application_id       | FK → Application UNIQUE | 입회 경로 추적                                        |
| season_id            | FK → Season             | 입회 기수                                             |
| name / email / phone | TEXT                    |                                                       |
| team                 | ENUM                    | WEB_1 / WEB_2 / ANDROID_1 / ANDROID_2 / IOS_1 / IOS_2 |
| is_active            | BOOLEAN                 | 활동중(true) / 수료(false)                            |
| discord_id           | TEXT                    | Discord 사용자 ID                                     |

### Admin (운영진)

| 필드      | 타입        | 설명                 |
| --------- | ----------- | -------------------- |
| id        | UUID PK     |                      |
| member_id | FK → Member | 운영진은 반드시 회원 |
| role      | ENUM        | PRESIDENT / STAFF    |
| is_active | BOOLEAN     |                      |

> 한 Member가 여러 Admin row 가질 수 있음 (복수 역할 대비)
> 어드민 판단: Admin 테이블에 `member_id` 일치 + `is_active = true` row 존재

### Notice (공지)

| 필드            | 타입                 | 설명                                 |
| --------------- | -------------------- | ------------------------------------ |
| id              | UUID PK              |                                      |
| season_id       | FK → Season NULLABLE | null이면 전체 공지                   |
| title / content | TEXT                 |                                      |
| target          | ENUM                 | ALL (랜딩 노출) / MEMBER (회원 전용) |
| is_published    | BOOLEAN              |                                      |
| published_at    | TIMESTAMPTZ          |                                      |
| created_by      | FK → Admin           |                                      |

---

## 아키텍처

### Layered Architecture

```
Presentation  →  app/**/page.tsx         (Server Component, UI)
Application   →  app/**/_actions/*.ts    (권한체크 + 입력값 검증 + core 호출)
Service       →  packages/core/          (비즈니스 로직 + Zod 스키마)
Repository    →  packages/db/            (Drizzle ORM, 순수 CRUD)
```

각 계층은 바로 아래 계층만 호출. 계층을 건너뛰지 않음.

### 계층별 역할 및 예외 처리

**`packages/db/` — Repository**

- Drizzle ORM 기반 순수 CRUD만 담당
- DB 에러만 처리 (연결 실패, 제약조건 위반 등)
- DB 에러를 의미있는 에러로 변환 후 상위로 throw

```ts
// packages/db/queries/member.ts
export async function createMember(data: NewMember) {
  try {
    return await db.insert(member).values(data).returning();
  } catch (e) {
    if (isUniqueConstraintError(e)) throw new Error("DUPLICATE_EMAIL");
    throw e;
  }
}
```

**`packages/core/` — Service**

- 비즈니스 로직 (여러 쿼리 조합)
- Zod 스키마 정의 (admin, web 공통 사용)
- 비즈니스 규칙 위반 처리

```ts
// packages/core/application/application.service.ts
export async function passApplication(applicationId: string) {
  const app = await getApplicationById(applicationId)
  if (app.status === 'PASSED') throw new Error('ALREADY_PASSED')
  if (app.status === 'FAILED') throw new Error('ALREADY_FAILED')

  await updateApplicationStatus(applicationId, 'PASSED')
  await createMember({ ... })
}

// packages/core/application/application.schema.ts
export const passApplicationSchema = z.object({
  applicationId: z.string().uuid(),
})
```

**`apps/admin/_actions/` — Application**

- 권한 체크 (앱마다 규칙이 다르므로 각 앱에 위치)
- Zod 스키마 import 후 입력값 검증 실행
- core 서비스 호출

```ts
// apps/admin/_actions/application.ts
"use server";
export async function passApplicationAction(input: unknown) {
  // 1. 권한 체크 (admin 전용 규칙)
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const admin = await getAdminByMemberId(session.user.id);
  if (!admin) throw new Error("Forbidden");

  // 2. 입력값 검증 (Zod 스키마는 @ddd/core에서 import)
  const parsed = passApplicationSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  // 3. 비즈니스 로직 호출
  await passApplication(parsed.data.applicationId);
}
```

> `apps/web/_actions/`는 권한 체크 없음 (비인증 사용자도 신청 폼 제출 가능)

### API Routes 사용 범위

API Routes는 **외부 서비스 콜백에만** 사용. 나머지는 Server Action.

```
app/api/calendar/webhook/route.ts  ← Google Calendar 콜백
app/api/discord/route.ts           ← Discord 콜백
```

### 인증 흐름

```
브라우저
  → Middleware (비로그인 → /login 리다이렉트)
    → Server Component (읽기 — @ddd/db 직접 호출)
    → _actions (쓰기 — 권한체크 → @ddd/core → @ddd/db)
```

### 세션 구조

```ts
session.user = {
  id, // member.id
  name,
  email,
  isAdmin, // admin row 존재 여부
  roles, // admin.role[] ex) ['PRESIDENT']
};
```

### 권한 레벨

| 역할      | 접근 범위                      |
| --------- | ------------------------------ |
| 비인증    | 없음 (apps/web 신청 폼만 허용) |
| STAFF     | 모든 어드민 기능 읽기/쓰기     |
| PRESIDENT | STAFF 권한 + 운영진 관리       |

---

## 주요 기능

### Application

- 지원서 목록 조회 / 직군별 필터링
- 지원서 상세 보기
- 상태 변경 (RECEIVED → INTERVIEW → PASSED / FAILED)
- 합격 처리 시 Member 자동 생성

### Interview

- 면접 일정 등록/수정 (Google Calendar 동기화)
- 지원자별 면접 배정
- 점수 및 메모 기록
- 최종 합불 결정 → Application status 반영

### Member

- 회원 목록 / 상세 / 수정
- 기수별 조회
- 팀 배정 (6팀)
- is_active 상태 관리

### Admin

- 운영진 지정 / 해제 (Member → Admin)
- role 관리 (PRESIDENT / STAFF)

### Notice

- 공지 작성 / 수정 / 삭제
- 전체 공지 vs 회원 공지 구분
- 랜딩페이지 노출 여부 (target: ALL)
- 작성 시 Discord 채널 자동 전송

---

## 패키지 구조

```
(root)
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
│
├── apps/
│   ├── admin/                        (@ddd/admin)
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   └── [domain]/
│   │   │   │       ├── page.tsx      ← Server Component (읽기)
│   │   │   │       └── _actions/
│   │   │   │           └── *.ts      ← 권한체크 + 입력값 검증
│   │   │   └── api/
│   │   │       ├── calendar/webhook/ ← Google Calendar 콜백
│   │   │       └── discord/          ← Discord 콜백
│   │   └── lib/
│   │       └── auth.ts               ← NextAuth 설정
│   │
│   └── web/                          (@ddd/web, 추후)
│
└── packages/
    ├── db/                           (@ddd/db)
    │   ├── schema/                   ← Drizzle 스키마
    │   │   ├── season.ts
    │   │   ├── application.ts
    │   │   ├── interview.ts
    │   │   ├── member.ts
    │   │   ├── admin.ts
    │   │   ├── notice.ts
    │   │   └── index.ts
    │   ├── queries/                  ← 순수 CRUD 함수
    │   │   ├── season.ts
    │   │   ├── application.ts
    │   │   ├── interview.ts
    │   │   ├── member.ts
    │   │   ├── admin.ts
    │   │   ├── notice.ts
    │   │   └── index.ts
    │   └── index.ts                  ← db 클라이언트 export
    │
    ├── core/                         (@ddd/core)
    │   ├── application/
    │   │   ├── application.service.ts  ← 비즈니스 로직
    │   │   ├── application.schema.ts   ← Zod 스키마
    │   │   └── application.test.ts     ← 테스트
    │   ├── interview/
    │   ├── member/
    │   ├── admin/
    │   ├── notice/
    │   └── index.ts
    │
    └── ui/                           (@ddd/ui, 추후)
```

### 테스트 위치

- `packages/db/queries/*.test.ts` — DB 쿼리 테스트
- `packages/core/**/*.test.ts` — 비즈니스 로직 테스트
- `apps/admin/_actions/*.test.ts` — 권한 체크 테스트

### 컨벤션

- Server Actions 사용 (API Routes는 외부 콜백에만)
- ENUM 값은 Drizzle 스키마와 TypeScript 타입 동일하게 유지
- 날짜는 TIMESTAMPTZ 저장, 표시는 `date-fns` 사용

---

## DB 스키마 / 마이그레이션

- 스키마 정의: `packages/db/schema/`
- 마이그레이션 파일 (자동 생성): `packages/db/drizzle/`
- DB 구조 변경 시: `schema/*.ts` 수정 → `pnpm db:generate` → `pnpm db:migrate`
- SQL Editor 직접 사용 불필요 (drizzle-kit이 자동 처리)

---

## 미결 사항

- [ ] `pnpm db:generate` 실행 → 마이그레이션 SQL 자동 생성
- [ ] `pnpm db:migrate` 실행 → Supabase DB에 자동 반영
- [ ] packages/core 구조 세팅
- [ ] 파일 업로드 스토리지 확정 (Cloudflare R2 권장)
- [ ] NextAuth.js Provider 확정 (Google OAuth 권장)
- [ ] Google Calendar OAuth 설정
- [ ] Discord Bot 설정 (초대 발송, Role 부여)
- [ ] Discord Webhook 설정 (공지 채널 연동)
