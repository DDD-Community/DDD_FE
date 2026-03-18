# IT 사이드 프로젝트 동아리 어드민 (DDD)

## 코드 규약

> 코드 구현, 리뷰, 리팩터링, 테스트 판단은 모두 **[CODE_RULES.md](./CODE_RULES.md)** 를 기준으로 한다. 규칙 충돌 시 CODE_RULES가 우선한다.

---

## 프로젝트 개요

- **목적**: IT 사이드 프로젝트 동아리 운영을 위한 프론트엔드 애플리케이션
- **구조**: 프론트엔드 모노레포 (PNPM Workspaces)
  - `apps/admin` — 어드민 페이지 (현재 개발 대상)
  - `apps/web` — 랜딩페이지 + 동아리 신청 폼 (추후 개발)
  - `packages/ui` — 공통 UI 컴포넌트 + 디자인 토큰

> 백엔드는 별도 레포지토리에서 관리. 이 레포는 프론트엔드 전용.

### 기술 스택

| 분류       | 기술                                      |
| ---------- | ----------------------------------------- |
| 프레임워크 | Next.js 16 (App Router)                   |
| 언어       | TypeScript strict mode                    |
| 스타일링   | vanilla-extract (CSS-in-TS, zero-runtime) |
| 인증       | NextAuth.js v5                            |
| 패키지관리 | PNPM Workspaces                           |
| 런타임     | Node.js >= 20                             |

---

## 도메인 (참고용)

백엔드 API에서 제공하는 주요 도메인 모델입니다. 프론트엔드에서 이 데이터를 표시하고 조작합니다.

### 주요 엔티티

- **Application (지원서)**: 지원자 정보, 직군, 상태, 포트폴리오
- **Interview (면접)**: 면접 일정, 점수, 결과
- **Member (회원)**: 합격자 정보, 팀 배정, 활동 상태
- **Admin (운영진)**: 역할 (PRESIDENT / STAFF)
- **Notice (공지)**: 전체/회원 공지

### 권한 레벨

| 역할      | 접근 범위                  |
| --------- | -------------------------- |
| 비인증    | 없음 (apps/web만 허용)     |
| STAFF     | 모든 어드민 기능 읽기/쓰기 |
| PRESIDENT | STAFF 권한 + 운영진 관리   |

---

## 아키텍처

### 프론트엔드 구조

```
apps/admin/
├── app/                    ← Next.js App Router
│   ├── layout.tsx          ← 루트 레이아웃
│   ├── page.tsx            ← 홈 페이지
│   └── api/                ← API Routes (외부 콜백용)
├── components/             ← 앱 전용 컴포넌트
├── hooks/                  ← 커스텀 훅
├── lib/                    ← 유틸리티, 설정
│   └── auth.ts             ← NextAuth 설정
└── styles/                 ← 앱 전용 스타일
```

### 공유 UI 패키지

```
packages/ui/
├── index.ts                ← 컴포넌트 export
├── global.css              ← 글로벌 스타일
├── tokens/                 ← 디자인 토큰 (vanilla-extract)
│   └── *.css.ts
└── [ComponentName]/        ← 컴포넌트별 폴더 (추후)
    ├── index.tsx
    └── styles.css.ts
```

### 패키지 의존성

```
apps/admin  ──depends──>  @ddd/ui
apps/web    ──depends──>  @ddd/ui
```

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
│   ├── admin/                    (@ddd/admin)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── robots.ts         ← 검색엔진 인덱싱 방지
│   │   │   └── api/              ← 외부 콜백용 API Routes
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── web/                      (@ddd/web, 추후)
│
└── packages/
    └── ui/                       (@ddd/ui)
        ├── index.ts
        ├── global.css
        ├── tokens/               ← 디자인 토큰
        └── package.json
```

---

## 스크립트

```bash
# 루트에서 실행
pnpm dev:admin          # 어드민 개발 서버
pnpm dev:web            # 웹 개발 서버 (추후)
pnpm build:admin        # 어드민 빌드

# 패키지 필터
pnpm --filter @ddd/admin dev
pnpm --filter @ddd/ui build
```

---

## 컨벤션

### 스타일링

- vanilla-extract 사용 (`.css.ts` 파일)
- 디자인 토큰은 `@ddd/ui/tokens`에서 관리
- 앱에서 사용: `import '@ddd/ui/global.css'`

### 컴포넌트

- 공통 컴포넌트는 `@ddd/ui`에 작성
- 앱 전용 컴포넌트는 각 앱의 `components/`에 작성

### 타입

- TypeScript strict mode 사용
- API 응답 타입은 백엔드 스키마 기반으로 정의

---

## 미결 사항

- [ ] NextAuth.js Provider 확정 (Google OAuth 권장)
- [ ] 백엔드 API 엔드포인트 연동
- [ ] `@ddd/ui` 공통 컴포넌트 설계
- [ ] 디자인 토큰 체계 정립 (색상, 타이포그래피, 스페이싱)
- [ ] apps/web 초기 세팅
