# apps/admin — 어드민 앱 개발 가이드

DDD 동아리 운영진용 어드민 페이지. Vite + React 19, Tailwind CSS 4, React Router(Data Mode) 기반.

---

## 디렉터리 구조 (FSD 기반)

```
src/
├── app/                        # 앱 초기화 레이어
│   └── providers/
│       └── ThemeProvider.tsx   # 전역 테마 Provider + useTheme 훅
│
├── pages/                      # 페이지 레이어 (라우트 1:1 대응, 주요 feature 단위)
│   ├── index.tsx               # 라우터 설정 (createBrowserRouter)
│   ├── login/
│   ├── applications/
│   ├── semesters/
│   ├── reminders/
│   ├── projects/
│   ├── blog-posts/
│   └── error/
│
├── widgets/                    # 복합 UI 블록 레이어 (페이지 간 공유)
│   ├── sidebar/
│   │   ├── SideBar.tsx
│   │   └── constants.ts        # 메뉴 아이템 정의
│   └── admin-layout/
│       └── AdminLayout.tsx     # SideBar + Outlet 레이아웃
│
└── shared/                     # 순수 공유 자원 레이어
    ├── ui/                     # UI 컴포넌트 (shadcn/base-ui 기반 primitives)
    ├── hooks/                  # 범용 훅 (useIsMobile 등)
    └── lib/                    # 유틸 함수 및 상수 (cn, paths, auth)
```

---

## 레이어 규칙

의존성 방향은 **단방향**으로 강제한다.

```
pages → widgets → shared
app   → pages
```

- 각 레이어는 자신보다 **아래** 레이어만 import할 수 있다.
- `shared`는 어떤 레이어도 import하지 않는다.
- `widgets`는 `pages`를 import하지 않는다.

---

## 새 페이지 추가 방법

1. `src/pages/{페이지명}/` 폴더 생성
2. 페이지 컴포넌트 작성 (`{페이지명}Page.tsx`)
3. `src/pages/index.tsx` 라우터에 경로 추가
4. `src/shared/lib/paths.ts`에 경로 상수 추가
5. `src/widgets/sidebar/constants.ts`에 메뉴 아이템 추가 (사이드바에 노출 시)

### 페이지 slice 내부 구조

파일이 하나면 세그먼트 폴더 없이 바로 배치한다.

```
pages/applications/
├── ApplicationsPage.tsx        # 단순할 때: 그냥 파일
└── ...

pages/applications/             # 복잡해질 때: 세그먼트로 분리
├── ui/
│   ├── ApplicationsPage.tsx
│   └── ApplicationTable.tsx
├── model/
│   ├── useApplications.ts
│   └── applicationSchema.ts
└── api/
    └── applicationsApi.ts
```

---

## shared/ 사용 규칙

| 경로 | 용도 |
|---|---|
| `shared/ui/button.tsx` | Base UI 기반 버튼 (CVA variants) |
| `shared/ui/tooltip.tsx` | Base UI 기반 툴팁 |
| `shared/ui/avatar.tsx` | Base UI 기반 아바타 |
| `shared/ui/drawer.tsx` | Vaul 기반 드로어 |
| `shared/ui/FlexBox.tsx` | flex 레이아웃 유틸 컴포넌트 |
| `shared/ui/DDDAnimated.tsx` | DDD 브랜드 로고 애니메이션 |
| `shared/ui/GoogleButton.tsx` | Google 로그인 버튼 |
| `shared/hooks/useIsMobile.ts` | 모바일 뷰포트 감지 훅 |
| `shared/lib/cn.ts` | clsx + tailwind-merge 유틸 |
| `shared/lib/paths.ts` | 라우트 경로 상수 |
| `shared/lib/auth.ts` | 인증 체크 로더 유틸 (TODO) |

shadcn 스타일 UI 컴포넌트를 추가할 때는 `shared/ui/`에 배치한다.

---

## 주요 기술 결정

- **라우터**: React Router Data Mode (`createBrowserRouter`) — loader로 페이지 진입 전 데이터 페칭
- **스타일링**: Tailwind CSS 4 + `cn()` 유틸
- **UI 라이브러리**: `@base-ui/react` (headless), `vaul` (drawer)
- **아이콘**: `@hugeicons/react`
- **테마**: `ThemeProvider` — localStorage 유지, `d` 키로 토글, 다크/라이트/시스템 지원
- **API**: `@ddd/api` 패키지에서 import, `main.tsx`에서 `configureApi()` 초기화

---

## 기능 개발 현황 체크리스트

> 기준: [어드민 기능 명세서 3.x] (2026-04-11 기준)
> - ✅ 완료 / 🔧 부분 구현 (UI만 있고 실제 기능 미연결) / ⬜ 미구현

---

### 공통 인프라

- ✅ Vite + React 19 + TypeScript 환경 구성
- ✅ Tailwind CSS 4 + shadcn/ui 설정
- ✅ React Router Data Mode 설정 (`createBrowserRouter`)
- ✅ TanStack Query 설정 (`QueryProvider`)
- ✅ MSW(Mock Service Worker) 목업 환경 구성
- ✅ ESLint + Prettier + Lefthook (코드 품질 체크)
- ✅ FSD 기반 디렉터리 구조 (`app / pages / widgets / shared`)
- ✅ AdminLayout (SideBar + MobileHeader + Outlet)
- ⬜ Google OAuth 실제 연결 (현재 LoginPage UI만 존재)
- ⬜ 인증 보호 라우트 (`shared/lib/auth.ts` TODO 상태)

---

### 3.1 기수 관리 (`/semesters`)

- ✅ 기수 목록 조회 (테이블: 기수, 상태, 모집기간, 지원자수, 멤버수, 등록일)
- ✅ 상태별 필터 (모집예정 / 모집중 / 활동중 / 활동종료)
- ✅ 기수 검색
- ✅ 통계 카드 (전체 기수, 현재 상태, 누적 지원자, 누적 활동 멤버)
- 🔧 수동 상태 변경 버튼 UI ("모집중 전환") — 실제 API 미연결
- 🔧 기수 수정 버튼 UI — 실제 수정 폼/모달 미구현
- ⬜ 새 기수 등록 폼 (기수번호, 상태, 모집기간 날짜 범위)
- ⬜ 프로세스 일정 등록/수정 (서류발표일, 온라인 인터뷰일, 최종발표일)
- ⬜ 커리큘럼 등록/수정 (9주차 JSON 배열 편집 UI)
- ⬜ 파트별 지원서 양식 관리 (질문 추가/수정/삭제)
- ⬜ 모집 종료일 경과 시 자동 "활동중" 전환 처리

---

### 3.2 사전 알림 신청 관리 (`/reminders`)

- ✅ 알림 신청자 목록 조회 (테이블: 이름, 이메일, 직군, 관심기수, 신청일, 상태)
- ✅ 상태별 필터 (대기 / 발송완료)
- ✅ 이름/이메일 검색
- ✅ 통계 카드 (전체 신청, 대기, 발송완료, 취소)
- 🔧 이메일 개별 발송 버튼 UI — 실제 API 미연결
- ⬜ 기수별 필터
- ⬜ 이메일 목록 엑셀 다운로드
- ⬜ 전체 일괄 발송 기능 (어드민 수동 트리거)

---

### 3.3 지원자 및 지원서 관리 (`/applications`)

- ✅ 지원자 목록 조회 (테이블: 이름, 이메일, 직군, 지원기수, 지원일, 상태)
- ✅ 상태별 필터
- ✅ 이름/이메일 검색
- ✅ 통계 카드 (전체 지원, 대기, 면접 대기, 면접 합격, 활동중)
- 🔧 지원자 상태 변경 버튼 UI ("합격처리", "수정") — 실제 API 미연결
- ⬜ 파트별 필터 (PM / PD / BE / FE / IOS / AOS)
- ⬜ 기수별 필터
- ⬜ 지원자 상태 enum 정확히 반영 (서류대기 / 서류합격 / 서류불합격 / 최종합격 / 최종불합격 / 활동중 / 활동완료 / 활동중단)
- ⬜ 지원자 상세 페이지 (`/applications/:id`) — 이름 클릭 시 이동
- ⬜ 지원자 상세: 지원 파트, 이름, 휴대폰번호(가운데번호 마스킹), 생년월일, 거주지역
- ⬜ 지원자 상세: 파트별 질문+답변 표시
- ⬜ 지원자 상세: 개인정보 동의 여부 + 동의 일시
- ⬜ 지원자 상세에서 상태 변경 기능

---

### 3.4 프로젝트 DB 관리 (`/projects`)

- ✅ 프로젝트 목록 조회 (테이블: 프로젝트명, 설명, 기수, 팀원수, 상태, 등록일)
- ✅ 상태별 필터 / 프로젝트명 검색
- 🔧 수정/삭제 버튼 UI — 실제 폼/API 미연결
- ⬜ 새 프로젝트 등록 폼 (썸네일 이미지 업로드, 플랫폼, 서비스명, 한줄 설명, 기수, PDF, 참여자)
- ⬜ 썸네일 이미지 업로드 (S3/R2 연동)
- ⬜ PDF 업로드 (최종발표 PDF)
- ⬜ 플랫폼 다중 선택 (iOS / AOS / WEB)
- ⬜ 참여자 텍스트 입력
- ⬜ 등록 시 `/projects/[id]` URL 자동 생성 (웹 연동)

---

### 3.5 블로그 DB 관리 (`/blog-posts`)

- ✅ 블로그 목록 조회 (테이블: 제목, 작성자, 카테고리, 상태, 게시일, 등록일)
- ✅ 상태별 필터 / 제목·작성자 검색
- 🔧 수정/삭제 버튼 UI — 실제 폼/API 미연결
- ⬜ 새 블로그 등록 폼 (썸네일 업로드, 제목, 본문 일부, 외부 URL)
- ⬜ 썸네일 이미지 업로드
- ⬜ 등록 시 `/blog/[id]` URL 자동 생성 (웹 연동)

---

### API 연동

- ✅ MSW 목업 핸들러 구성 (semester / application / reminder / project / blog-post)
- ⬜ 실제 백엔드 API 연동 (orval 코드 생성 → `@ddd/api` 패키지 활용)
- ⬜ 각 페이지 타입 정의 실제 API 명세 기반으로 업데이트 (현재 "임시 타입" 주석)
