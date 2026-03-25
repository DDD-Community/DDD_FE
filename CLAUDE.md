# DDD 프론트엔드 모노레포

IT 사이드 프로젝트 동아리(DDD) 운영을 위한 프론트엔드 모노레포.

> 코드 구현, 리뷰, 리팩터링, 테스트 판단은 모두 **[CODE_RULES.md](./CODE_RULES.md)** 를 기준으로 한다.

---

## 목적

- `apps/admin` — 동아리 운영진용 어드민 페이지 (현재 개발 중)
- `apps/web` — 랜딩페이지 + 동아리 신청 폼 (추후 개발)
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
    └── api/          (@ddd/api)   — API 클라이언트, 타입, Zod 스키마, Hey API 생성 코드
```

**패키지 매니저**: PNPM Workspaces
**Node.js**: >= 20

### 앱별 기술 스택

| 앱             | 프레임워크              | 스타일링       | 상태    | 비고                    |
| -------------- | ----------------------- | -------------- | ------- | ----------------------- |
| `apps/admin`   | Vite + React 19         | Tailwind CSS 4 | 개발 중 | shadcn/ui, React Router |
| `apps/web`     | Next.js 16 (App Router) | -              | 미개발  | 랜딩 + 신청 폼          |
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
pnpm --filter @ddd/api generate
```
