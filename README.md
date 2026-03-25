# DDD 프론트엔드 모노레포

IT 사이드 프로젝트 동아리(DDD) 운영을 위한 프론트엔드 모노레포.

> 코드 구현, 리뷰, 리팩터링, 테스트 판단은 모두 **[CODE_RULES.md](./CODE_RULES.md)** 를 기준으로 한다.

---

## 목적

- `apps/admin` — 동아리 운영진용 어드민 페이지 (현재 개발 중)
- `apps/web` — 랜딩페이지 + 동아리 신청 폼 (추후 개발)
- `packages/api` — API 클라이언트, Zod 스키마 및 타입 공유 패키지

백엔드는 별도 레포지토리에서 관리. 이 레포는 프론트엔드 전용.

---

## 모노레포 구조

```
(root)
├── apps/
│   ├── admin/        (@ddd/admin) — Vite + React, Tailwind CSS
│   └── web/          (@ddd/web)   — Next.js App Router
└── packages/
    └── api/          (@ddd/api)   — API 클라이언트, Zod 스키마, 공유 타입
```

**패키지 매니저**: PNPM Workspaces
**Node.js**: >= 20

### 앱별 기술 스택

| 앱             | 프레임워크              | 스타일링       | 비고                    |
| -------------- | ----------------------- | -------------- | ----------------------- |
| `apps/admin`   | Vite + React 19         | Tailwind CSS 4 | shadcn/ui, React Router |
| `apps/web`     | Next.js 16 (App Router) | -              | 랜딩 + 신청 폼          |
| `packages/api` | -                       | -              | OpenAPI 기반 자동 생성  |

---

## 시작하기

### 요구사항

- Node.js >= 20
- pnpm >= 9

### 설치

```bash
pnpm install
```

---

## 스크립트

```bash
# 개발 서버
pnpm dev:admin          # 어드민 개발 서버
pnpm dev:web            # 웹 개발 서버 (추후)

# 빌드
pnpm build:admin        # 어드민 빌드
pnpm build:web          # 웹 빌드 (추후)

# API 클라이언트 생성
pnpm gen:api            # OpenAPI 스펙으로 API 클라이언트 재생성

# 코드 품질
pnpm lint               # 전체 린트
pnpm lint:fix           # 전체 린트 자동 수정
pnpm format             # 전체 Prettier 포맷
pnpm format:check       # 포맷 검사

# 패키지 필터
pnpm --filter @ddd/admin dev
pnpm --filter @ddd/api generate
```

---

## 패키지 의존성 관리

### pnpm Catalog

워크스페이스 전반에서 공유되는 패키지 버전은 `pnpm-workspace.yaml`의 catalog로 단일 관리한다.
각 패키지에서 `"catalog:"`로 참조하면 catalog에 선언된 버전이 설치된다.

**catalog 등록 패키지**: `typescript`, `eslint`, `@eslint/js`, `prettier`, `zod`, `react`, `react-dom`, `@types/react`, `@types/react-dom`

### `@ddd/api` 사용 시 주의사항

`@ddd/api`는 Zod 스키마를 export한다. 이를 사용하는 앱에서는 **`zod`를 직접 설치**해야 한다.

```json
// apps/admin/package.json 또는 apps/web/package.json
"dependencies": {
  "@ddd/api": "workspace:*",
  "zod": "catalog:"
}
```

`zod`를 설치하지 않으면 `@ddd/api`에서 export된 스키마를 정상적으로 사용할 수 없다.
(`@ddd/api`는 `peerDependencies`로 zod를 선언하므로, 설치 주체는 사용하는 앱이다.)

---

## 코드 규약

[CODE_RULES.md](./CODE_RULES.md) 참고.
