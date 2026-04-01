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
