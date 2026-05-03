# DDD 프론트엔드 진행 현황

> **기준 문서**: 어드민 기능 명세 3.x, SEO 요구사항 4.x, 데이터 모델 5.x, MVP 범위 6.x
> **코드 스냅샷**: 2026-05-04 (branch: `dev/admin`)
> **범례**: ✅ 완료 / 🔧 부분 구현 (UI만 또는 목업 연결) / ⬜ 미구현
>
> **이번 라운드 정밀 점검**: HTML 목업(`~/Downloads/ddd-admin (1) (1).html`) 대비 현재 코드의 하드코딩·API 미연동·미구현을 file:line 단위로 재검토. 결과는 각 섹션과 문서 말미 [정밀 갭 (코드 라인 참조)](#정밀-갭-코드-라인-참조-2026-05-04-추가) 에 반영.

---

## 어드민 화면 레퍼런스

`apps/admin`의 신규 페이지 / 리뉴얼 작업은 다음 HTML 목업을 단일 시각 레퍼런스로 사용한다.

- **파일**: `~/Downloads/ddd-admin (1) (1).html` (별도 보존; 외부 공유 금지)
- **포함 페이지**: 기수 / 사전 알림 / 지원자 / 프로젝트 / 블로그 + 각 영역 Drawer · Confirm Modal · Toast
- **개발 원칙**
  - 컬럼·필터·필드 구성은 HTML을 따르되, 데이터 형태·필드명은 `@ddd/api` DTO에 정합되게 변환한다.
  - HTML에만 존재하지만 백엔드 DTO에 없는 필드(예: 프로젝트/블로그 `status`)는 **노출하지 않는다.**
  - HTML이 page-number 페이지네이션을 그리더라도 백엔드가 cursor 페이지네이션이면 "더 보기" / 무한스크롤로 대체한다.
  - 토스트·확인 모달은 **HeroUI v3** 기본 컴포넌트로 구현한다 (별도 토스트 가이드는 [docs/admin-toast.md](./docs/admin-toast.md) 참조).
- **세부 설계 문서**: [docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) — `/projects`, `/blog-posts` 페이지의 11단계 구현 계획 포함.

---

## 한눈에 보기

| 영역 | 상태 | 핵심 갭 |
| --- | --- | --- |
| 공통 인프라 (admin) | 🔧 | 실 API 연동 (OAuth · 인증 가드 · 로그아웃 ✅) |
| 3.1 기수 관리 | 🔧 | **mockApi.ts 의존 + Drawer/버튼 onPress 전부 미연결 — 가장 위험** |
| 3.2 사전 알림 | 🔧 | 일괄 발송 ✅, 개별 발송 액션 컬럼 자체 부재 + CSV UI 없음 |
| 3.3 지원자 관리 | 🔧 | 상세 라우트 미정의, 행 클릭 → 상세 진입 미연결 |
| 3.4 프로젝트 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) — PDF 업로드는 후속 |
| 3.5 블로그 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) |
| 3.6 FAQ | ✅ | MVP 제외 결정 (FE 하드코딩) |
| 4. SEO (web) | ⬜ | 스켈레톤만, 거의 전부 미구현 |
| 5. 데이터 모델 타입 반영 | 🔧 | `@ddd/api` 생성 타입 도입 진행 중 — `pages/semesters/types.d.ts` 임시 타입 잔존 |

---

## 공통 인프라 (apps/admin)

**완료**

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- HeroUI v3 (shadcn/ui primitives 제거 완료)
- React Router Data Mode (`createBrowserRouter`) — `apps/admin/src/pages/index.tsx`
- TanStack Query (`QueryProvider`)
- MSW 목업 환경 — `apps/admin/src/mocks/`
- ESLint + Prettier + Lefthook
- FSD 디렉터리 구조 (`app / pages / widgets / shared`)
- `AdminLayout` (SideBar + MobileHeader + Outlet)
- `ThemeProvider` (localStorage, `d` 키 토글, 다크/라이트/시스템)

**미구현**

- ⬜ 실제 백엔드 API 연동 (orval 생성 코드 → `@ddd/api`)

**완료 (이번 라운드 추가)**

- ✅ Google OAuth 실제 연결 — `LoginPage` 가 `${VITE_API_URL}/api/v1/auth/google` 로 외부 redirect, 백엔드가 `CLIENT_REDIRECT_URL` 로 되돌림 (httpOnly 쿠키)
- ✅ 인증 보호 라우트 (Minimal) — 별도 loader 가드 없이 `client.ts` 401 인터셉터 + `main.tsx` `onUnauthorized` 콜백에 위임. 401 발생 시 `/` 로 자동 redirect
- ✅ 사이드바 사용자 메뉴 드롭다운 + 로그아웃 흐름 — `widgets/navigation/UserMenuDropdown.tsx` + `entities/auth/model/useLogoutFlow.ts` (`@ddd/api` `useLogout` mutation → 토스트 → `/` redirect)

**비-목표 (별도 라운드)**

- 회원가입 — 별도 흐름 없음 (Google OAuth 첫 로그인이 곧 가입)
- 로그인 사용자 컨텍스트 (me 표시) — 백엔드 `/me` 엔드포인트 추가 후
- 회원 탈퇴 UI — 별도 라운드
- 권한(roles) 기반 접근 제어 — 별도 라운드

---

## 3.1 기수 관리 (`/semesters`)

### 3.1.1 기수 상태 정의

- ✅ 상태 Enum 표기 (모집예정 / 모집 중 / 활동 중 / 활동종료) — 테이블 컬럼 노출
- ⬜ 홈페이지 버튼 동기화 (사전 알림 신청 / 지원 신청 / 모집 종료) — 웹 측 책임

### 3.1.2 기수 등록/수정

- 🔧 기수 목록 조회 — UI는 완성, **데이터 출처가 mockApi.ts (faker)**. `SemestersPage.tsx:21-27` 가 `getApiClient().get<SemesterInfo[]>("/semester")` 직접 호출 — 다른 페이지와 달리 `useCohorts()` 훅 미사용
- ✅ 상태별 필터 / 기수 검색 (클라이언트)
- 🔧 통계 카드 — UI 4개 카드(`SemestersPage.tsx:144-169`) 전부 **하드코딩** ("14", "활동 중 / 13기", "1204명", "520명"). 동적 집계 미구현
- 🔧 새 기수 등록 폼 — `SemesterRegisterDrawer.tsx` 섹션 4개(기본정보/프로세스/커리큘럼/파트별 양식)는 렌더되나 **`handleSubmit`이 `console.log("등록:", form)` 만 실행** (`SemesterRegisterDrawer.tsx:131-134`). `useCreateCohort()` 가 `packages/api/src/cohort/hooks.ts:39` 에 이미 존재하나 import 없음
- 🔧 새 기수 등록 버튼 — `TitleSection` Button(`SemestersPage.tsx:137-139`)에 `onPress` 없음. Drawer trigger 미연결로 클릭해도 열리지 않음
- 🔧 프로세스 일정 등록/수정 — DateRangePicker(서류접수/인터뷰), DatePicker(서류발표/최종발표) UI만
- 🔧 커리큘럼 등록/수정 (9주차 고정 배열, `SemesterRegisterDrawer.tsx:47-50`) — DatePicker + Input UI만
- 🔧 파트별 지원서 양식 관리 (PM/PD/Server/Web/iOS/Android Tabs) — 질문 추가/삭제는 동작, 저장은 미연결
- 🔧 수동 상태 변경 버튼 ("모집중 전환") — `SemestersPage.tsx:117` `onPress` 없음. `useUpdateCohort()` 미연결
- 🔧 기수 수정 버튼 — `SemestersPage.tsx:114-116` `onPress` 없음. 편집 모드 Drawer 자체가 부재 (현재 Drawer는 create-only)
- ⬜ `SemesterRegisterDrawer` react-hook-form 도입 — 현재 단순 useState로만 폼 관리 (다른 폼 Drawer는 react-hook-form + Zod 사용)
- ⬜ 모집 종료일 경과 시 자동 "활동중" 전환 (백엔드/스케줄러 책임)

---

## 3.2 사전 알림 신청 관리 (`/reminders`)

- ✅ 신청자 목록 조회 (이메일 / 기수 / 신청일 / 상태 / 발송 일시) — `useAdminEarlyNotifications` 연동
- ✅ 상태별 필터 (전체 / 대기 / 발송완료) — 클라이언트 predicate
- ✅ 이메일 검색 (클라이언트, 부분 일치)
- ✅ 통계 카드 — 동적 집계 (`RemindersPage.tsx:68-72` `stats` useMemo)
- ✅ 기수별 필터 — `useCohorts()` 매핑 + 최신 모집기수 자동 선택 (`pickActiveCohortId`)
- ✅ 전체 일괄 발송 — `RemindersBulkSendDrawer.tsx:62` `useSendBulkEarlyNotification` mutation 연동
- ⬜ 개별 발송 버튼 — `RemindersTable.tsx:28-34` 헤더에 액션 컬럼 자체가 없음 (HTML 목업에는 있음)
- ⬜ 이메일 목록 CSV 다운로드 — API(`useAdminEarlyNotificationsCsv`)는 존재하나 UI 트리거 없음
- ⬜ 기수 상태 "모집중" 전환 시 자동 발송 (Phase 2)

---

## 3.3 지원자 및 지원서 관리 (`/applications`)

### 3.3.1 지원자 상태 정의

- 🔧 상태 값 일부 노출 — 명세 전체 enum(서류대기 / 서류합격 / 서류불합격 / 최종합격 / 최종불합격 / 활동중 / 활동완료 / 활동중단) 정합성 재검수 필요

### 3.3.2 지원자 목록

- ✅ 목록 조회 (이름 / 연락처 / 파트 / 기수 / 지원일 / 상태) — `useAdminApplications` 연동
- ✅ 상태별 필터, 이름·연락처 검색 (클라이언트), 파트별/기수별 필터
- ✅ 통계 카드 — `ApplicationsPage.tsx:76-83` 에서 cardList 기반 동적 집계
- ✅ 상태 변경 — `ApplicationTable.tsx:26-37` `usePatchApplicationStatus` mutation + 캐시 invalidate + 토스트
- 🔧 상태 진행 액션 — `ApplicationTable.tsx:69-79` "다음 단계: {next}" 단일 버튼만 제공. HTML 목업의 합격/불합격 분기 선택 UI 없음 (NEXT_STATUS 매핑으로 단방향 진행만)
- ⬜ 지원자 행 클릭 → 상세 진입 — onPress·Link·navigate 미연결
- ⬜ 지원자 이름 행 hover 스타일 등 인터랙션 hint 없음

### 3.3.3 지원자 상세 (`/applications/:id`)

- ⬜ **상세 라우트 자체가 미정의** — `apps/admin/src/pages/index.tsx` 에 `/applications/:id` path 없음 (현재는 `/applications` 만 등록)
- ⬜ 지원 파트 / 이름 / 휴대폰번호(가운데번호 마스킹) / 생년월일 / 거주지역 표시
- ⬜ 파트별 질문+답변 + 제출 일시
- ⬜ 개인정보 동의 여부 + 동의 일시
- ⬜ 상세에서 상태 변경 기능
- ⬜ HTML 목업의 `applicantDrawer` (지원자 상세 슬라이드 패널) — React 코드에 미존재

### 3.3.4 개인정보 처리

- ⬜ 합격 발표 후 6개월 자동 파기 스케줄러 (Cron)
- ⬜ 개인정보 필드 null 처리 또는 레코드 삭제 로직
- ⬜ 감사 로그 / 관리자 알림 (필요 시)

---

## 3.4 프로젝트 DB 관리 (`/projects`)

> 화면 레퍼런스: HTML 목업 `#page-projects` 영역. 컬럼/필터/Drawer 구성은 HTML을 따르되 `status` 필드는 백엔드 DTO에 없으므로 제거한다. 세부 계획은 [설계 문서](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) 참조.

- ✅ 목록 조회 (썸네일 / 서비스명 / 플랫폼 / 기수 / 한줄설명 / 참여자수) — `useInfiniteProjects` 연동
- ✅ 플랫폼 필터 (서버) + 기수 필터 (클라이언트, `useCohorts` 매핑) + 서비스명 검색
- ✅ "더 보기" 페이지네이션 (cursor 기반, `useInfiniteQuery`)
- ✅ 새 프로젝트 등록/수정 Drawer (`ProjectFormDrawer.tsx`) — 썸네일 · 플랫폼 다중 · 서비스명 · 한줄설명 · 기수 · 참여자 N명, react-hook-form + Zod
- ✅ 썸네일 이미지 업로드 (`useUploadFile({ category: 'project-thumbnail' })`)
- ✅ 참여자 입력 (`useFieldArray` — 이름/파트/후기)
- ✅ 삭제 확인 (`DeleteProjectDialog` — HeroUI `AlertDialog`) + `useDeleteProject`
- ✅ 저장/삭제 토스트 (HeroUI v3 `toast`, [`docs/admin-toast.md`](./docs/admin-toast.md) 표준)
- ⬜ PDF 업로드 (`useUploadFile({ category: 'project-pdf' })`) — 후속 스코프
- ⬜ 등록 시 `/projects/[id]` URL 자동 생성 (웹 연동) — 후속 스코프
- ⬜ 브라우저 회귀 테스트 (실제 백엔드/MSW 연동 후)

---

## 3.5 블로그 DB 관리 (`/blog-posts`)

> 화면 레퍼런스: HTML 목업 `#page-blog` 영역. 백엔드 DTO에 없는 `status` / `author` / `category` 필드는 제거한다. 세부 계획은 [설계 문서](./docs/superpowers/specs/2026-04-26-blog-projects-admin-design.md) 참조.

- ✅ 목록 조회 (썸네일 / 제목 / 본문일부 / 외부 링크 / 등록일) — `useInfiniteBlogPosts` 연동
- ✅ 제목 검색 (클라이언트, 부분 일치)
- ✅ "더 보기" 페이지네이션 (cursor 기반, `useInfiniteQuery`)
- ✅ 새 블로그 등록/수정 Drawer (`BlogPostFormDrawer.tsx`) — 썸네일 · 제목 · 본문일부 · 외부 URL, react-hook-form + Zod
- ✅ 썸네일 이미지 업로드 (`useUploadFile({ category: 'blog-thumbnail' })`)
- ✅ 삭제 확인 (`DeleteBlogPostDialog` — HeroUI `AlertDialog`) + `useDeleteBlogPost`
- ✅ 저장/삭제 토스트 (HeroUI v3 `toast`, [`docs/admin-toast.md`](./docs/admin-toast.md) 표준)
- ⬜ 등록 시 `/blog/[id]` URL 자동 생성 (웹 연동) — 후속 스코프
- ⬜ 브라우저 회귀 테스트 (실제 백엔드/MSW 연동 후)

---

## 3.6 FAQ 관리

- ✅ MVP: 프론트엔드 하드코딩 (어드민 구현 제외 결정)
- ⬜ Phase 2: 어드민 Q&A 등록/수정/삭제, 표시 순서 드래그 정렬

---

## 4. SEO 요구사항 (apps/web)

> 현재 `apps/web` 은 App Router 스켈레톤(`layout.tsx`, `page.tsx`, 빈 섹션 페이지들)만 존재. 대부분 미구현.

### 4.1 페이지 구조

- ⬜ 프로젝트 상세 `/projects/[id]` SSG 빌드 + 텍스트 콘텐츠
- ⬜ 페이지별 고유 `<title>` ("페이지명 | DDD" 형식)
- ⬜ 페이지별 `<meta name="description">` (120자 이내)
- ⬜ `sitemap.xml` 자동 생성 (프로젝트 상세 포함)
- ⬜ `robots.txt` (`/admin/*` Disallow)
- ⬜ Canonical URL 설정 (중복 콘텐츠 방지)
- ⬜ 이미지 alt 텍스트 (프로젝트 썸네일 포함)
- ⬜ Phase 2: `/blog/[slug]` 내부 아티클 페이지화

### 4.2 Open Graph (SNS 공유)

- ⬜ `og:title` / `og:description` (페이지별 개별 설정)
- ⬜ `og:image` (프로젝트 상세: 썸네일 / 나머지: DDD 기본)
- ⬜ `og:url` (canonical과 동일)
- ⬜ `twitter:card = summary_large_image`

### 4.3 구조화 데이터 (Schema.org)

- ⬜ 홈 FAQ 섹션 — `FAQPage`
- ⬜ 홈 — `Organization`
- ⬜ 프로젝트 상세 — `SoftwareApplication`

### 4.4 성능 (Core Web Vitals)

- ⬜ LCP < 2.5s — Next.js `<Image>` 우선 로딩 적용
- ⬜ CLS < 0.1 — 이미지 width/height 명시, 폰트 preload
- ⬜ INP < 200ms — 불필요 JS 번들 제거, 코드 스플리팅

---

## 5. 데이터 모델 (참조)

백엔드 스키마이지만 프론트 타입 반영 여부 추적 목적. 현재 각 페이지의 `types.d.ts` 는 임시 타입이며, `@ddd/api` 생성 코드로 대체 예정.

- ⬜ `cohort` ENUM(UPCOMING / RECRUITING / ACTIVE / CLOSED) 타입 반영
- ⬜ `applicant` 전체 컬럼 (part ENUM, 개인정보 필드, privacy_agreed_at, delete_scheduled_at 등)
- ⬜ `project.platform` ENUM[] 복수 타입 반영
- ⬜ `early_notification` 스키마 (cohort_id, email, notified_at)

---

## 6. MVP 범위 요약

### 6.1 MVP 포함 — 진행 상황

| 영역 | 상태 | 비고 |
| --- | --- | --- |
| 홈페이지 — 홈 (소개/CTA/수치/미리보기/후원사/FAQ/지원 유도) | ⬜ | `apps/web` 스켈레톤 |
| 홈페이지 — 모집 안내 (파트/프로세스/커리큘럼/지원 신청) | ⬜ | |
| 홈페이지 — 지원 (사전 알림 / 지원서 + 개인정보 동의) | ⬜ | |
| 홈페이지 — 프로젝트 (목록+필터 / 상세 / PDF) | ⬜ | `project/[id]` 라우트만 존재 |
| 홈페이지 — 블로그 (외부 아티클 링크 목록) | ⬜ | |
| 어드민 — 기수 관리 (상태 + 수동 변경) | 🔧 | 목록/필터 완료, 등록·수정 폼 API 미연결 |
| 어드민 — 지원자 목록/상세/상태 변경 | 🔧 | 목록만 구현, 상세 페이지 미구현 |
| 어드민 — 사전 알림 DB + 수동 이메일 발송 | 🔧 | 목록/통계 UI, 발송 API 미연결 |
| 어드민 — 프로젝트 DB 등록/수정 | ✅ | 목록·필터·등록·수정·삭제 코드 완료 (브라우저 검증 미실시) |
| 어드민 — 블로그 DB 등록/수정 | ✅ | 목록·검색·등록·수정·삭제 코드 완료 (브라우저 검증 미실시) |
| SEO — sitemap/robots/OG/Schema.org/상세 URL | ⬜ | |

### 6.2 Phase 2

- ⬜ 프로젝트 참여자 후기
- ⬜ 블로그 아티클 내부 페이지화
- ⬜ 어드민 FAQ 관리

---

## 정밀 갭 (코드 라인 참조, 2026-05-04 추가)

HTML 목업 대비 현재 코드의 **하드코딩 / API 미연동 / 미구현 인터랙션** 을 file:line 단위로 정리. 작업 우선순위는 ▲ 표시.

### 하드코딩 (실 데이터로 교체 필요)

- ▲ `apps/admin/src/pages/semesters/SemestersPage.tsx:144-169` — `CardSection` 4개 카드("14", "활동 중 13기", "1204명", "520명") 모두 정적 마크업. 백엔드 집계 엔드포인트 도입 또는 클라이언트 집계 로직 필요
- ▲ `apps/admin/src/pages/semesters/mockApi.ts:1-32` — MSW handler가 faker로 `/semester` 응답 생성. `useCohorts()` 로 교체 + 본 파일 제거 필요
- `apps/admin/src/pages/semesters/types.d.ts` — 임시 `SemesterInfo` / `SemesterStatus` 타입. `@ddd/api` `CohortDto` 로 대체

### API 미연동 (훅은 존재, import 만 누락)

- ▲ `apps/admin/src/pages/semesters/SemesterRegisterDrawer.tsx:131-134` — `handleSubmit` 이 `console.log("등록:", form)` 만 실행. `useCreateCohort()` (`packages/api/src/cohort/hooks.ts:39`) 미import
- ▲ `apps/admin/src/pages/semesters/SemestersPage.tsx:21-27` — `getApiClient().get<SemesterInfo[]>("/semester")` 직접 호출. 다른 페이지처럼 `useCohorts()` 훅으로 통일
- ▲ `apps/admin/src/pages/semesters/SemestersPage.tsx:114-117` — "수정" / "모집중 전환" 버튼 `onPress` 없음. `useUpdateCohort()` (`packages/api/src/cohort/hooks.ts:48`) 연결 필요
- ▲ `apps/admin/src/pages/semesters/SemestersPage.tsx:137-139` — TitleSection "새 기수 등록" 버튼 `onPress` 없음. Drawer trigger 미연결 → 클릭해도 Drawer 열리지 않음
- `apps/admin/src/pages/index.tsx:23-29` — `/semesters` loader 함수가 빈 예시 주석. 다른 라우트와 일관되게 제거 또는 prefetch 도입 결정 필요

### HTML 목업에는 있는데 미구현인 UI

- ▲ `/applications/:id` 상세 라우트 — `apps/admin/src/pages/index.tsx` 에 path 자체 없음. HTML 목업 `applicantDrawer` (지원 파트 / 이름 / 마스킹 휴대폰 / 생년월일 / 거주지역 / 파트별 Q&A / 개인정보 동의 / 제출 일시) 전체 미구현
- ▲ `apps/admin/src/pages/applications/components/ApplicationTable.tsx` — 행 클릭 → 상세 진입 인터랙션 없음 (현재는 "다음 단계" 버튼만). HTML 목업은 이름 클릭 → Drawer
- ▲ `apps/admin/src/pages/applications/components/ApplicationTable.tsx:69-79` — "다음 단계: {next}" 단일 버튼. HTML 목업의 합격/불합격 분기 선택 UI 부재 (NEXT_STATUS 매핑 단방향 진행만)
- `apps/admin/src/pages/reminders/components/RemindersTable.tsx:28-34` — 액션 컬럼 자체 부재. 개별 발송, 발송 완료 상태 변경 UI 없음
- `apps/admin/src/pages/reminders/RemindersPage.tsx` — CSV 다운로드 트리거 부재. API(`useAdminEarlyNotificationsCsv`)는 존재
- `apps/admin/src/pages/semesters/SemesterRegisterDrawer.tsx` — 편집(수정) 모드 부재. 현재 Drawer는 create-only로, 기존 데이터 prefill 분기 없음
- `apps/admin/src/pages/semesters/SemesterRegisterDrawer.tsx:63` — react-hook-form + Zod 미사용 (단순 `useState`). 다른 폼 Drawer(`ProjectFormDrawer`, `BlogPostFormDrawer`)와 일관성 깨짐

### 회귀 테스트

- ⬜ `/projects` — 실제 백엔드 또는 MSW 연동 후 등록·수정·삭제·필터·"더 보기" 시나리오 브라우저 검증
- ⬜ `/blog-posts` — 동일

### 우선순위 Top 5 (가장 빠르게 가치 회수)

1. **`SemesterRegisterDrawer` 제출 연동** — `useCreateCohort` import + handleSubmit 교체 + 토스트
2. **`SemestersPage` 데이터 출처 통일** — `getApiClient` 직접 호출 → `useCohorts()` 로 교체, `mockApi.ts` 제거
3. **기수 테이블 액션 연결** — "수정" → 편집 Drawer (Drawer를 mode prop으로 분기), "모집중 전환" → `useUpdateCohort` mutation
4. **`/applications/:id` 라우트 + 상세 Drawer 신설** — HTML `applicantDrawer` 마크업 기반
5. **기수 통계 카드 동적화** — 백엔드 집계 또는 클라이언트 reduce
