# DDD 프론트엔드 모노레포

IT 사이드 프로젝트 동아리(DDD) 운영을 위한 프론트엔드 모노레포.

> 코드 구현, 리뷰, 리팩터링, 테스트 판단은 모두 **[CODE_RULES.md](./CODE_RULES.md)** 를 기준으로 한다.

---

## 목적

- `apps/admin` — 동아리 운영진용 어드민 페이지 (현재 개발 중)
- `apps/web` — 홈/블로그/프로젝트/모집안내 랜딩페이지 (개발 중)
- `packages/api` — 공통 API 클라이언트 SDK, 타입, Zod 스키마 (Hey API 코드 생성 포함)

백엔드는 별도 레포지토리에서 관리. 이 레포는 프론트엔드 전용.

---

## 모노레포 구조

```
(root)
├── apps/
│   ├── admin/        (@ddd/admin) — Vite + React, Tailwind CSS
│   └── web/          (@ddd/web)   — Next.js App Router
└── packages/
    ├── api/          (@ddd/api)   — API 클라이언트, 타입, Zod 스키마, Hey API 생성 코드
    └── ui/           (@ddd/ui)    — admin/web 공통 UI 컴포넌트 (예정)
```

**패키지 매니저**: PNPM Workspaces
**Node.js**: >= 20

### 앱별 기술 스택

| 앱             | 프레임워크              | 스타일링       | 상태    | 비고                    |
| -------------- | ----------------------- | -------------- | ------- | ----------------------- |
| `apps/admin`   | Vite + React 19         | Tailwind CSS 4 | 개발 중 | shadcn/ui, React Router |
| `apps/web`     | Next.js 16 (App Router) | -              | 개발 중 | 홈/블로그/프로젝트/모집안내 |
| `packages/api` | -                       | -              | 개발 중 | Hey API, Zod            |

---

## 스크립트

```bash
# 루트에서 실행
pnpm dev:admin          # 어드민 개발 서버
pnpm build:admin        # 어드민 빌드

pnpm dev:web            # 웹 개발 서버 (추후)
pnpm build:web          # 웹 빌드 (추후)

pnpm gen:api            # Hey API로 OpenAPI 스키마 → 타입/SDK 코드 생성

pnpm lint               # 전체 린트
pnpm lint:fix           # 전체 린트 자동 수정
pnpm format             # 전체 Prettier 포맷

# 패키지 필터
pnpm --filter @ddd/admin dev
pnpm --filter @ddd/web dev
pnpm --filter @ddd/api generate
```

---

## apps/web 라우트 구조

```
apps/web/
├── app/
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # / 홈
│   ├── blog/
│   │   └── page.tsx                # /blog
│   ├── project/
│   │   ├── page.tsx                # /project 목록
│   │   └── [id]/
│   │       └── page.tsx            # /project/{id} 상세 풀 페이지
│   └── recruit/
│       └── page.tsx                # /recruit 모집안내
├── components/
│   ├── ui/                         # 재사용 단위 컴포넌트 (Button, Tab, Pagination 등)
│   ├── sections/                   # 페이지 섹션 단위 컴포넌트
│   └── layout/                     # Header, Footer 등 공통 레이아웃
└── hooks/                          # web 전용 커스텀 훅
```

### 페이지별 메타데이터

| 경로 | title | description |
|---|---|---|
| `/` | DDD - 사이드 프로젝트로 성장하는 개발자 커뮤니티 | 개발자, 디자이너, 기획자가 함께 사이드 프로젝트를 만들고 성장하는 커뮤니티 DDD. 실전 협업 경험을 쌓아보세요. |
| `/blog` | DDD 블로그 - 사이드 프로젝트 인사이트 | DDD 멤버들의 사이드 프로젝트 경험과 개발, 협업 인사이트를 공유합니다. |
| `/project` | DDD 프로젝트 - 사이드 프로젝트 결과물 모음 | DDD에서 진행된 다양한 사이드 프로젝트 결과물을 확인해보세요. |
| `/project/[id]` | {프로젝트명} \| DDD | DDD에서 진행된 사이드 프로젝트 {프로젝트명} 직접 확인해보세요. |
| `/recruit` | DDD 모집 - 사이드 프로젝트 멤버 지원 | DDD에서 함께할 개발자, 디자이너, 기획자를 모집합니다. |
