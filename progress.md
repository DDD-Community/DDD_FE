# DDD 프론트엔드 진행 현황

> **기준 문서**: 어드민 기능 명세 3.x, SEO 요구사항 4.x, 데이터 모델 5.x, MVP 범위 6.x
> **코드 스냅샷**: 2026-04-26 (branch: `dev/admin`)
> **범례**: ✅ 완료 / 🔧 부분 구현 (UI만 또는 목업 연결) / ⬜ 미구현

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
| 공통 인프라 (admin) | 🔧 | OAuth · 인증 가드 · 실 API 연동 |
| 3.1 기수 관리 | 🔧 | 등록/수정 폼 API 미연결 |
| 3.2 사전 알림 | 🔧 | 발송 API · 엑셀 · 일괄 발송 |
| 3.3 지원자 관리 | 🔧 | 상세 페이지 전체 미구현 |
| 3.4 프로젝트 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) — PDF 업로드는 후속 |
| 3.5 블로그 DB | ✅ | 코드 완료 (브라우저 회귀 테스트 미실시) |
| 3.6 FAQ | ✅ | MVP 제외 결정 (FE 하드코딩) |
| 4. SEO (web) | ⬜ | 스켈레톤만, 거의 전부 미구현 |
| 5. 데이터 모델 타입 반영 | ⬜ | `@ddd/api` 생성 코드로 대체 예정 |

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

- ⬜ Google OAuth 실제 연결 (`pages/login/LoginPage.tsx` UI만 존재)
- ⬜ 인증 보호 라우트 (`shared/lib/auth.ts` TODO 상태)
- ⬜ 실제 백엔드 API 연동 (orval 생성 코드 → `@ddd/api`)

---

## 3.1 기수 관리 (`/semesters`)

### 3.1.1 기수 상태 정의

- ✅ 상태 Enum 표기 (모집예정 / 모집 중 / 활동 중 / 활동종료) — 테이블 컬럼 노출
- ⬜ 홈페이지 버튼 동기화 (사전 알림 신청 / 지원 신청 / 모집 종료) — 웹 측 책임

### 3.1.2 기수 등록/수정

- ✅ 기수 목록 조회 (기수 / 상태 / 모집기간 / 지원자수 / 멤버수 / 등록일)
- ✅ 상태별 필터 / 기수 검색
- ✅ 통계 카드 (전체 기수 / 현재 상태 / 누적 지원자 / 누적 활동 멤버)
- 🔧 새 기수 등록 폼 — `SemesterRegisterDrawer.tsx` (Drawer + DatePicker + Select), API 미연결
- 🔧 프로세스 일정 등록/수정 (서류발표일 · 온라인 인터뷰일 · 최종발표일) — DatePicker UI만
- 🔧 커리큘럼 등록/수정 (9주차 JSON 배열) — DatePicker + Input UI만
- 🔧 파트별 지원서 양식 관리 (질문 추가/수정/삭제) — Tabs + TextArea UI만
- 🔧 수동 상태 변경 버튼 ("모집중 전환") — API 미연결
- 🔧 기수 수정 버튼 — 수정 폼/모달 미구현
- ⬜ 모집 종료일 경과 시 자동 "활동중" 전환 (백엔드/스케줄러 책임)

---

## 3.2 사전 알림 신청 관리 (`/reminders`)

- ✅ 신청자 목록 조회 (이름 / 이메일 / 직군 / 관심기수 / 신청일 / 상태)
- ✅ 상태별 필터 (대기 / 발송완료)
- ✅ 이름·이메일 검색
- ✅ 통계 카드 (전체 / 대기 / 발송완료 / 취소)
- 🔧 이메일 개별 발송 버튼 UI — API 미연결
- 🔧 저장 필드 (기수 / 이메일 / 신청 일시) — 목업 데이터에만 반영, 실 스키마 미연동
- ⬜ 기수별 필터
- ⬜ 이메일 목록 엑셀 다운로드
- ⬜ 전체 일괄 발송 (MVP: 어드민 수동 트리거)
- ⬜ 기수 상태 "모집중" 전환 시 자동 발송 (Phase 2)

---

## 3.3 지원자 및 지원서 관리 (`/applications`)

### 3.3.1 지원자 상태 정의

- 🔧 상태 값 일부 노출 — 명세 전체 enum(서류대기 / 서류합격 / 서류불합격 / 최종합격 / 최종불합격 / 활동중 / 활동완료 / 활동중단) 정합성 재검수 필요

### 3.3.2 지원자 목록

- ✅ 목록 조회 (이름 / 이메일 / 직군 / 지원기수 / 지원일 / 상태)
- ✅ 상태별 필터
- ✅ 이름 / 이메일 검색
- ✅ 통계 카드 (전체 지원 / 대기 / 면접 대기 / 면접 합격 / 활동중)
- 🔧 지원자 상태 변경 버튼 ("합격처리", "수정") — API 미연결
- ⬜ 파트별 필터 (PM / PD / BE / FE / IOS / AOS)
- ⬜ 기수별 필터
- ⬜ 지원자 이름 클릭 → 상세 페이지 이동

### 3.3.3 지원자 상세 (`/applications/:id`)

- ⬜ 상세 라우트 자체가 미구현
- ⬜ 지원 파트 / 이름 / 휴대폰번호(가운데번호 마스킹) / 생년월일 / 거주지역 표시
- ⬜ 파트별 질문+답변 + 제출 일시
- ⬜ 개인정보 동의 여부 + 동의 일시
- ⬜ 상세에서 상태 변경 기능

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
