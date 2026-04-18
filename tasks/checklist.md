# DDD 기능 명세 구현 체크리스트

> **기준 문서**: 어드민 기능 명세 3.x, SEO 요구사항 4.x, 데이터 모델 5.x, MVP 범위 6.x
> **코드 스냅샷**: 2026-04-18 (branch: `dev/admin`)
> **범례**: ✅ 완료 / 🔧 부분 구현 (UI만 또는 목업 연결) / ⬜ 미구현

---

## 공통 인프라 (admin)

- ✅ Vite + React 19 + TypeScript 환경
- ✅ Tailwind CSS 4
- ✅ HeroUI v3 도입 (shadcn/ui primitives 제거 완료)
- ✅ React Router Data Mode (`createBrowserRouter`) — `apps/admin/src/pages/index.tsx`
- ✅ TanStack Query (`QueryProvider`)
- ✅ MSW(Mock Service Worker) 목업 환경 (`apps/admin/src/mocks/`)
- ✅ ESLint + Prettier + Lefthook
- ✅ FSD 기반 디렉터리 구조 (`app / pages / widgets / shared`)
- ✅ AdminLayout (SideBar + MobileHeader + Outlet)
- ✅ ThemeProvider (localStorage, `d` 키 토글, 다크/라이트/시스템)
- ⬜ Google OAuth 실제 연결 (`pages/login/LoginPage.tsx` UI만 존재)
- ⬜ 인증 보호 라우트 (`shared/lib/auth.ts` TODO 상태)
- ⬜ 실제 백엔드 API 연동 (orval 생성 코드 → `@ddd/api` 활용)

---

## 3.1 기수 관리 (`/semesters`)

### 3.1.1 기수 상태 정의

- ✅ 상태 Enum 표기 (모집예정 / 모집 중 / 활동 중 / 활동종료) — 테이블 컬럼에 노출
- ⬜ 홈페이지 버튼 동기화 (사전 알림 신청 / 지원 신청 / 모집 종료) — 웹 측 기능

### 3.1.2 기수 등록/수정

- ✅ 기수 목록 조회 (기수 / 상태 / 모집기간 / 지원자수 / 멤버수 / 등록일)
- ✅ 상태별 필터 / 기수 검색
- ✅ 통계 카드 (전체 기수 / 현재 상태 / 누적 지원자 / 누적 활동 멤버)
- 🔧 새 기수 등록 폼 (기수번호, 상태, 모집기간) — `SemesterRegisterDrawer.tsx` (Drawer + DatePicker + Select UI), 실제 API 미연결
- 🔧 프로세스 일정 등록/수정 (서류발표일, 온라인 인터뷰일, 최종발표일) — DatePicker UI만
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
- ⬜ 기수별 필터
- ⬜ 이메일 목록 엑셀 다운로드
- ⬜ 전체 일괄 발송 (MVP: 어드민 수동 트리거)
- ⬜ 기수 상태 "모집중" 전환 시 자동 발송 (Phase 2)

### 저장 필드 (명세 3.2)

- 🔧 기수 / 이메일 / 신청 일시 — 목업 데이터에 반영, 실제 스키마 미연동

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
- ⬜ 파트별 질문+답변 + 제출 일시 표시
- ⬜ 개인정보 동의 여부 + 동의 일시 표시
- ⬜ 상세에서 상태 변경 기능

### 3.3.4 개인정보 처리

- ⬜ 합격 발표 후 6개월 자동 파기 스케줄러 (Cron)
- ⬜ 개인정보 필드 null 처리 또는 레코드 삭제 로직
- ⬜ 관련 감사 로그/관리자 알림 (필요 시)

---

## 3.4 프로젝트 DB 관리 (`/projects`)

- ✅ 목록 조회 (프로젝트명 / 설명 / 기수 / 팀원수 / 상태 / 등록일)
- ✅ 상태별 필터 / 프로젝트명 검색
- 🔧 수정 / 삭제 버튼 UI — 폼 / API 미연결
- ⬜ 새 프로젝트 등록 폼 (썸네일, 플랫폼, 서비스명, 한줄 설명, 기수, PDF, 참여자)
- ⬜ 썸네일 이미지 업로드 (S3/R2 연동)
- ⬜ PDF 업로드 (최종발표 PDF)
- ⬜ 플랫폼 다중 선택 (iOS / AOS / WEB)
- ⬜ 참여자 텍스트 입력
- ⬜ 등록 시 `/projects/[id]` URL 자동 생성 (웹 연동)

---

## 3.5 블로그 DB 관리 (`/blog-posts`)

- ✅ 목록 조회 (제목 / 작성자 / 카테고리 / 상태 / 게시일 / 등록일)
- ✅ 상태별 필터 / 제목·작성자 검색
- 🔧 수정 / 삭제 버튼 UI — 폼 / API 미연결
- ⬜ 새 블로그 등록 폼 (썸네일, 제목, 본문 일부, 외부 URL)
- ⬜ 썸네일 이미지 업로드
- ⬜ 등록 시 `/blog/[id]` URL 자동 생성 (웹 연동)

---

## 3.6 FAQ 관리 (제외)

- ✅ MVP: 프론트엔드 하드코딩 (어드민 구현 제외 결정)
- ⬜ Phase 2: 어드민 Q&A 등록 / 수정 / 삭제, 표시 순서 드래그 정렬

---

## 4. SEO 요구사항 (apps/web)

> 현재 `apps/web`은 App Router 스켈레톤(`layout.tsx`, `page.tsx`, 빈 섹션 페이지들)만 존재. 대부분 미구현.

### 4.1 페이지 구조

- ⬜ 프로젝트 상세 `/projects/[id]` SSG 빌드 + 텍스트 콘텐츠
- ⬜ 각 페이지 고유 `<title>` ("페이지명 | DDD" 형식)
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

백엔드 스키마이지만 프론트 타입 반영 여부 추적 목적. 현재 각 페이지의 `types.d.ts`는 임시 타입이며, `@ddd/api` 생성 코드로 대체 예정.

- ⬜ `cohort` ENUM(UPCOMING / RECRUITING / ACTIVE / CLOSED) 타입 반영
- ⬜ `applicant` 전체 컬럼(part ENUM, 개인정보 필드, privacy_agreed_at, delete_scheduled_at 등) 타입 반영
- ⬜ `project` `platform` ENUM[] 복수 타입 반영
- ⬜ `early_notification` 스키마(cohort_id, email, notified_at) 타입 반영

---

## 6. MVP 범위 요약

### 6.1 MVP 포함 — 진행 상황

| 영역 | 상태 | 비고 |
|---|---|---|
| 홈페이지 — 홈 (소개/CTA/수치/미리보기/후원사/FAQ/지원 유도) | ⬜ | `apps/web` 스켈레톤 상태 |
| 홈페이지 — 모집 안내 (파트/프로세스/커리큘럼/지원 신청) | ⬜ | |
| 홈페이지 — 지원 (사전 알림 / 지원서 + 개인정보 동의) | ⬜ | |
| 홈페이지 — 프로젝트 (목록+필터 / 상세 / PDF) | ⬜ | `project/[id]` 라우트만 존재 |
| 홈페이지 — 블로그 (외부 아티클 링크 목록) | ⬜ | |
| 어드민 — 기수 관리 (상태 + 수동 변경) | 🔧 | 목록/필터 완료, 등록·수정 폼은 API 미연결 |
| 어드민 — 지원자 목록/상세/상태 변경 | 🔧 | 목록만 구현, 상세 페이지 미구현 |
| 어드민 — 사전 알림 DB + 수동 이메일 발송 | 🔧 | 목록/통계 UI, 발송 API 미연결 |
| 어드민 — 프로젝트 DB 등록/수정 | 🔧 | 목록/검색만, 등록 폼 미구현 |
| SEO — sitemap/robots/OG/Schema.org/상세 URL | ⬜ | |

### 6.2 Phase 2

- ⬜ 프로젝트 참여자 후기
- ⬜ 블로그 아티클 내부 페이지화
- ⬜ 어드민 FAQ 관리
