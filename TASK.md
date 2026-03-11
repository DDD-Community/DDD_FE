# Claude Code 작업 태스크 (순서대로 진행)

> 현재 상태: Next.js 프로젝트 생성 완료, CLAUDE.md 루트에 작성 완료
> 이 파일의 태스크를 위에서부터 순서대로 진행할 것
> 완료한 태스크는 `- [x]`로 표시

---

## PHASE 1 — 모노레포 구조 세팅

### Task 1-1. 루트 설정 파일 생성
- [x] 루트 `package.json` 생성
- [x] 루트 `pnpm-workspace.yaml` 생성
- [x] 루트 `tsconfig.base.json` 생성 (strict mode 기반 공통 설정)

### Task 1-2. 폴더 구조 생성
- [x] `apps/admin/` — 기존 Next.js 프로젝트 이동
- [x] `apps/web/` — 빈 폴더 생성 (추후 개발)
- [x] `packages/db/` — 폴더 생성
- [x] `packages/core/` — 폴더 생성
- [x] `packages/ui/` — 빈 폴더 생성 (추후 개발)

### Task 1-3. apps/admin 패키지 설정
- [x] `apps/admin/package.json`의 `name`을 `@ddd/admin`으로 수정
- [x] `@ddd/db`, `@ddd/core` 의존성 추가
- [x] `apps/admin/tsconfig.json`이 루트 `tsconfig.base.json`을 extends하도록 수정

---

## PHASE 2 — packages/db 세팅

### Task 2-1. packages/db 초기화
- [x] `packages/db/package.json` 생성
- [x] 의존성 설치 (drizzle-orm, postgres, drizzle-zod, zod)
- [x] 개발 의존성 설치 (drizzle-kit, dotenv, typescript)

### Task 2-2. Drizzle 스키마 작성
- [x] `schema/season.ts` — season 테이블 + seasonStatusEnum + drizzle-zod 스키마
- [x] `schema/application.ts` — application 테이블 + enums + drizzle-zod 스키마 (email, phone, referenceUrls extend)
- [x] `schema/interview.ts` — interview 테이블 + interviewResultEnum + drizzle-zod 스키마 (score extend)
- [x] `schema/member.ts` — member 테이블 + memberTeamEnum + drizzle-zod 스키마
- [x] `schema/admin.ts` — admin 테이블 + adminRoleEnum + drizzle-zod 스키마
- [x] `schema/notice.ts` — notice 테이블 + noticeTargetEnum + drizzle-zod 스키마
- [x] `schema/index.ts` — 전체 export + relations 정의

### Task 2-3. Drizzle 설정 및 DB 클라이언트
- [x] `packages/db/drizzle.config.ts` 생성
- [x] `packages/db/index.ts` 생성 — postgres.js + drizzle 클라이언트 export + Zod 스키마 export

### Task 2-4. DB 마이그레이션 실행
- [ ] `apps/admin/.env.local`에 `DATABASE_URL` 추가
  ```
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
  ```
- [ ] 마이그레이션 실행
  ```bash
  pnpm --filter @ddd/db db:generate
  pnpm --filter @ddd/db db:migrate
  ```
- [ ] Supabase Dashboard에서 테이블 생성 확인

### Task 2-5. packages/db queries 작성
- [x] `queries/season.ts`
- [x] `queries/application.ts`
- [x] `queries/interview.ts`
- [x] `queries/member.ts`
- [x] `queries/admin.ts`
- [x] `queries/notice.ts`
- [x] `queries/index.ts`

---

## PHASE 3 — packages/core 세팅

### Task 3-1. packages/core 초기화
- [x] `packages/core/package.json` 생성
- [x] 의존성 설치 (zod, @ddd/db@workspace:*)
- [x] 개발 의존성 설치 (typescript)

### Task 3-2. Zod 스키마 확인
- [x] packages/db/schema/ 에서 자동 생성된 Zod 스키마를 packages/core에서 re-export
- [x] 비즈니스 규칙이 추가된 extended 스키마는 packages/core/[domain]/[domain].schema.ts에서 관리

> **참고**: drizzle-zod로 자동 생성된 기본 스키마(`insertXxxSchema`, `selectXxxSchema`)는 `@ddd/db`에서 직접 export됨.
> `@ddd/core`의 스키마 파일에는 비즈니스 규칙이 추가된 스키마만 작성.

### Task 3-3. 도메인별 Service 작성
- [x] `application/application.service.ts`
- [x] `interview/interview.service.ts`
- [x] `member/member.service.ts`
- [x] `admin/admin.service.ts`
- [x] `notice/notice.service.ts`
- [x] 각 도메인 `index.ts`
- [x] `index.ts` — 전체 export

---

## PHASE 4 — NextAuth 세팅

### Task 4-1. NextAuth 설치 및 설정
- [x] 설치
- [x] `apps/admin/lib/auth.ts` 생성
  - Provider: Google OAuth
  - session 콜백에서 member.id, isAdmin, roles 주입
  - DB에서 admin 여부 조회하여 세션에 포함
- [x] `apps/admin/lib/auth.types.ts` — Session 타입 확장
- [x] `apps/admin/app/api/auth/[...nextauth]/route.ts` 생성
- [ ] `.env.local` 값 채우기
  ```
  AUTH_SECRET=        # openssl rand -base64 32
  AUTH_GOOGLE_ID=     # Google Cloud Console
  AUTH_GOOGLE_SECRET= # Google Cloud Console
  ```

### Task 4-2. Middleware 설정
- [x] `apps/admin/middleware.ts` 생성
  - /dashboard/** 비로그인 → /login 리다이렉트
  - 로그인했지만 isAdmin false → /unauthorized

---

## PHASE 5 — 어드민 페이지 구현

### Task 5-1. 레이아웃 및 공통 UI
- [ ] `app/dashboard/layout.tsx` — 사이드바 + 헤더 레이아웃
- [ ] `app/login/page.tsx` — 로그인 페이지
- [ ] `app/unauthorized/page.tsx` — 권한 없음 페이지

### Task 5-2. Season (기수 관리)
- [ ] `app/dashboard/seasons/page.tsx` — 기수 목록
- [ ] `app/dashboard/seasons/_actions/season.ts` — 기수 생성/수정

### Task 5-3. Application (지원서 관리)
- [ ] `app/dashboard/applications/page.tsx` — 지원서 목록 + 직군별 필터
- [ ] `app/dashboard/applications/[id]/page.tsx` — 지원서 상세
- [ ] `app/dashboard/applications/_actions/application.ts`
  - `moveToInterviewAction`
  - `passApplicationAction` — Member 자동 생성 포함
  - `failApplicationAction`

### Task 5-4. Interview (면접 관리)
- [ ] `app/dashboard/interviews/page.tsx` — 면접 일정 목록
- [ ] `app/dashboard/interviews/_actions/interview.ts`
  - `scheduleInterviewAction` — Google Calendar 연동
  - `recordResultAction`

### Task 5-5. Member (회원 관리)
- [ ] `app/dashboard/members/page.tsx` — 회원 목록 + 기수별 필터
- [ ] `app/dashboard/members/[id]/page.tsx` — 회원 상세
- [ ] `app/dashboard/members/_actions/member.ts`
  - `assignTeamAction`
  - `deactivateMemberAction`

### Task 5-6. Admin (운영진 관리)
- [ ] `app/dashboard/admins/page.tsx` — 운영진 목록
- [ ] `app/dashboard/admins/_actions/admin.ts`
  - `grantAdminAction` — PRESIDENT만 가능
  - `revokeAdminAction` — PRESIDENT만 가능

### Task 5-7. Notice (공지 관리)
- [ ] `app/dashboard/notices/page.tsx` — 공지 목록
- [ ] `app/dashboard/notices/new/page.tsx` — 공지 작성
- [ ] `app/dashboard/notices/_actions/notice.ts`
  - `createNoticeAction` — Discord Webhook 전송 포함
  - `updateNoticeAction`
  - `deleteNoticeAction`

---

## PHASE 6 — 외부 연동

### Task 6-1. Discord 연동
- [ ] Discord Bot 생성 및 토큰 발급
- [ ] `.env.local`에 추가
  ```
  DISCORD_BOT_TOKEN=
  DISCORD_SERVER_ID=
  DISCORD_MEMBER_ROLE_ID=
  DISCORD_NOTICE_CHANNEL_ID=
  ```
- [ ] `apps/admin/lib/discord.ts` — Bot API 함수
  - `sendServerInvite(discordId)` — 합격자 초대
  - `assignRole(discordId, roleId)` — Role 부여
  - `sendNoticeToChannel(content)` — 공지 전송

### Task 6-2. Google Calendar 연동
- [ ] Google Cloud Console에서 OAuth 설정
- [ ] `.env.local`에 추가
  ```
  GOOGLE_CALENDAR_ID=
  ```
- [ ] `apps/admin/lib/calendar.ts` — Calendar API 함수
  - `createCalendarEvent(interview)` — 일정 생성
  - `updateCalendarEvent(googleEventId, data)` — 일정 수정
  - `deleteCalendarEvent(googleEventId)` — 일정 삭제

---

## 진행 시 주의사항

```
1. 각 Phase는 순서대로 진행 (앞 Phase 완료 후 다음 Phase)
2. DB 쿼리는 packages/db/queries/에만, 비즈니스 로직은 packages/core/에만
3. _actions/에서 반드시 권한 체크 후 core 호출
4. 계층을 건너뛰는 호출 금지 (page.tsx에서 직접 core 호출 금지)
5. 환경변수는 .env.local에만, 절대 커밋 금지
```
